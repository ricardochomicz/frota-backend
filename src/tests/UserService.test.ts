import UserService from '../services/UserService';
import db from '../config/db';
import bcrypt from 'bcryptjs';

jest.mock('../config/db', () => ({
    promise: jest.fn().mockReturnValue({
        query: jest.fn()
    })
}));

describe('UserService', () => {
    let dbQueryMock: jest.Mock;

    beforeEach(() => {
        dbQueryMock = require('../config/db').promise().query as jest.Mock;
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('create', () => {
        it('deve criar um novo usuário', async () => {
            const user = {
                name: 'Test User',
                email: 'test@example.com',
                password_hash: 'password123',
                role: 'admin',
            };

            dbQueryMock.mockResolvedValueOnce([[]]); // Nenhum usuário existente
            dbQueryMock.mockResolvedValueOnce([{ insertId: 1 }]); // Usuário inserido

            const result = await UserService.create(user);

            expect(dbQueryMock).toHaveBeenCalledTimes(2);
            expect(result.insertId).toBe(1);
        });

        it('deve lançar erro ao criar usuário com email já existente', async () => {
            const user = { name: 'Test User', email: 'test@example.com', password_hash: 'password123', role: 'admin' };

            dbQueryMock.mockResolvedValueOnce([[{ id: 1 }]]);

            await expect(UserService.create(user)).rejects.toThrow('[ERRO API] Email já está em uso');
        });
    });

    describe("getAll", () => {

        it("deve retornar todos os usuários sem filtros", async () => {
            jest.spyOn(UserService, 'getUserAccessScope').mockResolvedValue({
                query: '',
                countQuery: '',
                queryParams: []
            });
            const mockUsers = [{ id: 1, name: "Pedro", email: "pedro@email.com" }];
            const mockTotal = [{ total: 1 }];

            jest.spyOn(db, 'promise').mockReturnValue({
                query: jest.fn()
                    .mockResolvedValueOnce([mockTotal]) // Retorno da contagem total
                    .mockResolvedValueOnce([mockUsers]) // Retorno dos pneus
            } as any);

            const result = await UserService.getAll(1, 10, {}, 1);
            expect(result).toEqual({ users: mockUsers, total: 1 });
        });

        it("deve aplicar filtros corretamente", async () => {
            jest.spyOn(UserService, 'getUserAccessScope').mockResolvedValue({
                query: '',
                countQuery: '',
                queryParams: []
            });
            const mockUsers = [{ id: 3, name: "Pedro", email: "pedro@email.com", role: "admin" }];
            const mockTotal = [{ total: 1 }];

            jest.spyOn(db, 'promise').mockReturnValue({
                query: jest.fn()
                    .mockResolvedValueOnce([mockTotal])
                    .mockResolvedValueOnce([mockUsers])
            } as any);

            const filters = { name: "Pedro", role: "admin" };
            const result = await UserService.getAll(1, 10, filters, 1);
            expect(result).toEqual({ users: mockUsers, total: 1 });
        });

        it('deve permitir que um gerente veja os registros dos subordinados', async () => {
            jest.spyOn(UserService, 'getUserAccessScope').mockResolvedValue({
                query: '',
                countQuery: '',
                queryParams: []
            });

            (db.promise().query as jest.Mock)
                .mockResolvedValueOnce([[{ total: 1 }]]) // Mock para a contagem total
                .mockResolvedValueOnce([
                    [{ id: 3, name: "Pedro", email: "pedro@email.com", role: "users", manager_id: 1 }]
                ]); // Mock para os registros

            const result = await UserService.getAll(1, 10, {}, 1);

            expect(result).toEqual({
                users: [
                    { id: 3, name: "Pedro", email: "pedro@email.com", role: "users", manager_id: 1 }
                ],
                total: 1
            });
        });


        it("deve permitir que um usuário comum veja apenas seus próprios registros", async () => {

            const mockUsers = [{ id: 1, name: "Pedro", email: "pedro@email.com", role: "users", manager_id: 1 }];
            const mockTotal = [{ total: 1 }];

            jest.spyOn(UserService, 'getUserAccessScope').mockResolvedValue({
                query: ` AND name = ?`,
                countQuery: ` AND name = ?`,
                queryParams: [10],
            });

            jest.spyOn(db, 'promise').mockReturnValue({
                query: jest.fn()
                    .mockResolvedValueOnce([mockTotal])
                    .mockResolvedValueOnce([mockUsers])
            } as any);

            const result = await UserService.getAll(1, 10, {}, 10);
            expect(result).toEqual({ users: mockUsers, total: 1 });
        });

        it("deve lidar com erros do banco de dados", async () => {
            jest.spyOn(db, 'promise').mockReturnValue({
                query: jest.fn().mockRejectedValue(new Error("Erro ao buscar usuários. Tente novamente mais tarde.."))
            } as any);

            await expect(UserService.getAll(1, 10, {}, 4)).rejects.toThrow(new Error("Erro ao buscar usuários. Tente novamente mais tarde."));
        });
    });

    describe('findByEmail', () => {
        it('deve buscar um usuário pelo email', async () => {
            const email = 'test@example.com';
            const mockUser = { id: 1, name: 'Test User', email, role: 'admin', manager_id: null };

            dbQueryMock.mockResolvedValueOnce([[mockUser]]);

            const result = await UserService.findByEmail(email);

            expect(dbQueryMock).toHaveBeenCalledWith('SELECT * FROM users WHERE email = ?', [email]);
            expect(result).toEqual(mockUser);
        });

        it('deve retornar null se não encontrar usuário pelo email', async () => {
            dbQueryMock.mockResolvedValueOnce([[]]);
            const result = await UserService.findByEmail('notfound@example.com');
            expect(result).toBeNull();
        });
    });

    describe('get', () => {
        it('deve buscar um usuário pelo ID', async () => {
            const mockUser = { id: 1, name: 'Test User', email: 'test@example.com', role: 'admin', manager_id: null };

            dbQueryMock.mockResolvedValueOnce([[mockUser]]);

            const result = await UserService.get(1);
            expect(result).toEqual(mockUser);
        });
    });

    describe('update', () => {
        it('deve atualizar um usuário', async () => {
            const userUpdate = { name: 'Updated Name', email: 'updated@example.com', role: 'user' };

            dbQueryMock.mockResolvedValueOnce([{}]);
            await UserService.update(1, userUpdate);

            expect(dbQueryMock).toHaveBeenCalledWith(
                'UPDATE users SET name = ?, email = ?, role = ? WHERE id = ?',
                [userUpdate.name, userUpdate.email, userUpdate.role, 1]
            );
        });
    });

    describe('destrpy', () => {
        it('deve deletar um usuário', async () => {
            dbQueryMock.mockResolvedValueOnce([{}]);
            await UserService.delete(1);
            expect(dbQueryMock).toHaveBeenCalledWith('DELETE FROM users WHERE id = ?', [1]);
        });
    });

    describe('me', () => {
        it('deve retornar o usuário logado', async () => {
            const mockUser = { id: 1, name: 'Test User', email: 'test@example.com', role: 'admin' };
            const req = { user: { id: 1 } };

            dbQueryMock.mockResolvedValueOnce([[mockUser]]);

            const result = await UserService.me(req);
            expect(result).toEqual(mockUser);
        });
    });
});
