import { z } from "zod";

export const maintenanceSchema = z.object({
    vehicle_id: z.preprocess(
        (val) => (typeof val === "string" || typeof val === "number" ? Number(val) : val),
        z.number().min(1, { message: "O veículo é obrigatório e deve ser um número válido" })
    ),
    user_id: z.preprocess(
        (val) => (val === undefined || val === null ? val : Number(val)),
        z.number().min(1, { message: "O usuário deve ser um número válido" }).optional()
    ),
    type: z.string().min(1, { message: "O tipo de manutenção é obrigatório" }),
    description: z.string().min(1, { message: "A descrição da manutenção é obrigatória" }),
    mileage_at_maintenance: z.preprocess(
        (val) => (typeof val === "string" || typeof val === "number" ? Number(val) : val),
        z.number().min(0, { message: "KM da manutenção deve ser um número válido" })
    ),
    date: z.preprocess(
        (val) => (typeof val === "string" ? new Date(val) : val),
        z.date().optional()
    ),
    created_at: z.preprocess(
        (val) => (typeof val === "string" ? new Date(val) : val),
        z.date().optional()
    ),
    updated_at: z.preprocess(
        (val) => (typeof val === "string" ? new Date(val) : val),
        z.date().optional()
    ),
    status: z.string().optional(),
    vehicle: z
        .object({
            id: z.number().optional(),
            model: z.string().optional(),
            brand: z.string(),
            year: z.number().min(1886, { message: "Ano inválido" }).max(new Date().getFullYear(), { message: "Ano inválido" }),
            license_plate: z.string().regex(/^[A-Z]{3}-\d{4}$/, { message: "Placa inválida (Formato: AAA-1234)" }),
        })
        .optional(),
});
