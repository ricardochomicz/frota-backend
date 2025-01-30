import ICostAnalysis from "../models/CostAnalysis";
import db from "../config/db";


class CostAnalysisService {

    static async create(costAnalysis: ICostAnalysis, user_id: number): Promise<{ data: ICostAnalysis }> {
        try {
            const { vehicle_id, item_type, cost, purchase_date, performance_score } = costAnalysis;
            const query = `INSERT INTO cost_analysis (vehicle_id, user_id, item_type, cost, purchase_date, performance_score) VALUES (?, ?, ?, ?, ?, ?)`;
            const [result]: any = await db.promise().query(query, [vehicle_id, user_id, item_type, cost, purchase_date, performance_score]);
            return result;
        } catch (error) {
            throw new Error('Erro na requisição. Tente novamente mais tarde.');
        }
    }

    static async getAll(): Promise<ICostAnalysis[]> {
        const query = `SELECT * FROM cost_analysis`;
        try {
            const [rows]: any = await db.promise().query(query);
            return rows;
        } catch (error) {
            throw new Error('Erro ao buscar manutenções. Tente novamente mais tarde.');
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