export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return '-';
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return '-';
  return new Intl.DateTimeFormat('pt-BR').format(d);
}

export function formatDateTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(d);
}

export function getPercentage(value: number, total: number): number {
  if (total === 0) return 0;
  return (value / total) * 100;
}

export function isSaldoCritico(saldo: number, valorAdesao: number): boolean {
  return saldo < (valorAdesao * 0.2);
}

export function isVigenciaProxima(vigenciaFinal: string | Date): boolean {
  const data = typeof vigenciaFinal === 'string' ? new Date(vigenciaFinal) : vigenciaFinal;
  const hoje = new Date();
  const agora = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());
  const fim = new Date(data.getFullYear(), data.getMonth(), data.getDate());

  return agora.getFullYear() === fim.getFullYear() && agora.getMonth() === fim.getMonth();
}

export function truncate(str: string, length: number = 50): string {
  if (str.length <= length) return str;
  return str.substring(0, length) + '...';
}
