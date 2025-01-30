interface IMaintenance {
    id?: number;
    vehicle_id: number;
    type: string;
    description: string;
    mileage_at_maintenance: number;
    date: Date;
}

export default IMaintenance;