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
            const subordinateIds = managerResults.map((user: any) => user.id);
            query += ` AND (id = ? OR id IN (?${', ?'.repeat(subordinateIds.length - 1)}))`; // Filtra registros do usuário ou dos subordinados
            countQuery += ` AND (id = ? OR id IN (?${', ?'.repeat(subordinateIds.length - 1)}))`;
            queryParams.push(userId, ...subordinateIds);
        } else {
            // Verificar se o usuário logado não é um manager (manager_id é null)
            const [userResults]: any = await db.promise().query(
                `SELECT manager_id FROM users WHERE id = ?`,
                [userId]
            );

            if (userResults.length > 0 && userResults[0].manager_id === null) {
                query += ` AND id = ?`; // Filtra apenas os registros do usuário logado
                countQuery += ` AND id = ?`;
                queryParams.push(userId);
            }
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