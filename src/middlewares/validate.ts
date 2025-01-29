import { Request, Response, NextFunction } from "express";
import { ZodSchema } from "zod";

export const validate = (schema: ZodSchema<any>) =>
    (req: Request, res: Response, next: NextFunction): void => {
        try {
            req.body = schema.parse(req.body);
            next();
        } catch (error: any) {
            res.status(400).json({
                error: "Erro de validação",
                details: error.errors.map((err: any) => ({
                    path: err.path,
                    message: err.message,
                })),
            });
        }
    };
