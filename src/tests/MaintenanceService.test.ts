import MaintenanceService from "../services/MaintenanceService";
import db from "../config/db";
import IMaintenance from "../models/Maintenance";

jest.mock('../config/db', () => ({
    promise: jest.fn().mockReturnThis(),
    query: jest.fn()
}));

describe("MaintenanceService", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe("create", () => {
        it("deve criar uma nova manutenção", async () => {
            const mockMaintenance: IMaintenance = {
                vehicle_id: 1,
                type: "Troca de óleo",
                description: "Óleo sintético",
                mileage_at_maintenance: 50000,
                user_id: 1,
            };

            const mockInsertResult = [{ insertId: 10 }];

            (db.promise().query as jest.Mock).mockResolvedValueOnce(mockInsertResult);

            const result = await MaintenanceService.create(mockMaintenance);

            expect(result).toEqual({ id: 10 });
            expect(db.promise().query).toHaveBeenCalledWith(
                expect.stringContaining("INSERT INTO maintenance"),
                expect.any(Array)
            );
        });

        it("deve lançar erro ao falhar a criação", async () => {
            (db.promise().query as jest.Mock).mockRejectedValueOnce(new Error("DB error"));

            await expect(MaintenanceService.create({} as IMaintenance)).rejects.toThrow(
                "Erro na requisição. Tente novamente mais tarde."
            );
        });
    });

    // describe("getAll", () => {
    //     it("deve retornar todas as manutenções", async () => {
    //         const mockMaintenances = [
    //             { id: 1, type: "Troca de óleo", description: "Óleo sintético", user_id: 1 },
    //         ];
    //         const mockTotal = [{ total: 1 }];

    //         (db.promise().query as jest.Mock)
    //             .mockResolvedValueOnce([mockTotal])
    //             .mockResolvedValueOnce([mockMaintenances]);

    //         const result = await MaintenanceService.getAll(1, 10, {}, 1);

    //         expect(result).toEqual({ maintenances: mockMaintenances, total: 1 });
    //     });

    //     it("deve lidar com erro no banco de dados", async () => {
    //         (db.promise().query as jest.Mock).mockRejectedValue(new Error("DB error"));

    //         await expect(MaintenanceService.getAll(1, 10, {}, 1)).rejects.toThrow(
    //             "Erro ao buscar manutenções. Tente novamente mais tarde."
    //         );
    //     });
    // });

    describe("get", () => {
        it("deve retornar uma manutenção específica", async () => {
            const mockMaintenance = [{ id: 1, type: "Troca de óleo", description: "Óleo sintético" }];

            (db.promise().query as jest.Mock).mockResolvedValueOnce([mockMaintenance]);

            const result = await MaintenanceService.get(1);

            expect(result).toEqual(mockMaintenance[0]);
        });

        it("deve retornar null se não encontrar manutenção", async () => {
            (db.promise().query as jest.Mock).mockResolvedValueOnce([[]]);

            const result = await MaintenanceService.get(999);

            expect(result).toBeNull();
        });
    });

    describe("getByVehicleId", () => {
        it("deve retornar manutenções por vehicle_id", async () => {
            const mockMaintenances = [{ id: 1, vehicle_id: 2, type: "Troca de óleo" }];

            (db.promise().query as jest.Mock).mockResolvedValueOnce([mockMaintenances]);

            const result = await MaintenanceService.getByVehicleId(2);

            expect(result).toEqual(mockMaintenances);
        });

        it("deve retornar array vazio se não houver manutenções", async () => {
            (db.promise().query as jest.Mock).mockResolvedValueOnce([[]]);

            const result = await MaintenanceService.getByVehicleId(999);

            expect(result).toEqual([]);
        });
    });

    describe('update', () => {
        it('deve atualizar a manutenção e retornar vazio', async () => {
            const maintenance: IMaintenance = { id: 1, type: 'Troca', description: 'Troca de Pneu', mileage_at_maintenance: 10000, user_id: 1, vehicle_id: 1 };

            (db.promise().query as jest.Mock).mockResolvedValueOnce(null);

            await MaintenanceService.update(1, maintenance);
            expect(db.promise().query).toHaveBeenCalledWith(
                `UPDATE maintenance SET vehicle_id = ?, type = ?, description = ?, mileage_at_maintenance = ?, user_id = ? WHERE id = ?`,
                [maintenance.vehicle_id, maintenance.type, maintenance.description, maintenance.mileage_at_maintenance, maintenance.user_id, 1]
            );
        });

        it('deve gerar um erro se a consulta ao banco de dados falhar', async () => {
            const maintenance: IMaintenance = { id: 1, type: 'Troca', description: 'Troca de Pneu', mileage_at_maintenance: 10000, user_id: 1, vehicle_id: 1 };

            (db.promise().query as jest.Mock).mockRejectedValueOnce(new Error('Erro ao atualizar manutenção. Tente novamente mais tarde.'));

            await expect(MaintenanceService.update(1, maintenance)).rejects.toThrow('Erro ao atualizar manutenção. Tente novamente mais tarde.');
        });
    });


    describe("destroy", () => {
        it("deve deletar uma manutenção", async () => {
            (db.promise().query as jest.Mock).mockResolvedValueOnce([{}]);

            await expect(MaintenanceService.destroy(1)).resolves.toBeUndefined();
        });

        it("deve lançar erro ao falhar a exclusão", async () => {
            (db.promise().query as jest.Mock).mockRejectedValueOnce(new Error("DB error"));

            await expect(MaintenanceService.destroy(1)).rejects.toThrow(
                "Erro ao deletar manutenção. Tente novamente mais tarde."
            );
        });
    });
});
