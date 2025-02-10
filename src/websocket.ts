import WebSocket from 'ws';
import http from 'http';

export const setupWebSocket = (server: http.Server) => {
    const wss = new WebSocket.Server({ server });

    wss.on('connection', (ws) => {
        console.log('Novo cliente conectado!');

        // Enviar uma mensagem para o cliente assim que ele se conectar
        ws.send(JSON.stringify({ type: "connection_success", message: "Conexão estabelecida com sucesso!" }));

        // Quando o servidor recebe uma mensagem do cliente
        ws.on('message', (message) => {
            console.log('Mensagem recebida:', message.toString());
        });

        // Tratamento de erros
        ws.on('error', (error) => {
            console.error('Erro no WebSocket:', error);
        });

        // Quando o cliente desconectar
        ws.on('close', () => {
            console.log('Cliente desconectado');
        });
    });

    return wss; // Retorna o WebSocket Server
};

