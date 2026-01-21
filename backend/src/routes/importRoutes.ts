import { Router } from 'express';
import { ImportService } from '../services/importService';

const router = Router();

/**
 * POST /api/import/preview
 * Pré-visualiza o resultado da importação sem executá-la
 */
router.post('/preview', async (req, res) => {
  try {
    const { data } = req.body;

    // Validar estrutura do arquivo
    const validacao = ImportService.validarArquivoImportacao(req.body);
    if (!validacao.valido) {
      return res.status(400).json({
        success: false,
        error: validacao.mensagem,
      });
    }

    // Obter estatísticas
    const stats = await ImportService.obterEstatisticasImportacao(data);

    return res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error('Erro ao gerar preview de importação:', error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Erro ao processar preview',
    });
  }
});

/**
 * POST /api/import/executar
 * Executa a importação dos processos de RP
 */
router.post('/executar', async (req, res) => {
  try {
    const { data } = req.body;

    // Validar estrutura do arquivo
    const validacao = ImportService.validarArquivoImportacao(req.body);
    if (!validacao.valido) {
      return res.status(400).json({
        success: false,
        error: validacao.mensagem,
      });
    }

    // Executar importação
    const resultado = await ImportService.importarProcessosRP(data);

    return res.json({
      success: true,
      data: resultado,
    });
  } catch (error) {
    console.error('Erro ao executar importação:', error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Erro ao executar importação',
    });
  }
});

export default router;
