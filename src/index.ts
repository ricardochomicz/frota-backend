import express from 'express';
import vehicleRoutes from './routes/vehicleRoutes';
import userRoutes from './routes/userRoutes';
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

// Rotas Usuários
app.use('/api', userRoutes);

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});