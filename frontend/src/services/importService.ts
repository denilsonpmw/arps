import api from './api';

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

export interface ImportPreview {
  totalProcessos: number;
  processosValidos: number;
  processosInvalidos: number;
  nupsDuplicados: number;
}

export interface ImportResult {
  total: number;
  importados: number;
  ignorados: number;
  erros: Array<{ nup: string; erro: string }>;
  atasImportadas: Array<{ nup: string; arpNumero: string }>;
}

export const importService = {
  /**
   * Gera preview da importação sem executá-la
   */
  async preview(data: { data: ProcessoRP[] }): Promise<ImportPreview> {
    const response = await api.post('/import/preview', data);
    return response.data.data;
  },

  /**
   * Executa a importação dos processos
   */
  async executar(data: { data: ProcessoRP[] }): Promise<ImportResult> {
    const response = await api.post('/import/executar', data);
    return response.data.data;
  },
};
