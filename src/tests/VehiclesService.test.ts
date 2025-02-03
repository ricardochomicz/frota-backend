import db from '../config/db';
import IVehicle from "../models/Vehicle";
import VehicleService from '../services/VehicleService';

jest.mock('../config/db', () => ({
    promise: jest.fn().mockReturnThis(),
    query: jest.fn()
}));

describe('VehicleService', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('create', () => {
        it('deve criar um novo veiculo e retonar o resultado', async () => {
            const vehicle: IVehicle = { brand: 'BrandX', model: 'ModelY', year: 2020, license_plate: 'ABC-1234', mileage: 10000, fuel_type: 'gasoline' };
            const user_id = 1;
            const result = { insertId: 1 };

            (db.promise().query as jest.Mock).mockResolvedValueOnce([result]);

            const response = await VehicleService.create(vehicle, user_id);
            expect(response).toEqual({ id: result.insertId });
            expect(db.promise().query).toHaveBeenCalledWith(
                `INSERT INTO vehicles (brand, model, year, license_plate, mileage, fuel_type, user_id) VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [vehicle.brand, vehicle.model, vehicle.year, vehicle.license_plate.toUpperCase(), vehicle.mileage, vehicle.fuel_type, user_id]
            );
        });
    });

    describe('getByLicensePlate', () => {
        it('deve retornar um veiculo pela placa', async () => {
            const vehicle: IVehicle = { id: 1, brand: 'BrandX', model: 'ModelY', year: 2020, license_plate: 'ABC-1234', mileage: 10000, fuel_type: 'gasoline' };

            (db.promise().query as jest.Mock).mockResolvedValueOnce([vehicle]);

            const response = await VehicleService.getByLicensePlate('ABC-1234');
            expect(response).toEqual(vehicle);
            expect(db.promise().query).toHaveBeenCalledWith(`SELECT * FROM vehicles WHERE license_plate LIKE ?`, [`%ABC-1234%`]);
        });
    });

    describe('getAll', () => {
        it('deve retornar uma lista de veiculos com total', async () => {
            const vehicles: IVehicle[] = [{ id: 1, brand: 'BrandX', model: 'ModelY', year: 2020, license_plate: 'ABC-1234', mileage: 10000, fuel_type: 'gasoline' }];
            const total = 1;

            (db.promise().query as jest.Mock)
                .mockResolvedValueOnce([[{ total }]])
                .mockResolvedValueOnce([vehicles]);

            const response = await VehicleService.getAll();
            expect(response).toEqual({ vehicles, total });
            expect(db.promise().query).toHaveBeenCalledTimes(2);
        });
    });

    describe('get', () => {
        it('deve retornar um veiculo pelo ID', async () => {
            const vehicle: IVehicle = { id: 1, brand: 'BrandX', model: 'ModelY', year: 2020, license_plate: 'ABC-1234', mileage: 10000, fuel_type: 'gasoline' };

            (db.promise().query as jest.Mock).mockResolvedValueOnce([[vehicle]]);

            const response = await VehicleService.get(1);
            expect(response).toEqual(vehicle);
            expect(db.promise().query).toHaveBeenCalledWith(`SELECT * FROM vehicles WHERE id = ?`, [1]);
        });
    });

    describe('getAllVehiclesToSelect', () => {
        it('deve retornar uma lista de veiculos para select', async () => {
            const vehicles: IVehicle[] = [{ id: 1, brand: 'BrandX', model: 'ModelY', year: 2020, license_plate: 'ABC-1234', mileage: 10000, fuel_type: 'gasoline' }];

            (db.promise().query as jest.Mock).mockResolvedValueOnce([vehicles]);

            const response = await VehicleService.getAllVehiclesToSelect();
            expect(response).toEqual(vehicles);
            expect(db.promise().query).toHaveBeenCalledWith(`SELECT * FROM vehicles`);
        });
    });

    describe('update', () => {
        it('deve atualizar um veículo e devolver nulo', async () => {
            const vehicle: IVehicle = { brand: 'BrandX', model: 'ModelY', year: 2020, license_plate: 'ABC-1234', mileage: 10000, fuel_type: 'gasoline' };

            (db.promise().query as jest.Mock).mockResolvedValueOnce(null);

            await VehicleService.update(1, vehicle);
            expect(db.promise().query).toHaveBeenCalledWith(
                `UPDATE vehicles SET brand = ?, model = ?, year = ?, license_plate = ?, mileage = ?, fuel_type = ? WHERE id = ?`,
                [vehicle.brand, vehicle.model, vehicle.year, vehicle.license_plate, vehicle.mileage, vehicle.fuel_type, 1]
            );
        });
    });

    describe('destroy', () => {
        it('deve excluir um veiculo', async () => {
            (db.promise().query as jest.Mock).mockResolvedValueOnce(null);

            await VehicleService.destroy(1);
            expect(db.promise().query).toHaveBeenCalledWith(`DELETE FROM vehicles WHERE id = ?`, [1]);
        });
    });
});
