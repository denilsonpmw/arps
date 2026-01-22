import { Request, Response, NextFunction } from 'express';
import { CreateAtaSchema, UpdateAtaSchema, ListAtasSchema } from '../schemas/ataSchema';
import { AtaService } from '../services/ataService';
import { asyncHandler } from '../middleware/errorHandler';
import { prisma } from '../lib/prisma';

// Helper para adicionar totalAderido a uma ata
async function formatAtaComTotalAderido(ata: Record<string, unknown>) {
  const adesoes = await prisma.adesao.findMany({ where: { ataId: ata.id as string } });
  const totalAderido = adesoes.reduce((sum, a) => sum + a.valorAderido.toNumber(), 0);
  return { ...ata, totalAderido };
}

// Helper para adicionar totalAderido a múltiplas atas
async function formatAtasComTotalAderido(atas: Record<string, unknown>[]) {
  return Promise.all(atas.map((ata) => formatAtaComTotalAderido(ata)));
}

export const createAta = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
  const data = CreateAtaSchema.parse(req.body);
  const ata = await AtaService.create(data);
  const ataComTotal = await formatAtaComTotalAderido(ata);
  res.status(201).json({ success: true, data: ataComTotal });
});

export const getAta = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
  const ata = await AtaService.findById(req.params.id);
  if (!ata) {
    res.status(404).json({ success: false, error: { message: 'Ata não encontrada' } });
    return;
  }
  const ataComTotal = await formatAtaComTotalAderido(ata);
  res.json({ success: true, data: ataComTotal });
});

export const listAtas = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
  const query = ListAtasSchema.parse(req.query);
  const skip = query.page && query.limit ? (query.page - 1) * query.limit : undefined;

  const atas = await AtaService.findAll({
    orgaoGerenciador: query.orgaoGerenciador,
    ativa: query.ativa,
    skip,
    take: query.limit,
  });

  const atasComTotal = await formatAtasComTotalAderido(atas);
  const total = await AtaService.count({ ativa: query.ativa });

  res.json({
    success: true,
    data: atasComTotal,
    pagination: query.limit ? { page: query.page || 1, limit: query.limit, total } : undefined,
  });
});

export const updateAta = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
  const data = UpdateAtaSchema.parse(req.body);
  const ata = await AtaService.update(req.params.id, data);
  const ataComTotal = await formatAtaComTotalAderido(ata);
  res.json({ success: true, data: ataComTotal });
});

export const deleteAta = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
  await AtaService.delete(req.params.id);
  res.json({ success: true, message: 'Ata deletada com sucesso' });
});

export const buscarAtaParaRelatorio = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
  const { nup, arpNumero, modalidade } = req.query;
  const { id } = req.params;

  // Se tem ID na rota, buscar por ID
  if (id) {
    const ata = await prisma.ata.findUnique({
      where: { id },
      include: {
        adesoes: {
          orderBy: { data: 'desc' },
        },
      },
    });

    if (!ata) {
      res.status(404).json({ success: false, error: { message: 'Ata não encontrada' } });
      return;
    }

    const totalAderido = ata.adesoes.reduce((sum, a) => sum + a.valorAderido.toNumber(), 0);
    const ataComTotal = { ...ata, totalAderido };

    res.json({ success: true, data: ataComTotal });
    return;
  }

  // Caso contrário, buscar por parâmetros de query
  if (!nup && !arpNumero && !modalidade) {
    res.status(400).json({ 
      success: false, 
      error: { message: 'Forneça pelo menos um parâmetro de busca: nup, arpNumero ou modalidade' } 
    });
    return;
  }

  const filters = [];
  if (nup) filters.push({ nup: String(nup) });
  if (arpNumero) filters.push({ arpNumero: { contains: String(arpNumero), mode: 'insensitive' as const } });
  if (modalidade) filters.push({ modalidade: { contains: String(modalidade), mode: 'insensitive' as const } });

  const ata = await prisma.ata.findFirst({
    where: {
      OR: filters,
    },
    include: {
      adesoes: {
        orderBy: { data: 'desc' },
      },
    },
  });

  if (!ata) {
    res.status(404).json({ success: false, error: { message: 'Ata não encontrada' } });
    return;
  }

  const totalAderido = ata.adesoes.reduce((sum, a) => sum + a.valorAderido.toNumber(), 0);
  const ataComTotal = { ...ata, totalAderido };

  res.json({ success: true, data: ataComTotal });
});
