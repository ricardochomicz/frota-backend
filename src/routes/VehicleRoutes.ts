import express from 'express';
import VehicleController from '../controllers/VehicleController';
import { validate } from '../middlewares/Validate';
import { vehicleSchema } from '../schemas/VehicleSchema';
import { authMiddleware } from '../middlewares/AuthMiddleware';

const router = express.Router();

/**
 * @route POST /vehicles
 * @description Criação de um novo veículo
 */
router.post('/vehicles', authMiddleware, validate(vehicleSchema), VehicleController.create);


/**
 * @route GET /vehicles
 * @description Retorna a lista de veículos cadastrados
 */
router.get('/vehicles', authMiddleware, VehicleController.getAll);


/**
 * @route GET /vehicles/:id
 * @description Busca um veículo pelo ID
 */
router.get('/vehicles/:id', authMiddleware, VehicleController.get);


/**
 * @route GET /vehicles/license_plate/:license_plate
 * @description Busca um veículo pelo número da placa
 */
router.get('/vehicles/license_plate/:license_plate', authMiddleware, VehicleController.getByLicensePlate);


/**
 * @route GET /vehicles/alls
 * @description Busca todos os veículos cadastrados
 */
router.get('/to-select', authMiddleware, VehicleController.getAllVehiclesToSelect);

/**
 * @route GET /vehicles/vehicle-maintenances-tires/:id
 * @description Exibe as manutenções e pneus de um veículo
 */
router.get('/vehicles/vehicle-maintenances-tires/:id', authMiddleware, VehicleController.getVehicleMaintenancesAndTires);

/**
 * @route PUT /vehicles/:id
 * @description Atualiza um veículo pelo ID
 */
router.put('/vehicles/:id/edit', authMiddleware, validate(vehicleSchema), VehicleController.update);


/**
 * @route PUT /vehicles/mileage
 * @description Atualiza a kilometragem de um veículo
 */
router.put('/vehicles/mileage', authMiddleware, VehicleController.updateMileage);


/**
 * @route DELETE /vehicles/:id
 * @description Deleta um veículo pelo ID
 */
router.delete('/vehicle/:id/delete', authMiddleware, VehicleController.destroy);



export default router;
