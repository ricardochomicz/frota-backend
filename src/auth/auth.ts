import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'secret';

// Gera um token JWT
export function generateToken(userId: number, role: string): string {
    return jwt.sign({ userId, role }, JWT_SECRET, { expiresIn: '1h' });
}

// Verifica um token JWT
export function verifyToken(token: string): { userId: number; role: string } | null {
    try {
        const decoded = jwt.verify(token, JWT_SECRET) as { userId: number; role: string };
        return decoded;
    } catch (err) {
        return null;
    }
}