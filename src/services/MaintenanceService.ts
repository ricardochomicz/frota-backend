import IMaintenance from "../models/Maintenance";
import db from "../config/db";
const PAGE = 1;
const LIMIT = 10;
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

    static async getAll(
        page = PAGE,
        limit = LIMIT,
        filters: { type?: string, startDate?: Date, endDate?: Date, license_plate?: string } = {}): Promise<{ maintenances: IMaintenance[], total: number }> {
        const offset = (Math.max(1, Number(page)) - 1) * Math.max(1, Number(limit));

        let query = `
        SELECT m.*, 
            v.id as vehicle_id, v.license_plate, v.model, v.brand, v.year, v.mileage,
            u.id AS user_id, u.name AS user_name, u.email AS user_email
        FROM maintenance m
        JOIN vehicles v ON m.vehicle_id = v.id
        JOIN users u ON m.user_id = u.id
        WHERE 1=1
    `;
        let countQuery = `SELECT COUNT(*) AS total
                          FROM maintenance m
                          JOIN vehicles v ON m.vehicle_id = v.id 
                          WHERE 1=1`;
        let queryParams: any[] = [];

        if (filters.type) {
            query += ` AND type LIKE ?`;
            countQuery += ` AND type LIKE ?`;
            queryParams.push(`%${filters.type}%`);
        }

        if (filters.license_plate) {
            query += ` AND v.license_plate LIKE ?`;
            countQuery += ` AND v.license_plate LIKE ?`;
            queryParams.push(`%${filters.license_plate}%`);
        }

        if (filters.startDate && filters.endDate) {
            query += ` AND date BETWEEN ? AND ?`;
            countQuery += ` AND date BETWEEN ? AND ?`;
            queryParams.push(filters.startDate, filters.endDate);
        } else if (filters.startDate) {
            query += ` AND date >= ?`;
            countQuery += ` AND date >= ?`;
            queryParams.push(filters.startDate);
        } else if (filters.endDate) {
            query += ` AND date <= ?`;
            countQuery += ` AND date <= ?`;
            queryParams.push(filters.endDate);
        }


        query += ` LIMIT ? OFFSET ?`;
        queryParams.push(limit, offset);

        try {
            const [[{ total }]]: any = await db.promise().query(countQuery, queryParams.slice(0, -2));
            const [rows]: any = await db.promise().query(query, queryParams);
            const formattedRows = rows.map((maintenance: any) => ({
                id: maintenance.id,
                date: maintenance.date,
                type: maintenance.type,
                description: maintenance.description,
                mileage_at_maintenance: maintenance.mileage_at_maintenance,
                created_at: maintenance.created_at,
                updated_at: maintenance.updated_at,
                vehicle: {
                    id: maintenance.vehicle_id,
                    license_plate: maintenance.license_plate,
                    model: maintenance.model,
                    brand: maintenance.brand,
                    year: maintenance.year
                },
                user: {
                    id: maintenance.user_id,
                    name: maintenance.user_name,
                    email: maintenance.user_email
                }
            }));

            return { maintenances: formattedRows, total };
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

    static async destroy(id: number) {
        const query = `DELETE FROM maintenance WHERE id = ?`;

        try {
            await db.promise().query(query, [id]);
        } catch (error) {
            throw new Error('Erro ao deletar manutenção. Tente novamente mais tarde.');
        }
    }
}

export default MaintenanceService;