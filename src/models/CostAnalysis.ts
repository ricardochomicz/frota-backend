interface ICostAnalysis {
    id?: number;
    vehicle_id: number;
    item_type: string;
    cost: number;
    purchase_date: Date;
    performance_score: number;
}

export default ICostAnalysis;