import express from 'express';
import {
  createAta,
  getAta,
  listAtas,
  updateAta,
  deleteAta,
  buscarAtaParaRelatorio,
} from '../controllers/ataController';
import { AtaService } from '../services/ataService';
import { adminMiddleware } from '../middleware/adminMiddleware';

const router = express.Router();

// Bulk operations (must come before /:id routes)
router.delete('/bulk', adminMiddleware, async (req, res) => {
  try {
    const { ids } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        error: { message: 'Forneça um array de IDs válido' },
      });
    }

    let deletados = 0;
    const erros: Array<{ id: string; erro: string }> = [];

    for (const id of ids) {
      try {
        await AtaService.delete(id);
        deletados++;
      } catch (error) {
        erros.push({
          id,
          erro: error instanceof Error ? error.message : 'Erro desconhecido',
        });
      }
    }

    return res.json({
      success: true,
      data: {
        total: ids.length,
        deletados,
        erros,
      },
    });
  } catch (error) {
    console.error('Erro ao deletar atas em massa:', error);
    return res.status(500).json({
      success: false,
      error: {
        message: error instanceof Error ? error.message : 'Erro ao deletar atas',
      },
    });
  }
});

// CRUD routes
router.post('/', createAta);
router.get('/', listAtas);
router.get('/relatorio/buscar', buscarAtaParaRelatorio);
router.get('/:id/relatorio', buscarAtaParaRelatorio);
router.get('/:id', getAta);
router.patch('/:id', updateAta);
router.delete('/:id', adminMiddleware, deleteAta);

export default router;
