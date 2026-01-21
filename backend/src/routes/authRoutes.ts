import express from 'express';
import { login, verifyToken } from '../controllers/authController';

const router = express.Router();

router.post('/login', login);
router.get('/verify', verifyToken);

export default router;
