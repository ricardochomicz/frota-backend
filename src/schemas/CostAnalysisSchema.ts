import { z } from "zod";

const decimalSchema = z.preprocess(
    (val) => {
        if (typeof val === "string") {
            // Substituir "," por "." para compatibilidade e converter para número
            const num = parseFloat(val.replace(",", "."));
            return isNaN(num) ? val : num;
        }
        return val;
    },
    z.number()
        .min(0, { message: "O valor deve ser positivo" })
        .max(999999, { message: "O valor é muito alto" })
        .multipleOf(0.01)
);

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
    purchase_date: z.preprocess(
        (val) => (typeof val === "string" ? new Date(val) : val),
        z.date({ message: "A data de compra deve ser uma data válida" }).optional()
    ),
    cost: decimalSchema,
    performance_score: decimalSchema,
    description: z.string().min(1, { message: "A descrição é obrigatória" }).optional(),
    replacement_reason: z.string().min(1, { message: "A razão de substituição é obrigatória" }).optional(),
});
