import { prisma } from '../lib/prisma';
import { isSaldoCritico, isVigenciaProxima, isVigenciaAtencao } from '../utils/calculos';

export class DashboardService {
  static async getDashboardData() {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    const atas = await prisma.ata.findMany({
      where: { 
        ativa: true,
        vigenciaFinal: { gte: hoje }
      },
      include: { adesoes: true },
    });

    const totalAtasAtivas = atas.length;
    const saldoTotalDisponivel = atas.reduce((sum, ata) => sum + ata.saldoDisponivel.toNumber(), 0);
    const totalAdesoes = atas.reduce((sum, ata) => sum + ata.adesoes.length, 0);

    // Atas com vigência próxima (vencendo nos próximos 2 meses)
    const atasVencendo = atas.filter((ata) => isVigenciaProxima(ata.vigenciaFinal));
    const adesoesvencendo = atasVencendo.length;

    // Atas com saldo crítico (< 30%)
    const atasComSaldoCritico = atas.filter((ata) =>
      isSaldoCritico(ata.saldoDisponivel, ata.valorAdesao)
    );

    // Atas com alerta (saldo crítico OU vigência próxima OU vigência até 6 meses)
    const atasComAlerta = atas.filter((ata) => 
      isSaldoCritico(ata.saldoDisponivel, ata.valorAdesao) || 
      isVigenciaProxima(ata.vigenciaFinal) ||
      isVigenciaAtencao(ata.vigenciaFinal)
    );

    // Ordena por vigência: datas mais próximas primeiro (ascendente)
    atasComAlerta.sort((a, b) => {
      if (!a.vigenciaFinal && !b.vigenciaFinal) return 0;
      if (!a.vigenciaFinal) return 1; // Sem vigência vai pro final
      if (!b.vigenciaFinal) return -1;
      return a.vigenciaFinal.getTime() - b.vigenciaFinal.getTime();
    });

    return {
      totalAtasAtivas,
      saldoTotalDisponivel,
      totalAdesoes,
      adesoesvencendo,
      atasComSaldoCritico: atasComSaldoCritico.length,
      atasAlerta: atasComAlerta.map((ata) => {
        const totalAderido = ata.adesoes.reduce((sum, adesao) => sum + adesao.valorAderido.toNumber(), 0);
        const quantidadeAdesoes = ata.adesoes.length;
        return {
          id: ata.id,
          arpNumero: ata.arpNumero,
          orgaoGerenciador: ata.orgaoGerenciador,
          objeto: ata.objeto,
          vigenciaFinal: ata.vigenciaFinal,
          valorAdesao: ata.valorAdesao.toNumber(),
          quantidadeAdesoes: quantidadeAdesoes,
          totalAderido: totalAderido,
          saldoDisponivel: ata.saldoDisponivel.toNumber(),
          saldoCritico: isSaldoCritico(ata.saldoDisponivel, ata.valorAdesao),
          vigenciaProxima: isVigenciaProxima(ata.vigenciaFinal),
        };
      }),
    };
  }

  static async getAtasComSaldoCritico() {
    const atas = await prisma.ata.findMany({
      where: { ativa: true },
    });

    return atas.filter((ata) => isSaldoCritico(ata.saldoDisponivel, ata.valorAdesao));
  }

  static async getAtasVencendo() {
    const atas = await prisma.ata.findMany({
      where: { ativa: true },
    });

    return atas.filter((ata) => isVigenciaProxima(ata.vigenciaFinal));
  }

  static async getResumosPorOrgao() {
    const atas = await prisma.ata.findMany({
      where: { ativa: true },
      include: { adesoes: true },
    });

    const resumoPorOrgao = new Map<string, any>();

    atas.forEach((ata) => {
      const orgao = ata.orgaoGerenciador;

      if (!resumoPorOrgao.has(orgao)) {
        resumoPorOrgao.set(orgao, {
          orgao,
          totalAtas: 0,
          saldoDisponivel: 0,
          totalAdesoes: 0,
          atividadeComAlerta: false,
        });
      }

      const resumo = resumoPorOrgao.get(orgao);
      resumo.totalAtas += 1;
      resumo.saldoDisponivel += ata.saldoDisponivel.toNumber();
      resumo.totalAdesoes += ata.adesoes.length;

      if (isSaldoCritico(ata.saldoDisponivel, ata.valorAdesao) || isVigenciaProxima(ata.vigenciaFinal)) {
        resumo.atividadeComAlerta = true;
      }
    });

    return Array.from(resumoPorOrgao.values());
  }
}
