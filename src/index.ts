import express from 'express';
import connection from './config/db';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());

app.get('/', (req, res) => {
    res.send('API de Gerenciamento de Frota');
});

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});