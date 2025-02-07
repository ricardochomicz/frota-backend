import db from '../config/db';
import { ITires, TireCheckResult } from "../models/Tires";
import { setupWebSocket } from '../websocket';
import BaseService from './BaseService';
import NotificationService from './notifications/NotificationTiresService';
import WebSocket from 'ws';

const LIMIT = 5;
const PAGE = 1;
let wss: WebSocket.Server;

class TiresService extends BaseService {

    /**
 * 
 * @param vehicle Dados do pneu
 * @returns Retorna o ID do pneu inserido
 */
    static async create(tires: ITires, userId?: number): Promise<{ data: ITires }> {

        const { code, brand, model, price, status, durability_km } = tires;

        const query = `INSERT INTO tires (code, brand, model, price, status, durability_km, user_id) VALUES (?, ?, ?, ?, ?, ?, ?)`;

        try {
            const [result]: any = await db.promise().query(query, [code, brand, model, price, status, durability_km, userId]);
            return result;
        } catch (error) {
            console.error("[ERROR API] Erro ao criar pneus:", error);
            throw new Error('Erro ao criar pneus. Tente novamente mais tarde.');
        }
    }

    /**
     * 
     * @returns Retorna uma lista com todos os pneus cadastrados
     */
    static async getAll(page = PAGE, limit = LIMIT, filters: { code?: string; brand?: string; model?: string; status?: string } = {}, userId?: any): Promise<{ tires: ITires[], total: number }> {
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
        if (filters.status) {
            query += ` AND status LIKE ?`;
            countQuery += ` AND status LIKE ?`;
            queryParams.push(`%${filters.status}%`);
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
            return { tires: rows, total };
        } catch (error) {
            console.error('[ERROR API] Erro ao buscar pneus:', error);
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
            console.error("[ERROR API] Erro ao buscar pneu:", error);
            throw new Error('Erro ao buscar pneu. Tente novamente mais tarde.');
        }
    }


    /**
     * Retorna um pneu pelo código.
     * @param code Código do pneu
     * @returns 
     */
    static async getTiresByCode(code: string): Promise<ITires | null> {
        const checkQuery = `
            SELECT COUNT(*) AS count, t.code, t.brand, t.model, t.status
            FROM vehicle_tires vt
            JOIN tires t ON vt.tire_id = t.id AND vt.to_replace = 0 AND t.status != 'available'
            WHERE t.code = ?
        `;
        try {
            const [checkRows]: any = await db.promise().query(checkQuery, [code]);

            // Se o pneu estiver associado a algum veículo, não pode ser retornado
            if (checkRows[0].count > 0 && checkRows[0].status === "in use") {
                console.error("[ERROR API]getTiresByCode Pneus ja associado a um veiculo");
                throw new Error('Pneu já está associado a um veículo.');
            } else if (checkRows[0].status === 'lower') {
                console.error("[ERROR API] Pneu ja baixado");
                throw new Error('Pneu já baixado.');
            } else {
                const query = `SELECT * FROM tires WHERE code = ?`;

                const [rows]: any = await db.promise().query(query, [code]);
                return rows[0] || null;
            }


        } catch (error) {
            console.error("[ERROR API] Erro ao buscar pneus:", error);
            throw new Error('Erro ao buscar pneus. Tente novamente mais tarde.');
        }
    }

    /**
     * Atualiza um pneu no banco de dados.
     * @param id 
     * @param data IVehicle
     */
    static async update(id: number, data: ITires): Promise<void> {

        const { code, brand, model, price, status, durability_km } = data;

        const query = `UPDATE tires SET code = ?, brand = ?, model = ?, price = ?, status = ?, durability_km = ? WHERE id = ?`;

        try {
            await db.promise().query(query, [code, brand, model, price, status, durability_km, id]);
        } catch (error) {
            console.error("[ERROR API] Erro ao atualizar pneu:", error);
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
                console.error("[ERROR API] Este pneu não pode ser excluído, pois está em uso por um veículo.");
                throw new Error("Este pneu não pode ser excluído, pois está em uso por um veículo.");
            }

            // Se o pneu não estiver em uso, pode ser excluído da tabela `tires`
            const deleteQuery = "DELETE FROM tires WHERE id = ?";
            await db.promise().query(deleteQuery, [tireId]);

        } catch (error) {
            console.error("[ERROR API] Erro ao excluir pneu:", error);
            throw new Error("Este pneu não pode ser excluído, pois está em uso por um veículo.");
        }
    }

    static async updateStatusAfterAnalysis(tireId: number, status: string, replacement_reason: string): Promise<void> {

        const query = `UPDATE tires SET status = ? WHERE id = ?`;
        if (replacement_reason === 'defect') {
            status = 'lower'
        } else {
            status = 'available'
        }
        try {
            await db.promise().query(query, [status, tireId]);
        } catch (error) {
            console.error("[ERROR API] Erro ao atualizar status do pneu:", error);
        }
    }

    static async checkTireWear(wss: WebSocket.Server) {
        const query = `
            SELECT 
                vt.*, 
                v.license_plate, 
                v.mileage AS current_mileage,
                u.email,
                t.code
            FROM 
                vehicle_tires vt
            JOIN 
                vehicles v ON vt.vehicle_id = v.id
            JOIN 
                users u ON v.user_id = u.id
            JOIN 
                tires t ON vt.tire_id = t.id
            LEFT JOIN 
                (SELECT vehicle_id, MAX(mileage_at_maintenance) AS max_mileage 
                FROM maintenance 
                GROUP BY vehicle_id) m 
            ON vt.vehicle_id = m.vehicle_id
            WHERE 
                vt.to_replace = 0 
                AND v.mileage >= vt.mileage_at_installation + vt.predicted_replacement_mileage;
        `;

        try {
            console.error('Iniciando verificação de pneus...');
            const [rows] = await db.promise().query<TireCheckResult[]>(query);

            if (Array.isArray(rows) && rows.length > 0) {
                console.error(`🔴 ${rows.length} pneus precisam de troca.`);
                rows.forEach(async (tire) => {
                    wss.clients.forEach((client) => {
                        if (client.readyState === WebSocket.OPEN) {
                            client.send(JSON.stringify({
                                type: 'tire_replacement',
                                message: `Pneu do veículo ${tire.license_plate} precisa ser trocado!`,
                                data: tire
                            }));
                        }
                    });
                    if (!tire.email || !tire.license_plate) {
                        console.error('Dados incompletos para o pneu:', tire);
                        return;
                    }
                    console.log(`🔴 O pneu ${tire.code} do veículo ${tire.license_plate} precisa ser trocado!`);
                    try {

                        // Enviar notificação ao usuário responsável
                        await NotificationService.sendEmail({
                            to: tire.email,
                            subject: 'Troca de Pneus Necessária',
                            message: `O pneu ${tire.code} do veículo ${tire.license_plate} atingiu a quilometragem de substituição. Agende a troca o quanto antes.`,
                        });
                        console.log(`✅ Notificação enviada para ${tire.email}`);
                    } catch (error) {
                        console.error(`❌ Erro ao enviar notificação para ${tire.email}:`, error);
                    }
                });
            } else {
                console.log('✅ Nenhum pneu precisa de troca agora.');
            }
        } catch (error) {
            console.error('Erro ao verificar pneus:', error);
        }
    }

}

export default TiresService;