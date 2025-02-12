import db from "../config/db";
import IVehicleTires from "../models/VehicleTires";
import MaintenanceService from "./MaintenanceService";


class VehicleTiresService {

    static async create(vehicleTiresArray: IVehicleTires[], user_id?: number): Promise<IVehicleTires[]> {
        const query = `
            INSERT INTO vehicle_tires (vehicle_id, tire_id, installation_date, mileage_at_installation, predicted_replacement_mileage, user_id, maintenance_id)
            VALUES ?
        `;

        // Mapeia os valores para inserção
        const values = vehicleTiresArray.map(tire => [
            tire.vehicle_id,
            tire.tire_id,
            tire.installation_date,
            tire.mileage_at_installation,
            tire.predicted_replacement_mileage,
            tire.maintenance_id
        ]);

        try {
            // Executa a consulta de inserção
            const [result]: any = await db.promise().query(query, [values]);

            // Atualiza o status dos pneus após a inserção
            for (const tire of vehicleTiresArray) {
                await this.updateStatusTires(tire.tire_id, 'in use');
            }

            // Calcula os IDs gerados com base no insertId e quantidade de registros inseridos
            const insertedTires = vehicleTiresArray.map((tire, i) => ({
                ...tire,
                id: result.insertId + i
            }));

            return insertedTires;
        } catch (error) {
            throw new Error('Erro ao inserir os pneus. Tente novamente mais tarde.');
        }
    }


    /**
     * Busca todos os pneus de um veículo.
     * @param vehicle_id ID do veículo
     * @returns 
     */
    static async getTiresByVehicleId(vehicle_id: number): Promise<IVehicleTires | null> {
        const query = `
            SELECT 
                vt.*, 
                t.code, 
                t.brand, 
                t.model, 
                v.mileage,
                m.status,
                (v.mileage >= (vt.mileage_at_installation + vt.predicted_replacement_mileage)) AS needs_replacement
            FROM vehicle_tires vt 
            INNER JOIN tires t ON vt.tire_id = t.id  
            INNER JOIN vehicles v ON vt.vehicle_id = v.id 
            LEFT JOIN maintenance m ON vt.maintenance_id = m.id
            WHERE vt.vehicle_id = ?;
        `;

        try {
            const [rows]: any = await db.promise().query(query, [vehicle_id]);
            return rows;
        } catch (error) {
            throw new Error('Erro ao buscar pneu. Tente novamente mais tarde.');
        }
    }

    static async getVehicleTiresForMaintenance(vehicle_id: number, maintenance_id: number): Promise<IVehicleTires | null> {
        const query = `
            SELECT 
                vt.*, 
                t.code, 
                t.brand, 
                t.model, 
                v.mileage,
                m.status,
                (v.mileage >= (vt.mileage_at_installation + vt.predicted_replacement_mileage)) AS needs_replacement
            FROM vehicle_tires vt 
            INNER JOIN tires t ON vt.tire_id = t.id  
            INNER JOIN vehicles v ON vt.vehicle_id = v.id 
            LEFT JOIN maintenance m ON vt.maintenance_id = m.id
            WHERE vt.vehicle_id = ? AND vt.maintenance_id = ?
        `;

        try {
            const [rows]: any = await db.promise().query(query, [vehicle_id, maintenance_id]);
            return rows;

        } catch (error) {
            throw new Error('Erro ao buscar pneu. Tente novamente mais tarde.');
        }
    }


    /**
     * Verifica se o pneu está cadastrado no veículo atual ou em outro veículo.
     * @param tire_id ID do pneu
     * @param vehicle_id ID do veículo
     * @returns 
     */
    static async isTireAssignedToAnotherVehicle(tire_id: number, vehicle_id: number): Promise<boolean> {
        const query = `
            SELECT COUNT(*) as total
            FROM vehicle_tires vt
            INNER JOIN tires t ON vt.tire_id = t.id
            WHERE vt.tire_id = ? 
            AND (vt.vehicle_id != ? AND t.status != 'available')
        `;

        try {
            const [rows]: any = await db.promise().query(query, [tire_id, vehicle_id]);
            return rows[0].total > 0; // Retorna true se o pneu já estiver em uso ou baixado
        } catch (error: any) {
            throw new Error("Erro ao verificar pneu. Tente novamente mais tarde.");
        }
    }


