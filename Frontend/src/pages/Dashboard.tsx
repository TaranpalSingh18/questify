import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { PlusCircle, FileText, Users, Building, Calendar, MapPin, DollarSign, MessageSquare } from "lucide-react";
import { useQuests } from '../context/QuestContext';
import SkillSelector from '../components/SkillSelector';
import Navbar from '../components/Navbar';
import { QuestFormData } from '../types/quest';
import Chat from '../components/Chat';

interface Quest {
  _id: string;
  title: string;
  company: string;
  description: string;
  requirements: string[];
  skills: string[];
  deadline: string;
  compensation?: string;
  location: string;
  remote: boolean;
  postedBy: string;
  postedAt: string;
  applicants: number;
  submissionsCount: number;
}

interface Submission {
  _id: string;
  questTitle: string;
  submitterName: string;
  response: string;
  videoDemo?: string;
  githubLink?: string;
  description?: string;
}

const customScrollbarStyles = `
  .custom-scrollbar::-webkit-scrollbar {
    width: 6px;
  }
  .custom-scrollbar::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 3px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 3px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: #94a3b8;
  }
`;

const styleSheet = document.createElement("style");
styleSheet.textContent = customScrollbarStyles;
document.head.appendChild(styleSheet);

const Dashboard: React.FC = () => {
  const { currentUser, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { refreshQuests } = useQuests();
  const [quests, setQuests] = useState<Quest[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [activeTab, setActiveTab] = useState("posted");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showChat, setShowChat] = useState(false);

  // Form state
  const [formData, setFormData] = useState<QuestFormData>({
    title: "",
    company: "",
    companyLogo: "",
    description: "",
    requirements: [""],
    skills: [],
    deadline: "",
    compensation: "",
    location: "",
    remote: true
  });

  useEffect(() => {
    if (!isAuthenticated || !currentUser) {
      navigate('/login');
      return;
    }

    if (currentUser.role !== 'hirer') {
      navigate('/');
      return;
    }

    fetchQuests();
    fetchSubmissions();
  }, [isAuthenticated, currentUser, navigate]);

  const fetchQuests = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/quests", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setQuests(response.data);
    } catch (error) {
      console.error("Error fetching quests:", error);
    }
  };

  const fetchSubmissions = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/submissions", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setSubmissions(response.data);
    } catch (error) {
      console.error("Error fetching submissions:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (name === 'skills' || name === 'requirements') {
      setFormData((prev) => ({
        ...prev,
        [name]: value.split(',').map(item => item.trim()).filter(Boolean)
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // Validate required fields
      if (!formData.title || !formData.company || !formData.description || !formData.deadline || !formData.location) {
        throw new Error('Please fill in all required fields');
      }

      // Format the data to match the Quest model
      const questData = {
        title: formData.title,
        company: formData.company,
        companyLogo: formData.companyLogo || undefined,
        description: formData.description,
        requirements: formData.requirements,
        skills: formData.skills,
        deadline: new Date(formData.deadline).toISOString(),
        compensation: formData.compensation || undefined,
        location: formData.location,
        remote: formData.remote,
        postedBy: currentUser?._id,
      };

      const response = await fetch('http://localhost:5000/api/quests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(questData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create quest');
      }

      const data = await response.json();
      console.log('Quest created:', data);

      // Refresh the quests list
      await refreshQuests();
      
      // Reset form
      clearForm();
    } catch (err) {
      console.error('Error creating quest:', err);
      setError(err instanceof Error ? err.message : 'Failed to create quest');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  const clearForm = () => {
    setFormData({
      title: '',
      company: '',
      companyLogo: '',
      description: '',
      requirements: [''],
      skills: [],
      deadline: '',
      compensation: '',
      location: '',
      remote: true,
    });
    setError(null);
  };

  if (!currentUser || currentUser.role !== 'hirer') {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-xl text-gray-600">Access denied. Hirer account required.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-blue-600">Dashboard {currentUser && `- Welcome, ${currentUser.name}`}</h1>
          <div className="flex gap-2">
            <button 
              onClick={() => navigate("/")} 
              className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-md border border-gray-300 bg-white text-sm font-medium shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              ← Back to Home
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Post a Quest Card */}
          <div className="lg:col-span-2 rounded-lg border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-200 p-6">
              <div className="flex items-center gap-2">
                <PlusCircle className="h-5 w-5 text-blue-600" />
                <h2 className="text-xl font-semibold">Post a Quest</h2>
              </div>
              <p className="text-sm text-gray-500 mt-1">Create a new quest for freelancers to complete</p>
            </div>
            <div className="p-6">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">
                  {error}
                </div>
              )}
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Quest Title *
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Company Name *
                    </label>
                    <input
                      type="text"
                      name="company"
                      value={formData.company}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Deadline *
                    </label>
                    <input
                      type="datetime-local"
                      name="deadline"
                      value={formData.deadline}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Location *
                    </label>
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Compensation
                    </label>
                    <input
                      type="text"
                      name="compensation"
                      value={formData.compensation}
                      onChange={handleInputChange}
                      placeholder="e.g., $50,000 - $70,000"
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description *
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    required
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Required Skills *
                  </label>
                  <SkillSelector
                    selectedSkills={formData.skills}
                    onChange={(skills) => setFormData(prev => ({ ...prev, skills }))}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Requirements *
                  </label>
                  {formData.requirements.map((req, index) => (
                    <div key={index} className="mb-2">
                      <input
                        type="text"
                        value={req}
                        onChange={(e) => {
                          const newRequirements = [...formData.requirements];
                          newRequirements[index] = e.target.value;
                          setFormData(prev => ({ ...prev, requirements: newRequirements }));
                        }}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        placeholder={`Requirement ${index + 1}`}
                      />
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, requirements: [...prev.requirements, ''] }))}
                    className="mt-2 text-sm text-blue-600 hover:text-blue-700"
                  >
                    + Add another requirement
                  </button>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="remote"
                    checked={formData.remote}
                    onChange={(e) => setFormData(prev => ({ ...prev, remote: e.target.checked }))}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-700">
                    This is a remote position
                  </label>
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={clearForm}
                    className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Clear Quest
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? 'Posting...' : 'Post Quest'}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Dashboard Overview Card */}
          <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-200 p-4">
              <div className="text-lg font-semibold flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-600" />
                Dashboard Overview
              </div>
            </div>
            <div className="p-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Active Quests</span>
                  <span className="font-medium">{quests.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Total Submissions</span>
                  <span className="font-medium">{submissions.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Completed Quests</span>
                  <span className="font-medium">{quests.filter(q => q.submissionsCount > 0).length}</span>
                </div>
                <div className="pt-4 border-t border-gray-200">
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Quick Actions</h3>
                  <div className="space-y-2">
                    <button 
                      onClick={() => handleTabChange("posted")}
                      className="w-full text-left px-4 py-2 rounded-md border border-gray-300 bg-white text-sm font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                      View All Quests
                    </button>
                    <button 
                      onClick={() => handleTabChange("submissions")}
                      className="w-full text-left px-4 py-2 rounded-md border border-gray-300 bg-white text-sm font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                      Review Submissions
                    </button>
                    <button 
                      onClick={() => setShowChat(true)}
                      className="w-full text-left px-4 py-2 rounded-md border border-gray-300 bg-white text-sm font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                      Message Freelancers
                    </button>
                  </div>
                </div>
                <div className="pt-4 border-t border-gray-200">
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Active Quests</h3>
                  <div className="max-h-[300px] overflow-y-auto pr-2 space-y-2 custom-scrollbar">
                    {quests.length > 0 ? (
                      quests.map((quest) => (
                        <div 
                          key={quest._id} 
                          className="p-3 border border-gray-200 rounded-md hover:border-blue-300 transition-colors cursor-pointer"
                          onClick={() => handleTabChange("posted")}
                        >
                          <h4 className="font-medium text-sm text-gray-900 truncate">{quest.title}</h4>
                          <div className="mt-1 flex items-center gap-2">
                            <span className="text-xs text-gray-500">
                              {new Date(quest.deadline).toLocaleDateString()}
                            </span>
                            <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">
                              {quest.submissionsCount || 0} submissions
                            </span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-4 text-sm text-gray-500">
                        No active quests
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Section */}
        <div className="mt-8">
          <div className="border-b border-gray-200">
            <div className="grid w-full grid-cols-2">
              <button
                className={`inline-flex items-center justify-center whitespace-nowrap py-3 text-sm font-medium border-b-2 ${
                  activeTab === "posted" ? "border-blue-600 text-blue-600" : "border-transparent hover:text-gray-700 hover:border-gray-300"
                }`}
                onClick={() => handleTabChange("posted")}
              >
                My Posted Quests
              </button>
              <button
                className={`inline-flex items-center justify-center whitespace-nowrap py-3 text-sm font-medium border-b-2 ${
                  activeTab === "submissions" ? "border-blue-600 text-blue-600" : "border-transparent hover:text-gray-700 hover:border-gray-300"
                }`}
                onClick={() => handleTabChange("submissions")}
              >
                Submissions on My Quests
              </button>
            </div>
          </div>

          {/* Posted Quests Content */}
          {activeTab === "posted" && (
            <div className="mt-4">
              <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
                <div className="p-6">
                  {quests.length > 0 ? (
                    <div className="space-y-4">
                      {quests.map((quest) => (
                        <div key={quest._id} className="p-4 border border-gray-200 rounded-md">
                          <h4 className="font-bold text-lg">{quest.title}</h4>
                          <p className="mt-2 text-gray-600">{quest.description}</p>
                          <div className="mt-3 flex flex-wrap gap-4">
                            {quest.compensation && (
                              <span className="text-sm bg-blue-50 text-blue-700 px-2 py-1 rounded-md">
                                Compensation: {quest.compensation}
                              </span>
                            )}
                            {quest.deadline && (
                              <span className="text-sm bg-green-50 text-green-700 px-2 py-1 rounded-md">
                                Deadline: {new Date(quest.deadline).toLocaleDateString()}
                              </span>
                            )}
                            <span className="text-sm bg-purple-50 text-purple-700 px-2 py-1 rounded-md">
                              Submissions: {quest.submissionsCount || 0}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center text-center p-6 min-h-[200px]">
                      <FileText className="h-12 w-12 text-gray-400 mb-4" />
                      <h3 className="text-lg font-medium mb-2">No quests posted yet</h3>
                      <p className="text-gray-500 mb-4">
                        Create your first quest to start receiving submissions from talented freelancers
                      </p>
                      <button 
                        onClick={() => document.getElementById("title")?.focus()}
                        className="inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                      >
                        Post Your First Quest
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Submissions Content */}
          {activeTab === "submissions" && (
            <div className="mt-4">
              <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
                <div className="p-6">
                  {submissions.length > 0 ? (
                    <div className="space-y-4">
                      {submissions.map((submission) => (
                        <div key={submission._id} className="p-4 border border-gray-200 rounded-md">
                          <div className="flex justify-between mb-2">
                            <h4 className="font-bold text-lg">{submission.questTitle}</h4>
                            <span className="text-sm bg-blue-50 text-blue-700 px-2 py-1 rounded-md">
                              Submitted by: {submission.submitterName}
                            </span>
                          </div>
                          <p className="mt-2 text-gray-600">{submission.description}</p>
                          {submission.videoDemo && (
                            <div className="mt-2">
                              <a
                                href={submission.videoDemo}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-700"
                              >
                                Watch Video Demo →
                              </a>
                            </div>
                          )}
                          {submission.githubLink && (
                            <div className="mt-2">
                              <a
                                href={submission.githubLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-700"
                              >
                                View GitHub Repository →
                              </a>
                            </div>
                          )}
                          <div className="mt-4 flex justify-end space-x-2">
                            <button className="px-3 py-1 text-sm border border-green-500 text-green-600 rounded-md hover:bg-green-50">
                              Accept
                            </button>
                            <button className="px-3 py-1 text-sm border border-gray-300 text-gray-600 rounded-md hover:bg-gray-50">
                              Request Changes
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center text-center p-6 min-h-[200px]">
                      <Users className="h-12 w-12 text-gray-400 mb-4" />
                      <h3 className="text-lg font-medium mb-2">No submissions yet</h3>
                      <p className="text-gray-500 mb-4">
                        Once freelancers submit work for your quests, they will appear here
                      </p>
                      <button 
                        onClick={() => handleTabChange("posted")}
                        className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                      >
                        View Active Quests
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      {showChat && (
        <Chat onClose={() => setShowChat(false)} />
      )}
    </div>
  );
};

export default Dashboard;