import db from '../config/db';
import ITires from "../models/Tires";
import TiresService from '../services/TiresService';

jest.mock('../config/db', () => ({
    promise: jest.fn().mockReturnThis(),
    query: jest.fn()
}));

describe('TiresService', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('TiresService - create', () => {
        it('deveria criar um novo pneu e retornar o resultado', async () => {
            const tires: ITires = { code: '1234', brand: 'BrandX', model: 'ModelY', price: '100.00' };
            const user_id = 1;
            const result = { insertId: 1 };

            (db.promise().query as jest.Mock).mockResolvedValueOnce([result]);

            const response = await TiresService.create(tires, user_id);
            expect(response).toEqual(result);
            expect(db.promise().query).toHaveBeenCalledWith(
                `INSERT INTO tires (code, brand, model, price, user_id) VALUES (?, ?, ?, ?, ?)`,
                [tires.code, tires.brand, tires.model, tires.price, user_id]
            );
        });

        it('deve gerar um erro se a consulta ao banco de dados falhar', async () => {
            const tires: ITires = { code: '1234', brand: 'BrandX', model: 'ModelY', price: '100.00' };
            const user_id = 1;

            (db.promise().query as jest.Mock).mockRejectedValueOnce(new Error('Database error'));

            await expect(TiresService.create(tires, user_id)).rejects.toThrow('Erro ao criar pneus. Tente novamente mais tarde.');
        });
    });

    describe('TiresService - getAll', () => {
        it('deve retornar uma lista de pneus e a contagem total', async () => {
            const tires: ITires[] = [{ id: 1, code: '1234', brand: 'BrandX', model: 'ModelY', price: '100.00', user_id: 1 }];
            const total = 1;

            (db.promise().query as jest.Mock)
                .mockResolvedValueOnce([[{ total }]])
                .mockResolvedValueOnce([tires]);

            const response = await TiresService.getAll();
            expect(response).toEqual({ tires, total });
            expect(db.promise().query).toHaveBeenCalledTimes(2);
        });

        it('deve gerar um erro se a consulta ao banco de dados falhar', async () => {
            (db.promise().query as jest.Mock).mockRejectedValueOnce(new Error('Database error'));

            await expect(TiresService.getAll()).rejects.toThrow('Erro ao buscar pneus. Tente novamente mais tarde.');
        });
    });

    describe('TiresService - get', () => {
        it('deve retornar um pneu pelo ID', async () => {
            const tire: ITires = { id: 1, code: '1234', brand: 'BrandX', model: 'ModelY', price: '100.00', user_id: 1 };

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

    describe('TiresService - getTiresByCode', () => {
        it('deve retornar um pneu pelo codigo', async () => {
            const tire: ITires = { id: 1, code: '1234', brand: 'BrandX', model: 'ModelY', price: '100.00', user_id: 1 };

            (db.promise().query as jest.Mock).mockResolvedValueOnce([[tire]]);

            const response = await TiresService.getTiresByCode('1234');
            expect(response).toEqual(tire);
            expect(db.promise().query).toHaveBeenCalledWith(`SELECT * FROM tires WHERE code = ?`, ['1234']);
        });

        it('deve retornar nulo se o pneu não for encontrado', async () => {
            (db.promise().query as jest.Mock).mockResolvedValueOnce([[]]);

            const response = await TiresService.getTiresByCode('1234');
            expect(response).toBeNull();
        });

        it('deve gerar um erro se a consulta ao banco de dados falhar', async () => {
            (db.promise().query as jest.Mock).mockRejectedValueOnce(new Error('Database error'));

            await expect(TiresService.getTiresByCode('1234')).rejects.toThrow('Erro ao buscar pneu. Tente novamente mais tarde.');
        });
    });

    describe('TiresService - update', () => {
        it('deve atualizar um pneu e retornar vazio', async () => {
            const tire: ITires = { id: 1, code: '1234', brand: 'BrandX', model: 'ModelY', price: '100.00', user_id: 1 };

            (db.promise().query as jest.Mock).mockResolvedValueOnce(null);

            await TiresService.update(1, tire);
            expect(db.promise().query).toHaveBeenCalledWith(
                `UPDATE tires SET code = ?, brand = ?, model = ?, price = ? WHERE id = ?`,
                [tire.code, tire.brand, tire.model, tire.price, 1]
            );
        });

        it('deve gerar um erro se a consulta ao banco de dados falhar', async () => {
            const tire: ITires = { id: 1, code: '1234', brand: 'BrandX', model: 'ModelY', price: '100.00', user_id: 1 };

            (db.promise().query as jest.Mock).mockRejectedValueOnce(new Error('Database error'));

            await expect(TiresService.update(1, tire)).rejects.toThrow('Erro ao atualizar pneu. Tente novamente mais tarde.');
        });
    });

    describe('TiresService - destroy', () => {
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

});