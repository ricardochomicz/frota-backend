import { Request, Response } from 'express';
import { tiresSchema } from "../schemas/TiresSchema";
import TiresService from "../services/TiresService";


class TiresController {

    static async create(req: Request, res: Response): Promise<void> {
        try {
            if (!req.user) {
                res.status(401).json({ error: "Usuário não autenticado" });
                return;
            }
            // Validação da entrada
            const tires = tiresSchema.parse(req.body);

            //Verifica se o pneu ja existe
            // const tiresExists = await TiresService.findByCode(tires.code);
            // if (tiresExists) {
            //     res.status(400).json({ error: 'Pneu já cadastrado' });
            //     return;
            // }

            // Criação do pneu no banco de dados
            const result = await TiresService.create(tires, req.user.userId);
            res.status(201).json({ message: 'Pneu cadastrado com sucesso', data: result });

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
            code: req.query.code as string || undefined,
            brand: req.query.brand as string || undefined,
            model: req.query.model as string || undefined,
            status: req.query.status as string || undefined
        };



        try {
            const { tires, total } = await TiresService.getAll(page, limit, filters);
            res.status(200).json({
                data: tires,
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            });
        } catch (err: any) {
            res.status(500).json({ error: 'Erro ao buscar pneus', details: err.message });
        }
    }



    static async get(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const tires = await TiresService.get(Number(id));
            if (!tires) {
                res.status(404).json({ error: 'Pneu não encontrado' });
                return;
            }
            res.status(200).json({ data: tires });
        } catch (err: any) {
            res.status(500).json({ error: 'Erro ao buscar pneu', details: err.message });
        }
    }

    static async getTiresByCode(req: Request, res: Response): Promise<any> {
        try {
            const { code } = req.params;

            if (!code) {
                return res.status(400).json({ error: "Código do pneu não fornecido." });
            }

            const tire = await TiresService.getTiresByCode(code);

            if (!tire) {
                return res.status(404).json({ error: "Pneu não encontrado." });
            }

            return res.status(200).json({ data: tire });
        } catch (err: any) {
            res.status(400).json({ error: err.message });
        }
    }



    static async update(req: Request, res: Response): Promise<void> {
        try {
            if (!req.user) {
                res.status(401).json({ error: "Usuário não autenticado" });
                return;
            }
            const { id } = req.params;
            const tires = tiresSchema.parse(req.body);

            await TiresService.update(Number(id), tires);
            res.status(200).json({ message: 'Pneu atualizado com sucesso' });
        } catch (err: any) {
            if (err.name === "ZodError") {
                res.status(400).json({ error: 'Erro de validação', details: err.errors });
            }
            res.status(500).json({ error: 'Erro interno', details: err.message, e: err.error });
        }
    }

    static async destroy(req: Request, res: Response): Promise<void> {
        try {
            if (!req.user) {
                res.status(401).json({ error: "Usuário não autenticado" });
                return;
            }
            const { id } = req.params;
            await TiresService.destroy(Number(id));
            res.status(200).json({ message: 'Pneu deletado com sucesso' });
        } catch (err: any) {
            res.status(500).json({ error: 'Erro ao deletar pneu', details: err.message });
        }
    }

    static async updateStatusAfterAnalysis(req: Request, res: Response): Promise<void> {
        try {
            if (!req.user) {
                res.status(401).json({ error: "Usuário não autenticado" });
                return;
            }
            const { id } = req.params;
            const { status, replacement_reason } = req.body;
            await TiresService.updateStatusAfterAnalysis(Number(id), status, replacement_reason);
            res.status(200).json({ message: 'Status do pneu atualizado com sucesso' });
        } catch (err: any) {
            res.status(500).json({ error: 'Erro ao atualizar status do pneu', details: err.message });
        }
    }
}

export default TiresController;