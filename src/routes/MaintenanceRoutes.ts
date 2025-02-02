import express from 'express';
import MaintenanceController from '../controllers/MaintenanceController';
import { authMiddleware } from '../middlewares/AuthMiddleware';

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
router.put('/maintenances/:id/edit', authMiddleware, MaintenanceController.update);

router.delete('/maintenances/:id/delete', authMiddleware, MaintenanceController.destroy);

export default router;