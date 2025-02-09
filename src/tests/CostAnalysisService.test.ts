import db from "../config/db";
import ICostAnalysis from "../models/CostAnalysis";
import CostAnalysisService from "../services/CostAnalysisService";

// Mock do banco de dados
jest.mock('../config/db', () => ({
    promise: jest.fn().mockReturnThis(),
    query: jest.fn()
}));

describe("CostAnalysisService", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe("create", () => {
        it("deve criar uma nova análise de custo", async () => {
            const mockCostAnalysis: ICostAnalysis = {
                vehicle_id: 1,
                item_type: "tire",
                cost: "1000",
                purchase_date: new Date("2025-02-08"),
                performance_score: "5",
                description: "Test description",
                replacement_reason: "wear",
                tire_id: 1,
                mileage_driven: 50000,
                vehicle_tire_id: 1,
            };

            const userId = 1;

            // Mock da query de inserção
            (db.promise().query as jest.Mock).mockResolvedValueOnce([{ insertId: 1 }, null]);

            const result = await CostAnalysisService.create(mockCostAnalysis, userId);

            // Verifica se a query foi chamada corretamente
            expect(db.promise().query).toHaveBeenCalledWith(
                "INSERT INTO cost_analysis (vehicle_id, item_type, cost, purchase_date, performance_score, description, replacement_reason, tire_id, mileage_driven, vehicle_tire_id, user_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                [
                    1,
                    "tire",
                    "1000",
                    expect.anything(), // Ignora o valor da data
                    "5",
                    "Test description",
                    "wear",
                    1,
                    50000,
                    1,
                    1,
                ]
            );

            // Verifica o retorno
            expect(result).toEqual({ insertId: 1 });
        });

        it("deve lançar erro se a criação falhar", async () => {
            const mockCostAnalysis: ICostAnalysis = {
                vehicle_id: 1,
                item_type: "tire",
                cost: "1000",
                purchase_date: new Date('2025-02-08'),
                performance_score: "5",
                description: "Test description",
                replacement_reason: "wear",
                tire_id: 1,
                mileage_driven: 50000,
                vehicle_tire_id: 1,
            };

            const userId = 1;

            // Mock da query de inserção com erro
            (db.promise().query as jest.Mock).mockRejectedValueOnce(
                new Error("Erro na requisição. Tente novamente mais tarde.")
            );

            await expect(
                CostAnalysisService.create(mockCostAnalysis, userId)
            ).rejects.toThrow("Erro na requisição. Tente novamente mais tarde.");
        });
    });

    describe("getAll", () => {
        afterEach(() => {
            jest.clearAllMocks();
        });
        it("deve retornar todas as analises sem filtros", async () => {
            jest.spyOn(CostAnalysisService, 'getUserAccessScope').mockResolvedValue({
                query: '',
                countQuery: '',
                queryParams: []
            });
            const mockAnalysis = [{
                id: 1,
                vehicle_id: 1,
                item_type: "tire",
                cost: 1000,
                purchase_date: new Date("2025-02-08"),
                performance_score: 5,
                description: "Test description",
                replacement_reason: "defect",
                tire_id: 1,
                mileage_driven: 50000,
                vehicle_tire_id: 1,
                user_id: 1,
            }];
            const mockTotal = [{ total: 1 }];

            jest.spyOn(db, 'promise').mockReturnValue({
                query: jest.fn()
                    // .mockResolvedValueOnce([[]])
                    .mockResolvedValueOnce([mockTotal]) // Retorno da contagem total
                    .mockResolvedValueOnce([mockAnalysis]) // Retorno das manutenções
            } as any);

            const result = await CostAnalysisService.getAll(1, 10, {}, 1);
            expect(result).toEqual({
                analysis: [{
                    id: 1,
                    vehicle_id: 1,
                    item_type: "tire",
                    cost: 1000,
                    purchase_date: new Date("2025-02-08"),
                    performance_score: 5,
                    description: "Test description",
                    replacement_reason: "defect",
                    tire_id: 1,
                    mileage_driven: 50000,
                    vehicle_tire_id: 1,
                    user_id: 1,
                }],
                total: 1,
            });
        });

        it("deve aplicar filtros na busca", async () => {
            jest.spyOn(CostAnalysisService, 'getUserAccessScope').mockResolvedValue({
                query: ` AND user_id = ?`,
                countQuery: ` AND user_id = ?`,
                queryParams: [1],
            });
            const mockAnalysis = [
                {
                    id: 1,
                    vehicle_id: 1,
                    item_type: "tire",
                    cost: 1000,
                    purchase_date: new Date("2025-02-08"),
                    performance_score: 5,
                    description: "Test description",
                    replacement_reason: "defect",
                    tire_id: 1,
                    mileage_driven: 50000,
                    vehicle_tire_id: 1,
                    user_id: 1,
                    license_plate: "ABC-1234",
                    model: "Model X",
                    brand_vehicle: "Brand Y",
                    year: 2020,
                    mileage: 100000,
                    user_name: "John Doe",
                    user_email: "john.doe@example.com",
                    code: "P001",
                    brand: "Michelin",
                    price: 500,
                    durability_km: 60000,
                },
            ];

            const mockTotal = [{ total: 1 }];

            (db.promise().query as jest.Mock)
                .mockResolvedValueOnce([mockTotal])
                .mockResolvedValueOnce([mockAnalysis, null]);

            const filters = { replacement_reason: "defect" };
            const result = await CostAnalysisService.getAll(1, 10, filters, 1);

            expect(result).toEqual({
                analysis: mockAnalysis,
                total: 1,
            });
        });

        it("deve lançar erro se a busca falhar", async () => {
            // Mock da query de contagem com erro
            (db.promise().query as jest.Mock).mockRejectedValueOnce(
                new Error("Erro ao buscar análises. Tente novamente mais tarde.")
            );

            await expect(CostAnalysisService.getAll(1, 10, {})).rejects.toThrow(
                "Erro ao buscar análises. Tente novamente mais tarde."
            );
        });
    });

    describe("get", () => {
        it("deve retornar uma análise de custo pelo id", async () => {
            const mockAnalysis = {
                id: 1,
                vehicle_id: 1,
                item_type: "tire",
                cost: 1000,
                purchase_date: new Date("2025-02-08"),
                performance_score: 5,
                description: "Test description",
                replacement_reason: "wear",
                tire_id: 1,
                mileage_driven: 50000,
                vehicle_tire_id: 1,
                user_id: 1,
            };

            // Mock da query de busca
            (db.promise().query as jest.Mock).mockResolvedValueOnce([[mockAnalysis], null]);

            const result = await CostAnalysisService.get(1);

            // Verifica se a query foi chamada corretamente
            expect(db.promise().query).toHaveBeenCalledWith(
                "SELECT * FROM cost_analysis WHERE id = ?",
                [1]
            );

            // Verifica o retorno
            expect(result).toEqual(mockAnalysis);
        });

        it("deve retornar null se a análise não for encontrada", async () => {
            // Mock da query de busca sem resultados
            (db.promise().query as jest.Mock).mockResolvedValueOnce([[], null]);

            const result = await CostAnalysisService.get(1);

            // Verifica o retorno
            expect(result).toBeNull();
        });

        it("deve lançar erro se a busca falhar", async () => {
            // Mock da query de busca com erro
            (db.promise().query as jest.Mock).mockRejectedValueOnce(
                new Error("Erro no banco de dados")
            );

            await expect(CostAnalysisService.get(1)).rejects.toThrow(
                "Erro ao buscar manutenções. Tente novamente mais tarde."
            );
        });
    });

    describe("update", () => {
        it("deve atualizar uma análise de custo", async () => {
            const mockAnalysis: ICostAnalysis = {
                vehicle_id: 1,
                item_type: "tire",
                cost: "1000",
                purchase_date: new Date("2025-02-08"),
                performance_score: "5",
            };

            const userId = 1;

            // Mock da query de atualização
            (db.promise().query as jest.Mock).mockResolvedValueOnce([{}, null]);

            await CostAnalysisService.update(1, mockAnalysis, userId);

            // Verifica se a query foi chamada corretamente
            expect(db.promise().query).toHaveBeenCalledWith(
                "UPDATE cost_analysis SET vehicle_id = ?, user_id = ?, item_type = ?, cost = ?, purchase_date = ?, performance_score = ? WHERE id = ?",
                [1, 1, "tire", "1000", new Date("2025-02-08"), "5", 1]
            );
        });

        it("deve lançar erro se a atualização falhar", async () => {
            const mockAnalysis: ICostAnalysis = {
                vehicle_id: 1,
                item_type: "tire",
                cost: "1000",
                purchase_date: new Date('2023-10-01'),
                performance_score: "5",
            };

            const userId = 1;

            // Mock da query de atualização com erro
            (db.promise().query as jest.Mock).mockRejectedValueOnce(
                new Error("Erro no banco de dados")
            );

            await expect(
                CostAnalysisService.update(1, mockAnalysis, userId)
            ).rejects.toThrow("Erro ao atualizar manutenção. Tente novamente mais tarde.");
        });
    });

    describe("destroy", () => {
        it("deve deletar uma analise de custo", async () => {
            (db.promise().query as jest.Mock).mockResolvedValueOnce([{}]);

            await expect(CostAnalysisService.destroy(1)).resolves.toBeUndefined();
        });

        it("deve lançar erro ao falhar a exclusão", async () => {
            (db.promise().query as jest.Mock).mockRejectedValueOnce(new Error("DB error"));

            await expect(CostAnalysisService.destroy(1)).rejects.toThrow(
                "Erro ao deletar análise. Tente novamente mais tarde."
            );
        });
    });
});