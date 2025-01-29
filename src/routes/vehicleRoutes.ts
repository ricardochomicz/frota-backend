import express from 'express';
import VehicleController from '../controllers/VehicleController';
import { validate } from '../middlewares/validate';
import { vehicleSchema } from '../schemas/VehicleSchema';

const router = express.Router();

/**
 * @route POST /vehicles
 * @description Criação de um novo veículo
 */
router.post('/vehicles', validate(vehicleSchema), VehicleController.create);

/**
 * @route GET /vehicles
 * @description Retorna a lista de veículos cadastrados
 */
router.get('/vehicles', VehicleController.getAll);

/**
 * @route GET /vehicles/:id
 * @description Busca um veículo pelo ID
 */
router.get('/vehicles/:id', VehicleController.getById);

/**
 * @route GET /vehicles/license_plate/:license_plate
 * @description Busca um veículo pelo número da placa
 */
router.get('/vehicles/license_plate/:license_plate', VehicleController.getByLicensePlate);

/**
 * @route PUT /vehicles/:id
 * @description Atualiza um veículo pelo ID
 */
router.put('/vehicles/:id', validate(vehicleSchema), VehicleController.update);



export default router;
