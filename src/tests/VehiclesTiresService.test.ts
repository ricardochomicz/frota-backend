import db from "../config/db";
import IVehicleTires from "../models/VehicleTires";
import MaintenanceService from "../services/MaintenanceService";
import VehicleTiresService from "../services/VehicleTiresService";



// Mock do banco de dados
jest.mock('../config/db', () => ({
    promise: jest.fn().mockReturnThis(),
    query: jest.fn()
}));

// Mock do MaintenanceService
jest.mock("../services/MaintenanceService", () => ({
    updateMaintenanceStatus: jest.fn(),
}));

describe("VehicleTiresService", () => {
    afterEach(() => {
        jest.clearAllMocks(); // Limpa os mocks após cada teste
    });

    describe("create", () => {
        it("deve criar pneus e atualizar o status para 'in use'", async () => {
            const mockTires: IVehicleTires[] = [
                {
                    vehicle_id: 1,
                    tire_id: 1,
                    installation_date: new Date("2025-02-07"),
                    mileage_at_installation: 10000,
                    predicted_replacement_mileage: 50000,
                    user_id: 1,
                    maintenance_id: 1,
                },
            ];

            // Mock da query de inserção
            (db.promise().query as jest.Mock).mockResolvedValueOnce([
                { insertId: 1 },
                null,
            ]);

            // Mock da query de atualização de status
            (db.promise().query as jest.Mock).mockResolvedValueOnce([{}, null]);

            const result = await VehicleTiresService.create(mockTires);

            // Verifica se a query de inserção foi chamada corretamente
            expect(db.promise().query).toHaveBeenCalledWith(
                "INSERT INTO vehicle_tires (vehicle_id, tire_id, installation_date, mileage_at_installation, predicted_replacement_mileage, user_id, maintenance_id) VALUES ?",
                [[
                    [
                        1,
                        1,
                        new Date("2025-02-07"),
                        10000,
                        50000,
                        1,
                        1,
                    ],
                ]]
            );

            // Verifica se o status do pneu foi atualizado
            expect(db.promise().query).toHaveBeenCalledWith(
                "UPDATE tires SET status = ? WHERE id = ?",
                ["in use", 1]
            );

            // Verifica o retorno
            expect(result).toEqual([
                {
                    ...mockTires[0],
                    id: 1, // ID gerado
                },
            ]);
        });

        it("deve lançar erro se a inserção falhar", async () => {
            const mockTires: IVehicleTires[] = [
                {
                    vehicle_id: 1,
                    tire_id: 1,
                    installation_date: new Date("2025-02-07"),
                    mileage_at_installation: 10000,
                    predicted_replacement_mileage: 50000,
                    user_id: 1,
                    maintenance_id: 1,
                },
            ];

            // Mock da query de inserção com erro
            (db.promise().query as jest.Mock).mockRejectedValueOnce(
                new Error("Erro no banco de dados")
            );

            await expect(VehicleTiresService.create(mockTires)).rejects.toThrow(
                "Erro ao inserir os pneus. Tente novamente mais tarde."
            );
        });
    });

    describe("getTiresByVehicleId", () => {
        it("deve retornar os pneus de um veículo", async () => {
            const mockRows = [
                {
                    id: 1,
                    vehicle_id: 1,
                    tire_id: 1,
                    installation_date: "2023-10-01",
                    mileage_at_installation: 10000,
                    predicted_replacement_mileage: 50000,
                    user_id: 1,
                    maintenance_id: 1,
                    code: "P001",
                    brand: "Michelin",
                    model: "Pilot Sport",
                    mileage: 15000,
                    status: "active",
                    needs_replacement: 0,
                },
            ];

            // Mock da query
            (db.promise().query as jest.Mock).mockResolvedValueOnce([mockRows, null]);

            const result = await VehicleTiresService.getTiresByVehicleId(1);

            // Verifica se a query foi chamada corretamente
            expect(db.promise().query).toHaveBeenCalledWith(
                expect.stringContaining("SELECT"),
                [1]
            );

            // Verifica o retorno
            expect(result).toEqual(mockRows);
        });

        it("deve lançar erro se a busca falhar", async () => {
            // Mock da query com erro
            (db.promise().query as jest.Mock).mockRejectedValueOnce(
                new Error("Erro no banco de dados")
            );

            await expect(VehicleTiresService.getTiresByVehicleId(1)).rejects.toThrow(
                "Erro ao buscar pneu. Tente novamente mais tarde."
            );
        });
    });

    describe("getVehicleTiresForMaintenance", () => {
        it("deve retornar os pneus de um veículo para manutenção", async () => {
            const mockRows = [
                {
                    id: 1,
                    vehicle_id: 1,
                    tire_id: 1,
                    installation_date: "2023-10-01",
                    mileage_at_installation: 10000,
                    predicted_replacement_mileage: 50000,
                    user_id: 1,
                    maintenance_id: 1,
                    code: "P001",
                    brand: "Michelin",
                    model: "Pilot Sport",
                    mileage: 15000,
                    status: "active",
                    needs_replacement: 0,
                },
            ];

            // Mock da query
            (db.promise().query as jest.Mock).mockResolvedValueOnce([mockRows, null]);

            const result = await VehicleTiresService.getVehicleTiresForMaintenance(1, 1);

            // Verifica se a query foi chamada corretamente
            expect(db.promise().query).toHaveBeenCalledWith(
                expect.stringContaining("SELECT"),
                [1, 1]
            );

            // Verifica o retorno
            expect(result).toEqual(mockRows);
        });

        it("deve lançar erro se a busca falhar", async () => {
            // Mock da query com erro
            (db.promise().query as jest.Mock).mockRejectedValueOnce(
                new Error("Erro no banco de dados")
            );

            await expect(
                VehicleTiresService.getVehicleTiresForMaintenance(1, 1)
            ).rejects.toThrow("Erro ao buscar pneu. Tente novamente mais tarde.");
        });
    });

    describe("isTireAssignedToAnotherVehicle", () => {
        it("deve retornar true se o pneu estiver em uso em outro veículo", async () => {
            const mockRows = [{ total: 1 }];

            // Mock da query
            (db.promise().query as jest.Mock).mockResolvedValueOnce([mockRows, null]);

            const result = await VehicleTiresService.isTireAssignedToAnotherVehicle(1, 2);

            // Verifica se a query foi chamada corretamente
            expect(db.promise().query).toHaveBeenCalledWith(
                expect.stringContaining("SELECT"),
                [1, 2]
            );

            // Verifica o retorno
            expect(result).toBe(true);
        });

        it("deve retornar false se o pneu não estiver em uso em outro veículo", async () => {
            const mockRows = [{ total: 0 }];

            // Mock da query
            (db.promise().query as jest.Mock).mockResolvedValueOnce([mockRows, null]);

            const result = await VehicleTiresService.isTireAssignedToAnotherVehicle(1, 2);

            // Verifica o retorno
            expect(result).toBe(false);
        });

        it("deve lançar erro se a verificação falhar", async () => {
            // Mock da query com erro
            (db.promise().query as jest.Mock).mockRejectedValueOnce(
                new Error("Erro no banco de dados")
            );

            await expect(
                VehicleTiresService.isTireAssignedToAnotherVehicle(1, 2)
            ).rejects.toThrow("Erro ao verificar pneu. Tente novamente mais tarde.");
        });
    });

    describe("markTireForReplacement", () => {
        it("deve marcar o pneu para substituição e atualizar a manutenção", async () => {
            const mockTire = {
                mileage_to_replace: 15000,
            };

            const mockMaintenanceId = 1;

            // Mock da query de busca
            (db.promise().query as jest.Mock).mockResolvedValueOnce([
                [{ maintenance_id: mockMaintenanceId }],
                null,
            ]);

            // Mock da query de atualização
            (db.promise().query as jest.Mock).mockResolvedValueOnce([{}, null]);

            // Mock da atualização de manutenção
            (MaintenanceService.updateMaintenanceStatus as jest.Mock).mockResolvedValueOnce({});

            await VehicleTiresService.markTireForReplacement(1, mockTire as IVehicleTires);

            // Verifica se a query de busca foi chamada
            expect(db.promise().query).toHaveBeenCalledWith(
                "SELECT maintenance_id FROM vehicle_tires WHERE id = ?",
                [1]
            );

            // Verifica se a query de atualização foi chamada
            expect(db.promise().query).toHaveBeenCalledWith(
                "UPDATE vehicle_tires SET to_replace = 1, mileage_to_replace = ? WHERE id = ?",
                [15000, 1]
            );

            // Verifica se a manutenção foi atualizada
            expect(MaintenanceService.updateMaintenanceStatus).toHaveBeenCalledWith(
                mockMaintenanceId
            );
        });

        it("deve lançar erro se o pneu não for encontrado", async () => {
            const mockTire = {
                mileage_to_replace: 15000,
            };

            // Mock da query de busca sem resultados
            (db.promise().query as jest.Mock).mockResolvedValueOnce([[], null]);

            await expect(
                VehicleTiresService.markTireForReplacement(1, mockTire as IVehicleTires)
            ).rejects.toThrow("Erro ao atualizar pneu. Tente novamente mais tarde.");
        });

        it("deve lançar erro se a atualização falhar", async () => {
            const mockTire = {
                mileage_to_replace: 15000,
            };

            // Mock da query de busca
            (db.promise().query as jest.Mock).mockResolvedValueOnce([
                [{ maintenance_id: 1 }],
                null,
            ]);

            // Mock da query de atualização com erro
            (db.promise().query as jest.Mock).mockRejectedValueOnce(
                new Error("Erro no banco de dados")
            );

            await expect(
                VehicleTiresService.markTireForReplacement(1, mockTire as IVehicleTires)
            ).rejects.toThrow("Erro ao atualizar pneu. Tente novamente mais tarde.");
        });
    });

    describe("dischargeTire", () => {
        it("deve remover o pneu da tabela vehicle_tires", async () => {
            // Mock da query de busca
            (db.promise().query as jest.Mock).mockResolvedValueOnce([
                [{ id: 1 }],
                null,
            ]);

            // Mock da query de remoção
            (db.promise().query as jest.Mock).mockResolvedValueOnce([
                { affectedRows: 1 },
                null,
            ]);

            const result = await VehicleTiresService.dischargeTire(1);

            // Verifica se a query de busca foi chamada
            expect(db.promise().query).toHaveBeenCalledWith(
                "SELECT id FROM vehicle_tires WHERE tire_id = ?",
                [1]
            );

            // Verifica se a query de remoção foi chamada
            expect(db.promise().query).toHaveBeenCalledWith(
                "DELETE FROM vehicle_tires WHERE id = ?",
                [1]
            );

            // Verifica o retorno
            expect(result).toBe(true);
        });

        it("deve retornar false se o pneu não estiver cadastrado", async () => {
            // Mock da query de busca sem resultados
            (db.promise().query as jest.Mock).mockResolvedValueOnce([[], null]);

            const result = await VehicleTiresService.dischargeTire(1);

            // Verifica o retorno
            expect(result).toBe(false);
        });

        it("deve lançar erro se a remoção falhar", async () => {
            // Mock da query de busca
            (db.promise().query as jest.Mock).mockResolvedValueOnce([
                [{ id: 1 }],
                null,
            ]);

            // Mock da query de remoção com erro
            (db.promise().query as jest.Mock).mockRejectedValueOnce(
                new Error("Erro no banco de dados")
            );

            await expect(VehicleTiresService.dischargeTire(1)).rejects.toThrow(
                "Erro ao remover pneu. Tente novamente mais tarde."
            );
        });
    });

    describe("updateStatusTires", () => {
        it("deve atualizar o status do pneu", async () => {
            // Mock da query de atualização
            (db.promise().query as jest.Mock).mockResolvedValueOnce([{}, null]);

            await VehicleTiresService.updateStatusTires(1, "in use");

            // Verifica se a query foi chamada corretamente
            expect(db.promise().query).toHaveBeenCalledWith(
                "UPDATE tires SET status = ? WHERE id = ?",
                ["in use", 1]
            );
        });

        it("deve lançar erro se a atualização falhar", async () => {
            // Mock da query de atualização com erro
            (db.promise().query as jest.Mock).mockRejectedValueOnce(
                new Error("Erro no banco de dados")
            );

            await expect(VehicleTiresService.updateStatusTires(1, "in use")).rejects.toThrow(
                "Erro ao atualizar o status do pneu. Tente novamente mais tarde."
            );
        });
    });
});