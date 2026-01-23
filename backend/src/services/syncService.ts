import { prisma } from '../lib/prisma';
import axios from 'axios';

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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let response: any;
  try {
    console.log('[sync] Chamando API externa...');
    console.log(`[sync] URL completa: ${API_URL}`);
    response = await axios.get(API_URL, {
      headers: { 'x-api-key': API_KEY },
      timeout: 15000,
    });
    console.log(`[sync] Resposta HTTP: status ${response.status}`);
    if (response.status !== 200) {
      console.error(`[sync] Erro HTTP: status ${response.status}`);
      return;
    }
  } catch (err) {
    console.error('[sync] Erro de rede ao chamar API:', err);
    const error = err as any;
    if (error.response) {
      console.error(`[sync] Status: ${error.response.status}`);
      console.error(`[sync] URL requisitada: ${error.config?.url}`);
      console.error(`[sync] Method: ${error.config?.method}`);
      console.error(`[sync] Headers enviados:`, JSON.stringify(error.config?.headers));
      console.error(`[sync] Resposta:`, JSON.stringify(error.response.data));
    }
    return;
  }

  const registros = Array.isArray(response.data) ? response.data : response.data?.data;
  if (!Array.isArray(registros)) {
    console.error('[sync] Resposta da API não é um array');
    return;
  }

  // Inicia transação
  const results = await prisma.$transaction(async (tx) => {
    const logs: string[] = [];
    for (const item of registros) {
      const { source_id, deleted, ...dados } = item;
      if (!source_id) {
        logs.push(`[sync] Ignorado: registro sem source_id`);
        continue;
      }
      try {
        // Busca registro local
        const local = await tx.ata.findUnique({ where: { source_id } });
        if (!local) {
          // INSERT
          await tx.ata.create({ data: { ...dados, source_id, updated_at_source: new Date(), deleted_at: deleted ? new Date() : null } });
          logs.push(`[sync] Inserido novo registro source_id=${source_id}`);
        } else if (local.local_override) {
          // NÃO atualiza nada
          logs.push(`[sync] Mantido local_override=true source_id=${source_id}`);
        } else if (deleted) {
          // Soft delete se permitido
          if (!local.deleted_at) {
            await tx.ata.update({ where: { source_id }, data: { deleted_at: new Date(), updated_at_source: new Date() } });
            logs.push(`[sync] Soft delete source_id=${source_id}`);
          } else {
            logs.push(`[sync] Já estava deletado source_id=${source_id}`);
          }
        } else {
          // UPDATE
          await tx.ata.update({ where: { source_id }, data: { ...dados, updated_at_source: new Date(), deleted_at: null } });
          logs.push(`[sync] Atualizado source_id=${source_id}`);
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
