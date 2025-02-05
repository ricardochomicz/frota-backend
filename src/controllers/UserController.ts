import { Request, Response } from 'express';
import UserService from '../services/UserService';
import { UserAuthService } from '../services/UserAuthService';
import bcrypt from 'bcryptjs';



class UserController {
    static async create(req: Request, res: Response): Promise<void> {
        const { name, email, password_hash, role, manager_id } = req.body;

        // Verifica se o usuário já existe
        const existingUser = await UserService.findByEmail(email);
        if (existingUser) {
            res.status(400).json({ error: 'Email já está em uso' });
            return;
        }

        try {
            await UserService.create({ name, email, password_hash, role, manager_id });
            res.status(201).json({ message: 'Usuário criado com sucesso' });
        } catch (err: any) {
            res.status(500).json({ error: 'Erro ao criar usuário', details: err.message });
        }
    }
    static async getAll(req: Request, res: Response): Promise<void> {
        const page = Math.max(1, Number(req.query.page) || 1);
        const limit = Math.max(1, Number(req.query.limit) || 10);
        const filters = {
            name: req.query.name as string || undefined,
            role: req.query.role as string || undefined,
        };
        try {
            const { users, total } = await UserService.getAll(page, limit, filters, req.user.userId);
            res.status(200).json({
                data: users,
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            });
        } catch (err: any) {
            res.status(500).json({ error: 'Erro ao buscar usuários', details: err.message });
        }
    }

    static async get(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const user = await UserService.get(Number(id));
            if (!user) {
                res.status(404).json({ error: 'Usuário não encontrado' });
                return;
            }
            res.status(200).json({ data: user });
        } catch (err: any) {
            res.status(500).json({ error: 'Erro ao buscar usuário', details: err.message });
        }
    }

    static async update(req: Request, res: Response): Promise<void> {
        const { id } = req.params;
        const { name, email, role } = req.body;
        try {
            // Busca o usuário atual no banco de dados
            const existingUser = await UserService.get(Number(id));
            if (!existingUser) {
                res.status(404).json({ error: 'Usuário não encontrado' });
                return;
            }

            await UserService.update(Number(id), { name, email, role }, req.user.userId);
            res.status(200).json({ message: 'Usuário atualizado com sucesso' });
        } catch (err: any) {
            res.status(500).json({ error: 'Erro ao atualizar usuário', details: err.message });
        }
    }

    static async getMe(req: Request, res: Response): Promise<void> {
        try {
            const user = await UserService.me(req);
            if (user) {
                res.json(user);  // Retorna os dados do usuário
                return;
            } else {
                res.status(404).json({ error: 'Usuário não encontrado.' });
            }
        } catch (error) {
            res.status(500).json({ error: 'Erro interno ao buscar usuário.' });
        }
    }

    static async getAuthenticatedUser(req: Request, res: Response): Promise<void> {
        try {
            const token = req.headers.authorization?.split(' ')[1];  // Obtém o token do cabeçalho

            if (!token) {
                res.status(401).json({ error: 'Token não fornecido.' });
                return;
            }

            // Chama o serviço que autentica o usuário com o token
            const user = await UserAuthService.authenticateUser(token);

            if (!user) {
                res.status(404).json({ error: 'Usuário não encontrado.' });
                return;
            }

            res.json(user);  // Retorna os dados do usuário
            return;
        } catch (error) {
            res.status(500).json({ error: 'Erro ao buscar dados do usuário.' });
            return;
        }
    }
}

export default UserController;