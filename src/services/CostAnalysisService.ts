import ICostAnalysis from "../models/CostAnalysis";
import db from "../config/db";
import moment from "moment";
import BaseService from "./BaseService";

const PAGE = 1;
const LIMIT = 10;
class CostAnalysisService extends BaseService {

    static async create(costAnalysis: ICostAnalysis, userId?: number): Promise<{ data: ICostAnalysis }> {
        try {
            const { vehicle_id, item_type, cost, purchase_date, performance_score, description, replacement_reason, tire_id, mileage_driven } = costAnalysis;
            const dateFormat = moment(purchase_date).format('YYYY-MM-DD');
            const query = `INSERT INTO cost_analysis (vehicle_id, item_type, cost, purchase_date, performance_score, description, replacement_reason, tire_id, mileage_driven,  user_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
            const [result]: any = await db.promise().query(query, [vehicle_id, item_type, cost, dateFormat, performance_score, description, replacement_reason, tire_id, mileage_driven, userId]);
            return result;
        } catch (error) {
            console.error("[ERROR API] Erro ao criar analise de custo:", error);
            throw new Error('Erro na requisição. Tente novamente mais tarde.');
        }
    }

    static async getAll(
        page = PAGE,
        limit = LIMIT,
        filters: { replacement_reason?: string } = {}, userId?: any): Promise<{ analysis: ICostAnalysis[], total: number }> {
        const offset = (Math.max(1, Number(page)) - 1) * Math.max(1, Number(limit));

        let query = `
            SELECT c.*, 
                v.id as vehicle_id, v.license_plate, v.model, v.brand, v.year, v.mileage,
                u.id AS user_id, u.name AS user_name, u.email AS user_email,
                t.id AS tire_id, t.code, t.brand, t.model, t.price, t.durability_km
            FROM cost_analysis c
            JOIN vehicles v ON c.vehicle_id = v.id
            JOIN users u ON c.user_id = u.id
            JOIN tires t ON c.tire_id = t.id
            WHERE 1=1
        `;

        let countQuery = `SELECT COUNT(*) AS total
            FROM cost_analysis c
            JOIN vehicles v ON c.vehicle_id = v.id 
            WHERE 1=1`;
        let queryParams: any[] = [];

        if (filters.replacement_reason) {
            query += ` AND replacement_reason LIKE ?`;
            countQuery += ` AND replacement_reason LIKE ?`;
            queryParams.push(`%${filters.replacement_reason}%`);
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
            return { analysis: rows, total };
        } catch (error) {
            console.error('[ERROR API] Erro ao buscar análises:', error);
            throw new Error('Erro ao buscar análises. Tente novamente mais tarde.');
        }
    }

    static async get(id: number): Promise<ICostAnalysis | null> {
        const query = `SELECT * FROM cost_analysis WHERE id = ?`;
        try {
            const [rows]: any = await db.promise().query(query, [id]);
            return rows[0] || null;
        } catch (error) {
            throw new Error('Erro ao buscar manutenções. Tente novamente mais tarde.');
        }
    }

    static async update(id: number, costAnalysis: ICostAnalysis, user_id: number) {
        const { vehicle_id, item_type, cost, purchase_date, performance_score } = costAnalysis;
        const query = `UPDATE cost_analysis SET vehicle_id = ?, user_id = ?, item_type = ?, cost = ?, purchase_date = ?, performance_score = ? WHERE id = ?`;
        try {
            await db.promise().query(query, [vehicle_id, user_id, item_type, cost, purchase_date, performance_score, id]);
        } catch (error) {
            throw new Error('Erro ao atualizar manutenção. Tente novamente mais tarde.');
        }
    }

    static async delete(id: number): Promise<void> {
        const query = `DELETE FROM cost_analysis WHERE id = ?`;

        try {
            await db.promise().query(query, [id]);
        } catch (error) {
            throw new Error('Erro ao deletar veículo. Tente novamente mais tarde.');
        }
    }
}

export default CostAnalysisService;