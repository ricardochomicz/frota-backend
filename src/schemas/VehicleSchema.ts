import { z } from "zod";

export const vehicleSchema = z.object({
    brand: z.string().min(1, { message: "A marca é obrigatória" }),
    model: z.string().min(1, { message: "O modelo é obrigatório" }),
    year: z.number()
        .min(1886, { message: "Ano inválido" })
        .max(new Date().getFullYear() + 1, { message: "Ano inválido" }),
    license_plate: z.string().regex(/^[A-Z]{3}-\d{4}$|^[A-Z]{3}\d[A-Z]\d{2}$/, {
        message: "Placa inválida (Formatos aceitos: AAA-1234 ou AAA1A11)"
    }),
    mileage: z.number().nonnegative({ message: "Quilometragem inválida" }),
    fuel_type: z.enum(["gasoline", "diesel", "eletric", "hybrid"], {
        message: "Tipo de combustível inválido"
    }),
});


export const vehicleLicensePlateSchema = z.object({
    license_plate: z.string().regex(/^[A-Z]{3}-\d{4}$/, { message: "Placa inválida (Formato: AAA-1234)" }),
});


