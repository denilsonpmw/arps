import express from 'express';
import {
  createAdesao,
  getAdesao,
  listAdesoes,
  listAdesoesPorAta,
  updateAdesao,
  deleteAdesao,
} from '../controllers/adesaoController';

const router = express.Router();

// CRUD routes
router.post('/', createAdesao);
router.get('/', listAdesoes);
router.get('/:id', getAdesao);
router.patch('/:id', updateAdesao);
router.delete('/:id', deleteAdesao);

// Routes for specific ata
router.get('/ata/:ataId', listAdesoesPorAta);

export default router;
