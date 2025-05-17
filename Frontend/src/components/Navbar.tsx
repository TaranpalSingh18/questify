// src/components/Navbar.tsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Bell, MessageSquare, User, Briefcase, Trophy, Crown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { CiCoins1 } from "react-icons/ci";
import Leaderboard from './Leaderboard';
import SubscriptionPlans from './SubscriptionPlans';

const Navbar: React.FC = () => {
  const { currentUser, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      <nav className="bg-white border-b border-gray-200 fixed w-full z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="flex-shrink-0 flex items-center">
                <Briefcase className="h-8 w-8 text-blue-600" />
                <span className="ml-2 text-xl font-bold text-gray-900">Questify</span>
              </Link>
              
              {isAuthenticated && (
                <div className="ml-6 relative flex-grow max-w-3xl">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-gray-50 placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Search for quests, companies, or skills"
                    type="search"
                  />
                </div>
              )}
            </div>

            {isAuthenticated ? (
              <div className="flex items-center">
                <div className="flex items-center">
                  <button
                    onClick={() => setShowLeaderboard(true)}
                    className="p-2 rounded-full text-gray-500 hover:text-gray-700 hover:bg-gray-100 focus:outline-none"
                  >
                    <Trophy className="h-6 w-6" />
                  </button>
                  <div className="flex items-center bg-yellow-50 px-3 py-1 rounded-full border border-yellow-200 ml-2">
                    <CiCoins1 className='h-6 w-6 text-yellow-500'/>
                    <span className="text-sm font-medium text-yellow-700 ml-1">{currentUser?.coins || 0}</span>
                  </div>

                  {/* Premium Upgrade Button */}
                  <button
                    onClick={() => setShowSubscriptionModal(true)}
                    className="ml-4 flex items-center px-3 py-1 rounded-full bg-gradient-to-r from-yellow-400 to-yellow-600 text-white hover:from-yellow-500 hover:to-yellow-700 transition-all"
                  >
                    <Crown className="h-4 w-4 mr-1" />
                    <span className="text-sm font-medium">Upgrade</span>
                  </button>
             
                  <button className="ml-4 p-2 rounded-full text-gray-500 hover:text-gray-700 hover:bg-gray-100 focus:outline-none">
                    <Bell className="h-6 w-6" />
                  </button>
                  <button className="ml-2 p-2 rounded-full text-gray-500 hover:text-gray-700 hover:bg-gray-100 focus:outline-none">
                    <MessageSquare className="h-6 w-6" />
                  </button>
                  
                  <div className="ml-3 relative">
                    <div className="group relative">
                      <button className="flex items-center max-w-xs rounded-full text-sm focus:outline-none">
                        {currentUser?.profilePicture ? (
                          <img
                            className="h-8 w-8 rounded-full"
                            src={currentUser.profilePicture}
                            alt={currentUser.name}
                          />
                        ) : (
                          <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                            <User className="h-5 w-5 text-blue-600" />
                          </div>
                        )}
                      </button>
                      
                      <div className="hidden group-hover:block absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5">
                        <Link to="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                          Your Profile
                        </Link>
                        {currentUser?.role === 'hirer' && (
                          <Link to="/dashboard" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                            Dashboard
                          </Link>
                        )}
                        <Link to="/settings" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                          Settings
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          Sign out
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center">
                <Link
                  to="/login"
                  className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Log in
                </Link>
                <Link
                  to="/signup"
                  className="ml-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Leaderboard Modal */}
      {showLeaderboard && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto relative">
            <button
              onClick={() => setShowLeaderboard(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-xl font-bold"
            >
              ×
            </button>
            <div className="p-1">
              <Leaderboard />
            </div>
          </div>
        </div>
      )}

      {/* Subscription Modal */}
      {showSubscriptionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto relative">
            <button
              onClick={() => setShowSubscriptionModal(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-xl font-bold"
            >
              ×
            </button>
            <div className="p-1">
              <SubscriptionPlans showInModal={true} />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
