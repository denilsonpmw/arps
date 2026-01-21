import { prisma } from '../lib/prisma';
import { calcularValorAdesao } from '../utils/calculos';

export interface ProcessoRP {
  nup: string;
  objeto: string;
  ug: string;
  modalidade: string;
  numero_ano: string;
  situacao: string;
  valor_realizado: number;
  rp: boolean;
  conclusao: boolean;
}

export interface ImportResult {
  total: number;
  importados: number;
  ignorados: number;
  erros: Array<{ nup: string; erro: string }>;
  atasImportadas: Array<{ nup: string; arpNumero: string }>;
}

export class ImportService {
  /**
   * Importa processos de RP do arquivo JSON para criar Atas
   */
  static async importarProcessosRP(processos: ProcessoRP[]): Promise<ImportResult> {
    const result: ImportResult = {
      total: processos.length,
      importados: 0,
      ignorados: 0,
      erros: [],
      atasImportadas: [],
    };

    for (const processo of processos) {
      try {
        // Validações básicas
        if (!processo.rp || !processo.conclusao) {
          result.ignorados++;
          continue;
        }

        if (processo.situacao === 'Revogado' || processo.valor_realizado === 0) {
          result.ignorados++;
          continue;
        }

        // Verificar se já existe uma ata com este NUP
        const ataExistente = await prisma.ata.findFirst({
          where: { nup: processo.nup },
        });

        if (ataExistente) {
          result.ignorados++;
          result.erros.push({
            nup: processo.nup,
            erro: 'Ata já existe no sistema',
          });
          continue;
        }

        // Formatar modalidade a partir de modalidade e numero_ano
        const modalidadeCompleta = `${processo.modalidade} ${processo.numero_ano}`;

        // Calcular valor de adesão (50% do valor total)
        const valorAdesao = calcularValorAdesao(processo.valor_realizado);

        // Criar a ata
        const ata = await prisma.ata.create({
          data: {
            nup: processo.nup,
            modalidade: modalidadeCompleta,
            arpNumero: '', // Será preenchido posteriormente
            orgaoGerenciador: processo.ug,
            objeto: processo.objeto,
            vigenciaFinal: null, // Será preenchido posteriormente
            valorTotal: processo.valor_realizado,
            valorAdesao: valorAdesao,
            saldoDisponivel: valorAdesao,
            ativa: true,
          },
        });

        result.importados++;
        result.atasImportadas.push({
          nup: ata.nup,
          arpNumero: ata.modalidade, // Retorna modalidade para visualização
        });
      } catch (error) {
        result.erros.push({
          nup: processo.nup,
          erro: error instanceof Error ? error.message : 'Erro desconhecido',
        });
      }
    }

    return result;
  }

  /**
   * Valida o arquivo JSON de importação
   */
  static validarArquivoImportacao(data: unknown): { valido: boolean; mensagem?: string } {
    if (!data || typeof data !== 'object' || !('data' in data) || !Array.isArray((data as any).data)) {
      return {
        valido: false,
        mensagem: 'Arquivo inválido. Esperado um objeto com propriedade "data" contendo array de processos.',
      };
    }

    const dataObj = data as { data: ProcessoRP[] };

    if (dataObj.data.length === 0) {
      return {
        valido: false,
        mensagem: 'Arquivo não contém processos para importar.',
      };
    }

    // Validar estrutura básica do primeiro processo
    const primeiroProcesso = dataObj.data[0];
    const camposObrigatorios = ['nup', 'objeto', 'ug', 'modalidade', 'numero_ano', 'valor_realizado'];
    
    for (const campo of camposObrigatorios) {
      if (!(campo in primeiroProcesso)) {
        return {
          valido: false,
          mensagem: `Campo obrigatório "${campo}" não encontrado nos processos.`,
        };
      }
    }

    return { valido: true };
  }

  /**
   * Obtém estatísticas de importação antes de executar
   */
  static async obterEstatisticasImportacao(processos: ProcessoRP[]): Promise<{
    totalProcessos: number;
    processosValidos: number;
    processosInvalidos: number;
    nupsDuplicados: number;
  }> {
    let processosValidos = 0;
    let processosInvalidos = 0;
    let nupsDuplicados = 0;

    for (const processo of processos) {
      // Verificar se é válido
      if (!processo.rp || !processo.conclusao || processo.situacao === 'Revogado' || processo.valor_realizado === 0) {
        processosInvalidos++;
        continue;
      }

      // Verificar se já existe
      const existe = await prisma.ata.findFirst({
        where: { nup: processo.nup },
      });

      if (existe) {
        nupsDuplicados++;
        continue;
      }

      processosValidos++;
    }

    return {
      totalProcessos: processos.length,
      processosValidos,
      processosInvalidos,
      nupsDuplicados,
    };
  }
}
