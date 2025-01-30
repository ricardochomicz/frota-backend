import express from 'express';
import VehicleTiresController from '../controllers/VehicleTiresController';
import { validate } from '../middlewares/Validate';
import { authMiddleware } from '../middlewares/AuthMiddleware';
import { vehicleTiresSchema } from '../schemas/VehicleTiresSchema';

const router = express.Router();

router.post('/vehicle-tires', authMiddleware, validate(vehicleTiresSchema), VehicleTiresController.create);

router.get('/vehicle-tires/:vehicle_id', authMiddleware, VehicleTiresController.getTiresByVehicleId);

router.delete('/vehicle-tires/:tire_id', authMiddleware, VehicleTiresController.dischargeTire);

export default router;
