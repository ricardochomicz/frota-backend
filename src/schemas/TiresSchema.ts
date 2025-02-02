import { z } from "zod";

export const tiresSchema = z.object({
    code: z.string().min(1, { message: "O código do pneu é obrigatório" }),
    model: z.string().min(1, { message: "O modelo do pneu é obrigatório" }),
    brand: z.string().min(1, { message: "A marca do pneu é obrigatória" }),
    price: z
        .string({ message: "O preço do pneu é obrigatório" })
        //.positive({ message: "O preço deve ser maior que zero" })
        //.refine((value) => {
            // Verifica se o número tem até 10 dígitos no total e 2 casas decimais
            //const regex = /^\d{1,8}(\.\d{1,2})?$/;
            //return regex.test(String(value));
        //}, { message: "O preço deve ter até 10 dígitos no total e 2 casas decimais" }),
});
