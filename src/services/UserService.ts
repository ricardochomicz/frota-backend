// services/UserService.ts
import db from '../config/db';
import bcrypt from 'bcryptjs';
import IUser from '../models/User';

class UserService {
    static async create(user: IUser): Promise<void> {
        const { name, email, password_hash, role } = user;

        try {
            const [existingUser]: any = await db.promise().query(
                'SELECT * FROM users WHERE email = ?', [email]
            );

            if (existingUser.length > 0) {
                throw new Error('Email já está em uso');
            }

            const hash = await bcrypt.hash(password_hash, 10);

            await db.promise().query(
                'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)',
                [name, email, hash, role]
            );
        } catch (err) {
            throw err;
        }
    }

    static async findByEmail(email: string): Promise<IUser | null> {
        try {
            const [result]: any = await db.promise().query(
                'SELECT * FROM users WHERE email = ?', [email]
            );

            if (result.length === 0) {
                return null;
            }
            return result[0];
        } catch (err) {
            throw err;
        }
    }

    static async getAll(): Promise<IUser[]> {
        try {
            const [rows]: any = await db.promise().query('SELECT * FROM users');
            return rows;
        } catch (error) {
            console.error('[ERRO] Falha ao buscar usuários:', error);
            throw new Error('Erro ao buscar usuários.');
        }
    }
}

export default UserService;
