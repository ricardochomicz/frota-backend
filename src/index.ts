import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import http from 'http';
import vehicleRoutes from './routes/VehicleRoutes';
import tireRoutes from './routes/TiresRoutes';
import vehicleTiresRoutes from './routes/VehicleTiresRoutes';
import maintenanceRoutes from './routes/MaintenanceRoutes';
import costAnalysisRoutes from './routes/CostAnalysisRoutes';
import userRoutes from './routes/UserRoutes';
import AuthController from './controllers/auth/AuthController';
import TiresService from './services/TiresService';
import { setupWebSocket } from './websocket';
import dotenv from 'dotenv';
import WebSocket from 'ws';

dotenv.config();

const app = express();

const corsOptions = {
    origin: 'http://localhost:3000',
    optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(helmet());
app.use(express.json());

app.get('/', (req, res) => {
    res.send('API de Gerenciamento de Frota');
});



// Rotas de Autenticação
app.post('/register', AuthController.register);
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

// Middleware de tratamento de erros global
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('Erro global:', err);
    res.status(500).json({ error: 'Erro interno no servidor', details: err.message });
});

const PORT = process.env.PORT || 5000;
const server = http.createServer(app);
setupWebSocket(server);

server.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});

const wss = new WebSocket.Server({ server });

app.get('/api/verify-tires', async (req, res) => {
    try {
        await TiresService.checkTireWear(wss);
        res.status(200).json({ message: 'Verificação de pneus concluída' });
    } catch (error) {
        console.error('Erro ao verificar pneus:', error);
        res.status(500).json({ error: 'Erro ao verificar pneus' });
    }
});