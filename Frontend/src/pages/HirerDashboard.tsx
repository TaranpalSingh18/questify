import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { PlusCircle, FileText, Users, Check, X } from "lucide-react";
import { useQuests } from '../context/QuestContext';
import { QuestFormData } from '../types/quest';

interface Quest {
  _id: string;
  title: string;
  description: string;
  budget?: number;
  deadline?: string;
}

interface Submission {
  _id: string;
  questTitle: string;
  submitterName: string;
  videoDemo: string;
  githubLink: string;
  description: string;
  submittedAt: string;
  status: 'pending' | 'approved' | 'rejected';
}

const HirerDashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const { refreshQuests } = useQuests();
  const navigate = useNavigate();
  const [quests, setQuests] = useState<Quest[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<QuestFormData>({
    title: '',
    company: '',
    companyLogo: '',
    description: '',
    requirements: [],
    skills: [],
    deadline: '',
    compensation: '',
    location: '',
    remote: false,
  });
  const [activeTab, setActiveTab] = useState("posted");

  useEffect(() => {
    fetchQuests();
    fetchSubmissions();
  }, []);

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
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (name === 'skills' || name === 'requirements') {
      setFormData(prev => ({
        ...prev,
        [name]: value.split(',').map(item => item.trim()).filter(Boolean)
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
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
        postedBy: currentUser?._id, // Add the user ID
      };

      console.log('Sending quest data:', questData);

      const response = await fetch('http://localhost:5000/api/quests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`, // Add authorization header
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
      
      // Reset form and navigate
      setFormData({
        title: '',
        company: '',
        companyLogo: '',
        description: '',
        requirements: [],
        skills: [],
        deadline: '',
        compensation: '',
        location: '',
        remote: false,
      });
      navigate('/');
    } catch (err) {
      console.error('Error creating quest:', err);
      setError(err instanceof Error ? err.message : 'Failed to create quest');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmissionAction = async (submissionId: string, action: 'approve' | 'reject') => {
    try {
      const response = await axios.put(
        `http://localhost:5000/api/submissions/${submissionId}`,
        { status: action === 'approve' ? 'approved' : 'rejected' },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      if (response.status === 200) {
        // Update local state
        setSubmissions(submissions.map(sub => 
          sub._id === submissionId 
            ? { ...sub, status: action === 'approve' ? 'approved' : 'rejected' }
            : sub
        ));
      }
    } catch (error) {
      console.error(`Error ${action}ing submission:`, error);
      setError(`Failed to ${action} submission`);
    }
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  if (!currentUser || currentUser.role !== 'hirer') {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-xl text-gray-600">Access denied. Hirer account required.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-blue-600">Hirer Dashboard {currentUser && `- Welcome, ${currentUser.name}`}</h1>
        <div className="flex gap-2">
          <button 
            onClick={() => navigate("/")} 
            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-md border border-gray-300 bg-white text-sm font-medium shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            ← Back to Home
          </button>
          <button className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-md border border-gray-300 bg-white text-sm font-medium shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
            <Users className="h-4 w-4" />
            My Account
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Post a Quest Card */}
        <div className="md:col-span-2 rounded-lg border border-gray-200 bg-white shadow-sm">
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

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md font-medium disabled:opacity-50"
                >
                  {loading ? 'Posting...' : 'Post Quest'}
                </button>
              </div>
            </form>
          </div>
        </div>

        <div className="space-y-6">
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
                  <span className="text-sm text-gray-500">Pending Reviews</span>
                  <span className="font-medium">{submissions.filter(s => s.status === 'pending').length}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions Card */}
          <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-200 p-4">
              <div className="text-lg font-semibold">Quick Actions</div>
            </div>
            <div className="p-4 space-y-2">
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
              <button className="w-full text-left px-4 py-2 rounded-md border border-gray-300 bg-white text-sm font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                Message Freelancers
              </button>
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
        <div className={`mt-4 ${activeTab !== "posted" ? "hidden" : ""}`}>
          <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
            <div className="p-6">
              {quests.length > 0 ? (
                <div className="space-y-4">
                  {quests.map((quest) => (
                    <div key={quest._id} className="p-4 border border-gray-200 rounded-md">
                      <h4 className="font-bold text-lg">{quest.title}</h4>
                      <p className="mt-2 text-gray-600">{quest.description}</p>
                      <div className="mt-3 flex flex-wrap gap-4">
                        {quest.budget && (
                          <span className="text-sm bg-blue-50 text-blue-700 px-2 py-1 rounded-md">
                            Budget: ${quest.budget}
                          </span>
                        )}
                        {quest.deadline && (
                          <span className="text-sm bg-green-50 text-green-700 px-2 py-1 rounded-md">
                            Deadline: {new Date(quest.deadline).toLocaleDateString()}
                          </span>
                        )}
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

        {/* Submissions Content */}
        <div className={`mt-4 ${activeTab !== "submissions" ? "hidden" : ""}`}>
          <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
            <div className="p-6">
              {submissions.length > 0 ? (
                <div className="space-y-4">
                  {submissions.map((submission) => (
                    <div key={submission._id} className="p-4 border border-gray-200 rounded-md">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h4 className="font-bold text-lg">{submission.questTitle}</h4>
                          <p className="text-sm text-gray-500">Submitted by: {submission.submitterName}</p>
                          <p className="text-sm text-gray-500">
                            Submitted on: {new Date(submission.submittedAt).toLocaleDateString()}
                          </p>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-sm ${
                          submission.status === 'approved' 
                            ? 'bg-green-100 text-green-800'
                            : submission.status === 'rejected'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {submission.status.charAt(0).toUpperCase() + submission.status.slice(1)}
                        </span>
                      </div>
                      
                      <p className="mt-2 text-gray-600">{submission.description}</p>
                      
                      <div className="mt-4 space-y-2">
                        <a
                          href={submission.videoDemo}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center text-blue-600 hover:text-blue-700"
                        >
                          <span className="mr-2">📹</span>
                          Watch Video Demo
                        </a>
                        <br />
                        <a
                          href={submission.githubLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center text-blue-600 hover:text-blue-700"
                        >
                          <span className="mr-2">📦</span>
                          View GitHub Repository
                        </a>
                      </div>

                      {submission.status === 'pending' && (
                        <div className="mt-4 flex justify-end space-x-2">
                          <button
                            onClick={() => handleSubmissionAction(submission._id, 'approve')}
                            className="inline-flex items-center px-3 py-1 text-sm border border-green-500 text-green-600 rounded-md hover:bg-green-50"
                          >
                            <Check className="h-4 w-4 mr-1" />
                            Accept
                          </button>
                          <button
                            onClick={() => handleSubmissionAction(submission._id, 'reject')}
                            className="inline-flex items-center px-3 py-1 text-sm border border-red-500 text-red-600 rounded-md hover:bg-red-50"
                          >
                            <X className="h-4 w-4 mr-1" />
                            Reject
                          </button>
                        </div>
                      )}
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
      </div>
    </div>
  );
};

export default HirerDashboard;