import { Request } from 'express';
import { getAuthenticatedUser } from '../auth/generateAndVerifyToken';
import db from '../config/db';
import IVehicle from "../models/Vehicle";

class VehicleService {
    /**
     * Cria um novo veículo no banco de dados.
     * @param vehicle Dados do veículo
     * @returns Retorna o ID do veículo inserido
     */
    static async create(vehicle: IVehicle, user_id: number): Promise<{ id: number }> {

        const { brand, model, year, license_plate, mileage, fuel_type } = vehicle;

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
        const query = `SELECT * FROM vehicles WHERE license_plate = ?`;

        try {
            const [rows]: any = await db.promise().query(query, [licensePlate]);
            return rows[0] || null;
        } catch (error) {
            throw new Error('Erro ao buscar veículos. Tente novamente mais tarde.');
        }
    }


    /**
     * 
     * @returns Retorna uma lista com todos os veículos cadastrados
     */
    static async getAll(): Promise<IVehicle[]> {
        const query = `SELECT * FROM vehicles`;

        try {
            const [rows]: any = await db.promise().query(query);
            return rows;
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

    static async delete(id: number): Promise<void> {
        const query = `DELETE FROM vehicles WHERE id = ?`;

        try {
            await db.promise().query(query, [id]);
        } catch (error) {
            throw new Error('Erro ao deletar veículo. Tente novamente mais tarde.');
        }
    }
}

export default VehicleService;