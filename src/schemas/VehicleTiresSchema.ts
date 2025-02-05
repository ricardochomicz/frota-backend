import { z } from "zod";

export const vehicleTiresSchema = z.array(z.object({
    vehicle_id: z.preprocess(
        (val) => Number(val),
        z.number().min(1, { message: "O veículo é obrigatório e deve ser um número válido" })
    ),
    tire_id: z.preprocess(
        (val) => Number(val),
        z.number().min(1, { message: "O pneu é obrigatório e deve ser um número válido" })
    ),
    installation_date: z.preprocess(
        (val) => (typeof val === "string" ? new Date(val) : val),
        z.date({ message: "A data de instalação deve ser uma data válida" })
    ),
    mileage_at_installation: z.preprocess(
        (val) => Number(val),
        z.number().min(0, { message: "KM de instalação deve ser um número válido" })
    ),
    predicted_replacement_mileage: z.preprocess(
        (val) => Number(val),
        z.number().min(0, { message: "KM de substituição deve ser um número válido" })
    ),
    maintenance_id: z.preprocess(
        (val) => Number(val),
        z.number().min(1)
    )
}));
