import { Request, Response, NextFunction } from 'express';
import { CreateAdesaoSchema, UpdateAdesaoSchema, ListAdesoesSchema } from '../schemas/adesaoSchema';
import { AdesaoService } from '../services/adesaoService';
import { asyncHandler } from '../middleware/errorHandler';

export const createAdesao = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
  const data = CreateAdesaoSchema.parse(req.body);
  const adesao = await AdesaoService.create(data);
  res.status(201).json({ success: true, data: adesao });
});

export const getAdesao = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
  const adesao = await AdesaoService.findById(req.params.id);
  if (!adesao) {
    res.status(404).json({ success: false, error: { message: 'Adesão não encontrada' } });
    return;
  }
  res.json({ success: true, data: adesao });
});

export const listAdesoes = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
  const query = ListAdesoesSchema.parse(req.query);
  const skip = query.page && query.limit ? (query.page - 1) * query.limit : undefined;

  const adesoes = await AdesaoService.findAll({
    ataId: query.ataId,
    orgaoAderente: query.orgaoAderente,
    skip,
    take: query.limit,
  });

  res.json({ success: true, data: adesoes });
});

export const listAdesoesPorAta = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const ataId = req.params.ataId;
    const query = ListAdesoesSchema.parse(req.query);
    const skip = query.page && query.limit ? (query.page - 1) * query.limit : undefined;

    const adesoes = await AdesaoService.findByAta(ataId, { skip, take: query.limit });
    res.json({ success: true, data: adesoes });
  }
);

export const updateAdesao = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const data = UpdateAdesaoSchema.parse(req.body);
    const adesao = await AdesaoService.update(req.params.id, data);
    res.json({ success: true, data: adesao });
  }
);

export const deleteAdesao = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
  await AdesaoService.delete(req.params.id);
  res.json({ success: true, message: 'Adesão deletada com sucesso' });
});
