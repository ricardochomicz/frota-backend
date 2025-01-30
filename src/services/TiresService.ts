import db from '../config/db';
import ITires from "../models/Tires";
import { getAuthenticatedUser } from '../auth/generateAndVerifyToken';
import { Request } from 'express';

class TiresService {

    /**
 * 
 * @param vehicle Dados do pneu
 * @returns Retorna o ID do pneu inserido
 */
    static async create(tires: ITires, user_id: number): Promise<{ data: ITires }> {

        const { code, brand, model, price } = tires;

        const query = `INSERT INTO tires (code, brand, model, price, user_id) VALUES (?, ?, ?, ?, ?)`;

        try {
            const [result]: any = await db.promise().query(query, [code, brand, model, price, user_id]);
            return result;
        } catch (error) {
            throw new Error('Erro ao criar pneus. Tente novamente mais tarde.');
        }
    }

    /**
     * 
     * @returns Retorna uma lista com todos os pneus cadastrados
     */
    static async getAll(): Promise<ITires[]> {
        const query = `SELECT * FROM tires`;

        try {
            const [rows]: any = await db.promise().query(query);
            return rows;
        } catch (error) {
            throw new Error('Erro ao buscar pneus. Tente novamente mais tarde.');
        }
    }

    /**
     * Busca um pneu pelo ID.
     * @param id ID do pneu
     * @returns ITires
     */
    static async get(id: number): Promise<ITires | null> {
        const query = `SELECT * FROM tires WHERE id = ?`;

        try {
            const [rows]: any = await db.promise().query(query, [id]);
            return rows[0] || null;
        } catch (error) {
            throw new Error('Erro ao buscar pneu. Tente novamente mais tarde.');
        }
    }


    /**
     * Retorna um pneu pelo código.
     * @param code Código do pneu
     * @returns 
     */
    static async getTiresByCode(code: string): Promise<ITires | null> {
        const query = `SELECT * FROM tires WHERE code = ?`;

        try {
            const [rows]: any = await db.promise().query(query, [code]);
            return rows[0] || null;
        } catch (error) {
            throw new Error('Erro ao buscar pneu. Tente novamente mais tarde.');
        }
    }

    /**
     * Atualiza um pneu no banco de dados.
     * @param id 
     * @param data IVehicle
     */
    static async update(id: number, data: ITires): Promise<void> {
        const { code, brand, model, price } = data;

        const query = `UPDATE tires SET code = ?, brand = ?, model = ?, price = ? WHERE id = ?`;

        try {
            await db.promise().query(query, [code, brand, model, price, id]);
        } catch (error) {
            throw new Error('Erro ao atualizar pneu. Tente novamente mais tarde.');
        }
    }
}

export default TiresService;