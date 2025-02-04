interface IMaintenance {
    id?: number;
    vehicle_id: number;
    user_id?: number;
    type: string;
    description: string;
    mileage_at_maintenance: number;
    date?: Date;
    created_at?: Date;
    updated_at?: Date;
    vehicle?: {
        id?: number;
        model?: string;
        brand: string;
        year: number;
        license_plate: string;
    }
}

export default IMaintenance;