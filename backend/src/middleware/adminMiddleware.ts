import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth';

export const adminMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.userRole || req.userRole !== 'admin') {
    res.status(403).json({
      success: false,
      error: { message: 'Acesso negado. Apenas administradores podem realizar esta ação.' },
    });
    return;
  }
  
  next();
};