    /**
     * 
     * @param id 
     * @param data 
     */
    // static async removeTireToReplace(id: number, data: IVehicleTires): Promise<void> {
    //     const { mileage_to_replace } = data;

    //     const getMaintenanceQuery = `SELECT maintenance_id FROM vehicle_tires WHERE id = ?`;
    //     const query = `UPDATE vehicle_tires SET to_replace = 1, mileage_to_replace = ? WHERE id = ?`;

    //     try {
    //         const [rows]: any = await db.promise().query(getMaintenanceQuery, [id]);
    //         await db.promise().query(query, [mileage_to_replace, id]);
    //         if (rows.length === 0) {
    //             throw new Error(`Pneu com ID ${id} não encontrado.`);
    //         }
    //         const maintenance_id = rows[0].maintenance_id;

    //         await MaintenanceService.updateMaintenanceStatus(maintenance_id);
    //     } catch (error) {
    //         throw new Error('Erro ao atualizar pneu. Tente novamente mais tarde.');
    //     }
    // }

    static async markTireForReplacement(id: number, data: IVehicleTires): Promise<void> {
        const { mileage_to_replace } = data;

        const getMaintenanceQuery = `SELECT maintenance_id FROM vehicle_tires WHERE id = ?`;
        const query = `UPDATE vehicle_tires SET to_replace = 1, mileage_to_replace = ? WHERE id = ?`;

        try {
            const [rows]: any = await db.promise().query(getMaintenanceQuery, [id]);

            // Verifica se o pneu foi encontrado
            if (rows.length === 0) {
                throw new Error(`Pneu com ID ${id} não encontrado.`);
            }

            const maintenance_id = rows[0].maintenance_id;

            // Atualiza o pneu para "to_replace"
            await db.promise().query(query, [mileage_to_replace, id]);

            // Atualiza o status da manutenção
            await MaintenanceService.updateMaintenanceStatus(maintenance_id);
        } catch (error) {
            throw new Error('Erro ao atualizar pneu. Tente novamente mais tarde.');
        }
    }


    /**
     * Remove um pneu da tabela vehicle_tires pelo tire_id.
     * @param tire_id O ID do pneu a ser removido.
     * @returns Retorna true` se a remoção foi bem-sucedida, ou false se nenhum pneu foi encontrado.
     */
    static async dischargeTire(tire_id: number): Promise<boolean> {
        try {
            // Verifica se o pneu está cadastrado na tabela vehicle_tires
            const checkQuery = "SELECT id FROM vehicle_tires WHERE tire_id = ?";
            const [rows]: any = await db.promise().query(checkQuery, [tire_id]);

            if (rows.length === 0) {
                return false;
            }

            // Obtém o ID da tabela vehicle_tires
            const vehicleTireId = rows[0].id;

            // Agora, remove o registro da tabela vehicle_tires pelo ID encontrado
            const deleteQuery = "DELETE FROM vehicle_tires WHERE id = ?";
            const [result]: any = await db.promise().query(deleteQuery, [vehicleTireId]);

            // Retorna verdadeiro se a remoção foi bem-sucedida
            return result.affectedRows > 0;
        } catch (error: any) {
            throw new Error("Erro ao remover pneu. Tente novamente mais tarde.");
        }
    }

    static async updateStatusTires(tire_id: number, status: string): Promise<void> {
        try {
            const query = `UPDATE tires SET status = ? WHERE id = ?`;
            await db.promise().query(query, [status, tire_id]);
        } catch (error) {
            throw new Error('Erro ao atualizar o status do pneu. Tente novamente mais tarde.');
        }
    }

}

export default VehicleTiresService