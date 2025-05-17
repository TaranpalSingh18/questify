const WebSocket = require('ws');

let wss;

const initializeWebSocket = (server) => {
  wss = new WebSocket.Server({ server });

  wss.on('connection', (ws) => {
    console.log('New WebSocket connection established');

    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
    });

    ws.on('close', () => {
      console.log('Client disconnected');
    });
  });
};

const getWebSocketServer = () => wss;

module.exports = {
  initializeWebSocket,
  getWebSocketServer
}; 