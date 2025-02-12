import { Request, Response } from 'express';
import VehicleTiresService from "../services/VehicleTiresService";
import { vehicleTiresSchema } from '../schemas/VehicleTiresSchema';


class VehicleTiresController {

    static async create(req: Request, res: Response): Promise<any> {
        try {
            if (!req.user) {
                return res.status(401).json({ error: "Usuário não autenticado" });
            }

            // Validação da entrada (esperando um array)
            const vehicleTiresArray = vehicleTiresSchema.parse(req.body);

            // Verifica se algum dos pneus já está cadastrado em outro veículo
            for (const tire of vehicleTiresArray) {
                const tireExists = await VehicleTiresService.isTireAssignedToAnotherVehicle(tire.tire_id, tire.vehicle_id);
                if (tireExists) {
                    return res.status(400).json({ error: `O pneu já está cadastrado neste ou em outro veículo. Por favor, dê baixa para continuar.` });
                }
            }

            // Criação dos pneus no banco de dados
            const result = await VehicleTiresService.create(vehicleTiresArray);

            return res.status(201).json({ message: 'Pneus adicionados ao veículo com sucesso', data: result });

        } catch (err: any) {
            if (err.name === "ZodError") {
                return res.status(400).json({ error: 'Erro de validação', details: err.errors });
            }
            console.error(err);  // Logando o erro para investigação adicional
            return res.status(500).json({ error: 'Erro interno', details: err.message });
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

    static async markTireForReplacement(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const { mileage_to_replace } = req.body;

            await VehicleTiresService.markTireForReplacement(Number(id), mileage_to_replace);
            res.status(200).json({ message: 'Pneu marcado para substituição com sucesso' });
        } catch (err: any) {
            res.status(500).json({ error: 'Erro ao marcar pneu do veículo', details: err.message });
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