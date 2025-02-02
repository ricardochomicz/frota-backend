import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { Request } from "express";
import UserService from "../services/UserService";
import { IUser } from '../models/User';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'secret';

// Gera um token JWT
export function generateToken(userId: number, role: string): string {
    return jwt.sign({ userId, role }, JWT_SECRET, { expiresIn: '1h' });
}

// Verifica um token JWT
export function verifyToken(token: string): Promise<any> {
    return new Promise((resolve, reject) => {
        jwt.verify(token, JWT_SECRET, (err, decoded) => {
            if (err) return reject(err);
            resolve(decoded);
        });
    });
}

export const getAuthenticatedUser = async (req: Request): Promise<IUser | null> => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return null; // Nenhum token foi enviado
        }

        const token = authHeader.split(" ")[1]; // Remove "Bearer " do token
        const decoded: any = jwt.verify(token, JWT_SECRET);

        if (!decoded || !decoded.id) {
            return null; // Token inválido
        }

        // Busca o usuário no banco pelo ID do token
        const user = await UserService.get(decoded.id);

        return user || null;
    } catch (error) {
        console.error("[ERRO] Falha ao obter usuário autenticado:", error);
        return null;
    }
};