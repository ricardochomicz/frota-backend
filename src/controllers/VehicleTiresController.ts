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

            // Validação da entrada (esperando um array)
            const vehicleTiresArray = vehicleTiresSchema.parse(req.body);

            // Verifica se algum dos pneus já está cadastrado em outro veículo
            for (const tire of vehicleTiresArray) {
                const tireExists = await VehicleTiresService.isTireAssignedToAnotherVehicle(tire.tire_id, tire.vehicle_id);
                if (tireExists) {
                    res.status(400).json({ error: `O pneu já está cadastrado neste ou em outro veículo. Por favor, dê baixa para continuar.` });
                    return;
                }
            }

            // Criação dos pneus no banco de dados
            const result = await VehicleTiresService.create(vehicleTiresArray);

            res.status(201).json({ message: 'Pneus adicionados ao veículo com sucesso', data: result });

        } catch (err: any) {
            if (err.name === "ZodError") {
                res.status(400).json({ error: 'Erro de validação', details: err.errors });
                return;
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

    static async getVehicleTiresForMaintenance(req: Request, res: Response): Promise<void> {
        try {
            const { vehicle_id, maintenance_id } = req.params;
            const tires = await VehicleTiresService.getVehicleTiresForMaintenance(Number(vehicle_id), Number(maintenance_id));
            res.status(200).json({ data: tires });
        } catch (err: any) {
            res.status(500).json({ error: 'Erro ao buscar pneus', details: err.message });
        }
    }

    static async removeTireToReplace(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const data = req.body;
            if (!id || isNaN(Number(id))) {
                res.status(400).json({ error: 'ID do veículo inválido.' });
            }

            if (!data.tire_id || isNaN(Number(data.tire_id))) {
                res.status(400).json({ error: 'ID do pneu inválido.' });
            }
            await VehicleTiresService.removeTireToReplace(Number(id), data);
            res.status(200).json({ message: 'Pneu removido do veículo' });
        } catch (err: any) {
            res.status(500).json({ error: 'Erro ao remover pneu do veículo', details: err.message });
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