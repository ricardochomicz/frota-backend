import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../auth/generateAndVerifyToken';

declare global {
    namespace Express {
        interface Request {
            user?: any; // Adiciona o campo "user" ao tipo Request para evitar erros de tipos
        }
    }
}

export async function authMiddleware(req: Request, res: Response, next: NextFunction): Promise<void> {
    const token = req.headers.authorization?.split(' ')[1]; // Bearer <token>
    if (!token) {
        res.status(401).json({ error: 'Token não fornecido' });
        return;
    }

    try {
        const decoded = await verifyToken(token);
        if (!decoded) {
            res.status(401).json({ error: 'Token inválido' });
            return;
        }

        // Adiciona os dados do usuário à requisição
        req.user = decoded;
        next();
    } catch (err) {
        console.error('[ERRO] Falha na verificação do token:', err);
        res.status(500).json({ error: 'Erro ao verificar o token', details: (err as Error).message });
    }
}
