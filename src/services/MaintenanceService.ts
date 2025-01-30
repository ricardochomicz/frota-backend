import IMaintenance from "../models/Maintenance";
import db from "../config/db";

class MaintenanceService {

    static async create(maintenance: IMaintenance, user_id: number) {
        try {
            const { vehicle_id, type, description, mileage_at_maintenance, date } = maintenance;
            const query = `INSERT INTO maintenance (vehicle_id, user_id, type, description, mileage_at_maintenance, date) VALUES (?, ?, ?, ?, ?, ?)`;
            const [result]: any = await db.promise().query(query, [vehicle_id, user_id, type, description, mileage_at_maintenance, date]);
            return { id: result.insertId }
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

    static async update(id: number, maintenance: IMaintenance, user_id: number) {
        const { vehicle_id, type, description, mileage_at_maintenance, date } = maintenance;
        const query = `UPDATE maintenance SET vehicle_id = ?, type = ?, description = ?, mileage_at_maintenance = ?, date = ?, user_id = ? WHERE id = ?`;
        try {
            await db.promise().query(query, [vehicle_id, type, description, mileage_at_maintenance, date, user_id, id]);
            const updatedMaintenance = await this.getMaintenanceWithVehicle(id);
            return updatedMaintenance;
        } catch (error) {
            throw new Error('Erro ao atualizar manutenção. Tente novamente mais tarde.');
        }
    }

    static async getMaintenanceWithVehicle(maintenance_id: number) {
        const query = `
            SELECT m.*, 
                   v.id AS vehicle_id, v.model, v.brand, v.year, v.license_plate
            FROM maintenance m
            LEFT JOIN vehicles v ON m.vehicle_id = v.id
            WHERE m.id = ?
        `;

        try {
            const [rows]: any = await db.promise().query(query, [maintenance_id]);

            if (rows.length === 0) {
                throw new Error("Manutenção não encontrada.");
            }

            const maintenanceData = rows[0];

            // Estruturando a resposta para incluir o objeto vehicle
            return {
                id: maintenanceData.id,
                vehicle_id: maintenanceData.vehicle_id,
                type: maintenanceData.type,
                description: maintenanceData.description,
                mileage_at_maintenance: maintenanceData.mileage_at_maintenance,
                date: maintenanceData.date,
                created_at: maintenanceData.created_at,
                updated_at: maintenanceData.updated_at,
                user_id: maintenanceData.user_id,
                vehicle: {
                    id: maintenanceData.vehicle_id,
                    model: maintenanceData.model,
                    brand: maintenanceData.brand,
                    year: maintenanceData.year,
                    license_plate: maintenanceData.license_plate
                }
            };
        } catch (error) {
            throw new Error('Erro ao buscar dados da manutenção e veículo.');
        }
    }






}

export default MaintenanceService;