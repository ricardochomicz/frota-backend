import express from 'express';
import VehicleTiresController from '../controllers/VehicleTiresController';
import { validate } from '../middlewares/Validate';
import { authMiddleware } from '../middlewares/AuthMiddleware';
import { vehicleTiresSchema } from '../schemas/VehicleTiresSchema';

const router = express.Router();

/**
 * @route POST /vehicle-tires
 * @description Associa um pneu a um veículo
 */
router.post('/vehicle-tires', authMiddleware, validate(vehicleTiresSchema), VehicleTiresController.create);

/**
 * @route GET /vehicle-tires/:vehicle_id    
 * @description Busca os pneus associados a um veículo
 */
router.get('/vehicle-tires/:vehicle_id', authMiddleware, VehicleTiresController.getTiresByVehicleId);

/**
 * @param vehicle_id - ID do veículo
 * @param maintenance_id - ID da manutenção
 * @route GET /vehicle-tires/:vehicle_id/maintenance/:maintenance_id/tires
 * @description Busca os pneus associados a um veículo e a uma manutenção
 */
router.get('/vehicle-tires/:vehicle_id/maintenance/:maintenance_id/tires', authMiddleware, VehicleTiresController.getVehicleTiresForMaintenance);

/**
 * @route DELETE /vehicle-tires/:tire_id/delete
 * @description Desassocia um pneu de um veículo
 */
router.delete('/vehicle-tires/:tire_id/delete', authMiddleware, VehicleTiresController.dischargeTire);

/**
 * @route PUT /vehicle-tires/:id/replace-tire
 * 
 */
router.put('/vehicle-tires/:id/remove-to-replace', authMiddleware, VehicleTiresController.removeTireToReplace);

export default router;
