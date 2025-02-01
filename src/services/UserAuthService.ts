
import jwt from 'jsonwebtoken';
import db from '../config/db';

const JWT_SECRET = 'secretKey'; // A chave secreta usada para assinar o JWT

export class UserAuthService {
    // Método para obter o usuário autenticado a partir do token JWT
    static async authenticateUser(token: string): Promise<any> {
        try {
            // Verifica o token e decodifica para pegar o id
            const decoded: any = jwt.verify(token, JWT_SECRET);

            if (!decoded || !decoded.id) {
                throw new Error('Token inválido ou expirado.');
            }

            // Agora que temos o id, podemos buscar o usuário no banco de dados
            const [rows]: any = await db.promise().query(
                'SELECT id, name, email, role, created_at, updated_at FROM users WHERE id = ?',
                [decoded.id]
            );

            return rows[0] || null;  // Retorna o usuário ou null se não encontrado
        } catch (error) {
            throw new Error('Erro ao autenticar o usuário.');
        }
    }
}
