import express from 'express';
import {
  getDashboard,
  getAtasComSaldoCritico,
  getAtasVencendo,
  getResumosPorOrgao,
} from '../controllers/dashboardController';

const router = express.Router();

router.get('/', getDashboard);
router.get('/saldo-critico', getAtasComSaldoCritico);
router.get('/vencendo', getAtasVencendo);
router.get('/resumos-orgao', getResumosPorOrgao);

export default router;
