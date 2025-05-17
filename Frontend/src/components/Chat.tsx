import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { Send, X, User, Search, Flag, MoreVertical, Paperclip, Smile } from 'lucide-react';
import { format } from 'date-fns';
import axios from 'axios';

interface Message {
  _id: string;
  sender: string;
  receiver: string;
  content: string;
  timestamp: string;
  read: boolean;
}

interface ChatUser {
  _id: string;
  name: string;
  role: string;
  profilePicture?: string;
  lastMessage?: Message | null;
  unreadCount?: number;
}

interface ChatProps {
  onClose: () => void;
}

const Chat: React.FC<ChatProps> = ({ onClose }) => {
  const { currentUser } = useAuth();
  const [users, setUsers] = useState<ChatUser[]>([]);
  const [selectedUser, setSelectedUser] = useState<ChatUser | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const ws = useRef<WebSocket | null>(null);

  useEffect(() => {
    // Initialize WebSocket connection
    console.log('Initializing WebSocket connection...');
    ws.current = new WebSocket('ws://localhost:5000');

    ws.current.onopen = () => {
      console.log('WebSocket connected');
      if (currentUser) {
        const token = localStorage.getItem('token');
        ws.current?.send(JSON.stringify({
          type: 'auth',
          token
        }));
      }
    };

    ws.current.onmessage = (event) => {
      console.log('Received WebSocket message:', event.data);
      const data = JSON.parse(event.data);
      
      if (data.type === 'message') {
        console.log('Message details:', {
          message: data.message,
          selectedUser: selectedUser?._id,
          currentUser: currentUser?.id,
          isSender: data.message.sender === currentUser?.id,
          isReceiver: data.message.receiver === currentUser?.id,
          isSelectedUserSender: data.message.sender === selectedUser?._id,
          isSelectedUserReceiver: data.message.receiver === selectedUser?._id
        });

        // Only add message if it's specifically for the current chat
        const isMessageForCurrentChat = selectedUser && 
          ((data.message.sender === currentUser?.id && data.message.receiver === selectedUser._id) || 
           (data.message.sender === selectedUser._id && data.message.receiver === currentUser?.id));

        console.log('Should display message:', isMessageForCurrentChat);

        if (isMessageForCurrentChat) {
          setMessages(prev => {
            // Check if message already exists to prevent duplicates
            const messageExists = prev.some(msg => msg._id === data.message._id);
            if (messageExists) {
              console.log('Message already exists in state, not adding duplicate');
              return prev;
            }
            console.log('Adding new message to state');
            return [...prev, data.message];
          });
          scrollToBottom();
        }
      }
    };

    ws.current.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    ws.current.onclose = () => {
      console.log('WebSocket connection closed');
    };

    return () => {
      console.log('Cleaning up WebSocket connection');
      ws.current?.close();
    };
  }, [currentUser, selectedUser]);

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (selectedUser && ws.current && ws.current.readyState === WebSocket.OPEN) {
      // Start chat session first
      const startChatMessage = {
        type: 'start_chat',
        partnerId: selectedUser._id
      };
      console.log('Starting chat session:', startChatMessage);
      ws.current.send(JSON.stringify(startChatMessage));

      // Then fetch messages
      fetchMessages(selectedUser._id);
    }
  }, [selectedUser, ws.current?.readyState]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    console.log('Users state updated:', users);
  }, [users]);

  const fetchUsers = async () => {
    try {
      console.log('Starting to fetch users for chat...');
      const token = localStorage.getItem('token');
      console.log('Token from localStorage:', token ? 'Token exists' : 'No token found');
      console.log('Current user from context:', currentUser);

      if (!token) {
        console.error('No token found in localStorage');
        setIsLoading(false);
        return;
      }

      if (!currentUser) {
        console.error('No current user in context');
        setIsLoading(false);
        return;
      }

      const url = 'http://localhost:5000/api/users';
      console.log('Making request to:', url);
      console.log('Request headers:', {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      });

      const response = await axios.get(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);
      console.log('Response data:', response.data);
      
      if (!Array.isArray(response.data)) {
        console.error('Invalid response format:', response.data);
        throw new Error('Invalid response format');
      }

      // Filter out the current user and format the data
      const filteredUsers: ChatUser[] = response.data
        .filter(user => user._id !== currentUser.id)
        .map(user => ({
          _id: user._id,
          name: user.name,
          role: user.role,
          profilePicture: user.profilePicture,
          lastMessage: null,
          unreadCount: 0
        }));

      console.log('Filtered users:', filteredUsers);
      setUsers(filteredUsers);
    } catch (error) {
      console.error('Error in fetchUsers:', error);
      if (axios.isAxiosError(error)) {
        console.error('Axios error details:', {
          status: error.response?.status,
          data: error.response?.data,
          headers: error.response?.headers,
          config: {
            url: error.config?.url,
            method: error.config?.method,
            headers: error.config?.headers
          }
        });
        alert(`Failed to fetch users: ${error.response?.data?.message || error.message}`);
      } else {
        alert('Failed to fetch users. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMessages = async (userId: string) => {
    try {
      const response = await fetch(`http://localhost:5000/api/messages/${userId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch messages');
      const data = await response.json();
      setMessages(data);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedUser || !ws.current) {
      console.log('Cannot send message:', { 
        messageEmpty: !newMessage.trim(), 
        noSelectedUser: !selectedUser, 
        noWebSocket: !ws.current 
      });
      return;
    }

    try {
      // Create message object
      const messageData = {
        sender: currentUser?.id,
        receiver: selectedUser._id,
        content: newMessage,
        timestamp: new Date().toISOString()
      };

      console.log('Sending message:', messageData);

      // Send message through WebSocket
      ws.current.send(JSON.stringify({
        type: 'message',
        message: messageData
      }));

      // Create message object for local state
      const localMessage = {
        _id: Date.now().toString(), // Temporary ID
        sender: currentUser?.id,
        receiver: selectedUser._id,
        content: newMessage,
        timestamp: new Date().toISOString(),
        read: false
      };

      // Update messages state immediately
      setMessages(prev => [...prev, localMessage]);

      // Update last message in users list
      setUsers(prev => prev.map(user => 
        user._id === selectedUser._id ? {
          ...user,
          lastMessage: localMessage
        } : user
      ));

      // Clear input
      setNewMessage('');

      console.log('Message sent and added to local state:', localMessage);
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message. Please try again.');
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  console.log('Filtered users:', filteredUsers);
  console.log('Is loading:', isLoading);
  console.log('Current user:', currentUser);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl h-[85vh] flex overflow-hidden">
        {/* Users List */}
        <div className="w-1/3 border-r border-gray-200 flex flex-col bg-gray-50">
          <div className="p-4 border-b border-gray-200 bg-white">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Messages</h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-500 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center text-gray-500 p-4">
                {users.length === 0 ? 'No users found in database' : 'No users match your search'}
              </div>
            ) : (
              filteredUsers.map(user => (
                <div
                  key={user._id}
                  onClick={() => setSelectedUser(user)}
                  className={`p-4 cursor-pointer transition-colors duration-200 ${
                    selectedUser?._id === user._id ? 'bg-blue-50' : 'hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {user.profilePicture ? (
                      <img
                        src={user.profilePicture}
                        alt={user.name}
                        className="h-12 w-12 rounded-full object-cover ring-2 ring-offset-2 ring-blue-100"
                      />
                    ) : (
                      <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center ring-2 ring-offset-2 ring-blue-100">
                        <User className="h-6 w-6 text-blue-600" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {user.name}
                          </p>
                          <div className="flex items-center gap-1">
                            <Flag className="h-3 w-3 text-green-500" />
                            <span className="text-xs text-green-600 font-medium">
                              {user.role === 'hirer' ? 'Hirer' : 'Job Seeker'}
                            </span>
                          </div>
                        </div>
                        {user.unreadCount ? (
                          <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full min-w-[20px] text-center">
                            {user.unreadCount}
                          </span>
                        ) : null}
                      </div>
                      {user.lastMessage && (
                        <p className="text-sm text-gray-500 truncate mt-1">
                          {user.lastMessage.content}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col bg-white">
          {selectedUser ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-gray-200 bg-white flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {selectedUser.profilePicture ? (
                    <img
                      src={selectedUser.profilePicture}
                      alt={selectedUser.name}
                      className="h-12 w-12 rounded-full object-cover ring-2 ring-offset-2 ring-blue-100"
                    />
                  ) : (
                    <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center ring-2 ring-offset-2 ring-blue-100">
                      <User className="h-6 w-6 text-blue-600" />
                    </div>
                  )}
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">
                      {selectedUser.name}
                    </h3>
                    <p className="text-xs text-gray-500">
                      {selectedUser.role === 'hirer' ? 'Hirer' : 'Job Seeker'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button className="p-2 text-gray-400 hover:text-gray-500 rounded-full hover:bg-gray-100 transition-colors">
                    <MoreVertical className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => setSelectedUser(null)}
                    className="p-2 text-gray-400 hover:text-gray-500 rounded-full hover:bg-gray-100 transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                {messages.map((message, index) => {
                  const showDate = index === 0 || 
                    new Date(message.timestamp).toDateString() !== 
                    new Date(messages[index - 1].timestamp).toDateString();
                  
                  return (
                    <div key={message._id}>
                      {showDate && (
                        <div className="flex justify-center my-4">
                          <span className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                            {format(new Date(message.timestamp), 'MMMM d, yyyy')}
                          </span>
                        </div>
                      )}
                      <div
                        className={`flex ${
                          message.sender === currentUser?.id ? 'justify-end' : 'justify-start'
                        }`}
                      >
                        <div
                          className={`max-w-[70%] rounded-2xl px-4 py-2.5 ${
                            message.sender === currentUser?.id
                              ? 'bg-blue-600 text-white'
                              : 'bg-white text-gray-900 shadow-sm'
                          }`}
                        >
                          <p className="text-sm">{message.content}</p>
                          <p className={`text-xs mt-1 ${
                            message.sender === currentUser?.id ? 'text-blue-100' : 'text-gray-500'
                          }`}>
                            {format(new Date(message.timestamp), 'h:mm a')}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <form onSubmit={sendMessage} className="p-4 border-t border-gray-200 bg-white">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    className="p-2 text-gray-400 hover:text-gray-500 rounded-full hover:bg-gray-100 transition-colors"
                  >
                    <Paperclip className="h-5 w-5" />
                  </button>
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type a message..."
                      className="w-full rounded-full border border-gray-200 px-4 py-2.5 pr-12 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-500"
                    >
                      <Smile className="h-5 w-5" />
                    </button>
                  </div>
                  <button
                    type="submit"
                    disabled={!newMessage.trim()}
                    className="bg-blue-600 text-white p-2.5 rounded-full hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Send className="h-5 w-5" />
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-500 bg-gray-50">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <User className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Select a user to start chatting</h3>
              <p className="text-sm text-gray-500">Choose from your connections to begin a conversation</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Chat; 