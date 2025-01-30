import express from 'express';
import vehicleRoutes from './routes/VehicleRoutes';
import tireRoutes from './routes/TiresRoutes';
import vehicleTiresRoutes from './routes/VehicleTiresRoutes';
import userRoutes from './routes/UserRoutes';
import AuthController from './controllers/auth/AuthController';

const app = express();
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

// Rotas Usuários
app.use('/api', userRoutes);

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});