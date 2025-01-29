import { z } from "zod";

export const vehicleSchema = z.object({
    model: z.string().min(1, "O modelo é obrigatório"),
    year: z.number().min(1886, "Ano inválido").max(new Date().getFullYear(), "Ano inválido"),
    license_plate: z.string().regex(/^[A-Z]{3}-\d{4}$/, "Placa inválida (Formato: AAA-1234)"),
    mileage: z.number().nonnegative("Quilometragem inválida"),
});
