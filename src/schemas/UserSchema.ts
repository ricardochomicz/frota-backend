import { z } from 'zod';

export const userSchema = z.object({
    name: z.string()
        .min(1, { message: "O nome é obrigatório" })
        .trim(),

    email: z.string()
        .email({ message: "Email inválido" })
        .trim(),

    role: z.enum(["admin", "user", "manager"], { message: "Papel inválido" }),

    password_hash: z.string()
        .min(6, { message: "A senha deve ter pelo menos 6 caracteres" })
        .optional(),
});


export const userUpdateSchema = z.object({
    name: z.string().min(1, { message: 'O nome é obrigatório' }),
    email: z.string().email({ message: 'Email inválido' }),
    role: z.string().min(1, { message: 'O papel é obrigatório' }),
});