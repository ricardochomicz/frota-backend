import { Request, Response } from 'express';
import { maintenanceSchema } from '../schemas/MaintenanceSchema';
import MaintenanceService from '../services/MaintenanceService';
import IMaintenance from '../models/Maintenance';

class MaintenanceController {

    static async create(req: Request, res: Response): Promise<void> {

        try {
            if (!req.user) {
                res.status(401).json({ error: "Usuário não autenticado" });
                return;
            }

            const maintenance = maintenanceSchema.parse(req.body);
            const result = await MaintenanceService.create(maintenance, req.user.userId);
            res.status(201).json({ message: 'Manutenção cadastrada com sucesso', data: result });
        } catch (err: any) {
            if (err.name === "ZodError") {
                res.status(400).json({ error: 'Erro de validação', details: err.errors });
            }
            res.status(500).json({ error: 'Erro interno', details: err.message });
        }
    }

    static async getAll(req: Request, res: Response): Promise<void> {
        try {
            const maintenances = await MaintenanceService.getAll();    // Busca todas as manutenções no banco de dados
            res.status(200).json({ data: maintenances });
        } catch (err: any) {
            res.status(500).json({ error: 'Erro ao buscar manutenções', details: err.message });
        }
    }
}

export default MaintenanceController;