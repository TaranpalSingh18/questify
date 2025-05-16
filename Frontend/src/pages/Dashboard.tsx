import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { PlusCircle, FileText, Users } from "lucide-react";

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
  response: string;
}

const HirerDashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [quests, setQuests] = useState<Quest[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [newQuest, setNewQuest] = useState({
    title: "",
    description: "",
    budget: "",
    deadline: ""
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

  const handlePostQuest = async () => {
    try {
      const questData = {
        title: newQuest.title,
        description: newQuest.description,
        budget: newQuest.budget ? parseFloat(newQuest.budget) : undefined,
        deadline: newQuest.deadline || undefined
      };
      
      const response = await axios.post("http://localhost:5000/api/quests", questData, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      
      setQuests([...quests, response.data]);
      setNewQuest({ title: "", description: "", budget: "", deadline: "" });
    } catch (error) {
      console.error("Error posting quest:", error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setNewQuest({ ...newQuest, [id]: value });
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

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
            <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); handlePostQuest(); }}>
              <div className="space-y-2">
                <label htmlFor="title" className="text-sm font-medium">
                  Quest Title
                </label>
                <input
                  id="title"
                  value={newQuest.title}
                  onChange={handleInputChange}
                  placeholder="Enter a descriptive title for your quest"
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="description" className="text-sm font-medium">
                  Quest Description
                </label>
                <textarea
                  id="description"
                  value={newQuest.description}
                  onChange={handleInputChange}
                  placeholder="Describe the requirements, deliverables, and any other important details"
                  rows={4}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="budget" className="text-sm font-medium">
                    Budget
                  </label>
                  <input
                    id="budget"
                    value={newQuest.budget}
                    onChange={handleInputChange}
                    placeholder="$"
                    type="number"
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="deadline" className="text-sm font-medium">
                    Deadline
                  </label>
                  <input
                    id="deadline"
                    value={newQuest.deadline}
                    onChange={handleInputChange}
                    type="date"
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </form>
          </div>
          <div className="border-t border-gray-200 p-6 flex justify-end">
            <button 
              onClick={handlePostQuest}
              className="inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 w-full sm:w-auto"
            >
              Post Quest
            </button>
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
                  <span className="text-sm text-gray-500">Completed Quests</span>
                  <span className="font-medium">0</span>
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
                      <div className="flex justify-between mb-2">
                        <h4 className="font-bold text-lg">{submission.questTitle}</h4>
                        <span className="text-sm bg-blue-50 text-blue-700 px-2 py-1 rounded-md">
                          Submitted by: {submission.submitterName}
                        </span>
                      </div>
                      <p className="mt-2 text-gray-600">{submission.response}</p>
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
      </div>
    </div>
  );
};

export default HirerDashboard;