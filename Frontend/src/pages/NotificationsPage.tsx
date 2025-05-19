import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import { Bell, CheckCircle, XCircle, AlertCircle, MessageSquare, Trophy, DollarSign } from 'lucide-react';

interface Notification {
  _id: string;
  type: string;
  message: string;
  read: boolean;
  createdAt: string;
  data?: {
    questId?: string;
    submissionId?: string;
    coins?: number;
  };
}

const NotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/notifications', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      setNotifications(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch notifications');
      setLoading(false);
    }
  };

  const handleNotificationClick = async (notification: Notification) => {
    try {
      // Mark as read
      await axios.put(`http://localhost:5000/api/notifications/${notification._id}/read`, {}, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });

      // Update local state
      setNotifications(prev =>
        prev.map(n =>
          n._id === notification._id ? { ...n, read: true } : n
        )
      );

      // Navigate based on notification type
      if (notification.data?.questId) {
        navigate(`/quest/${notification.data.questId}`);
      } else if (notification.data?.submissionId) {
        navigate(`/dashboard?submission=${notification.data.submissionId}`);
      }
    } catch (err) {
      console.error('Error handling notification click:', err);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'SUBMISSION_APPROVED':
        return <CheckCircle className="h-6 w-6 text-green-500" />;
      case 'SUBMISSION_REJECTED':
        return <XCircle className="h-6 w-6 text-red-500" />;
      case 'NEW_SUBMISSION':
        return <MessageSquare className="h-6 w-6 text-blue-500" />;
      case 'QUEST_COMPLETED':
        return <Trophy className="h-6 w-6 text-yellow-500" />;
      case 'COINS_EARNED':
        return <DollarSign className="h-6 w-6 text-green-500" />;
      default:
        return <Bell className="h-6 w-6 text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="text-red-500">{error}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Notifications
              </h3>
            </div>
            <div className="border-t border-gray-200">
              {notifications.length === 0 ? (
                <div className="px-4 py-5 sm:p-6 text-center text-gray-500">
                  No notifications yet
                </div>
              ) : (
                <ul className="divide-y divide-gray-200">
                  {notifications.map((notification) => (
                    <li
                      key={notification._id}
                      className={`px-4 py-4 sm:px-6 hover:bg-gray-50 cursor-pointer ${
                        !notification.read ? 'bg-blue-50' : ''
                      }`}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <div className="flex items-center space-x-3">
                        {getNotificationIcon(notification.type)}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900">
                            {notification.message}
                          </p>
                          <p className="text-sm text-gray-500">
                            {new Date(notification.createdAt).toLocaleString()}
                          </p>
                        </div>
                        {!notification.read && (
                          <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationsPage; 