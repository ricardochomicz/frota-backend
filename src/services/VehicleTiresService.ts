import db from "../config/db";
import IVehicleTires from "../models/VehicleTires";

class VehicleTiresService {

    static async create(vehicleTires: IVehicleTires, user_id: number): Promise<{ id: number }> {
        const { vehicle_id, tire_id, installation_date, mileage_at_installation, predicted_replacement_mileage } = vehicleTires;
        const query = `INSERT INTO vehicle_tires (vehicle_id, tire_id, installation_date, mileage_at_installation, predicted_replacement_mileage) VALUES (?, ?, ?, ?, ?)`;
        try {
            const [result]: any = await db.promise().query(query, [vehicle_id, tire_id, installation_date, mileage_at_installation, predicted_replacement_mileage]);
            return { id: result.insertId };
        } catch (error) {
            throw new Error('Erro na requisição. Tente novamente mais tarde.');
        }
    }



    /**
     * Busca todos os pneus de um veículo.
     * @param vehicle_id ID do veículo
     * @returns 
     */
    static async getTiresByVehicleId(vehicle_id: number): Promise<IVehicleTires | null> {
        const query = `SELECT * FROM vehicle_tires WHERE vehicle_id = ?`;

        try {
            const [rows]: any = await db.promise().query(query, [vehicle_id]);
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
        FROM vehicle_tires
        WHERE tire_id = ?
        AND (vehicle_id = ? OR vehicle_id != ?)
    `;
        try {
            const [rows]: any = await db.promise().query(query, [tire_id, vehicle_id, vehicle_id]);
            return rows[0].total > 0; // Retorna true se o pneu já estiver cadastrado em outro veículo
        } catch (error: any) {
            throw new Error("Erro ao verificar pneu. Tente novamente mais tarde.");
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
                console.log("⚠️ O pneu não está cadastrado em nenhum veículo.");
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
            console.error(`[ERRO] Falha ao remover pneu: ${error.message}`, error);
            throw new Error("Erro ao remover pneu. Tente novamente mais tarde.");
        }
    }

}

export default VehicleTiresService