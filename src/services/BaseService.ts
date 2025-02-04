import db from '../config/db';

class BaseService {

    static async getUserAccessScope(userId: number): Promise<any> {
        let query = '';
        let countQuery = '';
        let queryParams: any[] = [];
        const [managerResults]: any = await db.promise().query(
            `SELECT id FROM users WHERE manager_id = ?`,
            [userId]
        );

        if (managerResults.length > 0) {
            // Se o usuário logado é um manager, ele pode ver seus próprios registros e os dos subordinados
            const subordinateIds = managerResults.map((user: any) => user.id); // IDs dos subordinados
            query += ` AND (user_id = ? OR user_id IN (?))`; // Filtra registros do usuário ou dos subordinados
            countQuery += ` AND (user_id = ? OR user_id IN (?))`;
            queryParams.push(userId, subordinateIds);
        } else {
            // Se o usuário logado não é um manager, ele só pode ver seus próprios registros
            query += ` AND user_id = ?`; // Filtra apenas os registros do usuário logado
            countQuery += ` AND user_id = ?`;
            queryParams.push(userId);
        }
        return { query, countQuery, queryParams };
    }

    static async getFilters(filters: any, column: string): Promise<any> {
        let query = '';
        let countQuery = '';
        let queryParams: any[] = [];
        if (filters[column]) {
            query += ` AND ${column} LIKE ?`;
            countQuery += ` AND ${column} LIKE ?`;
            queryParams.push(`%${filters[column]}%`);
        }
        return { query, countQuery, queryParams };
    }
}

export default BaseService