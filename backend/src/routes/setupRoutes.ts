import express from 'express';
import { createInitialAdmin } from '../controllers/setupController';

const router = express.Router();

router.post('/init-admin', createInitialAdmin);

export default router;
