import express from 'express';
import VehicleTiresController from '../controllers/VehicleTiresController';
import { validate } from '../middlewares/Validate';
import { authMiddleware } from '../middlewares/AuthMiddleware';
import { vehicleTiresSchema } from '../schemas/VehicleTiresSchema';

const router = express.Router();

router.post('/vehicle-tires', authMiddleware, validate(vehicleTiresSchema), VehicleTiresController.create);

router.get('/vehicle-tires/:vehicle_id', authMiddleware, VehicleTiresController.getTiresByVehicleId);

router.get('/vehicle-tires/:vehicle_id/maintenance/:maintenance_id/tires', authMiddleware, VehicleTiresController.getVehicleTiresForMaintenance);

router.delete('/vehicle-tires/:tire_id/delete', authMiddleware, VehicleTiresController.dischargeTire);

router.put('/vehicle-tires/:id/remove-to-replace', authMiddleware, VehicleTiresController.removeTireToReplace);

export default router;
