// src/components/Navbar.tsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Bell, MessageSquare, User, Briefcase, Trophy, Crown, LogOut, Menu, X, PlusCircle, CheckCircle, ChevronDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { CiCoins1 } from "react-icons/ci";
import Leaderboard from './Leaderboard';
import SubscriptionPlans from './SubscriptionPlans';
import Chat from './Chat';
import Notification from './Notification';

const Navbar: React.FC = () => {
  const { currentUser, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [coins, setCoins] = useState(0);
  const [showUserMenu, setShowUserMenu] = useState(false);

  useEffect(() => {
    if (currentUser) {
      setCoins(currentUser.coins || 0);
    }
  }, [currentUser]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchUnreadCount();
      // Set up WebSocket connection for real-time notifications
      const ws = new WebSocket('ws://localhost:5000');
      
      ws.onopen = () => {
        console.log('WebSocket connected');
        if (currentUser) {
          const token = localStorage.getItem('token');
          ws.send(JSON.stringify({
            type: 'auth',
            token,
            userId: currentUser._id
          }));
        }
      };

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === 'NOTIFICATION') {
          setUnreadCount(prev => prev + 1);
          if (data.notification.coins) {
            setCoins(prev => prev + data.notification.coins);
          }
          if (data.notification.coins) {
            setIsNotificationOpen(true);
          }
        }
      };

      return () => {
        ws.close();
      };
    }
  }, [currentUser, isAuthenticated]);

  const fetchUnreadCount = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/notifications/unread/count', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch unread count');
      const data = await response.json();
      setUnreadCount(data.count);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  return (
    <nav className="bg-white shadow-sm fixed w-full z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <Crown className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">Questify</span>
            </Link>
          </div>

          {/* Search Bar */}
          <div className="flex-1 flex items-center justify-center px-2 lg:ml-6 lg:justify-end">
            <div className="max-w-lg w-full lg:max-w-xs">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search quests..."
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            </div>
          </div>

          {/* Right side buttons */}
          <div className="flex items-center">
            {isAuthenticated ? (
              <>
                {/* Coins Display */}
                <div className="flex items-center mr-4">
                  <CiCoins1 className="h-6 w-6 text-yellow-500 mr-1" />
                  <span className="text-gray-700 font-medium">{coins}</span>
                </div>

                {/* Leaderboard Button */}
                <button
                  onClick={() => setShowLeaderboard(true)}
                  className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <Trophy className="h-6 w-6" />
                </button>

                {/* Chat Button */}
                <button
                  onClick={() => setShowChat(true)}
                  className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 relative"
                >
                  <MessageSquare className="h-6 w-6" />
                  {unreadMessages > 0 && (
                    <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
                      {unreadMessages}
                    </span>
                  )}
                </button>

                {/* Notifications */}
                <button
                  onClick={() => setIsNotificationOpen(true)}
                  className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 relative"
                >
                  <Bell className="h-6 w-6" />
                  {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {/* Upgrade Button */}
                <button
                  onClick={() => setShowSubscriptionModal(true)}
                  className="ml-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <Crown className="h-4 w-4 mr-2" />
                  Upgrade
                </button>

                {/* User Menu */}
                <div className="ml-4 relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center text-gray-700 hover:text-gray-900 focus:outline-none"
                  >
                    {currentUser?.profilePicture ? (
                      <img
                        src={currentUser.profilePicture}
                        alt={currentUser.name}
                        className="h-8 w-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                        <User className="h-5 w-5 text-blue-600" />
                      </div>
                    )}
                    <span className="ml-2 text-sm font-medium">{currentUser?.name}</span>
                    <ChevronDown className="ml-1 h-4 w-4" />
                  </button>

                  {showUserMenu && (
                    <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                      <div className="py-1">
                        <Link
                          to="/profile"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          Profile
                        </Link>
                        <Link
                          to="/settings"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          Settings
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          Sign out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  to="/login"
                  className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Sign in
                </Link>
                <Link
                  to="/register"
                  className="bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded-md text-sm font-medium"
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Leaderboard Modal */}
      {showLeaderboard && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Leaderboard</h2>
              <button
                onClick={() => setShowLeaderboard(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <Leaderboard onClose={() => setShowLeaderboard(false)} />
          </div>
        </div>
      )}

      {/* Subscription Modal */}
      {showSubscriptionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Upgrade Your Plan</h2>
              <button
                onClick={() => setShowSubscriptionModal(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <SubscriptionPlans onClose={() => setShowSubscriptionModal(false)} />
          </div>
        </div>
      )}

      {/* Notifications Modal */}
      {isNotificationOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-start justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl h-[70vh] flex overflow-hidden mt-16">
            <div className="flex-1 flex flex-col bg-white">
              <div className="p-6 border-b border-gray-200 bg-white flex items-center justify-between sticky top-0 z-10">
                <h2 className="text-xl font-semibold text-gray-900">Notifications</h2>
                <button
                  onClick={() => setIsNotificationOpen(false)}
                  className="p-2 text-gray-400 hover:text-gray-500 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto px-4">
                <div className="grid grid-cols-2 gap-4 py-4">
                  <Notification onClose={() => setIsNotificationOpen(false)} />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Chat Modal */}
      {showChat && (
        <Chat onClose={() => setShowChat(false)} onUnreadCountUpdate={(count) => setUnreadMessages(count)} />
      )}
    </nav>
  );
};

export default Navbar;
