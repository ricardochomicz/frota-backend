import { Request, Response } from 'express';
import { tiresSchema } from "../schemas/TiresSchema";
import TiresService from "../services/TiresService";


class TiresController {

    static async create(req: Request, res: Response): Promise<void> {
        console.log(req.user);
        try {
            if (!req.user) {
                res.status(401).json({ error: "Usuário não autenticado" });
                return;
            }
            // Validação da entrada
            const tires = tiresSchema.parse(req.body);

            //Verifica se o pneu ja existe
            const tiresExists = await TiresService.getTiresByCode(tires.code);
            if (tiresExists) {
                res.status(400).json({ error: 'Pneu já cadastrado' });
                return;
            }

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
        try {
            const tires = await TiresService.getAll();    // Busca todos os pneus no banco de dados
            res.status(200).json({ data: tires });
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

    static async getTiresByCode(req: Request, res: Response): Promise<void> {
        try {
            const { code } = req.params;
            const tires = await TiresService.getTiresByCode(code);
            if (!tires) {
                res.status(404).json({ error: 'Pneu não encontrado' });
                return;
            }
            res.status(200).json({ data: tires });
        } catch (err: any) {
            res.status(500).json({ error: 'Erro ao buscar pneu', details: err.message });
        }
    }

    static async update(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const tires = tiresSchema.parse(req.body);

            await TiresService.update(Number(id), tires);
            res.status(200).json({ message: 'Pneu atualizado com sucesso' });
        } catch (err: any) {
            if (err.name === "ZodError") {
                res.status(400).json({ error: 'Erro de validação', details: err.errors });
            }
            res.status(500).json({ error: 'Erro interno', details: err.message });
        }
    }
}

export default TiresController;