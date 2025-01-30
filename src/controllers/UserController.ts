import { Request, Response } from 'express';
import User from "../models/User";



class UserController {
    static async getAll(req: Request, res: Response): Promise<void> {
        try {
            const users = await User.getAll();    // Busca todos os usuários no banco de dados
            res.status(200).json({ message: 'Usuários encontrados', data: users });
        } catch (err: any) {
            console.error('[ERRO] Falha ao buscar usuários:', err);
            res.status(500).json({ error: 'Erro ao buscar usuários', details: err.message });
        }
    }
}

export default UserController;