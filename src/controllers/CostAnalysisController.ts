import { Request, Response } from 'express';
import { costAnalysisSchema } from '../schemas/CostAnalysisSchema';
import CostAnalysisService from '../services/CostAnalysisService';

class CostAnalysisController {

    static async create(req: Request, res: Response) {
        try {
            if (!req.user) {
                res.status(401).json({ error: "Usuário não autenticado" });
                return;
            }
            const costAnalysis = costAnalysisSchema.parse(req.body);
            const result = await CostAnalysisService.create(costAnalysis, req.user.userId);
            res.status(201).json({ message: 'Análise de custo criado com sucesso', data: result });
        } catch (err: any) {
            if (err.name === "ZodError") {
                res.status(400).json({ error: 'Erro de validação', details: err.errors });
            }
            res.status(500).json({ error: 'Erro interno', details: err.message });
        }
    }

    static async getAll(req: Request, res: Response) {
        const page = Math.max(1, Number(req.query.page) || 1);
        const limit = Math.max(1, Number(req.query.limit) || 10);
        const filters = {
            replacement_reason: req.query.replacement_reason as string || undefined
        };
        try {
            const { analysis, total } = await CostAnalysisService.getAll(page, limit, filters);
            res.status(200).json({
                data: analysis,
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            });
        } catch (err: any) {
            res.status(500).json({ error: 'Erro ao buscar análises', details: err.message });
        }
    }

    static async get(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const costAnalysis = await CostAnalysisService.get(Number(id));
            if (!costAnalysis) {
                res.status(404).json({ error: 'Análise de custo não encontrada' });
                return;
            }
            res.status(200).json({ data: costAnalysis });
        } catch (err: any) {
            res.status(500).json({ error: 'Erro ao buscar análise de custo', details: err.message });
        }
    }


    static async update(req: Request, res: Response) {
        try {
            if (!req.user) {
                res.status(401).json({ error: "Usuário não autenticado" });
                return;
            }
            const { id } = req.params;
            const costAnalysis = costAnalysisSchema.parse(req.body);
            const result = await CostAnalysisService.update(Number(id), costAnalysis, req.user.userId);
            res.status(200).json({ message: 'Análise de custo atualizada com sucesso', data: result });
        } catch (err: any) {
            if (err.name === "ZodError") {
                res.status(400).json({ error: 'Erro de validação', details: err.errors });
            }
            res.status(500).json({ error: 'Erro ao atualizar análise de custo', details: err.message });
        }
    }


    static async destroy(req: Request, res: Response) {
        try {
            const { id } = req.params;
            await CostAnalysisService.destroy(Number(id));
            res.status(200).json({ message: 'Análise de custo excluida com sucesso' });
        } catch (err: any) {
            res.status(500).json({ error: 'Erro ao excluir análise de custo', details: err.message });
        }
    }
}

export default CostAnalysisController