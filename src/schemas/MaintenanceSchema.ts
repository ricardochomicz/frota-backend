import { z } from "zod";

export const maintenanceSchema = z.object({
    vehicle_id: z.preprocess(
        (val) => Number(val),
        z.number().min(1, { message: "O veículo é obrigatório e deve ser um número válido" })
    ),
    user_id: z.preprocess(
        (val) => Number(val),
        z.number().min(1, { message: "O veículo é obrigatório e deve ser um número válido" })
    ),
    type: z.string().min(1, { message: "O tipo de manutenção é obrigatório" }),
    description: z.string().min(1, { message: "A descrição da manutenção é obrigatória" }),
    mileage_at_maintenance: z.preprocess(
        (val) => Number(val),
        z.number().min(0, { message: "KM da manutenção deve ser um número valido" })
    ),

});