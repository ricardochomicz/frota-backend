import { z } from "zod";

export const costAnalysisSchema = z.object({
    vehicle_id: z.preprocess(
        (val) => (typeof val === "string" || typeof val === "number" ? Number(val) : val),
        z.number().min(1, { message: "O veículo é obrigatório e deve ser um número válido" })
    ),
    user_id: z.preprocess(
        (val) => (val === undefined || val === null ? val : Number(val)),
        z.number().min(1, { message: "O usuário deve ser um número válido" }).optional()
    ),
    tire_id: z.preprocess(
        (val) => (val === undefined || val === null ? val : Number(val)),
        z.number().min(1, { message: "O pneu deve ser um número válido" }).optional()
    ),
    vehicle_tire_id: z.preprocess(
        (val) => (val === undefined || val === null ? val : Number(val)),
        z.number().min(1, { message: "Obrigatório" }).optional()
    ),
    mileage_driven: z.preprocess(
        (val) => (val === undefined || val === null ? val : Number(val)),
        z.number().min(0, { message: "KM rodados deve ser um número válido" }).optional()
    ),
    item_type: z.string().min(1, { message: "O tipo é obrigatório" }),
    cost: z.preprocess(
        (val) => (typeof val === "string" ? parseFloat(val) : val),
        z.number().positive({ message: "O valor deve ser positivo" })
    ),
    purchase_date: z.preprocess(
        (val) => (typeof val === "string" ? new Date(val) : val),
        z.date({ message: "A data de compra deve ser uma data válida" }).optional()
    ),
    performance_score: z.preprocess(
        (val) => (typeof val === "string" || typeof val === "number" ? Number(val) : val),
        z.number().min(0, { message: "O desempenho deve ser um número válido" })
    ),
    description: z.string().min(1, { message: "A descrição é obrigatória" }).optional(),
    replacement_reason: z.string().min(1, { message: "A razão de substituição é obrigatória" }).optional(),
});
