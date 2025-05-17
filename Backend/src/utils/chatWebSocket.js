const WebSocket = require('ws');
const jwt = require('jsonwebtoken');
const Message = require('../models/Message');
const User = require('../models/User');

let wss;
const clients = new Map(); // Map to store user connections
const chatSessions = new Map(); // Map to store active chat sessions

const initializeWebSocket = (server) => {
  console.log('Initializing WebSocket server...');
  wss = new WebSocket.Server({ server });

  wss.on('connection', async (ws) => {
    console.log('New WebSocket connection established');
    let userId = null; // Store the user ID for this connection
    let currentChatPartner = null; // Store the current chat partner

    ws.on('message', async (message) => {
      try {
        const data = JSON.parse(message);
        console.log('Received WebSocket message:', data);

        if (data.type === 'auth') {
          // Handle authentication
          const token = data.token;
          if (!token) {
            console.log('No token provided');
            return;
          }

          try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const user = await User.findById(decoded.userId);
            
            if (!user) {
              console.log('User not found');
              return;
            }

            // Store the connection with user ID
            userId = decoded.userId;
            ws.userId = userId; // Add userId to the WebSocket instance
            clients.set(userId, ws);
            console.log(`User ${user.name} authenticated and connected`);
          } catch (error) {
            console.error('Auth error:', error);
          }
        } else if (data.type === 'start_chat') {
          // Handle starting a chat session
          const { partnerId } = data;
          if (!userId || !partnerId) {
            console.log('Missing user IDs for chat session');
            return;
          }

          console.log('Starting chat session between:', {
            userId,
            partnerId
          });

          // Store the chat session
          const sessionId = [userId, partnerId].sort().join('_');
          chatSessions.set(sessionId, {
            participants: [userId, partnerId],
            active: true,
            startTime: new Date()
          });
          currentChatPartner = partnerId;

          console.log(`✅ Chat session started between ${userId} and ${partnerId}`);
          
          // Notify both users about the chat session
          const sessionMessage = {
            type: 'chat_session',
            sessionId,
            participants: [userId, partnerId]
          };

          // Send to current user
          ws.send(JSON.stringify(sessionMessage));
          console.log('Session notification sent to current user');

          // Send to partner if connected
          const partnerConnection = clients.get(partnerId);
          if (partnerConnection) {
            partnerConnection.send(JSON.stringify(sessionMessage));
            console.log('Session notification sent to partner');
          } else {
            console.log('Partner not connected, will notify when they connect');
          }
        } else if (data.type === 'message') {
          console.log('Processing message type...');
          const { message: messageData } = data;
          
          // Verify this is an active chat session
          const sessionId = [messageData.sender, messageData.receiver].sort().join('_');
          const session = chatSessions.get(sessionId);
          
          if (!session || !session.active) {
            console.log('No active chat session found, attempting to start one...');
            // Try to start a chat session automatically
            chatSessions.set(sessionId, {
              participants: [messageData.sender, messageData.receiver],
              active: true,
              startTime: new Date()
            });
            console.log('✅ Auto-started chat session for message');
          }

          console.log('Processing message:', {
            sessionId,
            sender: messageData.sender,
            receiver: messageData.receiver,
            content: messageData.content,
            timestamp: messageData.timestamp
          });

          // Verify the sender is the authenticated user
          if (messageData.sender !== userId) {
            console.log('Unauthorized message attempt');
            return;
          }

          try {
            // Save message to database
            console.log('=== MESSAGE SAVE ATTEMPT ===');
            console.log('Message data:', {
              sender: messageData.sender,
              receiver: messageData.receiver,
              content: messageData.content,
              timestamp: messageData.timestamp
            });

            const newMessage = new Message({
              sender: messageData.sender,
              receiver: messageData.receiver,
              content: messageData.content,
              timestamp: messageData.timestamp
            });

            // Validate the message before saving
            const validationError = newMessage.validateSync();
            if (validationError) {
              console.error('❌ Message validation error:', validationError);
              throw validationError;
            }

            console.log('Message validation passed, attempting to save...');
            const savedMessage = await newMessage.save();
            console.log('✅ Message saved successfully:', {
              id: savedMessage._id,
              sender: savedMessage.sender,
              receiver: savedMessage.receiver,
              content: savedMessage.content,
              timestamp: savedMessage.timestamp,
              read: savedMessage.read
            });

            // Verify the message was saved by querying it
            console.log('Verifying message in database...');
            const verifiedMessage = await Message.findById(savedMessage._id);
            if (!verifiedMessage) {
              console.error('❌ Message not found in database after saving');
              throw new Error('Message not found after save');
            }
            console.log('✅ Message verified in database:', verifiedMessage);

            // Send message only to the sender and receiver
            const messageToSend = {
              type: 'message',
              message: savedMessage
            };

            // Send to sender (current connection)
            ws.send(JSON.stringify(messageToSend));
            console.log('Message sent to sender:', messageData.sender);

            // Send to receiver if they're connected
            const receiverConnection = clients.get(messageData.receiver);
            if (receiverConnection) {
              receiverConnection.send(JSON.stringify(messageToSend));
              console.log('Message sent to receiver:', messageData.receiver);
            }

            // Count unread messages for receiver
            const unreadCount = await Message.countDocuments({
              receiver: messageData.receiver,
              sender: messageData.sender,
              read: false
            });

            // Send unread count to receiver if they're connected
            if (receiverConnection) {
              receiverConnection.send(JSON.stringify({
                type: 'unreadCount',
                count: unreadCount
              }));
              console.log('Unread count sent to receiver:', unreadCount);
            }
          } catch (error) {
            console.error('❌ Error processing message:', error);
            console.error('Error details:', {
              name: error.name,
              message: error.message,
              stack: error.stack
            });
          }
        } else if (data.type === 'end_chat') {
          // Handle ending a chat session
          if (currentChatPartner) {
            const sessionId = [userId, currentChatPartner].sort().join('_');
            chatSessions.delete(sessionId);
            currentChatPartner = null;
            console.log(`Chat session ended between ${userId} and ${currentChatPartner}`);
          }
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    });

    ws.on('close', () => {
      console.log('Client disconnected');
      if (userId) {
        // Clean up any active chat sessions
        for (const [sessionId, session] of chatSessions.entries()) {
          if (session.participants.includes(userId)) {
            chatSessions.delete(sessionId);
            console.log(`Chat session ${sessionId} ended due to disconnection`);
          }
        }
        clients.delete(userId);
        console.log(`User ${userId} disconnected`);
      }
    });
  });

  console.log('WebSocket server initialized');
};

const getWebSocketServer = () => wss;

module.exports = {
  initializeWebSocket,
  getWebSocketServer
}; 