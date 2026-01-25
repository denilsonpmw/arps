import { prisma } from '../lib/prisma';
import axios from 'axios';

interface ApiExternaItem {
  id: number;
  nup: string;
  objeto: string;
  deleted?: boolean;
  unidade_gestora?: { sigla: string };
  modalidade?: { sigla_modalidade: string };
  numero_ano?: string;
  valor_realizado?: number;
  situacao?: { eh_finalizadora: boolean };
}

interface ApiResponse {
  data?: ApiExternaItem[];
  pagination?: {
    totalPages: number;
  };
}

/**
 * Sincroniza registros do outro site via API REST.
 * - Executa de forma programada (ex: via cron ou scheduler externo)
 * - Chama endpoint GET do outro site, usando API key no header Authorization
 * - Para cada item:
 *   1) Se não existir registro com mesmo source_id → INSERT
 *   2) Se existir e local_override = false → UPDATE dos campos e updated_at_source
 *   3) Se existir e local_override = true → NÃO faz update
 * - Para exclusões:
 *   - Se "deleted" = true vindo do outro site, faz soft delete (deleted_at) se local_override = false
 *   - Se local_override = true, ignora exclusão
 * - Usa transação para garantir consistência
 * - Loga sucesso/erro de cada etapa
 */
export async function syncFromExemploOutroSite() {
  const API_URL = process.env.WEBHOOK_ARPS_URL;
  const API_KEY = process.env.WEBHOOK_ARPS_KEY;
  
  console.log('[sync] Verificando configuração...');
  console.log(`[sync] API_URL: ${API_URL ? 'configurado' : 'NÃO CONFIGURADO'}`);
  console.log(`[sync] API_KEY: ${API_KEY ? `configurado (${API_KEY.substring(0, 10)}...)` : 'NÃO CONFIGURADO'}`);
  
  if (!API_URL || !API_KEY) {
    console.error('[sync] API_URL ou API_KEY não configurados');
    return;
  }

  // Buscar todos os registros (com paginação)
  const todosRegistros: ApiExternaItem[] = [];
  let paginaAtual = 1;
  let totalPaginas = 1;

  try {
    console.log('[sync] Chamando API externa...');
    
    // Loop para buscar todas as páginas
    while (paginaAtual <= totalPaginas) {
      const urlComPaginacao = `${API_URL}${API_URL.includes('?') ? '&' : '?'}page=${paginaAtual}`;
      console.log(`[sync] Buscando página ${paginaAtual}/${totalPaginas}: ${urlComPaginacao}`);
      
      const response = await axios.get<ApiResponse>(urlComPaginacao, {
        headers: { 'x-api-key': API_KEY },
        timeout: 15000,
      });
      
      if (response.status !== 200) {
        console.error(`[sync] Erro HTTP: status ${response.status}`);
        break;
      }

      const registros = Array.isArray(response.data) ? response.data : response.data?.data;
      if (!Array.isArray(registros)) {
        console.error('[sync] Resposta da API não é um array');
        break;
      }

      todosRegistros.push(...registros);
      
      // Atualiza total de páginas (se houver paginação)
      if (response.data?.pagination) {
        totalPaginas = response.data.pagination.totalPages || 1;
        console.log(`[sync] Página ${paginaAtual}/${totalPaginas} - ${registros.length} registros`);
      } else {
        // Sem paginação, apenas uma página
        break;
      }
      
      paginaAtual++;
    }

    console.log(`[sync] Total de registros obtidos: ${todosRegistros.length}`);
    
  } catch (err) {
    console.error('[sync] Erro de rede ao chamar API:', err);
    const error = err as { response?: { status: number; data: unknown }; config?: { url?: string; method?: string; headers?: Record<string, string> }; name?: string; message?: string };
    console.error('[sync] Tipo de erro:', error?.name);
    console.error('[sync] Mensagem:', error?.message);
    console.error('[sync] Tem response?', !!error.response);
    if (error.response) {
      console.error(`[sync] Status: ${error.response.status}`);
      console.error(`[sync] URL requisitada: ${error.config?.url}`);
      console.error(`[sync] Method: ${error.config?.method}`);
      console.error(`[sync] Headers enviados:`, JSON.stringify(error.config?.headers, null, 2));
      console.error(`[sync] Resposta:`, JSON.stringify(error.response.data, null, 2));
    }
    if (error.config) {
      console.error('[sync] Config URL:', error.config.url);
      console.error('[sync] Config headers:', JSON.stringify(error.config.headers, null, 2));
    }
    return;
  }

  if (todosRegistros.length === 0) {
    console.log('[sync] Nenhum registro encontrado na API externa');
    return;
  }

  const registros = todosRegistros;

  // Função para mapear dados da API externa para o formato do Prisma
  const mapearParaAta = (item: ApiExternaItem) => {
    // Extrai sigla do órgão
    const orgao = item.unidade_gestora?.sigla || 'N/A';
    
    // Monta modalidade no formato "SIGLA NNN/AAAA"
    const modalidade = item.modalidade?.sigla_modalidade 
      ? `${item.modalidade.sigla_modalidade} ${item.numero_ano || ''}`
      : item.numero_ano || 'N/A';
    
    // Valor realizado (homologado)
    const valorTotal = item.valor_realizado || 0;
    
    return {
      nup: item.nup,
      modalidade: modalidade.trim(),
      arpNumero: null, // API externa não tem esse campo
      orgaoGerenciador: orgao,
      objeto: item.objeto || 'Sem descrição',
      vigenciaFinal: null, // API externa não tem esse campo
      valorTotal: valorTotal,
      valorAdesao: valorTotal * 2, // 200% do valor total
      saldoDisponivel: valorTotal * 2, // Inicialmente todo disponível
      ativa: item.situacao?.eh_finalizadora ? true : false,
    };
  };

  // Inicia transação
  const results = await prisma.$transaction(async (tx) => {
    const logs: string[] = [];
    for (const item of registros) {
      // Usa o 'nup' da API externa como source_id (identificador único entre sistemas)
      const source_id = item.nup;
      
      if (!source_id) {
        logs.push(`[sync] Ignorado: registro sem nup`);
        continue;
      }
      try {
        // Mapeia os dados para o formato do Prisma
        const dadosMapeados = mapearParaAta(item);
        
        // Busca registro local por source_id
        let local = await tx.ata.findUnique({ where: { source_id } });
        
        // Se não encontrou por source_id, verifica se existe por nup
        if (!local) {
          const porNup = await tx.ata.findUnique({ where: { nup: dadosMapeados.nup } });
          if (porNup) {
            // Encontrou registro local com mesmo NUP mas sem source_id
            // Vincula o source_id ao registro existente
            local = await tx.ata.update({
              where: { id: porNup.id },
              data: { source_id, updated_at_source: new Date() }
            });
            logs.push(`[sync] Vinculado source_id ao registro existente nup=${dadosMapeados.nup}`);
          }
        }
        
        if (!local) {
          // INSERT - novo registro
          await tx.ata.create({ 
            data: { 
              ...dadosMapeados, 
              source_id, 
              updated_at_source: new Date(), 
              deleted_at: item.deleted ? new Date() : null 
            } 
          });
          logs.push(`[sync] Inserido novo registro source_id=${source_id} nup=${item.nup}`);
        } else if (local.local_override) {
          // NÃO atualiza nada
          logs.push(`[sync] Mantido local_override=true source_id=${source_id}`);
        } else if (item.deleted) {
          // Soft delete se permitido
          if (!local.deleted_at) {
            await tx.ata.update({ where: { source_id }, data: { deleted_at: new Date(), updated_at_source: new Date() } });
            logs.push(`[sync] Soft delete source_id=${source_id}`);
          } else {
            logs.push(`[sync] Já estava deletado source_id=${source_id}`);
          }
        } else {
          // UPDATE
          await tx.ata.update({ 
            where: { source_id }, 
            data: { 
              ...dadosMapeados, 
              updated_at_source: new Date(), 
              deleted_at: null 
            } 
          });
          logs.push(`[sync] Atualizado source_id=${source_id} nup=${item.nup}`);
        }
      } catch (e) {
        logs.push(`[sync] Erro ao processar source_id=${source_id}: ${e instanceof Error ? e.message : e}`);
      }
    }
    return logs;
  });

  // Exibe logs
  for (const log of results) {
    console.log(log);
  }
}
