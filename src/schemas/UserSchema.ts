import { z } from 'zod';

export const registerSchema = z.object({
    name: z.string().min(1, { message: 'O nome é obrigatório' }),
    email: z.string().email({ message: 'Email inválido' }),
    role: z.string().min(1, { message: 'O papel é obrigatório' }),
});