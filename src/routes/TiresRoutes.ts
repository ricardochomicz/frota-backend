import express from 'express';
import TireController from '../controllers/TiresController';
import { tiresSchema } from '../schemas/TiresSchema';
import TiresController from '../controllers/TiresController';
import { validate } from '../middlewares/Validate';
import { authMiddleware } from '../middlewares/AuthMiddleware';

const router = express.Router();

/**
 * @route POST /tires
 * @description Criação de um novo pneu
 */
router.post('/tires', authMiddleware, validate(tiresSchema), TiresController.create);


/**
 * @route GET /tires
 * @description Retorna a lista de pneus cadastrados
 */
router.get('/tires', authMiddleware, TireController.getAll);


/**
 * @route GET /tires/:id
 * @description Busca um pneu pelo ID
 */
router.get('/tires/:id', authMiddleware, TireController.get);


/**
 * @route PUT /tires/:id
 * @description Atualiza um pneu pelo ID
 */
router.put('/tires/:id/edit', authMiddleware, validate(tiresSchema), TireController.update);


/**
 * @route DELETE /tires/:id/delete
 * @description Deleta um pneu pelo ID
 */
router.delete('/tires/:id/delete', authMiddleware, TireController.destroy);


/**
 * @route GET /tires/code/:code
 * @description Busca um pneu pelo código
 */
router.get('/tires-code/:code', authMiddleware, TireController.getTiresByCode);


/**
 * @route PUT /tires/:id/update-status-for-analysis
 * @description Atualiza o status um pneu pelo ID
 */
router.put('/tires/:id/update-status-after-analysis', authMiddleware, TireController.updateStatusAfterAnalysis);

export default router;