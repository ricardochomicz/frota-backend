import db from '../config/db';
import ITires from "../models/Tires";
import { getAuthenticatedUser } from '../auth/generateAndVerifyToken';
import { Request } from 'express';

const LIMIT = 5;
const PAGE = 1;

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
    static async getAll(page = PAGE, limit = LIMIT, filters: { code?: string; brand?: string; model?: string } = {}): Promise<{ tires: ITires[], total: number }> {
        const offset = (Math.max(1, Number(page)) - 1) * Math.max(1, Number(limit));

        let query = `SELECT * FROM tires WHERE 1=1`;
        let countQuery = `SELECT COUNT(*) AS total FROM tires WHERE 1=1`;
        let queryParams: any[] = [];

        if (filters.code) {
            query += ` AND code LIKE ?`;
            countQuery += ` AND code LIKE ?`;
            queryParams.push(`%${filters.code}%`);
        }
        if (filters.brand) {
            query += ` AND brand LIKE ?`;
            countQuery += ` AND brand LIKE ?`;
            queryParams.push(`%${filters.brand}%`);
        }
        if (filters.model) {
            query += ` AND model LIKE ?`;
            countQuery += ` AND model LIKE ?`;
            queryParams.push(`%${filters.model}%`);
        }

        query += ` LIMIT ? OFFSET ?`;
        queryParams.push(limit, offset);

        try {
            const [[{ total }]]: any = await db.promise().query(countQuery, queryParams.slice(0, -2));
            const [rows]: any = await db.promise().query(query, queryParams);
            return { tires: rows, total };
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

    static async destroy(tireId: number): Promise<void> {
        // Verifica se o pneu está associado a algum veículo na tabela pivot
        const checkQuery = "SELECT COUNT(*) AS count FROM vehicle_tires WHERE tire_id = ?";

        try {
            const [result]: any = await db.promise().query(checkQuery, [tireId]);

            // Se o pneu estiver associado a algum veículo, não pode ser excluído
            if (result[0].count > 0) {
                throw new Error("Este pneu não pode ser excluído, pois está em uso por um veículo.");
            }

            // Se o pneu não estiver em uso, pode ser excluído da tabela `tires`
            const deleteQuery = "DELETE FROM tires WHERE id = ?";
            await db.promise().query(deleteQuery, [tireId]);

        } catch (error) {
            throw new Error("Este pneu não pode ser excluído, pois está em uso por um veículo.");
        }
    }

}

export default TiresService;