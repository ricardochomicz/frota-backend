import { Request, Response } from 'express';
import Vehicle from '../models/Vehicle';
import { z } from 'zod';

// Esquema de validação com Zod
const vehicleSchema = z.object({
    model: z.string().min(1, "O modelo é obrigatório"),
    year: z.number().min(1886, "Ano inválido").max(new Date().getFullYear(), "Ano inválido"),
    license_plate: z.string().regex(/^[A-Z]{3}-\d{4}$/, "Placa inválida (Formato: AAA-1234)"),
    mileage: z.number().nonnegative("Quilometragem inválida"),
});

class VehicleController {
    static async create(req: Request, res: Response): Promise<Response> {
        try {
            // Validação da entrada
            const vehicle = vehicleSchema.parse(req.body);

            // Criação do veículo no banco de dados
            const result = await Vehicle.create(vehicle);
            return res.status(201).json({ message: 'Veículo criado com sucesso', data: result });

        } catch (err: any) {
            if (err.name === "ZodError") {
                return res.status(400).json({ error: 'Erro de validação', details: err.errors });
            }
            console.error('[ERRO] Falha ao criar veículo:', err);
            return res.status(500).json({ error: 'Erro interno', details: err.message });
        }
    }

    static async getAll(req: Request, res: Response): Promise<Response> {
        try {
            const vehicles = await Vehicle.getAll();
            return res.status(200).json({ message: 'Veículos encontrados', data: vehicles });
        } catch (err: any) {
            console.error('[ERRO] Falha ao buscar veículos:', err);
            return res.status(500).json({ error: 'Erro ao buscar veículos', details: err.message });
        }
    }
}

export default VehicleController;
