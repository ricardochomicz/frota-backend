import { RowDataPacket } from "mysql2";

export interface ITires {
    id?: number;
    code: string;
    brand: string;
    model: string;
    price: string;
    user_id?: number;
    status?: string;
    durability_km: number;
}

export interface TireCheckResult extends RowDataPacket {
    id: number;
    vehicle_id: number;
    license_plate: string;
    email: string;
    mileage_at_installation: number;
    predicted_replacement_mileage: number;
}