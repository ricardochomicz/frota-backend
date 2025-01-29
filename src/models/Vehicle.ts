import db from '../config/db';

interface IVehicle {
    model: string;
    year: number;
    license_plate: string;
    mileage: number;
}

class Vehicle {
    /**
     * Cria um novo veículo no banco de dados.
     * @param vehicle Dados do veículo
     * @returns Retorna o ID do veículo inserido
     */
    static async create(vehicle: IVehicle): Promise<{ id: number }> {
        const { model, year, license_plate, mileage } = vehicle;

        const query = `INSERT INTO vehicles (model, year, license_plate, mileage) VALUES (?, ?, ?, ?)`;

        try {
            const [result]: any = await db.promise().query(query, [model, year, license_plate, mileage]);
            return { id: result.insertId };
        } catch (error) {
            console.error('[ERRO] Falha ao criar veículo:', error);
            throw new Error('Erro ao criar veículo. Tente novamente mais tarde.');
        }
    }


    static async getAll(): Promise<IVehicle[]> {
        const query = `SELECT * FROM vehicles`;

        try {
            const [rows]: any = await db.promise().query(query);
            return rows;
        } catch (error) {
            console.error('[ERRO] Falha ao buscar veículos:', error);
            throw new Error('Erro ao buscar veículos. Tente novamente mais tarde.');
        }
    }
}

export default Vehicle;
