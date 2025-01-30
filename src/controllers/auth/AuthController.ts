import { Request, Response } from 'express';
import User from '../../models/User';
import { generateToken } from '../../auth/auth';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { loginSchema } from '../../schemas/auth/LoginSchema';
import { registerSchema } from '../../schemas/auth/RegisterSchema';

class AuthController {
    // Registro de usuário
    static async register(req: Request, res: Response): Promise<void> {
        try {
            // Validação de dados usando Zod
            const { name, email, password_hash, role } = registerSchema.parse(req.body);

            // Verifica se o usuário já existe
            const existingUser = await User.findByEmail(email);
            if (existingUser) {
                res.status(400).json({ error: 'Email já está em uso' });
                return;
            }

            // Cria o usuário no banco de dados
            await User.create({ name, email, password_hash, role });

            res.status(201).json({ message: 'Usuário criado com sucesso' });
            return;
        } catch (err: any) {
            if (err instanceof z.ZodError) {
                // Validação com Zod falhou
                res.status(400).json({ error: 'Dados inválidos', details: err.errors });
                return;
            }
            console.error('[ERRO] Falha ao registrar usuário:', err);
            res.status(500).json({ error: 'Erro ao criar usuário', details: err.message });
            return;
        }
    }

    // Login de usuário
    static async login(req: Request, res: Response): Promise<void> {
        try {
            // Validação de dados usando Zod
            const { email, password_hash } = loginSchema.parse(req.body);

            // Busca o usuário no banco de dados
            const user = await User.findByEmail(email);
            console.log(user);
            if (!user) {
                res.status(401).json({ error: 'Credenciais inválidas' });
                return
            }

            // Compara a senha
            const passwordMatch = await bcrypt.compare(password_hash, user.password_hash);
            if (!passwordMatch) {
                res.status(401).json({ error: 'Credenciais inválidas' });
                return
            }

            // Gera o token JWT
            const token = generateToken(user.id, user.role);
            res.status(200).json({ message: 'Login bem-sucedido', token });

        } catch (err: any) {
            // if (err instanceof z.ZodError) {
            //     res.status(400).json({ error: 'Dados inválidos', details: err.errors });

            // }
            console.error('[ERRO] Falha ao fazer login:', err);
            res.status(500).json({ error: 'Erro ao fazer login', details: err.message });

        }
    }
}

export default AuthController;
