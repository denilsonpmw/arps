import { Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import { asyncHandler } from '../middleware/errorHandler';
import { prisma } from '../index';
import { AuthRequest } from '../middleware/auth';

// Listar todos os usuários (apenas admin)
export const listUsers = asyncHandler(async (_req: AuthRequest, res: Response, _next: NextFunction) => {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      createdAt: true,
      updatedAt: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  res.json({
    success: true,
    data: users,
  });
});

// Criar novo usuário (apenas admin)
export const createUser = asyncHandler(async (req: AuthRequest, res: Response, _next: NextFunction) => {
  const { email, password, name, role } = req.body;

  if (!email || !password || !name) {
    res.status(400).json({
      success: false,
      error: { message: 'Email, senha e nome são obrigatórios' },
    });
    return;
  }

  // Verificar se email já existe
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    res.status(400).json({
      success: false,
      error: { message: 'Email já cadastrado' },
    });
    return;
  }

  // Hash da senha
  const hashedPassword = await bcrypt.hash(password, 10);

  // Criar usuário
  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      name,
      role: role || 'user',
    },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  res.status(201).json({
    success: true,
    data: user,
  });
});

// Atualizar usuário (apenas admin)
export const updateUser = asyncHandler(async (req: AuthRequest, res: Response, _next: NextFunction) => {
  const { id } = req.params;
  const { email, password, name, role } = req.body;

  // Verificar se usuário existe
  const existingUser = await prisma.user.findUnique({
    where: { id },
  });

  if (!existingUser) {
    res.status(404).json({
      success: false,
      error: { message: 'Usuário não encontrado' },
    });
    return;
  }

  // Se email foi alterado, verificar se já existe
  if (email && email !== existingUser.email) {
    const emailExists = await prisma.user.findUnique({
      where: { email },
    });

    if (emailExists) {
      res.status(400).json({
        success: false,
        error: { message: 'Email já cadastrado' },
      });
      return;
    }
  }

  // Preparar dados para atualização
  const updateData: any = {};
  if (email) updateData.email = email;
  if (name) updateData.name = name;
  if (role) updateData.role = role;
  if (password) {
    updateData.password = await bcrypt.hash(password, 10);
  }

  // Atualizar usuário
  const user = await prisma.user.update({
    where: { id },
    data: updateData,
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  res.json({
    success: true,
    data: user,
  });
});

// Deletar usuário (apenas admin)
export const deleteUser = asyncHandler(async (req: AuthRequest, res: Response, _next: NextFunction) => {
  const { id } = req.params;

  // Verificar se usuário existe
  const user = await prisma.user.findUnique({
    where: { id },
  });

  if (!user) {
    res.status(404).json({
      success: false,
      error: { message: 'Usuário não encontrado' },
    });
    return;
  }

  // Impedir que o usuário delete a si mesmo
  if (id === req.userId) {
    res.status(400).json({
      success: false,
      error: { message: 'Você não pode deletar seu próprio usuário' },
    });
    return;
  }

  // Deletar usuário
  await prisma.user.delete({
    where: { id },
  });

  res.json({
    success: true,
    data: { message: 'Usuário deletado com sucesso' },
  });
});
