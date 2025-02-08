import express from 'express';
import MaintenanceController from '../controllers/MaintenanceController';
import { authMiddleware } from '../middlewares/AuthMiddleware';
import { validate } from '../middlewares/Validate';
import { maintenanceSchema } from '../schemas/MaintenanceSchema';

const router = express.Router();

/**
 * @route POST /maintenances
 * @description Criação de uma nova manutenção
 */
router.post('/maintenances', authMiddleware, MaintenanceController.create);


/**
 * @route GET /maintenances
 * @description Retorna a lista de manutenções cadastradas
 */
router.get('/maintenances', authMiddleware, MaintenanceController.getAll);


/**
 * @route GET /maintenances/:id
 * @description Busca uma manutenção pelo ID
 */
router.get('/maintenances/:id', authMiddleware, MaintenanceController.get);


/**
 * @route PUT /maintenances/:id
 * @description Atualiza uma manutenção pelo ID
 */
router.put('/maintenances/:id/edit', authMiddleware, validate(maintenanceSchema), MaintenanceController.update);


/**
 * @route DELETE /maintenances/:id/delete
 * @description Deleta uma manutenção pelo ID
 */
router.delete('/maintenances/:id/delete', authMiddleware, MaintenanceController.destroy);

export default router; 