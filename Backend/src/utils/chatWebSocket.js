const WebSocket = require('ws');
const jwt = require('jsonwebtoken');
const Message = require('../models/Message');
const User = require('../models/User');
const mongoose = require('mongoose');

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
            clients.set(userId.toString(), ws);
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
          const sessionId = [userId.toString(), partnerId.toString()].sort().join('_');
          chatSessions.set(sessionId, {
            participants: [userId.toString(), partnerId.toString()],
            active: true,
            startTime: new Date()
          });
          currentChatPartner = partnerId;

          console.log(`✅ Chat session started between ${userId} and ${partnerId}`);
          
          // Notify both users about the chat session
          const sessionMessage = {
            type: 'chat_session',
            sessionId,
            participants: [userId.toString(), partnerId.toString()]
          };

          // Send to current user
          ws.send(JSON.stringify(sessionMessage));
          console.log('Session notification sent to current user');

          // Send to partner if connected
          const partnerConnection = clients.get(partnerId.toString());
          if (partnerConnection) {
            partnerConnection.send(JSON.stringify(sessionMessage));
            console.log('Session notification sent to partner');
          } else {
            console.log('Partner not connected, will notify when they connect');
          }
        } else if (data.type === 'message') {
          console.log('Processing message type...');
          const { message: messageData } = data;
          
          // Convert string IDs to ObjectIds for comparison
          const senderId = new mongoose.Types.ObjectId(messageData.sender);
          const receiverId = new mongoose.Types.ObjectId(messageData.receiver);
          
          // Verify this is an active chat session
          const sessionId = [senderId.toString(), receiverId.toString()].sort().join('_');
          const session = chatSessions.get(sessionId);
          
          if (!session || !session.active) {
            console.log('No active chat session found, attempting to start one...');
            // Try to start a chat session automatically
            chatSessions.set(sessionId, {
              participants: [senderId.toString(), receiverId.toString()],
              active: true,
              startTime: new Date()
            });
            console.log('✅ Auto-started chat session for message');
          }

          console.log('Processing message:', {
            sessionId,
            sender: senderId,
            receiver: receiverId,
            content: messageData.content,
            timestamp: messageData.timestamp
          });

          // Verify the sender is the authenticated user
          if (senderId.toString() !== userId.toString()) {
            console.log('Unauthorized message attempt');
            return;
          }

          try {
            // Save message to database
            console.log('=== MESSAGE SAVE ATTEMPT ===');
            const newMessage = new Message({
              sender: senderId,
              receiver: receiverId,
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
            console.log('✅ Message saved successfully:', savedMessage);

            // Send message only to the sender and receiver
            const messageToSend = {
              type: 'message',
              message: savedMessage
            };

            // Send to sender (current connection)
            if (ws.userId === savedMessage.sender.toString()) {
              ws.send(JSON.stringify(messageToSend));
              console.log('Message sent to sender:', savedMessage.sender);
            }

            // Send to receiver if they're connected
            const receiverConnection = clients.get(savedMessage.receiver.toString());
            if (receiverConnection) {
              receiverConnection.send(JSON.stringify(messageToSend));
              console.log('Message sent to receiver:', savedMessage.receiver);
            }

            // Count unread messages for receiver
            const unreadCount = await Message.countDocuments({
              receiver: receiverId,
              sender: senderId,
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
            const sessionId = [userId.toString(), currentChatPartner.toString()].sort().join('_');
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
          if (session.participants.includes(userId.toString())) {
            chatSessions.delete(sessionId);
            console.log(`Chat session ${sessionId} ended due to disconnection`);
          }
        }
        clients.delete(userId.toString());
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