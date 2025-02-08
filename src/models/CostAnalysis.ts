interface ICostAnalysis {
    id?: number;
    vehicle_id: number;
    user_id?: number;
    vehicle_tire_id?: number;
    tire_id?: number;
    item_type: string;
    cost: number;
    purchase_date?: Date;
    performance_score: number;
    description?: string;
    replacement_reason?: string;
    mileage_driven?: number;
}

export default ICostAnalysis; 