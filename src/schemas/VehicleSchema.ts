import { z } from "zod";

export const vehicleSchema = z.object({
    brand: z.string().min(1, { message: "A marca é obrigatória" }),
    model: z.string().min(1, { message: "O modelo é obrigatório" }),
    year: z.number().min(1886, { message: "Ano inválido" }).max(new Date().getFullYear(), { message: "Ano inválido" }),
    license_plate: z.string().regex(/^[A-Z]{3}-\d{4}$/, { message: "Placa inválida (Formato: AAA-1234)" }),
    mileage: z.number().nonnegative({ message: "Quilometragem inválida" }),
    fuel_type: z.string().min(1, { message: "O combustível é obrigatório" }),
});

export const vehicleLicensePlateSchema = z.object({
    license_plate: z.string().regex(/^[A-Z]{3}-\d{4}$/, { message: "Placa inválida (Formato: AAA-1234)" }),
});


