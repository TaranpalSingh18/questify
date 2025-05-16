import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Trophy, Medal, Coins } from 'lucide-react';

interface LeaderboardUser {
  _id: string;
  name: string;
  profilePicture: string;
  coins: number;
  role: string;
}

const Leaderboard: React.FC = () => {
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/users/leaderboard');
        const data = await response.json();
        setLeaderboardData(data);
      } catch (error) {
        console.error('Error fetching leaderboard:', error);
        // Set demo data if API fails
        setLeaderboardData([
          { _id: '1', name: 'Vivek', profilePicture: '', coins: 150, role: 'job-seeker' },
          { _id: '2', name: 'Sapna', profilePicture: '', coins: 120, role: 'job-seeker' },
          { _id: '3', name: 'Sangeeta', profilePicture: '', coins: 100, role: 'hirer' },
          { _id: '4', name: 'Prem', profilePicture: '', coins: 90, role: 'job-seeker' },
          { _id: '5', name: 'Vinod', profilePicture: '', coins: 80, role: 'job-seeker' },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  const handleSignInClick = () => {
    navigate('/login');
  };

  const getUserRank = () => {
    if (!currentUser) return -1;
    return leaderboardData.findIndex(user => user._id === currentUser._id) + 1;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <Trophy className="h-6 w-6 text-yellow-500" />
          <h2 className="text-2xl font-bold text-gray-800">Top Questers</h2>
        </div>
        {!currentUser && (
          <button
            onClick={handleSignInClick}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition-colors duration-200"
          >
            Sign in to compete
          </button>
        )}
      </div>

      {currentUser && (
        <div className="bg-blue-50 p-4 rounded-lg mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0">
                {currentUser.profilePicture ? (
                  <img
                    src={currentUser.profilePicture}
                    alt={currentUser.name}
                    className="h-10 w-10 rounded-full"
                  />
                ) : (
                  <div className="h-10 w-10 bg-blue-200 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-semibold">{currentUser.name[0]}</span>
                  </div>
                )}
              </div>
              <div>
                <p className="font-medium text-gray-900">Your Stats</p>
                <p className="text-sm text-gray-600">
                  Rank #{getUserRank() > 0 ? getUserRank() : 'Not ranked'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Coins className="h-5 w-5 text-yellow-500" />
              <span className="font-semibold text-gray-900">{currentUser.coins || 0}</span>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {leaderboardData.map((user, index) => (
          <div
            key={user._id}
            className={`flex items-center p-4 ${
              currentUser && user._id === currentUser._id
                ? 'bg-blue-50'
                : 'bg-gray-50'
            } rounded-lg hover:bg-gray-100 transition-colors duration-200`}
          >
            <div className="flex items-center justify-center w-8 h-8 mr-4">
              {index < 3 ? (
                <Medal className={`h-6 w-6 ${
                  index === 0 ? 'text-yellow-500' :
                  index === 1 ? 'text-gray-400' :
                  'text-amber-600'
                }`} />
              ) : (
                <span className="text-lg font-semibold text-gray-500">
                  #{index + 1}
                </span>
              )}
            </div>
            
            <div className="flex-shrink-0 w-10 h-10 mr-4">
              {user.profilePicture ? (
                <img
                  src={user.profilePicture}
                  alt={user.name}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <div className="w-full h-full rounded-full bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-600 font-semibold">
                    {user.name[0]}
                  </span>
                </div>
              )}
            </div>
            
            <div className="flex-grow">
              <h3 className="font-semibold text-gray-800">{user.name}</h3>
              <p className="text-sm text-gray-500 capitalize">{user.role.replace('-', ' ')}</p>
            </div>
            
            <div className="flex items-center gap-2">
              <Coins className="h-5 w-5 text-yellow-500" />
              <span className="font-semibold text-gray-800">{user.coins}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Leaderboard; 