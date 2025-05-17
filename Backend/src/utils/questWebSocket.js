const { getWebSocketServer } = require('../websocket/questWebSocket');

const notifyQuestUpdate = (type, data) => {
  const wss = getWebSocketServer();
  if (!wss) {
    console.log('WebSocket server not initialized');
    return;
  }

  const message = JSON.stringify({
    type: type.toUpperCase(),
    quest: data
  });

  wss.clients.forEach(client => {
    if (client.readyState === 1) { // 1 = OPEN
      client.send(message);
    }
  });
};

module.exports = { notifyQuestUpdate }; 