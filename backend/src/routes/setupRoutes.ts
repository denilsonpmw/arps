import express from 'express';
import { createInitialAdmin, updateLocalOverride } from '../controllers/setupController';

const router = express.Router();

router.post('/init-admin', createInitialAdmin);
router.post('/update-local-override', updateLocalOverride);

export default router;
