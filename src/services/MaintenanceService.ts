import IMaintenance from "../models/Maintenance";
import db from "../config/db";
import moment from "moment";
import BaseService from "./BaseService";

const PAGE = 1;
const LIMIT = 5;
class MaintenanceService extends BaseService {

    static async create(maintenance: IMaintenance, userId?: number) {
        try {
            const date_format = moment().format('YYYY-MM-DD');
            const status = 'PENDENTE';
            const { vehicle_id, type, description, mileage_at_maintenance } = maintenance;
            const query = `INSERT INTO maintenance (vehicle_id, type, description, mileage_at_maintenance, date, status, user_id) VALUES (?, ?, ?, ?, ?, ?, ?)`;
            const [result]: any = await db.promise().query(query, [vehicle_id, type, description, mileage_at_maintenance, date_format, status, userId]);
            return { id: result.insertId }
        } catch (error) {
            throw new Error('Erro na requisição. Tente novamente mais tarde.');
        }
    }

    static async getAll(
        page = PAGE,
        limit = LIMIT,
        filters: { type?: string, startDate?: Date, endDate?: Date, license_plate?: string } = {}, userId?: any): Promise<{ maintenances: IMaintenance[], total: number }> {
        const offset = (Math.max(1, Number(page)) - 1) * Math.max(1, Number(limit));

        let query = `
            SELECT 
                m.*, 
                v.id AS vehicle_id, v.license_plate, v.model, v.brand, v.year, v.mileage,
                u.id AS user_id, u.name AS user_name, u.email AS user_email,
                COUNT(vt.id) AS total_tires, 
                SUM(CASE 
                    WHEN v.mileage >= (vt.mileage_at_installation + vt.predicted_replacement_mileage)
                    AND vt.to_replace = 0 
                    THEN 1 
                    ELSE 
                        CASE 
                            WHEN v.mileage >= vt.mileage_at_installation + (0.8 * vt.predicted_replacement_mileage)
                            AND vt.to_replace = 0 
                            THEN 1
                            ELSE 0
                        END
                END) AS tires_pending
            FROM maintenance m 
            JOIN vehicles v ON m.vehicle_id = v.id
            LEFT JOIN users u ON u.id = m.user_id
            LEFT JOIN vehicle_tires vt ON vt.maintenance_id = m.id
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

        const { query: userScopeQuery, countQuery: userScopeCountQuery, queryParams: userScopeParams } = await this.getUserAccessScope(userId);

        query += userScopeQuery;
        countQuery += userScopeCountQuery;
        queryParams = [...queryParams, ...userScopeParams];

        query += ` 
        GROUP BY m.id, v.id, u.id
        LIMIT ? OFFSET ?
        `;
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
                status: maintenance.status,
                created_at: maintenance.created_at,
                updated_at: maintenance.updated_at,
                to_replace: maintenance.to_replace,
                tires_pending: maintenance.tires_pending,
                vehicle: {
                    id: maintenance.vehicle_id,
                    license_plate: maintenance.license_plate,
                    model: maintenance.model,
                    brand: maintenance.brand,
                    year: maintenance.year,
                    mileage: maintenance.mileage
                },
                data_user: {
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

    /**
     * 
     * @param id 
     * @returns retorna uma manutenção ou null
     */
    static async get(id: number): Promise<IMaintenance | null> {
        const query = `SELECT m.*, v.mileage 
                        FROM maintenance m
                        JOIN vehicles v ON m.vehicle_id = v.id
                        WHERE m.id = ?;`;
        try {
            const [rows]: any = await db.promise().query(query, [id]);
            return rows[0] || null;
        } catch (error) {
            throw new Error('Erro ao buscar manutenções. Tente novamente mais tarde.');
        }
    }

    /**
     * 
     * @param vehicle_id 
     * @returns retorna as manutenções de um veículo
     */
    static async getByVehicleId(vehicle_id: number): Promise<IMaintenance[]> {
        const query = `SELECT * FROM maintenance WHERE vehicle_id = ?`;
        try {
            const [rows]: any = await db.promise().query(query, [vehicle_id]);
            return rows;
        } catch (error) {
            throw new Error('Erro ao buscar manutenções. Tente novamente mais tarde.');
        }
    }

    /**
     * 
     * @param id 
     * @param maintenance 
     * @returns faz update na manutenção
     */
    static async update(id: number, maintenance: IMaintenance) {
        const { vehicle_id, type, description, mileage_at_maintenance, user_id } = maintenance;
        const query = `UPDATE maintenance SET vehicle_id = ?, type = ?, description = ?, mileage_at_maintenance = ?, user_id = ? WHERE id = ?`;
        try {
            await db.promise().query(query, [vehicle_id, type, description, mileage_at_maintenance, user_id, id]);
            // const updatedMaintenance = await this.getMaintenanceWithVehicle(id);
            // return updatedMaintenance;
        } catch (error) {
            throw new Error('Erro ao atualizar manutenção. Tente novamente mais tarde.');
        }
    }

    /**
     * 
     * @param maintenance_id 
     * @returns retorna as manutenções de um veículo
     */
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
                console.error("[ERROR API] Manutenção não encontrada:", maintenance_id);
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

    /**
     * 
     * @param id 
     * @returns deleta uma manutenção
     */
    static async destroy(id: number) {
        const query = `DELETE FROM maintenance WHERE id = ?`;
        try {
            await db.promise().query(query, [id]);
        } catch (error) {
            throw new Error('Erro ao deletar manutenção. Tente novamente mais tarde.');
        }
    }


    /**
     * 
     * @param maintenanceId 
     * @returns verifica se o campo to_replace da tabela vehicles está como 0
     * Caso a manutenção tenha 0 pneus pendentes, atualiza o status da manutenção para concluida
     */
    static async updateMaintenanceStatus(maintenanceId: number): Promise<void> {
        const query = `
            SELECT 
                COUNT(CASE WHEN vt.to_replace = 0 THEN 1 END) AS pending_tires,
                COUNT(CASE WHEN vt.to_replace = 1 THEN 1 END) AS replaced_tires,
                COUNT(*) AS total_tires
            FROM vehicle_tires vt
            WHERE vt.maintenance_id = ?
        `;

        const updateQuery = `UPDATE maintenance SET status = ? WHERE id = ?`;

        try {
            const [result]: any = await db.promise().query(query, [maintenanceId]);
            const { pending_tires, replaced_tires, total_tires } = result[0];

            let newStatus = "PENDENTE";
            if (replaced_tires === total_tires && total_tires > 0) {
                newStatus = "CONCLUIDA";
            }

            await db.promise().query(updateQuery, [newStatus, maintenanceId]);
        } catch (error) {
            throw new Error("Erro ao atualizar manutenção.");
        }
    }

}

export default MaintenanceService;