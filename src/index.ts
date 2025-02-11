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

// Configuração do CORS
const corsOptions = {
    origin: 'http://localhost:3000', // Restrinja para domínios específicos
    optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(helmet());
app.use(express.json());

// Rota inicial
app.get('/', (req, res) => {
    res.send('API de Gerenciamento de Frota');
});

// Rotas de Autenticação
app.post('/register', AuthController.register);
app.post('/login', AuthController.login);

// Rotas da API
app.use('/api', vehicleRoutes);
app.use('/api', tireRoutes);
app.use('/api', vehicleTiresRoutes);
app.use('/api', maintenanceRoutes);
app.use('/api', costAnalysisRoutes);
app.use('/api', userRoutes);

// Middleware de tratamento de erros global
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('Erro global:', err);
    res.status(500).json({ error: 'Erro interno no servidor', details: err.message });
});

// Configuração do servidor HTTP e WebSocket
const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

// Configura o WebSocket
const wss = setupWebSocket(server);

app.get('test', (req, res) => {
    res.send('Hello, World!');
});
// Rota para verificação de pneus
app.get('/api/verify-tires', async (req, res) => {
    try {
        await TiresService.checkTireWear(wss); // Passa o wss para o serviço
        res.status(200).json({ message: 'Verificação de pneus concluída' });
    } catch (error) {
        console.error('Erro ao verificar pneus:', error);
        res.status(500).json({ error: 'Erro ao verificar pneus' });
    }
});

// Inicia o servidor
server.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});