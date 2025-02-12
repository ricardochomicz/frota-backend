import { z } from "zod";

export const tiresSchema = z.object({
    code: z.string({ message: "O código do pneu é obrigatório" }).min(3, { message: "Minímo de 3 caracteres" }),
    model: z.string({ message: "O modelo do pneu é obrigatório" }).min(3, { message: "Minímo de 3 caracteres" }),
    brand: z.string({ message: "A marca do pneu é obrigatória" }).min(3, { message: "Minímo de 3 caracteres" }),
    // status: z.enum(["available", "in use", "lower"], { message: "Status inválido" }),
    price: z
        .string()
        .regex(/^\d+(\.\d{1,2})?$/, { message: "Preço inválido. Use um formato numérico, ex: 1000 ou 1000.50" }),
    durability_km: z.preprocess(
        (val) => (val === undefined || val === null ? val : Number(val)),
        z.number().min(1, { message: "O usuário deve ser um número válido" }).optional()
    ),
});
