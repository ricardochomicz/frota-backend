import { Request, Response } from 'express';
import Vehicle from '../models/Vehicle';
import { vehicleSchema } from '../schemas/VehicleSchema';


class VehicleController {
    static async create(req: Request, res: Response): Promise<void> {
        try {
            // Validação da entrada
            const vehicle = vehicleSchema.parse(req.body);

            //Verifica se o veículo já existe
            const vehicleExists = await Vehicle.getByLicensePlate(vehicle.license_plate);
            if (vehicleExists) {
                res.status(400).json({ error: 'Veículo ja cadastrado' });
                return;
            }

            // Criação do veículo no banco de dados
            const result = await Vehicle.create(vehicle);
            res.status(201).json({ message: 'Veículo criado com sucesso', data: result });

        } catch (err: any) {
            if (err.name === "ZodError") {
                res.status(400).json({ error: 'Erro de validação', details: err.errors });
            }
            console.error('[ERRO] Falha ao criar veículo:', err);
            res.status(500).json({ error: 'Erro interno', details: err.message });
        }
    }

    static async getAll(req: Request, res: Response): Promise<void> {
        try {
            const vehicles = await Vehicle.getAll();    // Busca todos os veículos no banco de dados
            res.status(200).json({ message: 'Veículos encontrados', data: vehicles });
        } catch (err: any) {
            console.error('[ERRO] Falha ao buscar veículos:', err);
            res.status(500).json({ error: 'Erro ao buscar veículos', details: err.message });
        }
    }

    static async getById(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;  // ID do veículo a ser buscado
            const vehicle = await Vehicle.getById(Number(id));  // Busca o veículo no banco de dados
            if (!vehicle) {
                res.status(404).json({ error: 'Veículo não encontrado' });
                return;
            }
            res.status(200).json({ message: 'Veículo encontrado', data: vehicle });
        } catch (err: any) {
            console.error('[ERRO] Falha ao buscar veículo:', err);
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

            const vehicle = await Vehicle.getByLicensePlate(license_plate);  // Busca o veículo no banco de dados
            if (!vehicle) {
                res.status(404).json({ error: 'Veículo não encontrado' });
                return;
            }
            res.status(200).json({ message: 'Veículo encontrado', data: vehicle });
        } catch (err: any) {
            console.error('[ERRO] Falha ao buscar veículo:', err);
            res.status(500).json({ error: 'Erro ao buscar veículo', details: err.message });
        }
    }

    static async update(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;  // ID do veículo a ser atualizado
            const vehicle = vehicleSchema.parse(req.body);  // Dados atualizados do veículo

            await Vehicle.update(Number(id), vehicle);  // Atualiza o veículo no banco de dados
            res.status(200).json({ message: 'Veículo atualizado com sucesso' });
        } catch (err: any) {
            if (err.name === "ZodError") {
                res.status(400).json({ error: 'Erro de validação', details: err.errors });
            }
            console.error('[ERRO] Falha ao atualizar veículo:', err);
            res.status(500).json({ error: 'Erro interno', details: err.message });
        }
    }
}

export default VehicleController;
