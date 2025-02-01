import { Request, Response } from 'express';
import VehicleService from '../services/VehicleService';
import { vehicleSchema } from '../schemas/VehicleSchema';


class VehicleController {
    static async create(req: Request, res: Response): Promise<void> {
        try {
            if (!req.user) {
                res.status(401).json({ error: "Usuário não autenticado" });
                return;
            }
            // Validação da entrada
            const vehicle = vehicleSchema.parse(req.body);

            //Verifica se o veículo já existe
            const vehicleExists = await VehicleService.getByLicensePlate(vehicle.license_plate);
            if (vehicleExists) {
                res.status(400).json({ error: 'Veículo com a placa informada já possui cadastrado' });
                return;
            }

            // Criação do veículo no banco de dados
            const result = await VehicleService.create(vehicle, req.user.userId);
            res.status(201).json({ message: 'Veículo criado com sucesso', data: result });

        } catch (err: any) {
            if (err.name === "ZodError") {
                res.status(400).json({ error: 'Erro de validação', details: err.errors });
            }
            res.status(500).json({ error: 'Erro interno', details: err.message });
        }
    }

    static async getAll(req: Request, res: Response): Promise<void> {
        try {
            const vehicles = await VehicleService.getAll();    // Busca todos os veículos no banco de dados
            res.status(200).json({ data: vehicles });
        } catch (err: any) {
            res.status(500).json({ error: 'Erro ao buscar veículos', details: err.message });
        }
    }

    static async get(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;  // ID do veículo a ser buscado
            const vehicle = await VehicleService.get(Number(id));  // Busca o veículo no banco de dados
            if (!vehicle) {
                res.status(404).json({ error: 'Veículo não encontrado' });
                return;
            }
            res.status(200).json({ message: 'Veículo encontrado', data: vehicle });
        } catch (err: any) {
            res.status(500).json({ error: 'Erro ao buscar veículo', details: err.message });
        }
    }

    static async getByLicensePlate(req: Request, res: Response): Promise<void> {
        try {
            const { license_plate } = req.params;  // Placa do veículo a ser buscado

            //Validação da entrada (exemplo simples)
            if (!/^[A-Z]{3}-\d{4}$/.test(license_plate)) {
                res.status(400).json({ error: 'Placa inválida (Formato: AAA-1234)' });
                return;
            }

            const vehicle = await VehicleService.getByLicensePlate(license_plate);  // Busca o veículo no banco de dados
            if (!vehicle) {
                res.status(404).json({ error: 'Veículo não encontrado' });
                return;
            }
            res.status(200).json({ message: 'Veículo encontrado', data: vehicle });
        } catch (err: any) {
            res.status(500).json({ error: 'Erro ao buscar veículo', details: err.message });
        }
    }

    static async update(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;  // ID do veículo a ser atualizado
            const vehicle = vehicleSchema.parse(req.body);  // Dados atualizados do veículo

            await VehicleService.update(Number(id), vehicle);  // Atualiza o veículo no banco de dados
            res.status(200).json({ message: 'Veículo atualizado com sucesso' });
        } catch (err: any) {
            if (err.name === "ZodError") {
                res.status(400).json({ error: 'Erro de validação', details: err.errors });
            }
            res.status(500).json({ error: 'Erro interno', details: err.message });
        }
    }

    /**
     * 
     * @param req ID do veículo a ser excluído
     * 
     */
    static async delete(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;  // ID do veículo a ser excluído
            await VehicleService.delete(Number(id));  // Exclui o veículo no banco de dados
            res.status(200).json({ message: 'Veículo excluído com sucesso' });
        } catch (err: any) {
            res.status(500).json({ error: 'Erro ao excluir veículo', details: err.message });
        }
    }
}

export default VehicleController;
