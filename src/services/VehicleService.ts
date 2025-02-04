
import db from '../config/db';
import IVehicle from "../models/Vehicle";
import BaseService from './BaseService';

const LIMIT = 5;
const PAGE = 1;

class VehicleService extends BaseService {
    /**
     * Cria um novo veículo no banco de dados.
     * @param vehicle Dados do veículo
     * @returns Retorna o ID do veículo inserido
     */
    static async create(vehicle: IVehicle): Promise<{ id: number }> {

        const { brand, model, year, license_plate, mileage, fuel_type, user_id } = vehicle;

        const query = `INSERT INTO vehicles (brand, model, year, license_plate, mileage, fuel_type, user_id) VALUES (?, ?, ?, ?, ?, ?, ?)`;

        try {
            const [result]: any = await db.promise().query(query, [brand, model, year, license_plate, mileage, fuel_type, user_id]);
            return { id: result.insertId };
        } catch (error) {
            throw new Error('Erro ao criar veículo. Tente novamente mais tarde.');
        }
    }

    /**
     * Retorna um veículo pelo número da placa.
     * @param license_plate Placa do veículo
     * @returns 
     */
    static async getByLicensePlate(licensePlate: string): Promise<IVehicle | null> {
        const query = `SELECT * FROM vehicles WHERE license_plate LIKE ?`;

        try {
            const [rows]: any = await db.promise().query(query, [`%${licensePlate}%`]);
            return rows;
        } catch (error) {
            throw new Error('Erro ao buscar veículosS. Tente novamente mais tarde.');
        }
    }

    /**
     * 
     * @returns Retorna uma lista com todos os veículos cadastrados
     */
    static async getAll(page = PAGE, limit = LIMIT, filters: { license_plate?: string; brand?: string; model?: string } = {}, userId?: any): Promise<{ vehicles: IVehicle[], total: number }> {
        const offset = (Math.max(1, Number(page)) - 1) * Math.max(1, Number(limit));

        let query = `SELECT * FROM vehicles WHERE 1=1`;
        let countQuery = `SELECT COUNT(*) AS total FROM vehicles WHERE 1=1`;
        let queryParams: any[] = [];

        if (filters.license_plate) {
            query += ` AND license_plate LIKE ?`;
            countQuery += ` AND license_plate LIKE ?`;
            queryParams.push(`%${filters.license_plate}%`);
        }
        if (filters.brand) {
            query += ` AND brand LIKE ?`;
            countQuery += ` AND brand LIKE ?`;
            queryParams.push(`%${filters.brand}%`);
        }
        if (filters.model) {
            query += ` AND model LIKE ?`;
            countQuery += ` AND model LIKE ?`;
            queryParams.push(`%${filters.model}%`);
        }

        this.getUserAccessScope(userId);

        query += ` LIMIT ? OFFSET ?`;
        queryParams.push(limit, offset);

        try {
            const [[{ total }]]: any = await db.promise().query(countQuery, queryParams.slice(0, -2));
            const [rows]: any = await db.promise().query(query, queryParams);
            return { vehicles: rows, total };
        } catch (error) {
            throw new Error('Erro ao buscar veículos. Tente novamente mais tarde.');
        }
    }

    /**
     * Busca um veículo pelo ID.
     * @param id ID do veículo
     * @returns IVehicle
     */
    static async get(id: number): Promise<IVehicle | null> {
        const query = `SELECT * FROM vehicles WHERE id = ?`;

        try {
            const [rows]: any = await db.promise().query(query, [id]);
            return rows[0] || null;
        } catch (error) {
            throw new Error('Erro ao buscar veículos. Tente novamente mais tarde.');
        }
    }

    static async getAllVehiclesToSelect(): Promise<any> {
        const query = `SELECT * FROM vehicles`;

        try {
            const [rows]: any = await db.promise().query(query);
            return rows;
        } catch (error) {
            throw new Error('Erro na consulta SQL. Tente novamente mais tarde.');
        }
    }


    /**
     * Atualiza um veículo no banco de dados.
     * @param id 
     * @param data IVehicle
     */
    static async update(id: number, data: IVehicle): Promise<void> {
        const { brand, model, year, license_plate, mileage, fuel_type } = data;

        const query = `UPDATE vehicles SET brand = ?, model = ?, year = ?, license_plate = ?, mileage = ?, fuel_type = ? WHERE id = ?`;

        try {
            await db.promise().query(query, [brand, model, year, license_plate, mileage, fuel_type, id]);
        } catch (error) {
            throw new Error('Erro ao atualizar veículo. Tente novamente mais tarde.');
        }
    }

    static async destroy(id: number): Promise<void> {
        const query = `DELETE FROM vehicles WHERE id = ?`;

        try {
            await db.promise().query(query, [id]);
        } catch (error) {
            throw new Error('Erro ao deletar veículo. Tente novamente mais tarde.');
        }
    }


}

export default VehicleService;