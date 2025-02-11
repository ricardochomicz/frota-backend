import { z } from 'zod';

export const registerSchema = z.object({
    name: z.string().min(1, { message: 'O nome é obrigatório' }),
    email: z.string().email({ message: 'Email inválido' }),
    password_hash: z.string().min(6, { message: 'A senha deve ter pelo menos 6 caracteres' }),
});