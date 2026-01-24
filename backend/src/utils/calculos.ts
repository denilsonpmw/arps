import { Decimal } from '@prisma/client/runtime/library';

/**
 * Calcula o valor de adesão total permitido (limite global) baseado no valor total
 * Conforme Lei 14.133/2021: até 4 órgãos podem aderir com 50% cada = 200% do valor total
 * Fórmula: VALOR_TOTAL * 2 (200% do valor total)
 */
export function calcularValorAdesao(valorTotal: number | Decimal): number {
  const total = typeof valorTotal === 'number' ? valorTotal : valorTotal.toNumber();
  return total * 2;
}

/**
 * Calcula o máximo permitido para uma adesão individual (50% do valor total)
 */
export function calcularMaximoAdesaoIndividual(valorTotal: number | Decimal): number {
  const total = typeof valorTotal === 'number' ? valorTotal : valorTotal.toNumber();
  return total * 0.5;
}

/**
 * Calcula o saldo disponível para novas adesões
 */
export function calcularSaldoDisponivel(
  valorAdesao: number | Decimal,
  valorTotalAderido: number | Decimal
): number {
  const adesao = typeof valorAdesao === 'number' ? valorAdesao : valorAdesao.toNumber();
  const aderido = typeof valorTotalAderido === 'number' ? valorTotalAderido : valorTotalAderido.toNumber();
  return adesao - aderido;
}

/**
 * Verifica se a ata está com saldo critico (abaixo de 30%)
 */
export function isSaldoCritico(saldoDisponivel: number | Decimal, valorAdesao: number | Decimal): boolean {
  const saldo = typeof saldoDisponivel === 'number' ? saldoDisponivel : saldoDisponivel.toNumber();
  const adesao = typeof valorAdesao === 'number' ? valorAdesao : valorAdesao.toNumber();
  return saldo < (adesao * 0.3);
}

/**
 * Verifica se a vigência termina nos próximos 3 meses (incluindo o mês atual)
 */
export function isVigenciaProxima(vigenciaFinal: Date | null): boolean {
  if (!vigenciaFinal) return false;
  
  const hoje = new Date();
  const agora = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());
  const fim = new Date(vigenciaFinal.getFullYear(), vigenciaFinal.getMonth(), vigenciaFinal.getDate());
  
  // Calcula a data daqui a 3 meses
  const tresMesesFrente = new Date(agora);
  tresMesesFrente.setMonth(agora.getMonth() + 3);
  
  // Verifica se a vigência final está entre hoje e 3 meses à frente
  return fim >= agora && fim <= tresMesesFrente;
}

/**
 * Verifica se a vigência termina nos próximos 6 meses (para alertas de atenção)
 */
export function isVigenciaAtencao(vigenciaFinal: Date | null): boolean {
  if (!vigenciaFinal) return false;
  
  const hoje = new Date();
  const agora = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());
  const fim = new Date(vigenciaFinal.getFullYear(), vigenciaFinal.getMonth(), vigenciaFinal.getDate());
  
  // Calcula a data daqui a 6 meses
  const seisMesesFrente = new Date(agora);
  seisMesesFrente.setMonth(agora.getMonth() + 6);
  
  // Verifica se a vigência final está entre hoje e 6 meses à frente
  return fim >= agora && fim <= seisMesesFrente;
}

/**
 * Valida se a adesão pode ser realizada
 */
export interface ValidacaoAdesao {
  valido: boolean;
  motivo?: string;
}

export function validarAdesao(
  valorAdesao: number | Decimal,
  valorIndividual: number,
  valorTotalAtual: number
): ValidacaoAdesao {
  const adesao = typeof valorAdesao === 'number' ? valorAdesao : valorAdesao.toNumber();
  
  // Validação 1: Valor individual não pode exceder 50% do VALOR_TOTAL
  const maxIndividual = adesao / 2; // 50% de (VALOR_TOTAL * 2)
  if (valorIndividual > maxIndividual) {
    return {
      valido: false,
      motivo: `Valor da adesão (R$ ${valorIndividual.toFixed(2)}) excede o limite de 50% do valor total (R$ ${maxIndividual.toFixed(2)})`,
    };
  }

  // Validação 2: Soma total não pode exceder VALOR_ADESAO
  if (valorTotalAtual + valorIndividual > adesao) {
    return {
      valido: false,
      motivo: `Soma das adesões (R$ ${(valorTotalAtual + valorIndividual).toFixed(2)}) excede o limite de 200% do valor total (R$ ${adesao.toFixed(2)})`,
    };
  }

  return { valido: true };
}
