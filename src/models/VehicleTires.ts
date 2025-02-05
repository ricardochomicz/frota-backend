interface IVehicleTires {
    id?: number;
    vehicle_id: number;
    tire_id: number;
    user_id?: number;
    maintenance_id?: number;
    installation_date: Date;
    mileage_at_installation: number;
    predicted_replacement_mileage: number;
    to_replace?: boolean;
    mileage_to_replace?: number;
}

export default IVehicleTires;