import { z } from "zod";

export const costAnalysisSchema = z.object({
    vehicle_id: z.preprocess(
        (val) => Number(val),
        z.number().min(1, { message: "O veículo é obrigatório e deve ser um número válido" })
    ),
    tire_id: z.preprocess(
        (val) => Number(val),
        z.number().min(1, { message: "O pneu é obrigatório e deve ser um número válido" })
    ),
    mileage_driven: z.preprocess(
        (val) => Number(val),
        z.number().min(0, { message: "KM rodados deve ser um número valido" })
    ),
    item_type: z.string().min(1, { message: "O tipo é obrigatório" }),
    cost: z.preprocess(
        (val) => (typeof val === "string" ? parseFloat(val) : val),
        z.number().positive("O valor deve ser positivo")
    ),

    purchase_date: z.preprocess(
        (val) => new Date(),
        z.date({ message: "A data de compra deve ser uma data válida" })
    ),
    performance_score: z.preprocess(
        (val) => Number(val),
        z.number().min(0, { message: "O desempenho deve ser um número válido" })
    ),
    description: z.string().min(1, { message: "A descrição é obrigatória" }),
    replacement_reason: z.string().min(1, { message: "A descrição é obrigatória" }),
});