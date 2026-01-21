import { Router } from 'express';
import { listUsers, createUser, updateUser, deleteUser } from '../controllers/userController';
import { authMiddleware } from '../middleware/auth';
import { adminMiddleware } from '../middleware/adminMiddleware';

const router = Router();

// Todas as rotas requerem autenticação e role de admin
router.use(authMiddleware);
router.use(adminMiddleware);

router.get('/', listUsers);
router.post('/', createUser);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);

export default router;
