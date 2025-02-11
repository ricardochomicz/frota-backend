import { Request, Response } from 'express';
import { generateToken } from '../../auth/generateAndVerifyToken';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { loginSchema } from '../../schemas/auth/LoginSchema';
import { registerSchema } from '../../schemas/auth/RegisterSchema';
import UserService from '../../services/UserService';

class AuthController {
    // Registro de usuário
    static async register(req: Request, res: Response): Promise<void> {
        try {
            // Validação de dados
            const { name, email, password_hash } = registerSchema.parse(req.body);
            const role = "admin";
            // Verifica se o usuário já existe
            const existingUser = await UserService.findByEmail(email);
            if (existingUser) {
                res.status(400).json({ error: 'Email já está em uso' });
                return;
            }

            // Cria o usuário no banco de dados
            await UserService.create({ name, email, password_hash, role });

            res.status(201).json({ message: 'Usuário criado com sucesso' });
            return;
        } catch (err: any) {
            console.log(err)
            if (err instanceof z.ZodError) {
                // Validação falhou
                res.status(400).json({ error: 'Dados inválidos', details: err.errors });
                return;
            }


        }
    }

    // Login de usuário
    static async login(req: Request, res: Response): Promise<void> {
        try {
            // Validação de dados
            const { email, password_hash } = loginSchema.parse(req.body);

            // Busca o usuário no banco de dados
            const user = await UserService.findByEmail(email);
            if (!password_hash) {
                res.status(400).json({ error: 'Senha é obrigatória' });
            }
            if (!user || !(await bcrypt.compare(password_hash, user.password_hash))) {
                res.status(401).json({ error: 'Credenciais inválidas' });
                return;
            }

            if (!user.id || typeof user.id !== 'number') {
                res.status(500).json({ error: 'Erro interno: usuário sem ID' });
                return;
            }

            const token = generateToken(user.id, user.role);

            // Criar uma cópia do usuário sem o campo password_hash
            const { password_hash: _, ...userWithoutPassword } = user;
            res.status(200).json({ message: 'Login bem-sucedido', token, user: userWithoutPassword });

        } catch (err: any) {
            if (err instanceof z.ZodError) {
                res.status(400).json({ error: 'Dados inválidos', details: err.errors });

            }
            console.error('[ERRO] Falha ao fazer login:', err);
            res.status(500).json({ error: 'Erro ao fazer login', details: err.message });

        }
    }

    static async logout(req: Request, res: Response): Promise<void> {
        try {
            res.clearCookie('token');
            res.clearCookie('user');
            res.status(200).json({ message: 'Logout bem-sucedido' });
        } catch (err: any) {
            console.error('[ERRO] Falha ao fazer logout:', err);
            res.status(500).json({ error: 'Erro ao fazer logout', details: err.message });
        }
    }
}

export default AuthController;
