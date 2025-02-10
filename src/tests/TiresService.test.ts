import { WebSocket } from 'ws';
import db from '../config/db';
import { ITires } from "../models/Tires";
import NotificationService from '../services/notifications/NotificationTiresService';
import TiresService from '../services/TiresService';

jest.mock('../config/db', () => ({
    promise: jest.fn().mockReturnThis(),
    query: jest.fn()
}));

describe('TiresService', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });


    describe('create', () => {
        it('deveria criar um novo pneu e retornar o resultado', async () => {

            const tires: ITires = { code: '1234', brand: 'BrandX', model: 'ModelY', price: '100.00', status: 'available', durability_km: 1000, user_id: 1 };

            const result = { insertId: 1 };

            (db.promise().query as jest.Mock).mockResolvedValueOnce([result]);

            const response = await TiresService.create(tires, 1);
            expect(response).toEqual(result);
            expect(db.promise().query).toHaveBeenCalledWith(
                `INSERT INTO tires (code, brand, model, price, status, durability_km, user_id) VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [tires.code, tires.brand, tires.model, tires.price, tires.status, tires.durability_km, tires.user_id]
            );
        });

        it('deve gerar um erro se a consulta ao banco de dados falhar', async () => {

            const tires: ITires = { code: '1234', brand: 'BrandX', model: 'ModelY', price: '100.00', user_id: 1, status: 'available', durability_km: 1000 };


            (db.promise().query as jest.Mock).mockRejectedValueOnce(new Error('Database error'));

            await expect(TiresService.create(tires)).rejects.toThrow('Erro ao criar pneus. Tente novamente mais tarde.');
        });
    });

    describe("getAll", () => {

        it("deve retornar todos os pneus sem filtros", async () => {
            jest.spyOn(TiresService, 'getUserAccessScope').mockResolvedValue({
                query: '',
                countQuery: '',
                queryParams: []
            });
            const mockTires = [{ id: 1, code: "ABC-1234", brand: "Michelin", model: "X-ICE", price: "100.00", status: "available", durability_km: 1000, user_id: 1 }];
            const mockTotal = [{ total: 1 }];

            jest.spyOn(db, 'promise').mockReturnValue({
                query: jest.fn()
                    .mockResolvedValueOnce([mockTotal]) // Retorno da contagem total
                    .mockResolvedValueOnce([mockTires]) // Retorno dos pneus
            } as any);

            const result = await TiresService.getAll(1, 10, {}, 1);
            expect(result).toEqual({ tires: mockTires, total: 1 });
        });

        it("deve aplicar filtros corretamente", async () => {
            jest.spyOn(TiresService, 'getUserAccessScope').mockResolvedValue({
                query: '',
                countQuery: '',
                queryParams: []
            });
            const mockTires = [{ id: 3, code: "LMN-0789", brand: "Goodyear", model: "All-Terrain", status: "available", user_id: 1 }];
            const mockTotal = [{ total: 1 }];

            jest.spyOn(db, 'promise').mockReturnValue({
                query: jest.fn()
                    .mockResolvedValueOnce([mockTotal])
                    .mockResolvedValueOnce([mockTires])
            } as any);

            const filters = { code: "LMN-0789", brand: "Goodyear" };
            const result = await TiresService.getAll(1, 10, filters, 1);
            expect(result).toEqual({ tires: mockTires, total: 1 });
        });

        it('deve permitir que um gerente veja os registros dos subordinados', async () => {
            jest.spyOn(TiresService, 'getUserAccessScope').mockResolvedValue({
                query: '',
                countQuery: '',
                queryParams: []
            });

            (db.promise().query as jest.Mock)
                .mockResolvedValueOnce([[{ total: 1 }]]) // Mock para a contagem total
                .mockResolvedValueOnce([
                    [{ id: 3, code: 'LMN-0789', brand: 'Goodyear', model: 'All-Terrain', status: 'available', user_id: 1 }]
                ]); // Mock para os registros

            const result = await TiresService.getAll(1, 10, {}, 1);

            expect(result).toEqual({
                tires: [
                    { id: 3, code: 'LMN-0789', brand: 'Goodyear', model: 'All-Terrain', status: 'available', user_id: 1 }
                ],
                total: 1
            });
        });


        it("deve permitir que um usuário comum veja apenas seus próprios registros", async () => {

            const mockTires = [{ id: 1, code: "LMN-0789", brand: "Goodyear", model: "All-Terrain", status: "available", user_id: 1 }];
            const mockTotal = [{ total: 1 }];

            jest.spyOn(TiresService, 'getUserAccessScope').mockResolvedValue({
                query: ` AND user_id = ?`,
                countQuery: ` AND user_id = ?`,
                queryParams: [10],
            });

            jest.spyOn(db, 'promise').mockReturnValue({
                query: jest.fn()
                    .mockResolvedValueOnce([mockTotal])
                    .mockResolvedValueOnce([mockTires])
            } as any);

            const result = await TiresService.getAll(1, 10, {}, 10);
            expect(result).toEqual({ tires: mockTires, total: 1 });
        });

        it("deve lidar com erros do banco de dados", async () => {
            jest.spyOn(db, 'promise').mockReturnValue({
                query: jest.fn().mockRejectedValue(new Error("Erro ao buscar pneus. Tente novamente mais tarde."))
            } as any);

            await expect(TiresService.getAll(1, 10, {}, 4)).rejects.toThrow(new Error("Erro ao buscar pneus. Tente novamente mais tarde."));
        });
    });

    describe('get', () => {
        it('deve retornar um pneu pelo ID', async () => {
            const tire: ITires = { id: 1, code: '1234', brand: 'BrandX', model: 'ModelY', price: '100.00', durability_km: 1000, user_id: 1 };

            (db.promise().query as jest.Mock).mockResolvedValueOnce([[tire]]);

            const response = await TiresService.get(1);
            expect(response).toEqual(tire);
            expect(db.promise().query).toHaveBeenCalledWith(`SELECT * FROM tires WHERE id = ?`, [1]);
        });

        it('deve retornar nulo se o pneu não for encontrado', async () => {
            (db.promise().query as jest.Mock).mockResolvedValueOnce([[]]);

            const response = await TiresService.get(1);
            expect(response).toBeNull();
        });

        it('deve gerar um erro se a consulta ao banco de dados falhar', async () => {
            (db.promise().query as jest.Mock).mockRejectedValueOnce(new Error('Database error'));

            await expect(TiresService.get(1)).rejects.toThrow('Erro ao buscar pneu. Tente novamente mais tarde.');
        });
    });

    describe('getTiresByCode', () => {
        it('deve retornar o pneu se não estiver associado a um veículo', async () => {
            const code = 'PNEU123';
            const mockTire: ITires = { id: 1, code: 'PNEU123', brand: 'Pirelli', model: 'Winter', price: '100.00', durability_km: 1000, user_id: 1 };

            // Mock da query para contar a associação de pneus
            (db.promise().query as jest.Mock).mockResolvedValueOnce([[{ count: 0 }]]);

            // Mock da query para selecionar o pneu pelo código
            (db.promise().query as jest.Mock).mockResolvedValueOnce([[mockTire]]);

            const result = await TiresService.getTiresByCode(code);

            expect(result).toEqual(mockTire);
        });

        it('deve lançar um erro se o pneu estiver associado a um veículo', async () => {
            const code = 'PNEU123';

            // Mock da query para contar a associação de pneus
            (db.promise().query as jest.Mock).mockResolvedValueOnce([[{ count: 1 }]]);

            await expect(TiresService.getTiresByCode(code)).rejects.toThrow('Erro ao buscar pneus. Tente novamente mais tarde.');
        });

        it('deve retornar null se o pneu não for encontrado', async () => {
            const code = 'PNEU123';

            // Mock da query para contar a associação de pneus
            (db.promise().query as jest.Mock).mockResolvedValueOnce([[{ count: 0 }]]);

            // Mock da query para selecionar o pneu pelo código
            (db.promise().query as jest.Mock).mockResolvedValueOnce([[]]);

            const result = await TiresService.getTiresByCode(code);

            expect(result).toBeNull();
        });

        it('deve lançar um erro se ocorrer um erro no banco de dados', async () => {
            const code = 'PNEU123';

            // Mock da query para contar a associação de pneus
            (db.promise().query as jest.Mock).mockRejectedValueOnce(new Error('Erro no banco de dados'));

            await expect(TiresService.getTiresByCode(code)).rejects.toThrow('Erro ao buscar pneus. Tente novamente mais tarde.');
        });
    });


    describe('update', () => {
        it('deve atualizar um pneu e retornar vazio', async () => {
            const tire: ITires = { id: 1, code: '1234', brand: 'BrandX', model: 'ModelY', price: '100.00', status: 'available', durability_km: 1000, user_id: 1 };

            (db.promise().query as jest.Mock).mockResolvedValueOnce(null);

            await TiresService.update(1, tire);
            expect(db.promise().query).toHaveBeenCalledWith(
                `UPDATE tires SET code = ?, brand = ?, model = ?, price = ?, status = ?, durability_km = ? WHERE id = ?`,
                [tire.code, tire.brand, tire.model, tire.price, tire.status, tire.durability_km, 1]
            );
        });

        it('deve gerar um erro se a consulta ao banco de dados falhar', async () => {
            const tire: ITires = { id: 1, code: '1234', brand: 'BrandX', model: 'ModelY', price: '100.00', status: 'available', durability_km: 1000, user_id: 1 };

            (db.promise().query as jest.Mock).mockRejectedValueOnce(new Error('Database error'));

            await expect(TiresService.update(1, tire)).rejects.toThrow('Erro ao atualizar pneu. Tente novamente mais tarde.');
        });
    });

    describe('updateStatusAfterAnalysis', () => {
        it('deve atualizar o status para "lower" quando o motivo for "defect"', async () => {
            const tireId = 1;
            const status = 'available';
            const replacement_reason = 'defect';

            // Mock da função query para simular uma execução bem-sucedida
            (db.promise().query as jest.Mock).mockResolvedValueOnce([{}, null]);

            await TiresService.updateStatusAfterAnalysis(tireId, status, replacement_reason);

            // Verifica se a função query foi chamada com os parâmetros corretos
            expect(db.promise().query).toHaveBeenCalledWith(
                'UPDATE tires SET status = ? WHERE id = ?',
                ['lower', tireId]
            );
        });
        it('deve atualizar o status para "available" quando o motivo não for "defect"', async () => {
            const tireId = 1;
            const status = 'lower';
            const replacement_reason = 'reform';

            // Mock da função query para simular uma execução bem-sucedida
            (db.promise().query as jest.Mock).mockResolvedValueOnce([{}, null]);

            await TiresService.updateStatusAfterAnalysis(tireId, status, replacement_reason);

            // Verifica se a função query foi chamada com os parâmetros corretos
            expect(db.promise().query).toHaveBeenCalledWith(
                'UPDATE tires SET status = ? WHERE id = ?',
                ['available', tireId]
            );
        });
        it('deve lançar um erro se a atualização no banco de dados falhar', async () => {
            const tireId = 1;
            const status = 'available';
            const replacement_reason = 'defect';

            // Mock da função query para simular um erro
            (db.promise().query as jest.Mock).mockRejectedValueOnce(new Error('Erro no banco de dados'));

            // Verifica se a função lança um erro
            await expect(
                TiresService.updateStatusAfterAnalysis(tireId, status, replacement_reason)
            ).rejects.toThrow('Erro ao atualizar o status do pneu. Tente novamente mais tarde.');
        });

    })

    describe('destroy', () => {
        it('deve excluir um pneu se ele não estiver em uso por nenhum veículo', async () => {
            (db.promise().query as jest.Mock)
                .mockResolvedValueOnce([[{ count: 0 }]])
                .mockResolvedValueOnce(null);

            await TiresService.destroy(1);
            expect(db.promise().query).toHaveBeenNthCalledWith(
                1,
                expect.stringContaining("SELECT COUNT(*) AS count FROM vehicle_tires WHERE tire_id = ?"),
                [1]
            );
            expect(db.promise().query).toHaveBeenNthCalledWith(
                2,
                expect.stringContaining("DELETE FROM tires WHERE id = ?"),
                [1]
            );
        });

        it('deve gerar um erro se o pneu estiver em uso por qualquer veículo', async () => {
            (db.promise().query as jest.Mock).mockResolvedValueOnce([[{ count: 1 }]]);

            await expect(TiresService.destroy(1)).rejects.toThrow("Este pneu não pode ser excluído, pois está em uso por um veículo.");
        });
    });

    class MockWebSocketServer {
        clients: Set<any>;
        constructor() {
            this.clients = new Set();
        }
        close() {
            this.clients.forEach((client) => client.close()); // Fecha todos os clientes
            this.clients.clear();
        }
    }

    jest.mock('ws', () => {
        Server: MockWebSocketServer
    })

    jest.mock('../services/notifications/NotificationTiresService', () => ({
        NotificationService: {
            sendEmail: jest.fn()
        }
    }))

    describe('checkTireWear', () => {
        let wss: any;

        beforeEach(() => {
            jest.clearAllMocks();
            jest.spyOn(console, 'error').mockImplementation(() => { });
            jest.spyOn(console, 'log').mockImplementation(() => { });
            // Cria uma instância mockada do WebSocket Server
            wss = new MockWebSocketServer();

            // Mock de um cliente WebSocket
            const mockClient = { readyState: 1, send: jest.fn(), close: jest.fn() }; // readyState 1 = OPEN
            wss.clients.add(mockClient);
        });

        afterEach(() => {
            jest.clearAllMocks(); // Limpa os mocks após cada teste
        });

        afterAll(() => {
            // Fecha as conexões WebSocket após o término dos testes
            wss.close();
        });

        it('deve enviar uma mensagem de "tire_warning" quando o desgaste atingir 80%', async () => {
            const mockRows = [
                {
                    current_mileage: 18000,
                    mileage_at_installation: 10000,
                    predicted_replacement_mileage: 10000,
                    license_plate: 'ABC-1234',
                    email: 'user@example.com',
                    code: 'P001',
                    to_replace: 0,
                    tw: true, // Habilita o envio de "tire_warning"
                    tr: false, // Desabilita o envio de "tire_replacement"
                },
            ];

            (db.promise().query as jest.Mock).mockResolvedValueOnce([mockRows, null]);

            const sendEmailMock = jest.spyOn(NotificationService, 'sendEmail').mockResolvedValueOnce(undefined);

            // Executa o método
            await TiresService.checkTireWear(wss);

            // Verifica se a query foi chamada
            expect(db.promise().query).toHaveBeenCalled();

            const mockClient = Array.from(wss.clients)[0] as any;
            expect(mockClient.send).toHaveBeenCalledWith(
                JSON.stringify({
                    type: 'tire_warning',
                    message: 'O pneu do veículo ABC-1234 está próximo da troca. A quilometragem atingiu 80%.',
                    data: mockRows[0],
                })
            );

            await expect(NotificationService.sendEmail).toHaveBeenCalledWith({
                to: 'user@example.com',
                subject: 'Aviso de Aproximação para Troca de Pneus',
                message: 'O pneu P001 do veículo ABC-1234 atingiu 80% da quilometragem de substituição. Agende a troca em breve.',
            });

            // Verifica os logs
            expect(console.error).toHaveBeenCalledWith('Iniciando verificação de pneus...');
            expect(console.log).toHaveBeenCalledWith('🔴 O pneu P001 do veículo ABC-1234 precisa ser trocado!');
            expect(console.log).toHaveBeenCalledWith('✅ Notificação enviada para user@example.com');
        })

        it('deve enviar uma mensagem de "tire_replacement" quando o desgaste atingir 100%', async () => {
            // Mock da query do banco de dados
            const mockRows = [
                {
                    id: 1,
                    license_plate: 'ABC-1234',
                    current_mileage: 20000, // Desgaste de 100%
                    mileage_at_installation: 10000,
                    predicted_replacement_mileage: 10000,
                    email: 'user@example.com',
                    code: 'P001',
                    to_replace: 0,
                    tw: false, // Desabilita o envio de "tire_warning"
                    tr: true, // Habilita o envio de "tire_replacement"
                },
            ];
            (db.promise().query as jest.Mock).mockResolvedValueOnce([mockRows, null]);

            const sendEmailMock = jest.spyOn(NotificationService, 'sendEmail').mockResolvedValueOnce(undefined);

            // Executa o método
            await TiresService.checkTireWear(wss);

            // Verifica se a query foi chamada
            expect(db.promise().query).toHaveBeenCalled();

            // Verifica se as notificações foram enviadas via WebSocket
            const mockClient = Array.from(wss.clients)[0] as any;
            expect(mockClient.send).toHaveBeenCalledWith(
                JSON.stringify({
                    type: 'tire_replacement',
                    message: 'Pneu do veículo ABC-1234 precisa ser trocado!',
                    data: mockRows[0],
                })
            );



            // Verifica se o e-mail foi enviado
            await expect(NotificationService.sendEmail).toHaveBeenCalledWith({
                to: 'user@example.com',
                subject: 'Troca de Pneus Necessária',
                message: 'O pneu P001 do veículo ABC-1234 atingiu a quilometragem de substituição. Agende a troca o quanto antes.',
            });

            // Verifica os logs
            expect(console.error).toHaveBeenCalledWith('Iniciando verificação de pneus...');
            expect(console.log).toHaveBeenCalledWith('🔴 O pneu P001 do veículo ABC-1234 precisa ser trocado!');
            expect(console.log).toHaveBeenCalledWith('✅ Notificação enviada para user@example.com');
        });

        it('deve enviar uma mensagem de "info" quando nenhum pneu precisar de troca', async () => {
            // Mock da query do banco de dados (sem resultados)
            (db.promise().query as jest.Mock).mockResolvedValueOnce([[], null]);

            // Executa o método
            await TiresService.checkTireWear(wss);
            const mockClient = Array.from(wss.clients)[0] as any;

            expect(mockClient.send).toHaveBeenCalledWith(
                JSON.stringify({
                    type: 'info',
                    message: 'Nenhum pneu precisa ser trocado no momento.',
                })
            );

            // Verifica se a query foi chamada
            expect(db.promise().query).toHaveBeenCalled();

            // Verifica os logs
            expect(console.log).toHaveBeenCalledWith('✅ Nenhum pneu precisa de troca agora.');
        });

        it('deve logar erro se a query falhar', async () => {
            // Mock da query do banco de dados (erro)
            (db.promise().query as jest.Mock).mockRejectedValueOnce(new Error('Erro no banco de dados'));

            // Executa o método
            await TiresService.checkTireWear(wss);

            // Verifica se o erro foi logado
            expect(console.error).toHaveBeenCalledWith('Erro ao verificar pneus:', expect.any(Error));
        });

        it('deve logar erro se os dados do pneu estiverem incompletos', async () => {
            // Mock da query do banco de dados (dados incompletos)
            const mockRows = [
                {
                    id: 1,
                    license_plate: null, // Dado incompleto
                    current_mileage: 50000,
                    email: null, // Dado incompleto
                    code: 'P001',
                },
            ];
            (db.promise().query as jest.Mock).mockResolvedValueOnce([mockRows, null]);

            // Executa o método
            await TiresService.checkTireWear(wss);

            // Verifica se o erro foi logado
            expect(console.error).toHaveBeenCalledWith('Dados incompletos para o pneu:', mockRows[0]);
        });
    });


});