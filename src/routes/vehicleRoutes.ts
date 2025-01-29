import express from 'express';
import VehicleController from '../controllers/VehicleController';
import { validate } from '../middlewares/validate';
import { vehicleSchema } from '../schemas/VehicleSchema';

const router = express.Router();

/**
 * @route POST /vehicles
 * @description Criação de um novo veículo
 * @access Público
 */
router.post('/vehicles', validate(vehicleSchema), VehicleController.create);

/**
 * @route GET /vehicles
 * @description Retorna a lista de veículos cadastrados
 * @access Público
 */
router.get('/vehicles', VehicleController.getAll);

export default router;
