import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { asyncHandler } from '../middleware/errorHandler';
import { prisma } from '../index';

const JWT_SECRET = process.env.JWT_SECRET || 'arps-supel-secret-key-change-in-production';

export const login = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({
      success: false,
      error: { message: 'Email e senha são obrigatórios' },
    });
    return;
  }

  // Buscar usuário no banco de dados
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    res.status(401).json({
      success: false,
      error: { message: 'Credenciais inválidas' },
    });
    return;
  }

  // Verificar senha
  const isValidPassword = await bcrypt.compare(password, user.password);
  
  if (!isValidPassword) {
    res.status(401).json({
      success: false,
      error: { message: 'Credenciais inválidas' },
    });
    return;
  }

  // Gerar token JWT
  const token = jwt.sign(
    { userId: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: '24h' }
  );

  res.json({
    success: true,
    data: {
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    },
  });
});

export const verifyToken = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
  const token = req.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    res.status(401).json({
      success: false,
      error: { message: 'Token não fornecido' },
    });
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; email: string; role: string };

    // Buscar usuário no banco para garantir que ainda existe
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!user) {
      res.status(401).json({
        success: false,
        error: { message: 'Usuário não encontrado' },
      });
      return;
    }

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
      },
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      error: { message: 'Token inválido ou expirado' },
    });
  }
});
