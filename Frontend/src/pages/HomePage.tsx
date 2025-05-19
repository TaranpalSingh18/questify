import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Briefcase, Search, Filter, TrendingUp, Building, Calendar, MapPin, DollarSign, Clock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useQuests } from '../context/QuestContext';
import QuestCard from '../components/QuestCard';
import Navbar from '../components/Navbar';
import Leaderboard from '../components/Leaderboard';
import SubscriptionPlans from '../components/SubscriptionPlans';

const HomePage: React.FC = () => {
  const { isAuthenticated, currentUser } = useAuth();
  const { quests, loading, error } = useQuests();
  const navigate = useNavigate();
  const [filteredQuests, setFilteredQuests] = useState(quests);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [selectedQuest, setSelectedQuest] = useState<string | null>(null);
  const [showSubmissionModal, setShowSubmissionModal] = useState(false);
  const [submissionData, setSubmissionData] = useState({
    videoDemo: '',
    githubLink: '',
    description: ''
  });

  useEffect(() => {
    let results = quests;
    
    // Filter by search term
    if (searchTerm) {
      results = results.filter(quest => 
        quest.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        quest.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
        quest.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        quest.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    // Filter by selected skills
    if (selectedSkills.length > 0) {
      results = results.filter(quest => 
        selectedSkills.some(skill => quest.skills.includes(skill))
      );
    }
    
    setFilteredQuests(results);
  }, [quests, searchTerm, selectedSkills]);

  const toggleSkillFilter = (skill: string) => {
    if (selectedSkills.includes(skill)) {
      setSelectedSkills(selectedSkills.filter(s => s !== skill));
    } else {
      setSelectedSkills([...selectedSkills, skill]);
    }
  };

  // Get all unique skills from quests
  const allSkills = Array.from(new Set(quests.flatMap(quest => quest.skills))).sort();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedQuest) return;

    try {
      const response = await fetch('http://localhost:5000/api/submissions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          questId: selectedQuest,
          ...submissionData
        })
      });

      if (!response.ok) {
        throw new Error('Failed to submit solution');
      }

      setShowSubmissionModal(false);
      setSelectedQuest(null);
      setSubmissionData({
        videoDemo: '',
        githubLink: '',
        description: ''
      });
      
      // Show success message or redirect
      navigate('/profile');
    } catch (error) {
      console.error('Error submitting solution:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex justify-center items-center min-h-[calc(100vh-64px)]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex justify-center items-center min-h-[calc(100vh-64px)]">
          <div className="text-red-600">Error loading quests: {error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="pt-16 pb-12">
        {!isAuthenticated ? (
          <div className="relative">
            <div className="bg-blue-600 text-white">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
                <div className="max-w-3xl">
                  <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
                    Complete Quests. Showcase Skills. Get Hired.
                  </h1>
                  <p className="mt-6 text-xl max-w-2xl">
                    Questify connects talented individuals with companies through skill-based challenges. 
                    Complete quests, demonstrate your abilities, and land your dream opportunity.
                  </p>
                  <div className="mt-10 flex space-x-4">
                    <Link
                      to="/signup"
                      className="bg-white text-blue-600 hover:bg-blue-50 px-6 py-3 border border-transparent rounded-md text-base font-medium shadow-sm"
                    >
                      Get Started
                    </Link>
                    <Link
                      to="/about"
                      className="bg-blue-700 text-white hover:bg-blue-800 px-6 py-3 border border-transparent rounded-md text-base font-medium"
                    >
                      Learn More
                    </Link>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
              {/* Featured Quests Section */}
              <h2 className="text-3xl font-bold text-gray-900 mb-8">Featured Quests</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                {quests.slice(0, 3).map(quest => (
                  <QuestCard key={quest._id} quest={quest} />
                ))}
              </div>

              {/* Leaderboard Section */}
              <div className="mt-16">
                <Leaderboard />
              </div>

              {/* Subscription Plans Section */}
              <div className="mt-16">
                <SubscriptionPlans />
              </div>
              
              <div className="mt-12 text-center">
                <Link
                  to="/signup"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md text-base font-medium inline-flex items-center"
                >
                  <Briefcase className="mr-2 h-5 w-5" />
                  Sign up to see more quests
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-col md:flex-row gap-8">
              {/* Sidebar */}
              <div className="w-full md:w-64 flex-shrink-0">
                <div className="bg-white p-4 rounded-lg shadow-sm mb-4">
                  <div className="flex items-center space-x-3 mb-4">
                    {currentUser?.profilePicture ? (
                      <img 
                        src={currentUser.profilePicture} 
                        alt={currentUser.name} 
                        className="h-12 w-12 rounded-full"
                      />
                    ) : (
                      <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-bold">{currentUser?.name.charAt(0)}</span>
                      </div>
                    )}
                    <div>
                      <h3 className="font-medium text-gray-900">{currentUser?.name}</h3>
                      <p className="text-sm text-gray-500">{currentUser?.title || 'Add your title'}</p>
                    </div>
                  </div>
                  
                  <Link 
                    to="/profile" 
                    className="block w-full text-center text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    View Profile
                  </Link>
                </div>
                
                <div className="bg-white p-4 rounded-lg shadow-sm mb-4">
                  <h3 className="font-medium text-gray-900 mb-3">Filter by Skills</h3>
                  <div className="space-y-2">
                    {allSkills.slice(0, 10).map((skill, index) => (
                      <button
                        key={index}
                        onClick={() => toggleSkillFilter(skill)}
                        className={`block px-3 py-1.5 rounded-full text-sm w-full text-left ${
                          selectedSkills.includes(skill)
                            ? 'bg-blue-100 text-blue-800'
                            : 'hover:bg-gray-100 text-gray-700'
                        }`}
                      >
                        {skill}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              
              {/* Main content */}
              <div className="flex-1">
                <div className="flex justify-between items-center mb-6">
                  <h1 className="text-2xl font-bold text-gray-900">Discover Quests</h1>
                  
                  <div className="flex items-center space-x-2">
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        placeholder="Search quests"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    
                    <button className="p-2 border border-gray-300 rounded-md hover:bg-gray-50">
                      <Filter className="h-5 w-5 text-gray-500" />
                    </button>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredQuests.map(quest => (
                    <QuestCard key={quest._id} quest={quest} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
      
      {/* Submission Modal */}
      {showSubmissionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6">
            <h2 className="text-2xl font-bold mb-4">Submit Your Solution</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Video Demo URL
                </label>
                <input
                  type="url"
                  value={submissionData.videoDemo}
                  onChange={(e) => setSubmissionData(prev => ({ ...prev, videoDemo: e.target.value }))}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="https://youtube.com/..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  GitHub Repository URL
                </label>
                <input
                  type="url"
                  value={submissionData.githubLink}
                  onChange={(e) => setSubmissionData(prev => ({ ...prev, githubLink: e.target.value }))}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="https://github.com/..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={submissionData.description}
                  onChange={(e) => setSubmissionData(prev => ({ ...prev, description: e.target.value }))}
                  required
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Describe your solution and implementation details..."
                />
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowSubmissionModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Submit Solution
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      <footer className="bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-4 md:mb-0">
              <Briefcase className="h-6 w-6 text-blue-600 mr-2" />
              <span className="text-xl font-bold text-gray-900">Questify</span>
            </div>
            <div className="flex space-x-6">
              <Link to="/about" className="text-gray-500 hover:text-gray-900">About</Link>
              <Link to="/privacy" className="text-gray-500 hover:text-gray-900">Privacy</Link>
              <Link to="/terms" className="text-gray-500 hover:text-gray-900">Terms</Link>
              <Link to="/contact" className="text-gray-500 hover:text-gray-900">Contact</Link>
            </div>
          </div>
          <div className="mt-8 text-center text-gray-500 text-sm">
            &copy; {new Date().getFullYear()} Questify. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;