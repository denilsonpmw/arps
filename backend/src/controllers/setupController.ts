import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../index';

export const createInitialAdmin = async (_req: Request, res: Response) => {
  try {
    // Verificar se já existe
    const existing = await prisma.user.findUnique({
      where: { email: 'admin@supel.gov.br' }
    });

    if (existing) {
      res.json({
        success: true,
        message: 'Admin já existe',
        data: { email: existing.email, name: existing.name, role: existing.role }
      });
      return;
    }

    // Criar admin
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const admin = await prisma.user.create({
      data: {
        email: 'admin@supel.gov.br',
        password: hashedPassword,
        name: 'Administrador',
        role: 'admin'
      }
    });

    res.json({
      success: true,
      message: 'Admin criado com sucesso',
      data: { email: admin.email, name: admin.name, role: admin.role }
    });
  } catch (error) {
    console.error('Erro ao criar admin:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Erro ao criar admin' }
    });
  }
};
