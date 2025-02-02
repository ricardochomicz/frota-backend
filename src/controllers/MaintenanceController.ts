import { Request, Response } from 'express';
import { maintenanceSchema } from '../schemas/MaintenanceSchema';
import MaintenanceService from '../services/MaintenanceService';

class MaintenanceController {

    static async create(req: Request, res: Response): Promise<void> {

        try {
            if (!req.user) {
                res.status(401).json({ error: "Usuário não autenticado" });
                return;
            }

            const maintenance = maintenanceSchema.parse(req.body);
            const result = await MaintenanceService.create(maintenance, req.user.userId);

            const maintenanceDetails = await MaintenanceService.getMaintenanceWithVehicle(result.id);
            res.status(201).json({ message: 'Manutenção cadastrada com sucesso', data: maintenanceDetails });
        } catch (err: any) {
            if (err.name === "ZodError") {
                res.status(400).json({ error: 'Erro de validação', details: err.errors });
            }
            res.status(500).json({ error: 'Erro interno', details: err.message });
        }
    }

    static async getAll(req: Request, res: Response): Promise<void> {
        const page = Math.max(1, Number(req.query.page) || 1);
        const limit = Math.max(1, Number(req.query.limit) || 10);
        const filters = {
            type: req.query.type as string || undefined,
            startDate: req.query.startDate ? new Date(String(req.query.startDate)) : undefined,
            endDate: req.query.endDate ? new Date(String(req.query.endDate)) : undefined,
            license_plate: req.query.license_plate ? String(req.query.license_plate) : undefined
        };

        try {
            const { maintenances, total } = await MaintenanceService.getAll(page, limit, filters);
            res.status(200).json({
                data: maintenances,
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            });

        } catch (err: any) {
            res.status(500).json({ error: 'Erro ao buscar manutenções', details: err.message });
        }
    }

    static async get(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const maintenance = await MaintenanceService.get(Number(id));
            if (!maintenance) {
                res.status(404).json({ error: 'Manutenção não encontrada' });
                return;
            }
            res.status(200).json({ data: maintenance });
        } catch (err: any) {
            res.status(500).json({ error: 'Erro ao buscar manutenção', details: err.message });
        }
    }

    static async update(req: Request, res: Response): Promise<void> {
        try {
            if (!req.user) {
                res.status(401).json({ error: "Usuário não autenticado" });
                return;
            }
            const { id } = req.params;
            const maintenance = maintenanceSchema.parse(req.body);
            const result = await MaintenanceService.update(Number(id), maintenance, req.user.userId);
            res.status(200).json({ message: 'Manutenção atualizada com sucesso', data: result });
        } catch (err: any) {
            if (err.name === "ZodError") {
                res.status(400).json({ error: 'Erro de validação', details: err.errors });
            }
            res.status(500).json({ error: 'Erro ao atualizar manutenção', details: err.message });
        }
    }

    static async destroy(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            await MaintenanceService.destroy(Number(id));
            res.status(200).json({ message: 'Manutenção excluida com sucesso' });
        } catch (err: any) {
            res.status(500).json({ error: 'Erro ao excluir manutenção', details: err.message });
        }
    }
}

export default MaintenanceController;