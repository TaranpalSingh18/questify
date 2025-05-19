const WebSocket = require('ws');
const jwt = require('jsonwebtoken');

let wss;
const clients = new Map(); // Store client connections with their user IDs

const setupWebSocket = (server) => {
  wss = new WebSocket.Server({ server });

  wss.on('connection', (ws) => {
    console.log('New WebSocket connection established');

    // Handle client messages
    ws.on('message', async (message) => {
      try {
        const data = JSON.parse(message);
        console.log('Received message:', data);

        switch (data.type) {
          case 'auth':
            handleAuth(ws, data);
            break;
          case 'message':
            handleMessage(ws, data);
            break;
          case 'join_chat':
            handleJoinChat(ws, data);
            break;
          case 'ping':
            handlePing(ws);
            break;
          default:
            console.log('Unknown message type:', data.type);
        }
      } catch (error) {
        console.error('Error processing WebSocket message:', error);
      }
    });

    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
    });

    ws.on('close', () => {
      // Remove client from the clients Map when they disconnect
      for (const [userId, client] of clients.entries()) {
        if (client === ws) {
          clients.delete(userId);
          console.log(`Client disconnected: ${userId}`);
          break;
        }
      }
    });
  });
};

const handleAuth = (ws, data) => {
  try {
    const { token } = data;
    if (!token) {
      console.error('Missing token in auth message');
      return;
    }

    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    // Store the authenticated client
    clients.set(userId, ws);
    ws.userId = userId; // Store userId on the socket for easy access
    console.log(`Client authenticated: ${userId}`);

    // Send confirmation back to client
    ws.send(JSON.stringify({
      type: 'auth_success',
      userId: userId
    }));
  } catch (error) {
    console.error('Error in handleAuth:', error);
    ws.send(JSON.stringify({
      type: 'auth_error',
      message: 'Authentication failed'
    }));
  }
};

const handleMessage = (ws, data) => {
  try {
    const { message } = data;
    if (!message || !message.sender || !message.receiver) {
      console.error('Invalid message format:', message);
      return;
    }

    console.log('Processing message:', {
      sender: message.sender,
      receiver: message.receiver,
      content: message.content
    });

    // Send to receiver if they're connected
    const receiverWs = clients.get(message.receiver);
    if (receiverWs && receiverWs.readyState === WebSocket.OPEN) {
      receiverWs.send(JSON.stringify({
        type: 'message',
        message: message
      }));
    }

    // Send confirmation back to sender
    ws.send(JSON.stringify({
      type: 'message_sent',
      messageId: message._id
    }));
  } catch (error) {
    console.error('Error in handleMessage:', error);
  }
};

const handleJoinChat = (ws, data) => {
  try {
    const { chatId } = data;
    if (!chatId) {
      console.error('Missing chatId in join_chat message');
      return;
    }

    // Store the chat room for this client
    ws.chatId = chatId;
    console.log(`Client joined chat: ${chatId}`);

    // Send confirmation back to client
    ws.send(JSON.stringify({
      type: 'join_success',
      chatId: chatId
    }));
  } catch (error) {
    console.error('Error in handleJoinChat:', error);
  }
};

const handlePing = (ws) => {
  try {
    ws.send(JSON.stringify({ type: 'pong' }));
  } catch (error) {
    console.error('Error in handlePing:', error);
  }
};

const notifyQuestUpdate = (type, data) => {
  if (!wss) return;

  const message = JSON.stringify({
    type: type.toUpperCase(),
    quest: data
  });

  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
};

const sendNotification = (userId, notification) => {
  if (!wss) return;

  const client = clients.get(userId);
  if (client && client.readyState === WebSocket.OPEN) {
    client.send(JSON.stringify({
      type: 'NOTIFICATION',
      notification: {
        ...notification,
        timestamp: new Date().toISOString()
      }
    }));
  }
};

const getWebSocketServer = () => wss;

module.exports = {
  setupWebSocket,
  notifyQuestUpdate,
  sendNotification,
  getWebSocketServer
}; 