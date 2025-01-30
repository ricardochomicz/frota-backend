import { z } from "zod";

export const costAnalysisSchema = z.object({
    vehicle_id: z.preprocess(
        (val) => Number(val),
        z.number().min(1, { message: "O veículo é obrigatório e deve ser um número válido" })
    ),
    item_type: z.string().min(1, { message: "O tipo é obrigatório" }),
    cost: z
        .number({ message: "O custo é obrigatório" })
        .positive({ message: "O custo deve ser maior que zero" })
        .refine((value) => {
            // Verifica se o número tem até 10 dígitos no total e 2 casas decimais
            const regex = /^\d{1,8}(\.\d{1,2})?$/;
            return regex.test(String(value));
        }, { message: "O custo deve ter até 10 dígitos no total e 2 casas decimais" }),
    mileage_at_maintenance: z.preprocess(
        (val) => Number(val),
        z.number().min(0, { message: "KM deve ser um número valido" })
    ),
    purchase_date: z.preprocess(
        (val) => new Date(),
        z.date({ message: "A data de compra deve ser uma data válida" })
    ),
    performance_score: z.preprocess(
        (val) => Number(val),
        z.number().min(0, { message: "O desempenho deve ser um número válido" })
    )
});