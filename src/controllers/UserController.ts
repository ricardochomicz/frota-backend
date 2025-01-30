import { Request, Response } from 'express';
import UserService from '../services/UserService';



class UserController {
    static async create(req: Request, res: Response): Promise<void> {
        const { name, email, password_hash, role } = req.body;
        try {
            await UserService.create({ name, email, password_hash, role });
            res.status(201).json({ message: 'Usuário criado com sucesso' });
        } catch (err: any) {
            res.status(500).json({ error: 'Erro ao criar usuário', details: err.message });
        }
    }
    static async getAll(req: Request, res: Response): Promise<void> {
        try {
            const users = await UserService.getAll();    // Busca todos os usuários no banco de dados
            res.status(200).json({ data: users });
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
            await UserService.update(Number(id), { name, email, role });
            res.status(200).json({ message: 'Usuário atualizado com sucesso' });
        } catch (err: any) {
            res.status(500).json({ error: 'Erro ao atualizar usuário', details: err.message });
        }
    }
}

export default UserController;