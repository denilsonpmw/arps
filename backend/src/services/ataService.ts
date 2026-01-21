import { prisma } from '../lib/prisma';
import { CreateAtaInput, UpdateAtaInput } from '../schemas/ataSchema';
import { calcularValorAdesao, calcularSaldoDisponivel } from '../utils/calculos';

export class AtaService {
  static async create(data: CreateAtaInput) {
    const valorAdesao = calcularValorAdesao(data.valorTotal);
    const saldoDisponivel = valorAdesao; // Inicialmente, saldo = valor de adesão disponível

    const ata = await prisma.ata.create({
      data: {
        nup: data.nup,
        modalidade: data.modalidade,
        arpNumero: data.arpNumero,
        orgaoGerenciador: data.orgaoGerenciador,
        objeto: data.objeto,
        vigenciaFinal: data.vigenciaFinal,
        valorTotal: data.valorTotal,
        valorAdesao,
        saldoDisponivel,
      },
    });

    return ata;
  }

  static async findById(id: string) {
    return prisma.ata.findUnique({
      where: { id },
      include: { adesoes: true },
    });
  }

  static async findAll(filter?: {
    orgaoGerenciador?: string;
    ativa?: boolean;
    skip?: number;
    take?: number;
  }) {
    return prisma.ata.findMany({
      where: {
        orgaoGerenciador: filter?.orgaoGerenciador,
        ativa: filter?.ativa,
      },
      skip: filter?.skip,
      take: filter?.take,
      orderBy: { vigenciaFinal: 'asc' },
    });
  }

  static async update(id: string, data: UpdateAtaInput) {
    const ata = await prisma.ata.findUnique({ where: { id } });
    if (!ata) throw new Error('Ata não encontrada');

    const updateData: any = { ...data };

    // Se o valor total foi atualizado, recalcular valor de adesão
    if (data.valorTotal && data.valorTotal !== ata.valorTotal.toNumber()) {
      const novoValorAdesao = calcularValorAdesao(data.valorTotal);
      updateData.valorAdesao = novoValorAdesao;

      // Recalcular saldo disponível
      const adesoes = await prisma.adesao.findMany({ where: { ataId: id } });
      const totalAderido = adesoes.reduce((sum, a) => sum + a.valorAderido.toNumber(), 0);
      updateData.saldoDisponivel = calcularSaldoDisponivel(novoValorAdesao, totalAderido);
    }

    return prisma.ata.update({
      where: { id },
      data: updateData,
    });
  }

  static async delete(id: string) {
    const ata = await prisma.ata.findUnique({ 
      where: { id },
      include: { adesoes: true }
    });
    
    if (!ata) throw new Error('Ata não encontrada');

    // Verificar se há adesões cadastradas
    if (ata.adesoes && ata.adesoes.length > 0) {
      throw new Error(`Não é possível excluir esta ata pois ela possui ${ata.adesoes.length} adesão(ões) cadastrada(s)`);
    }

    return prisma.ata.delete({ where: { id } });
  }

  static async count(filter?: { ativa?: boolean }) {
    return prisma.ata.count({
      where: { ativa: filter?.ativa },
    });
  }
}
