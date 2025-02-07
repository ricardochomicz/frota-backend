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
            const vehicle: IVehicle = { brand: 'BrandX', model: 'ModelY', year: 2020, license_plate: 'ABC-1234', mileage: 10000, fuel_type: 'gasoline', user_id: 1 };
            const result = { insertId: 1 };

            (db.promise().query as jest.Mock).mockResolvedValueOnce([result]);

            const response = await VehicleService.create(vehicle, 1);
            expect(response).toEqual({ id: result.insertId });
            expect(db.promise().query).toHaveBeenCalledWith(
                `INSERT INTO vehicles (brand, model, year, license_plate, mileage, fuel_type, user_id) VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [vehicle.brand, vehicle.model, vehicle.year, vehicle.license_plate.toUpperCase(), vehicle.mileage, vehicle.fuel_type, vehicle.user_id]
            );
        });
    });

    describe('getByLicensePlate', () => {
        it('deve retornar o veículo se a placa estiver correta', async () => {
            const licensePlate = 'ABC-1234';
            const mockVehicle: IVehicle = { id: 1, license_plate: 'ABC-1234', brand: 'Toyota', model: 'Corolla', mileage: 1000, fuel_type: 'gasoline', year: 2020, user_id: 1 };

            // Mock da query para retornar o veículo
            (db.promise().query as jest.Mock).mockResolvedValueOnce([[mockVehicle]]);

            const result = await VehicleService.getByLicensePlate(licensePlate);

            expect(result).toEqual(mockVehicle);
        });

        it('deve retornar null se o veículo não for encontrado', async () => {
            const licensePlate = 'XYZ-5678';

            // Mock da query para retornar um array vazio
            (db.promise().query as jest.Mock).mockResolvedValueOnce([[]]);

            const result = await VehicleService.getByLicensePlate(licensePlate);

            expect(result).toBeNull();
        });

        it('deve lançar um erro se ocorrer um erro no banco de dados', async () => {
            const licensePlate = 'ABC-1234';

            // Mock da query para lançar um erro
            (db.promise().query as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

            await expect(VehicleService.getByLicensePlate(licensePlate)).rejects.toThrow('Erro ao buscar veículosS. Tente novamente mais tarde.');
        });
    });

    describe("getAll", () => {
        it("deve retornar todos os veiculos sem filtros", async () => {
            jest.spyOn(VehicleService, 'getUserAccessScope').mockResolvedValue({
                query: '',
                countQuery: '',
                queryParams: []
            });
            const mockVehicle = [{ id: 1, brand: 'BrandX', model: 'ModelY', year: 2020, license_plate: 'ABC-1234', mileage: 10000, fuel_type: 'gasoline' }];
            const mockTotal = [{ total: 1 }];

            jest.spyOn(db, 'promise').mockReturnValue({
                query: jest.fn()
                    .mockResolvedValueOnce([mockTotal]) // Retorno da contagem total
                    .mockResolvedValueOnce([mockVehicle]) // Retorno dos veiculos
            } as any);

            const result = await VehicleService.getAll(1, 10, {}, 1);
            expect(result).toEqual({ vehicles: mockVehicle, total: 1 });
        });

        it("deve aplicar filtros corretamente", async () => {
            jest.spyOn(VehicleService, 'getUserAccessScope').mockResolvedValue({
                query: '',
                countQuery: '',
                queryParams: []
            });
            const mockVehicle = [{ id: 2, brand: 'BrandX', model: 'ModelY', year: 2020, license_plate: 'ABC-1234', mileage: 10000, fuel_type: 'gasoline', user_id: 1 }];
            const mockTotal = [{ total: 1 }];

            jest.spyOn(db, 'promise').mockReturnValue({
                query: jest.fn()
                    .mockResolvedValueOnce([mockTotal])
                    .mockResolvedValueOnce([mockVehicle])
            } as any);

            const filters = { license_plate: "ABC-1234", brand: "BrandX" };
            const result = await VehicleService.getAll(1, 10, filters, 2);
            expect(result).toEqual({ vehicles: mockVehicle, total: 1 });
        });

        it("deve permitir que um gerente veja os registros dos subordinados", async () => {
            jest.spyOn(VehicleService, 'getUserAccessScope').mockResolvedValue({
                query: '',
                countQuery: '',
                queryParams: []
            });
            (db.promise().query as jest.Mock)
                .mockResolvedValueOnce([[{ total: 1 }]]) // Mock para a contagem total
                .mockResolvedValueOnce([
                    [{ id: 2, brand: 'BrandX', model: 'ModelY', year: 2020, license_plate: 'ABC-1234', mileage: 10000, fuel_type: 'gasoline', user_id: 1 }]
                ]); // Mock para os registros

            const result = await VehicleService.getAll(1, 10, {}, 1);

            console.error('Resultado da função getAll:', result);
            expect(result).toEqual({
                vehicles: [
                    { id: 2, brand: 'BrandX', model: 'ModelY', year: 2020, license_plate: 'ABC-1234', mileage: 10000, fuel_type: 'gasoline', user_id: 1 }
                ],
                total: 1
            });
        });

        it("deve permitir que um usuário comum veja apenas seus próprios registros", async () => {

            const mockVehicle = [{ id: 1, brand: 'BrandX', model: 'ModelY', year: 2020, license_plate: 'ABC-1234', mileage: 10000, fuel_type: 'gasoline', user_id: 1 }];
            const mockTotal = [{ total: 1 }];

            jest.spyOn(VehicleService, 'getUserAccessScope').mockResolvedValue({
                query: ` AND user_id = ?`,
                countQuery: ` AND user_id = ?`,
                queryParams: [10],
            });

            jest.spyOn(db, 'promise').mockReturnValue({
                query: jest.fn()
                    .mockResolvedValueOnce([mockTotal])
                    .mockResolvedValueOnce([mockVehicle])
            } as any);

            const result = await VehicleService.getAll(1, 10, {}, 10);
            expect(result).toEqual({ vehicles: mockVehicle, total: 1 });
        });

        it("deve lidar com erros do banco de dados", async () => {
            jest.spyOn(db, 'promise').mockReturnValue({
                query: jest.fn().mockRejectedValue(new Error("Erro ao buscar veículos. Tente novamente mais tarde."))
            } as any);

            await expect(VehicleService.getAll(1, 10, {}, 4)).rejects.toThrow(new Error("Erro ao buscar veículos. Tente novamente mais tarde."));
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
