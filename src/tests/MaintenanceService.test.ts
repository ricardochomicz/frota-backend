import db from '../config/db';
import IMaintenance from "../models/Maintenance";
import MaintenanceService from '../services/MaintenanceService';

jest.mock('../config/db', () => ({
    promise: jest.fn().mockReturnThis(),
    query: jest.fn()
}));

describe('MaintenanceService', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('create', () => {
        it('should create a new maintenance record and return the result', async () => {
            const maintenance: IMaintenance = {
                vehicle_id: 1,
                type: 'Oil Change',
                description: 'Changed engine oil',
                mileage_at_maintenance: 15000,
                date: new Date()
            };
            const user_id = 1;
            const result = { insertId: 1 };

            (db.promise().query as jest.Mock).mockResolvedValueOnce([result]);

            const response = await MaintenanceService.create(maintenance, user_id);
            expect(response).toEqual({ id: result.insertId });
            expect(db.promise().query).toHaveBeenCalledWith(
                `INSERT INTO maintenance (vehicle_id, user_id, type, description, mileage_at_maintenance, date) VALUES (?, ?, ?, ?, ?, ?)`,
                [maintenance.vehicle_id, user_id, maintenance.type, maintenance.description, maintenance.mileage_at_maintenance, maintenance.date]
            );
        });
    });

    describe('getAll', () => {
        it('should return a list of maintenances and the total count', async () => {
            const maintenances = [{
                id: 1,
                date: new Date(),
                type: 'Oil Change',
                description: 'Changed engine oil',
                mileage_at_maintenance: 15000,
                created_at: new Date(),
                updated_at: new Date(),
                vehicle: {
                    id: 1,
                    license_plate: 'ABC-1234',
                    model: 'Model Y',
                    brand: 'BrandX',
                    year: 2020,
                },
                user: {
                    id: 1,
                    name: 'John Doe',
                    email: 'john.doe@example.com'
                }
            }];
            const total = 1;

            const dbResponseRows = [{
                id: 1,
                date: new Date(),
                type: 'Oil Change',
                description: 'Changed engine oil',
                mileage_at_maintenance: 15000,
                created_at: new Date(),
                updated_at: new Date(),
                vehicle_id: 1,
                license_plate: 'ABC-1234',
                model: 'Model Y',
                brand: 'BrandX',
                year: 2020,
                user_id: 1,
                user_name: 'John Doe',
                user_email: 'john.doe@example.com'
            }];

            (db.promise().query as jest.Mock)
                .mockResolvedValueOnce([[{ total }]])
                .mockResolvedValueOnce(dbResponseRows);

            const response = await MaintenanceService.getAll();
            expect(response).toEqual({ maintenances, total });
            expect(db.promise().query).toHaveBeenCalledTimes(2);
        });
    });

    describe('get', () => {
        it('should return a maintenance record by ID', async () => {
            const maintenance: IMaintenance = {
                id: 1,
                vehicle_id: 1,
                type: 'Oil Change',
                description: 'Changed engine oil',
                mileage_at_maintenance: 15000,
                date: new Date()
            };

            (db.promise().query as jest.Mock).mockResolvedValueOnce([[maintenance]]);

            const response = await MaintenanceService.get(1);
            expect(response).toEqual(maintenance);
            expect(db.promise().query).toHaveBeenCalledWith(`SELECT * FROM maintenance WHERE id = ?`, [1]);
        });
    });

    describe('getByVehicleId', () => {
        it('should return a list of maintenances by vehicle ID', async () => {
            const maintenances: IMaintenance[] = [{
                id: 1,
                vehicle_id: 1,
                type: 'Oil Change',
                description: 'Changed engine oil',
                mileage_at_maintenance: 15000,
                date: new Date()
            }];

            (db.promise().query as jest.Mock).mockResolvedValueOnce([maintenances]);

            const response = await MaintenanceService.getByVehicleId(1);
            expect(response).toEqual(maintenances);
            expect(db.promise().query).toHaveBeenCalledWith(`SELECT * FROM maintenance WHERE vehicle_id = ?`, [1]);
        });
    });

    describe('update', () => {
        it('should update a maintenance record and return the updated maintenance', async () => {
            const maintenance: IMaintenance = {
                id: 1,
                vehicle_id: 1,
                type: 'Oil Change',
                description: 'Changed engine oil',
                mileage_at_maintenance: 15000,
                date: new Date()
            };
            const user_id = 1;
            const updatedMaintenance = { ...maintenance, type: 'Tire Rotation' };

            const updatedDbMaintenance = {
                ...updatedMaintenance,
                created_at: new Date(),
                updated_at: new Date(),
                user_id: 1,
                vehicle: {
                    id: 1,
                    model: 'Model Y',
                    brand: 'BrandX',
                    year: 2020,
                    license_plate: 'ABC-1234'
                }
            };

            (db.promise().query as jest.Mock).mockResolvedValueOnce(null);
            (db.promise().query as jest.Mock).mockResolvedValueOnce([[updatedDbMaintenance]]);

            const response = await MaintenanceService.update(1, updatedMaintenance, user_id);
            expect(response).toEqual(updatedDbMaintenance);
            expect(db.promise().query).toHaveBeenCalledWith(
                `UPDATE maintenance SET vehicle_id = ?, type = ?, description = ?, mileage_at_maintenance = ?, date = ?, user_id = ? WHERE id = ?`,
                [updatedMaintenance.vehicle_id, updatedMaintenance.type, updatedMaintenance.description, updatedMaintenance.mileage_at_maintenance, updatedMaintenance.date, user_id, 1]
            );
        });
    });

    describe('getMaintenanceWithVehicle', () => {
        it('should return a maintenance record with vehicle details', async () => {
            const maintenance = {
                id: 1,
                vehicle_id: 1,
                type: 'Oil Change',
                description: 'Changed engine oil',
                mileage_at_maintenance: 15000,
                date: new Date(),
                created_at: new Date(),
                updated_at: new Date(),
                user_id: 1,
                vehicle: {
                    id: 1,
                    model: 'Model Y',
                    brand: 'BrandX',
                    year: 2020,
                    license_plate: 'ABC-1234'
                }
            };

            (db.promise().query as jest.Mock).mockResolvedValueOnce([[maintenance]]);

            const response = await MaintenanceService.getMaintenanceWithVehicle(1);
            expect(response).toEqual(maintenance);
            expect(db.promise().query).toHaveBeenCalledWith(
                `SELECT m.*, v.id AS vehicle_id, v.model, v.brand, v.year, v.license_plate FROM maintenance m LEFT JOIN vehicles v ON m.vehicle_id = v.id WHERE m.id = ?`,
                [1]
            );
        });
    });

    describe('destroy', () => {
        it('should delete a maintenance record', async () => {
            (db.promise().query as jest.Mock).mockResolvedValueOnce(null);

            await MaintenanceService.destroy(1);
            expect(db.promise().query).toHaveBeenCalledWith(`DELETE FROM maintenance WHERE id = ?`, [1]);
        });
    });
});
