import db from '../config/db'; // Já está usando a versão promise do mysql2
import bcrypt from 'bcryptjs';

interface IUser {
    name: string;
    email: string;
    password_hash: string;
    role: string;
}

class User {
    // Método para criar um usuário
    static async create(user: IUser): Promise<void> {
        const { name, email, password_hash, role } = user;

        try {
            // Verifica se o usuário já existe
            const [existingUser] = await db.promise().query('SELECT * FROM users WHERE email = ?', [email]);

            // Como o resultado de um SELECT é retornado em um array dentro de "rows", fazemos a verificação em "rows"
            if ((existingUser as any).length > 0) {
                throw new Error('Email já está em uso');
            }

            // Criptografa a senha
            const hash = await bcrypt.hash(password_hash, 10);

            const query = `
        INSERT INTO users (name, email, password_hash, role)
        VALUES (?, ?, ?, ?)
      `;

            // Executa a query de inserção
            await db.promise().query(query, [name, email, hash, role]);
        } catch (err) {
            throw err;  // Lança o erro para ser tratado externamente, caso necessário
        }
    }

    // Método para buscar um usuário pelo email
    static async findByEmail(email: string): Promise<any> {
        try {
            const [result] = await db.promise().query('SELECT * FROM users WHERE email = ?', [email]);

            if ((result as any).length === 0) {
                return null; // Retorna null se não encontrar o usuário
            }
            return (result as any)[0]; // Retorna o usuário encontrado
        } catch (err) {
            throw err;
        }
    }

    /**
     * 
     * @returns Retorna uma lista com todos os veículos cadastrados
     */
    static async getAll(): Promise<IUser[]> {
        const query = `SELECT * FROM users`;

        try {
            const [rows]: any = await db.promise().query(query);
            return rows;
        } catch (error) {
            console.error('[ERRO] Falha ao buscar usuários:', error);
            throw new Error('Erro ao buscar usuários. Tente novamente mais tarde.');
        }
    }
}

export default User;
