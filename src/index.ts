import express from 'express';
import vehicleRoutes from './routes/vehicleRoutes';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());

app.get('/', (req, res) => {
    res.send('API de Gerenciamento de Frota');
});

// Rotas
app.use('/api', vehicleRoutes);

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});