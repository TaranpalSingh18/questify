import React, { useState, useEffect, useCallback } from 'react';
import { Bell, Coins, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';

interface Notification {
  _id: string;
  type: 'login' | 'certificate' | 'quest' | 'message';
  message: string;
  coins?: number;
  timestamp: string;
  createdAt?: string;
  read: boolean;
  submission?: {
    videoDemo: string;
    githubLink: string;
    description: string;
    seekerName: string;
  };
}

interface NotificationProps {
  onClose: () => void;
}

const Notification: React.FC<NotificationProps> = ({ onClose }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [ws, setWs] = useState<WebSocket | null>(null);

  const connectWebSocket = useCallback(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    const wsUrl = `ws://localhost:5000?token=${token}`;
    const websocket = new WebSocket(wsUrl);

    websocket.onopen = () => {
      console.log('WebSocket connected');
    };

    websocket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'NOTIFICATION') {
          setNotifications(prev => [data.notification, ...prev]);
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    websocket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    websocket.onclose = () => {
      console.log('WebSocket disconnected');
      // Attempt to reconnect after 5 seconds
      setTimeout(connectWebSocket, 5000);
    };

    setWs(websocket);
  }, []);

  useEffect(() => {
    connectWebSocket();
    return () => {
      if (ws) {
        ws.close();
      }
    };
  }, [connectWebSocket]);

  const fetchNotifications = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        console.log('No token found');
        setIsLoading(false);
        return;
      }

      const response = await fetch('http://localhost:5000/api/notifications', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Fetched notifications:', data);
        setNotifications(data);
      } else {
        console.error('Failed to fetch notifications:', response.status);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const markAsRead = async (notificationId: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`http://localhost:5000/api/notifications/${notificationId}/read`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setNotifications(prev =>
          prev.map(notification =>
            notification._id === notificationId
              ? { ...notification, read: true }
              : notification
          )
        );
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'login':
      case 'certificate':
        return (
          <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center">
            <Coins className="h-7 w-7 text-yellow-600" />
          </div>
        );
      case 'quest':
        return (
          <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
            <Bell className="h-7 w-7 text-blue-600" />
          </div>
        );
      case 'message':
        return (
          <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
            <Bell className="h-7 w-7 text-green-600" />
          </div>
        );
      default:
        return null;
    }
  };

  const renderSubmissionDetails = (submission: Notification['submission']) => {
    if (!submission) return null;
    
    return (
      <div className="mt-3 space-y-3 text-sm">
        <p className="text-gray-600 text-base">Submitted by: {submission.seekerName}</p>
        <div className="space-y-2">
          <a
            href={submission.videoDemo}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center text-blue-600 hover:text-blue-800 text-base"
          >
            <ExternalLink className="h-5 w-5 mr-2" />
            Video Demo
          </a>
          <a
            href={submission.githubLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center text-blue-600 hover:text-blue-800 text-base"
          >
            <ExternalLink className="h-5 w-5 mr-2" />
            GitHub Repository
          </a>
        </div>
        <p className="text-gray-700 mt-3 text-base">{submission.description}</p>
      </div>
    );
  };

  return (
    <>
      {isLoading ? (
        <div className="col-span-2 p-6 text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-500 mt-3 text-base">Loading notifications...</p>
        </div>
      ) : notifications.length === 0 ? (
        <div className="col-span-2 p-6 text-center text-gray-500">
          <Bell className="h-12 w-12 mx-auto mb-3 text-gray-400" />
          <p className="text-lg">No notifications yet</p>
          <p className="text-base mt-2">You'll see your notifications here when they arrive</p>
        </div>
      ) : (
        notifications.map((notification) => (
          <div
            key={notification._id}
            className={`bg-white rounded-lg border border-gray-200 hover:border-gray-300 shadow-sm hover:shadow p-6 cursor-pointer ${
              !notification.read ? 'bg-blue-50 border-blue-100' : ''
            }`}
            onClick={() => markAsRead(notification._id)}
          >
            <div className="flex items-start space-x-4">
              {getNotificationIcon(notification.type)}
              <div className="flex-1 min-w-0">
                <p className="text-base text-gray-900">{notification.message}</p>
                {notification.submission && renderSubmissionDetails(notification.submission)}
                <p className="text-sm text-gray-500 mt-2">
                  {format(new Date(notification.timestamp || notification.createdAt || new Date()), 'MMM d, yyyy h:mm a')}
                </p>
                {notification.coins && (
                  <p className="text-sm text-yellow-600 mt-2 font-medium">
                    +{notification.coins} coins
                  </p>
                )}
              </div>
            </div>
          </div>
        ))
      )}
    </>
  );
};

export default Notification; 