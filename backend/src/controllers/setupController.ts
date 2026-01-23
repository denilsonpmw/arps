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

export const updateLocalOverride = async (_req: Request, res: Response) => {
  try {
    // Atualiza local_override=true onde arpNumero tem valor
    const result = await prisma.$executeRaw`
      UPDATE "Ata" 
      SET local_override = true 
      WHERE "arpNumero" IS NOT NULL 
        AND "arpNumero" != ''
        AND local_override = false
    `;

    // Conta quantos registros agora têm local_override=true
    const count = await prisma.ata.count({
      where: {
        arpNumero: { not: null },
        local_override: true
      }
    });

    res.json({
      success: true,
      message: 'Local override atualizado com sucesso',
      data: { 
        registrosAtualizados: Number(result),
        totalComLocalOverride: count
      }
    });
  } catch (error) {
    console.error('Erro ao atualizar local_override:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Erro ao atualizar local_override' }
    });
  }
};
