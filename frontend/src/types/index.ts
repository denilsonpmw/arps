export interface Ata {
  id: string;
  nup: string;
  modalidade: string;
  arpNumero: string;
  orgaoGerenciador: string;
  objeto: string;
  vigenciaFinal: string;
  valorTotal: number;
  valorAdesao: number;
  totalAderido: number;
  saldoDisponivel: number;
  ativa: boolean;
  adesoes: Adesao[];
  criadoEm: string;
  atualizadoEm: string;
}

export interface Adesao {
  id: string;
  ataId: string;
  ata: Ata;
  numeroIdentificador: string;
  data: string;
  orgaoAderente: string;
  valorAderido: number;
  criadoEm: string;
  atualizadoEm: string;
}

export interface DashboardData {
  totalAtasAtivas: number;
  saldoTotalDisponivel: number;
  totalAdesoes: number;
  adesoesvencendo: number;
  atasComSaldoCritico: number;
  atasAlerta: AtaAlerta[];
}

export interface AtaAlerta {
  id: string;
  arpNumero: string;
  orgaoGerenciador: string;
  objeto: string;
  saldoDisponivel: number;
  saldoCritico: boolean;
  vigenciaProxima: boolean;
  vigenciaFinal: string;
  valorAdesao: number;
}

export interface CreateAtaInput {
  nup: string;
  modalidade: string;
  arpNumero: string;
  orgaoGerenciador: string;
  objeto: string;
  vigenciaFinal: string;
  valorTotal: number;
}

export interface CreateAdesaoInput {
  ataId: string;
  numeroIdentificador: string;
  orgaoAderente: string;
  valorAderido: number;
}
