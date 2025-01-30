import { Request, Response } from 'express';
import VehicleTiresService from "../services/VehicleTiresService";
import { vehicleTiresSchema } from '../schemas/VehicleTiresSchema';


class VehicleTiresController {

    static async create(req: Request, res: Response): Promise<void> {
        try {
            if (!req.user) {
                res.status(401).json({ error: "Usuário não autenticado" });
                return;
            }
            // Validação da entrada
            const vehicleTires = vehicleTiresSchema.parse(req.body);

            //Verifica se o pneu já está cadastrado em um veículo.
            const tiresExistsForVehicle = await VehicleTiresService.isTireAssignedToAnotherVehicle(vehicleTires.tire_id, vehicleTires.vehicle_id);
            if (tiresExistsForVehicle) {
                res.status(400).json({ error: 'Pneu ja cadastrado neste ou em outro veículo, por favor de baixa para continuar.' });
                return;
            }

            // Criação do veículo no banco de dados
            const result = await VehicleTiresService.create(vehicleTires, req.user.userId);
            res.status(201).json({ message: 'Pneu adicionado ao veículo com sucesso', data: result });

        } catch (err: any) {
            if (err.name === "ZodError") {
                res.status(400).json({ error: 'Erro de validação', details: err.errors });
            }
            res.status(500).json({ error: 'Erro interno', details: err.message });
        }
    }

    static async getTiresByVehicleId(req: Request, res: Response): Promise<void> {
        try {
            const { vehicle_id } = req.params;
            const tires = await VehicleTiresService.getTiresByVehicleId(Number(vehicle_id));
            res.status(200).json({ data: tires });
        } catch (err: any) {
            res.status(500).json({ error: 'Erro ao buscar pneus', details: err.message });
        }
    }

    static async dischargeTire(req: Request, res: Response): Promise<void> {
        try {
            const { tire_id } = req.params;
            await VehicleTiresService.dischargeTire(Number(tire_id));
            res.status(200).json({ message: 'Pneu removido do veículo com sucesso' });
        } catch (err: any) {
            res.status(500).json({ error: 'Erro ao remover pneu do veículo', details: err.message });
        }
    }
}

export default VehicleTiresController;