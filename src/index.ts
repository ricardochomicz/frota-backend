import express from 'express';
import cors from 'cors';
import vehicleRoutes from './routes/VehicleRoutes';
import tireRoutes from './routes/TiresRoutes';
import vehicleTiresRoutes from './routes/VehicleTiresRoutes';
import maintenanceRoutes from './routes/MaintenanceRoutes';
import costAnalysisRoutes from './routes/CostAnalysisRoutes';
import userRoutes from './routes/UserRoutes';
import AuthController from './controllers/auth/AuthController';

const app = express();

const corsOptions = {
    origin: 'http://localhost:3000',
    optionsSuccessStatus: 200
};

app.use(cors());


const PORT = process.env.PORT || 5000;

app.use(express.json());

app.get('/', (req, res) => {
    res.send('API de Gerenciamento de Frota');
});

// Register 
app.post('/register', AuthController.register);

// Login
app.post('/login', AuthController.login);

// Rotas Veículos
app.use('/api', vehicleRoutes);

// Rotas Pneus
app.use('/api', tireRoutes);

// Rotas Veiculos/Pneus
app.use('/api', vehicleTiresRoutes);

// Rotas Manutenção
app.use('/api', maintenanceRoutes);

// Rotas Análise de Custo
app.use('/api', costAnalysisRoutes);

// Rotas Usuários
app.use('/api', userRoutes);

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});