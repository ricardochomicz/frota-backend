import express from 'express';
import CostAnalysisController from '../controllers/CostAnalysisController';
import { authMiddleware } from '../middlewares/AuthMiddleware';
import { validate } from '../middlewares/Validate';
import { costAnalysisSchema } from '../schemas/CostAnalysisSchema';

const router = express.Router();

/**
 * @route POST /cost-analysis
 * @description Criação de uma analise de custo
 */
router.post('/cost-analysis', authMiddleware, validate(costAnalysisSchema), CostAnalysisController.create);

/**
 * @route GET /cost-analysis
 * @description Retorna a lista de analises de custo cadastradas
 */
router.get('/cost-analysis', authMiddleware, CostAnalysisController.getAll);

/**
 * @route GET /cost-analysis/:id
 * @description Busca uma analise de custo pelo ID
 */
router.get('/cost-analysis/:id', authMiddleware, CostAnalysisController.get);

/**
 * @route PUT /cost-analysis/:id
 * @description Atualiza uma analise de custo pelo ID
 */
router.put('/cost-analysis/:id', authMiddleware, validate(costAnalysisSchema), CostAnalysisController.update);

/**
 * @route DELETE /cost-analysis/:id
 * @description Exclui uma analise de custo pelo ID
 */
router.delete('/cost-analysis/:id', authMiddleware, CostAnalysisController.delete);

export default router;