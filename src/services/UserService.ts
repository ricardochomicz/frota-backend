// services/UserService.ts
import db from '../config/db';
import bcrypt from 'bcryptjs';
import { IUser, IUserUpdate } from '../models/User';

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
            const [rows]: any = await db.promise().query('SELECT id, name, email, role, created_at, updated_at FROM users');
            return rows;
        } catch (error) {
            console.error('[ERRO] Falha ao buscar usuários:', error);
            throw new Error('Erro ao buscar usuários.');
        }
    }

    static async get(id: number): Promise<IUser | null> {
        try {
            const [rows]: any = await db.promise().query('SELECT id, name, email, role, created_at, updated_at FROM users WHERE id = ?', [id]);
            return rows[0] || null;
        } catch (error) {
            throw new Error('Erro ao buscar usuário.');
        }
    }

    static async update(id: number, user: IUserUpdate): Promise<void> {
        try {
            await db.promise().query('UPDATE users SET name = ?, email = ?, role = ? WHERE id = ?', [user.name, user.email, user.role, id]);
        } catch (error) {
            throw new Error('Erro ao atualizar usuário.');
        }
    }

    static async delete(id: number): Promise<void> {
        try {
            await db.promise().query('DELETE FROM users WHERE id = ?', [id]);
        } catch (error) {
            throw new Error('Erro ao deletar usuário.');
        }
    }

    static async me(req: any): Promise<IUser | null> {
        try {
            const { id } = req.user;
            const [rows]: any = await db.promise().query('SELECT id, name, email, role, created_at, updated_at FROM users WHERE id = ?', [id]);
            return rows[0] || null;
        } catch (error) {
            throw new Error('Erro ao buscar usuário.');
        }
    }
}

export default UserService;
