import { prisma } from '../lib/prisma';
import { CreateAdesaoInput, UpdateAdesaoInput } from '../schemas/adesaoSchema';
import { validarAdesao, calcularSaldoDisponivel } from '../utils/calculos';

export class AdesaoService {
  static async create(data: CreateAdesaoInput) {
    // Buscar a ata
    const ata = await prisma.ata.findUnique({
      where: { id: data.ataId },
      include: { adesoes: true },
    });

    if (!ata) throw new Error('Ata não encontrada');

    // Calcular total de adesões já existentes
    const totalAderido = ata.adesoes.reduce((sum, a) => sum + a.valorAderido.toNumber(), 0);

    // Validar adesão
    const validacao = validarAdesao(ata.valorAdesao, data.valorAderido, totalAderido);
    if (!validacao.valido) {
      throw new Error(validacao.motivo);
    }

    // Criar adesão
    const adesao = await prisma.adesao.create({
      data: {
        ataId: data.ataId,
        numeroIdentificador: data.numeroIdentificador,
        orgaoAderente: data.orgaoAderente,
        valorAderido: data.valorAderido,
      },
    });

    // Atualizar saldo disponível da ata
    const novoSaldo = calcularSaldoDisponivel(
      ata.valorAdesao,
      totalAderido + data.valorAderido
    );

    await prisma.ata.update({
      where: { id: data.ataId },
      data: { saldoDisponivel: novoSaldo },
    });

    return adesao;
  }

  static async findById(id: string) {
    return prisma.adesao.findUnique({
      where: { id },
      include: { ata: true },
    });
  }

  static async findByAta(ataId: string, filter?: { skip?: number; take?: number }) {
    return prisma.adesao.findMany({
      where: { ataId },
      include: { ata: true },
      skip: filter?.skip,
      take: filter?.take,
      orderBy: { data: 'desc' },
    });
  }

  static async findAll(filter?: {
    ataId?: string;
    orgaoAderente?: string;
    skip?: number;
    take?: number;
  }) {
    return prisma.adesao.findMany({
      where: {
        ataId: filter?.ataId,
        orgaoAderente: filter?.orgaoAderente,
      },
      include: { ata: true },
      skip: filter?.skip,
      take: filter?.take,
      orderBy: { data: 'desc' },
    });
  }

  static async update(id: string, data: UpdateAdesaoInput) {
    const adesao = await prisma.adesao.findUnique({
      where: { id },
      include: { ata: { include: { adesoes: true } } },
    });

    if (!adesao) throw new Error('Adesão não encontrada');

    // Se valor foi alterado, validar novamente
    if (data.valorAderido && data.valorAderido !== adesao.valorAderido.toNumber()) {
      const totalOutrasAdesoes = adesao.ata.adesoes
        .filter((a) => a.id !== id)
        .reduce((sum, a) => sum + a.valorAderido.toNumber(), 0);

      const validacao = validarAdesao(
        adesao.ata.valorAdesao,
        data.valorAderido,
        totalOutrasAdesoes
      );

      if (!validacao.valido) {
        throw new Error(validacao.motivo);
      }

      // Atualizar saldo disponível
      const novoSaldo = calcularSaldoDisponivel(
        adesao.ata.valorAdesao,
        totalOutrasAdesoes + data.valorAderido
      );

      await prisma.ata.update({
        where: { id: adesao.ataId },
        data: { saldoDisponivel: novoSaldo },
      });
    }

    return prisma.adesao.update({
      where: { id },
      data,
    });
  }

  static async delete(id: string) {
    const adesao = await prisma.adesao.findUnique({
      where: { id },
      include: { ata: { include: { adesoes: true } } },
    });

    if (!adesao) throw new Error('Adesão não encontrada');

    // Deletar adesão
    await prisma.adesao.delete({ where: { id } });

    // Recalcular saldo disponível
    const totalOutrasAdesoes = adesao.ata.adesoes
      .filter((a) => a.id !== id)
      .reduce((sum, a) => sum + a.valorAderido.toNumber(), 0);

    const novoSaldo = calcularSaldoDisponivel(adesao.ata.valorAdesao, totalOutrasAdesoes);

    await prisma.ata.update({
      where: { id: adesao.ataId },
      data: { saldoDisponivel: novoSaldo },
    });
  }
}
