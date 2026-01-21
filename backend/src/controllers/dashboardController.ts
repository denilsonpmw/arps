import { Request, Response, NextFunction } from 'express';
import { DashboardService } from '../services/dashboardService';
import { asyncHandler } from '../middleware/errorHandler';

export const getDashboard = asyncHandler(async (_req: Request, res: Response, _next: NextFunction) => {
  const dashboard = await DashboardService.getDashboardData();
  res.json({ success: true, data: dashboard });
});

export const getAtasComSaldoCritico = asyncHandler(
  async (_req: Request, res: Response, _next: NextFunction) => {
    const atas = await DashboardService.getAtasComSaldoCritico();
    res.json({ success: true, data: atas });
  }
);

export const getAtasVencendo = asyncHandler(
  async (_req: Request, res: Response, _next: NextFunction) => {
    const atas = await DashboardService.getAtasVencendo();
    res.json({ success: true, data: atas });
  }
);

export const getResumosPorOrgao = asyncHandler(
  async (_req: Request, res: Response, _next: NextFunction) => {
    const resumos = await DashboardService.getResumosPorOrgao();
    res.json({ success: true, data: resumos });
  }
);
