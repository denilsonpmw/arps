import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'arps-supel-secret-key-change-in-production';

export interface AuthRequest extends Request {
  userId?: string;
  userEmail?: string;
  userRole?: string;
}

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction): void => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      res.status(401).json({
        success: false,
        error: { message: 'Token de autenticação não fornecido' },
      });
      return;
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; email: string; role: string };
    req.userId = decoded.userId;
    req.userEmail = decoded.email;
    req.userRole = decoded.role;

    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      error: { message: 'Token inválido ou expirado' },
    });
  }
};
