import express from 'express';
import MaintenanceController from '../controllers/MaintenanceController';
import { authMiddleware } from '../middlewares/AuthMiddleware';

const router = express.Router();

router.post('/maintenances', authMiddleware, MaintenanceController.create);

router.get('/maintenances', authMiddleware, MaintenanceController.getAll);

export default router;