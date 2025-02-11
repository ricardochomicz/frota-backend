// services/UserService.ts
import db from '../config/db';
import bcrypt from 'bcryptjs';
import { IUser, IUserUpdate } from '../models/User';
import BaseService from './BaseService';

const LIMIT = 5;
const PAGE = 1;

class UserService extends BaseService {

    /**
     * @param user IUser
     * cadastra um novo usuário
     */
    static async create(user: IUser): Promise<any> {
        const { name, email, password_hash, role, manager_id } = user;
        try {
            const hash = await bcrypt.hash(password_hash, 10);

            const query = 'INSERT INTO users (name, email, password_hash, role, manager_id) VALUES (?, ?, ?, ?, ?)';

            const [result]: any = await db.promise().query(query, [name, email, hash, role, manager_id || null]);
            return result;
        } catch (err) {
            throw new Error('[ERRO API] Erro ao cadastrar usuário.');
        }
    }

    /**
     * 
     * @param email string
     * busca um usuário pelo email
     */
    static async findByEmail(email: string): Promise<IUser | null> {
        try {
            const [result]: any = await db.promise().query(
                'SELECT * FROM users WHERE email = ?', [email]
            );

            if (result.length === 0) {
                return null;
            }
            return result[0];
        } catch (err) {
            throw new Error('[ERRO API] Erro ao buscar usuário.');
        }
    }

    /**
     * 
     * @param page 
     * @param limit 
     * @param filters 
     * @param userId 
     * Na tabela users tem o campo manager_id que identifica quem o gerencia
     * manager_id pode ver os seus registros e também os seus subordinados
     * Usuários que não tem manager_id são gerentes
     */
    static async getAll(page = PAGE, limit = LIMIT, filters: { name?: string; role?: string; } = {}, userId?: any): Promise<{ users: IUser[], total: number }> {
        const offset = (Math.max(1, Number(page)) - 1) * Math.max(1, Number(limit));

        let query = `SELECT id, name, email, role, manager_id, created_at, updated_at FROM users WHERE 1=1`;
        let countQuery = `SELECT COUNT(*) AS total FROM users WHERE 1=1`;
        let queryParams: any[] = [];

        if (filters.name) {
            query += ` AND name LIKE ?`;
            countQuery += ` AND name LIKE ?`;
            queryParams.push(`%${filters.name}%`);
        }
        if (filters.role) {
            query += ` AND role LIKE ?`;
            countQuery += ` AND role LIKE ?`;
            queryParams.push(`%${filters.role}%`);
        }

        const { query: userScopeQuery, countQuery: userScopeCountQuery, queryParams: userScopeParams } = await this.getUserAccessScope(userId);

        query += userScopeQuery;
        countQuery += userScopeCountQuery;
        queryParams = [...queryParams, ...userScopeParams];

        query += ` LIMIT ? OFFSET ?`;
        queryParams.push(limit, offset);

        try {
            const [[{ total }]]: any = await db.promise().query(countQuery, queryParams.slice(0, -2));
            const [rows]: any = await db.promise().query(query, queryParams);
            return { users: rows, total };

        } catch (error) {
            throw new Error('Erro ao buscar usuários. Tente novamente mais tarde.');
        }
    }


    /**
     * 
     * @param id 
     * retora um usuário pelo id
     */
    static async get(id: number): Promise<IUser | null> {
        try {
            const [rows]: any = await db.promise().query('SELECT id, name, email, role, manager_id, created_at, updated_at FROM users WHERE id = ?', [id]);
            return rows[0] || null;
        } catch (error) {
            throw new Error('[ERRO API] Erro ao buscar usuário.');
        }
    }


    /**
     * 
     * @param id 
     * @param user 
     * @param authenticatedUser 
     */
    static async update(id: number, user: IUserUpdate): Promise<void> {

        const { name, email, role } = user;

        const query = `UPDATE users SET name = ?, email = ?, role = ? WHERE id = ?`;
        try {

            await db.promise().query(query, [name, email, role, id]);
        } catch (error) {
            throw new Error('[ERRO API] Erro ao atualizar usuário.');
        }
    }


    /**
     * 
     * @param id 
     * deleta um usuário
     */
    static async delete(id: number): Promise<void> {
        try {
            await db.promise().query('DELETE FROM users WHERE id = ?', [id]);
        } catch (error) {
            throw new Error('[ERRO API] Erro ao deletar usuário.');
        }
    }

    /**
     * 
     * @param req 
     * retorna o usuário logado
     */
    static async me(req: any): Promise<IUser | null> {
        try {
            const { id } = req.user;
            const [rows]: any = await db.promise().query('SELECT id, name, email, role, created_at, updated_at FROM users WHERE id = ?', [id]);
            return rows[0] || null;
        } catch (error) {
            throw new Error('[ERRO API] Erro ao buscar usuário.');
        }
    }
}

export default UserService;
