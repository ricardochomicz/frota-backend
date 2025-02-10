

import cron from 'node-cron';
import WebSocket from 'ws';
import TiresService from '../TiresService';


// Criar um WebSocket Server (ou passar uma instância existente)
const wss = new WebSocket.Server({ port: 8080 }); // Ajuste a porta se necessário

// Agendar a função para rodar a cada 1 hora
cron.schedule('* * * * *', async () => {
    console.log('⏳ Rodando a verificação de pneus...');
    await TiresService.checkTireWear(wss);
});
