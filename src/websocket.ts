
import WebSocket from 'ws';

let wss: WebSocket.Server;

export const setupWebSocket = (server: any) => {
    const wss = new WebSocket.Server({ server });

    wss.on('connection', (ws) => {
        console.log('Novo cliente conectado!');

        // Enviar uma mensagem para o cliente assim que ele se conectar
        ws.send('Conexão estabelecida com sucesso!');

        // Quando o servidor recebe uma mensagem do cliente
        ws.on('message', (message) => {
            console.log('Mensagem recebida:', message);
        });

        // Quando o cliente desconectar
        ws.on('close', () => {
            console.log('Cliente desconectado');
        });

        // Tratamento de erros
        ws.on('error', (error) => {
            console.error('Erro no WebSocket:', error);
        });
    });

    return wss;
};