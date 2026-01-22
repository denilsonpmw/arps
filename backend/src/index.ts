import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { errorHandler } from './middleware/errorHandler';
import { prisma } from './lib/prisma';
import authRoutes from './routes/authRoutes';
import ataRoutes from './routes/ataRoutes';
import adesaoRoutes from './routes/adesaoRoutes';
import dashboardRoutes from './routes/dashboardRoutes';
import importRoutes from './routes/importRoutes';
import userRoutes from './routes/userRoutes';
import setupRoutes from './routes/setupRoutes';
import { authMiddleware } from './middleware/auth';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:3000';

// Middleware
app.use(cors({ origin: CORS_ORIGIN }));
app.use(express.json());

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Rotas públicas (sem autenticação)
app.use('/api/auth', authRoutes);
app.use('/api/setup', setupRoutes); // Rota para criar admin inicial

// Rotas protegidas (com autenticação)
app.use('/api/atas', authMiddleware, ataRoutes);
app.use('/api/adesoes', authMiddleware, adesaoRoutes);
app.use('/api/dashboard', authMiddleware, dashboardRoutes);
app.use('/api/import', authMiddleware, importRoutes);
app.use('/api/users', userRoutes); // já tem authMiddleware e adminMiddleware internamente

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ success: false, error: { message: 'Rota não encontrada' } });
});

// Error handler (deve ser o último middleware)
app.use(errorHandler);

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully');
  await prisma.$disconnect();
  process.exit(0);
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Exportar prisma para uso nos controllers
export { prisma };
