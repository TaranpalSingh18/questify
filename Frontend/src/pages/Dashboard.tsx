import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { PlusCircle, FileText, Users, Building, Calendar, MapPin, DollarSign } from "lucide-react";
import { useQuests } from '../context/QuestContext';
import SkillSelector from '../components/SkillSelector';
import Navbar from '../components/Navbar';

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
}

interface Submission {
  _id: string;
  questId: string;
  userId: string;
  videoDemo: string;
  githubLink: string;
  description?: string;
  submittedAt: string;
  status: 'pending' | 'accepted' | 'rejected';
}

const Dashboard: React.FC = () => {
  const { currentUser, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { getSubmissionsByUserId, getQuestById } = useQuests();
  const [quests, setQuests] = useState<Quest[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [activeTab, setActiveTab] = useState("posted");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    company: "",
    description: "",
    requirements: [""],
    skills: [] as string[],
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
      const response = await fetch(`http://localhost:5000/api/submissions/user/${currentUser.id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch submissions');
      }
      const data = await response.json();
      setSubmissions(data);
    } catch (error) {
      console.error('Error fetching submissions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleRequirementChange = (index: number, value: string) => {
    const newRequirements = [...formData.requirements];
    newRequirements[index] = value;
    setFormData(prev => ({
      ...prev,
      requirements: newRequirements
    }));
  };

  const addRequirement = () => {
    setFormData(prev => ({
      ...prev,
      requirements: [...prev.requirements, ""]
    }));
  };

  const removeRequirement = (index: number) => {
    if (formData.requirements.length > 1) {
      const newRequirements = [...formData.requirements];
      newRequirements.splice(index, 1);
      setFormData(prev => ({
        ...prev,
        requirements: newRequirements
      }));
    }
  };

  const handlePostQuest = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // Validate required fields
      if (!formData.title || !formData.company || !formData.description || 
          !formData.deadline || !formData.location || formData.skills.length === 0) {
        throw new Error('Please fill in all required fields');
      }

      // Filter out empty requirements
      const filteredRequirements = formData.requirements.filter(req => req.trim() !== '');
      if (filteredRequirements.length === 0) {
        throw new Error('Please add at least one requirement');
      }

      if (!currentUser?.id) {
        throw new Error('User not authenticated');
      }

      const questData = {
        ...formData,
        requirements: filteredRequirements,
        postedBy: currentUser.id
      };

      const response = await fetch("http://localhost:5000/api/quests", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(questData)
      });

      if (!response.ok) {
        throw new Error('Failed to create quest');
      }

      const newQuest = await response.json();
      
      // Reset form
      setFormData({
        title: "",
        company: "",
        description: "",
        requirements: [""],
        skills: [],
        deadline: "",
        compensation: "",
        location: "",
        remote: true
      });

      // Refresh the page to show the new quest
      window.location.reload();
    } catch (error) {
      console.error("Error posting quest:", error);
      setError(error instanceof Error ? error.message : 'Failed to create quest');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="pt-24 pb-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="pt-24 pb-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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

            {error && (
              <div className="p-4 bg-red-50 border-l-4 border-red-400">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <form onSubmit={handlePostQuest} className="p-6 space-y-6">
              <div className="space-y-4">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                    Quest Title *
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="Enter a descriptive title for your quest"
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="company" className="block text-sm font-medium text-gray-700">
                    <div className="flex items-center">
                      <Building className="h-4 w-4 mr-1" />
                      <span>Company Name *</span>
                    </div>
                  </label>
                  <input
                    type="text"
                    id="company"
                    name="company"
                    value={formData.company}
                    onChange={handleInputChange}
                    placeholder="Enter your company name"
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                    Description *
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={4}
                    placeholder="Describe the requirements, deliverables, and any other important details"
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Requirements *
                  </label>
                  {formData.requirements.map((requirement, index) => (
                    <div key={index} className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={requirement}
                        onChange={(e) => handleRequirementChange(index, e.target.value)}
                        placeholder={`Requirement ${index + 1}`}
                        className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      <button
                        type="button"
                        onClick={() => removeRequirement(index)}
                        className="px-3 py-2 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-md border border-gray-300"
                        disabled={formData.requirements.length <= 1}
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addRequirement}
                    className="mt-2 text-sm text-blue-600 hover:text-blue-800"
                  >
                    + Add another requirement
                  </button>
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="deadline" className="block text-sm font-medium text-gray-700">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        <span>Deadline *</span>
                      </div>
                    </label>
                    <input
                      type="date"
                      id="deadline"
                      name="deadline"
                      value={formData.deadline}
                      onChange={handleInputChange}
                      min={new Date().toISOString().split('T')[0]}
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="compensation" className="block text-sm font-medium text-gray-700">
                      <div className="flex items-center">
                        <DollarSign className="h-4 w-4 mr-1" />
                        <span>Compensation</span>
                      </div>
                    </label>
                    <input
                      type="text"
                      id="compensation"
                      name="compensation"
                      value={formData.compensation}
                      onChange={handleInputChange}
                      placeholder="e.g., $500, $50/hour"
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-1" />
                      <span>Location *</span>
                    </div>
                  </label>
                  <input
                    type="text"
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    placeholder="e.g., San Francisco, CA"
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div className="flex items-center">
                  <input
                    id="remote"
                    name="remote"
                    type="checkbox"
                    checked={formData.remote}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="remote" className="ml-2 block text-sm text-gray-700">
                    This quest can be completed remotely
                  </label>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Creating...' : 'Post Quest'}
                </button>
              </div>
            </form>
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
                    <span className="text-sm text-gray-500">Completed Quests</span>
                    <span className="font-medium">0</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;