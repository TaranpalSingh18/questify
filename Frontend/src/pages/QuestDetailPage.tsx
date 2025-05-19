import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Calendar, MapPin, DollarSign, Users, Briefcase, Clock, ChevronLeft, Share2, Bookmark, Flag } from 'lucide-react';
import { useQuests } from '../context/QuestContext';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';

const QuestDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { getQuestById, submitToQuest } = useQuests();
  const { currentUser, isAuthenticated } = useAuth();
  const quest = getQuestById(id || '');
  
  const [videoDemo, setVideoDemo] = useState('');
  const [githubLink, setGithubLink] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');

  if (!quest) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="pt-24 pb-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white p-8 rounded-lg shadow-sm text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Quest not found</h2>
            <p className="text-gray-600 mb-6">The quest you're looking for doesn't exist or has been removed.</p>
            <Link
              to="/"
              className="inline-flex items-center text-blue-600 hover:text-blue-800"
            >
              <ChevronLeft className="h-5 w-5 mr-1" />
              Back to home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAuthenticated || !currentUser) {
      setSubmitError('You must be logged in to submit a quest');
      return;
    }
    
    if (!videoDemo || !githubLink) {
      setSubmitError('Please provide both a video demo and GitHub link');
      return;
    }
    
    setIsSubmitting(true);
    setSubmitError('');
    
    try {
      submitToQuest({
        questId: quest._id,
        userId: currentUser._id,
        videoDemo,
        githubLink,
        description
      });
      
      setSubmitSuccess(true);
      setVideoDemo('');
      setGithubLink('');
      setDescription('');
    } catch (error) {
      setSubmitError('Failed to submit quest. Please try again.');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="pt-16 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-6">
            <Link
              to="/"
              className="inline-flex items-center text-blue-600 hover:text-blue-800"
            >
              <ChevronLeft className="h-5 w-5 mr-1" />
              Back to quests
            </Link>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div className="flex items-center mb-4 md:mb-0">
                  {quest.companyLogo ? (
                    <img 
                      src={quest.companyLogo} 
                      alt={quest.company} 
                      className="w-16 h-16 rounded-md object-cover mr-4"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-blue-100 rounded-md flex items-center justify-center mr-4">
                      <span className="text-blue-600 font-bold text-xl">{quest.company.charAt(0)}</span>
                    </div>
                  )}
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">{quest.title}</h1>
                    <p className="text-gray-600">{quest.company}</p>
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <button className="p-2 rounded-full text-gray-500 hover:text-gray-700 hover:bg-gray-100">
                    <Share2 className="h-5 w-5" />
                  </button>
                  <button className="p-2 rounded-full text-gray-500 hover:text-gray-700 hover:bg-gray-100">
                    <Bookmark className="h-5 w-5" />
                  </button>
                  <button className="p-2 rounded-full text-gray-500 hover:text-gray-700 hover:bg-gray-100">
                    <Flag className="h-5 w-5" />
                  </button>
                </div>
              </div>
              
              <div className="flex flex-wrap mt-6 text-sm text-gray-500">
                <div className="flex items-center mr-6 mb-2">
                  <Calendar className="h-4 w-4 mr-1" />
                  <span>Deadline: {formatDate(quest.deadline)}</span>
                </div>
                <div className="flex items-center mr-6 mb-2">
                  <MapPin className="h-4 w-4 mr-1" />
                  <span>{quest.remote ? 'Remote' : quest.location}</span>
                </div>
                {quest.compensation && (
                  <div className="flex items-center mr-6 mb-2">
                    <DollarSign className="h-4 w-4 mr-1" />
                    <span>{quest.compensation}</span>
                  </div>
                )}
                <div className="flex items-center mr-6 mb-2">
                  <Users className="h-4 w-4 mr-1" />
                  <span>{quest.applicants || 0} applicants</span>
                </div>
                <div className="flex items-center mb-2">
                  <Clock className="h-4 w-4 mr-1" />
                  <span>Posted {formatDate(quest.postedAt)}</span>
                </div>
              </div>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-2">
                  <section className="mb-8">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Description</h2>
                    <p className="text-gray-700 whitespace-pre-line">{quest.description}</p>
                  </section>
                  
                  <section className="mb-8">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Requirements</h2>
                    <ul className="list-disc pl-5 space-y-2 text-gray-700">
                      {quest.requirements.map((requirement, index) => (
                        <li key={index}>{requirement}</li>
                      ))}
                    </ul>
                  </section>
                  
                  <section>
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Skills Required</h2>
                    <div className="flex flex-wrap gap-2">
                      {quest.skills.map((skill, index) => (
                        <span 
                          key={index} 
                          className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </section>
                </div>
                
                <div>
                  <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Submit Your Solution</h2>
                    
                    {!isAuthenticated ? (
                      <div className="text-center py-4">
                        <p className="text-gray-600 mb-4">You need to sign in to submit your solution</p>
                        <Link
                          to="/login"
                          className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                        >
                          Sign in
                        </Link>
                      </div>
                    ) : submitSuccess ? (
                      <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-4">
                        <div className="flex">
                          <div>
                            <p className="text-sm text-green-700">
                              Your submission has been received! The company will review it and get back to you.
                            </p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <form onSubmit={handleSubmit}>
                        {submitError && (
                          <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
                            <div className="flex">
                              <div>
                                <p className="text-sm text-red-700">{submitError}</p>
                              </div>
                            </div>
                          </div>
                        )}
                        
                        <div className="mb-4">
                          <label htmlFor="videoDemo" className="block text-sm font-medium text-gray-700 mb-1">
                            Video Demo URL
                          </label>
                          <input
                            type="url"
                            id="videoDemo"
                            value={videoDemo}
                            onChange={(e) => setVideoDemo(e.target.value)}
                            placeholder="https://www.youtube.com/watch?v=..."
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                            required
                          />
                        </div>
                        
                        <div className="mb-4">
                          <label htmlFor="githubLink" className="block text-sm font-medium text-gray-700 mb-1">
                            GitHub Repository URL
                          </label>
                          <input
                            type="url"
                            id="githubLink"
                            value={githubLink}
                            onChange={(e) => setGithubLink(e.target.value)}
                            placeholder="https://github.com/username/repo"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                            required
                          />
                        </div>
                        
                        <div className="mb-4">
                          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                            Description (optional)
                          </label>
                          <textarea
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={4}
                            placeholder="Describe your approach and any additional information..."
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                        
                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isSubmitting ? 'Submitting...' : 'Submit Solution'}
                        </button>
                      </form>
                    )}
                    
                    <div className="mt-6 text-center">
                      <p className="text-xs text-gray-500">
                        By submitting, you agree to our <Link to="/terms" className="text-blue-600 hover:text-blue-800">Terms of Service</Link> and <Link to="/privacy" className="text-blue-600 hover:text-blue-800">Privacy Policy</Link>
                      </p>
                    </div>
                  </div>
                  
                  <div className="mt-6 bg-gray-50 p-6 rounded-lg border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">About {quest.company}</h3>
                    <div className="flex items-center mb-4">
                      {quest.companyLogo ? (
                        <img 
                          src={quest.companyLogo} 
                          alt={quest.company} 
                          className="w-12 h-12 rounded-md object-cover mr-3"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-blue-100 rounded-md flex items-center justify-center mr-3">
                          <span className="text-blue-600 font-bold">{quest.company.charAt(0)}</span>
                        </div>
                      )}
                      <div>
                        <h4 className="font-medium text-gray-900">{quest.company}</h4>
                        <p className="text-sm text-gray-500">Technology</p>
                      </div>
                    </div>
                    <Link
                      to={`/company/${quest.company.toLowerCase().replace(/\s+/g, '-')}`}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      View company profile
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default QuestDetailPage;