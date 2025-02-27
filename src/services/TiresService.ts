
import db from '../config/db';
import { ITires, TireCheckResult } from "../models/Tires";
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

        const { code, brand, model, price, durability_km, status } = tires;

        const query = `INSERT INTO tires (code, brand, model, price, durability_km, status, user_id) VALUES (?, ?, ?, ?, ?, ?, ?)`;

        try {
            const [result]: any = await db.promise().query(query, [code, brand, model, price, durability_km, status, userId]);
            return result;
        } catch (error) {
            throw new Error('[CREATE API]Erro ao criar pneus. Tente novamente mais tarde.');
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
            throw new Error('[GETALL API] Erro ao buscar pneuss. Tente novamente mais tarde.');
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
            throw new Error('[GET API]Erro ao buscar pneu. Tente novamente mais tarde.');
        }
    }


    /**
     * Retorna um pneu pelo código.
     * @param code Código do pneu
     * @returns 
     */
    static async getTiresByCode(code: string): Promise<ITires | null> {
        try {
            // 1. Verificar o status do pneu na tabela 'tires'
            const tireQuery = `SELECT id, status, code, brand, model FROM tires WHERE code = ?`;
            const [tireRows]: any = await db.promise().query(tireQuery, [code]);

            if (!tireRows.length) {
                return null; // Pneu não encontrado
            }

            const { id: tireId, status } = tireRows[0];

            // Se o status for 'in use' ou 'lower', retorna erro 
            if (status === "in use") {
                throw new Error("Pneu já está associado a um veículo.");
            } else if (status === "lower") {
                throw new Error("Pneu já foi baixado.");
            }

            // Verifica se o pneu ainda está instalado na tabela 'vehicle_tires'
            const vehicleTireQuery = `
                SELECT COUNT(*) AS count 
                FROM vehicle_tires 
                WHERE tire_id = ? AND to_replace = 0
            `;
            const [vehicleTireRows]: any = await db.promise().query(vehicleTireQuery, [tireId]);

            if (vehicleTireRows[0].count > 0) {
                throw new Error("Pneu ainda está instalado em um veículo.");
            }

            // Retorna as informações completas do pneu
            return tireRows[0];
        } catch (error: any) {
            throw new Error(error.message);
        }
    }



    static async findByCode(code: string): Promise<any> {
        try {
            console.log("Buscando pneu com o código:", code);
            const [tire]: any = await db.promise().query(
                'SELECT * FROM tires WHERE code = ?', [code]
            );
            return tire.length > 0 ? tire[0] : null;
        } catch (err) {
            throw new Error("[ERRO API] Erro ao buscar pneus");
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
            throw new Error('Erro ao atualizar pneu. Tente novamente mais tarde.');
        }
    }

    /**
     * 
     * @param tireId 
     * deleta um pneu que não esteja associado na tabela vehicle_tires
     */
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


    /**
     * 
     * @param tireId 
     * @param status 
     * @param replacement_reason 
     * atualiza o status do pneu após criar uma análise
     */
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
            throw new Error('Erro ao atualizar o status do pneu. Tente novamente mais tarde.');
        }
    }

    /**
     * 
     * @param wss 
     * função para verificar se existem pneus que precisam de troca
     */
    static async checkTireWear(wss: WebSocket.Server) {
        const query = `
            SELECT 
                vt.*, 
                v.license_plate, 
                v.mileage AS current_mileage,
                u.email,
                t.code,
                CASE 
                    WHEN v.mileage >= (vt.mileage_at_installation + vt.predicted_replacement_mileage) 
                    THEN 'tire_replacement'
                    WHEN v.mileage >= (vt.mileage_at_installation + (0.8 * vt.predicted_replacement_mileage)) 
                    THEN 'tire_warning'
                    ELSE 'ok'
                END AS tire_status
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
                vt.to_replace = 0;
            `;

        try {
            console.error('Iniciando verificação de pneus...');
            const [rows] = await db.promise().query<TireCheckResult[]>(query);

            if (Array.isArray(rows) && rows.length > 0) {
                rows.forEach(async (tire) => {
                    const isNearReplacement = tire.tire_status === 'tire_warning';
                    const isDueForReplacement = tire.tire_status === 'tire_replacement';

                    if (!tire.email || !tire.license_plate) {
                        console.error('Dados incompletos para o pneu:', tire);
                        return;
                    }

                    // Enviar a mensagem para os clientes do WebSocket
                    wss.clients.forEach((client) => {
                        if (client.readyState === WebSocket.OPEN) {
                            if (isNearReplacement) {
                                console.log(`Enviando notificação de 80% para o veículo ${tire.license_plate}`);
                                client.send(JSON.stringify({
                                    type: 'tire_warning',
                                    message: `O pneu do veículo ${tire.license_plate} está próximo da troca. A quilometragem atingiu 80%.`,
                                    data: tire
                                }));
                            } else if (isDueForReplacement) {
                                console.log(`Enviando notificação de troca para o veículo ${tire.license_plate}`);
                                client.send(JSON.stringify({
                                    type: 'tire_replacement',
                                    message: `Pneu do veículo ${tire.license_plate} precisa ser trocado!`,
                                    data: tire
                                }));
                            }
                        } else {
                            console.log(`Cliente WebSocket não está aberto para o veículo ${tire.license_plate}`);
                        }
                    });

                    // Notificar por e-mail
                    console.log(`🔴 O pneu ${tire.code} do veículo ${tire.license_plate} precisa ser trocado!`);
                    try {
                        const subject = isDueForReplacement ? 'Troca de Pneus Necessária' : 'Aviso de Aproximação para Troca de Pneus';
                        const message = isDueForReplacement
                            ? `O pneu ${tire.code} do veículo ${tire.license_plate} atingiu a quilometragem de substituição. Agende a troca o quanto antes.`
                            : `O pneu ${tire.code} do veículo ${tire.license_plate} atingiu 80% da quilometragem de substituição. Agende a troca em breve.`;

                        // Enviar notificação ao usuário responsável
                        await NotificationService.sendEmail({
                            to: tire.email,
                            subject: subject,
                            message: message,
                        });
                        console.log(`✅ Notificação enviada para ${tire.email}`);
                    } catch (error) {
                        console.error(`❌ Erro ao enviar notificação para ${tire.email}:`, error);
                    }
                });
            } else {
                console.log('✅ Nenhum pneu precisa de troca agora.');
                wss.clients.forEach((client) => {
                    if (client.readyState === WebSocket.OPEN) {
                        client.send(JSON.stringify({
                            type: "info",
                            message: "Nenhum pneu precisa ser trocado no momento.",
                        }));
                    }
                });
            }
        } catch (error) {
            console.error('Erro ao verificar pneus:', error);
        }
    }
}

export default TiresService;