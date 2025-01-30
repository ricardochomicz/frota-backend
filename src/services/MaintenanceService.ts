import IMaintenance from "../models/Maintenance";
import db from "../config/db";

class MaintenanceService {

    static async create(maintenance: IMaintenance, user_id: number): Promise<{ id: number }> {
        try {
            const { vehicle_id, type, description, mileage_at_maintenance, date } = maintenance;
            const query = `INSERT INTO maintenance (vehicle_id, user_id, type, description, mileage_at_maintenance, date) VALUES (?, ?, ?, ?, ?, ?)`;
            const [result]: any = await db.promise().query(query, [vehicle_id, user_id, type, description, mileage_at_maintenance, date]);
            return { id: result.insertId };
        } catch (error) {
            throw new Error('Erro na requisição. Tente novamente mais tarde.');
        }
    }

    static async getAll(): Promise<IMaintenance[]> {
        const query = `SELECT * FROM maintenance`;
        try {
            const [rows]: any = await db.promise().query(query);
            return rows;
        } catch (error) {
            throw new Error('Erro ao buscar manutenções. Tente novamente mais tarde.');
        }
    }

    static async get(id: number): Promise<IMaintenance | null> {
        const query = `SELECT * FROM maintenance WHERE id = ?`;
        try {
            const [rows]: any = await db.promise().query(query, [id]);
            return rows[0] || null;
        } catch (error) {
            throw new Error('Erro ao buscar manutenções. Tente novamente mais tarde.');
        }
    }

    static async getByVehicleId(vehicle_id: number): Promise<IMaintenance[]> {
        const query = `SELECT * FROM maintenance WHERE vehicle_id = ?`;
        try {
            const [rows]: any = await db.promise().query(query, [vehicle_id]);
            return rows;
        } catch (error) {
            throw new Error('Erro ao buscar manutenções. Tente novamente mais tarde.');
        }
    }

    static async update(id: number, maintenance: IMaintenance, user_id: number): Promise<void> {
        const { vehicle_id, type, description, mileage_at_maintenance, date } = maintenance;
        const query = `UPDATE maintenance SET vehicle_id = ?, type = ?, description = ?, mileage_at_maintenance = ?, date = ?, user_id = ? WHERE id = ?`;
        try {
            await db.promise().query(query, [vehicle_id, type, description, mileage_at_maintenance, date, user_id, id]);
        } catch (error) {
            throw new Error('Erro ao atualizar manutenção. Tente novamente mais tarde.');
        }
    }

}

export default MaintenanceService;