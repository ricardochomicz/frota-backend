interface IVehicleTires {
    vehicle_id: number;
    tire_id: number;
    installation_date: Date;
    mileage_at_installation: number;
    predicted_replacement_mileage: number;
}

export default IVehicleTires;