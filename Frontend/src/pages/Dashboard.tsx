import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const HirerDashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [quests, setQuests] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [newQuest, setNewQuest] = useState({ title: "", description: "" });

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
      const response = await axios.post("http://localhost:5000/api/quests", newQuest, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setQuests([...quests, response.data]);
      setNewQuest({ title: "", description: "" });
    } catch (error) {
      console.error("Error posting quest:", error);
    }
  };

  return (
    <div className="p-6">
      <button onClick={() => navigate("/")} className="bg-gray-500 text-white px-4 py-2 rounded mb-4">
        ← Back to Home
      </button>
      <h2 className="text-2xl font-bold mb-4">Hirer Dashboard{currentUser && `- Welcome, ${currentUser.name}`}</h2>
      
      
      {/* Post a Quest */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold">Post a Quest</h3>
        <input
          type="text"
          placeholder="Quest Title"
          value={newQuest.title}
          onChange={(e) => setNewQuest({ ...newQuest, title: e.target.value })}
          className="border p-2 w-full mb-2"
        />
        <textarea
          placeholder="Quest Description"
          value={newQuest.description}
          onChange={(e) => setNewQuest({ ...newQuest, description: e.target.value })}
          className="border p-2 w-full mb-2"
        />
        <button onClick={handlePostQuest} className="bg-blue-500 text-white px-4 py-2">
          Post Quest
        </button>
      </div>
      
      {/* View Posted Quests */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold">My Posted Quests</h3>
        {quests.length > 0 ? (
          quests.map((quest) => (
            <div key={quest._id} className="border p-4 mb-2">
              <h4 className="font-bold">{quest.title}</h4>
              <p>{quest.description}</p>
            </div>
          ))
        ) : (
          <p>No quests posted yet.</p>
        )}
      </div>
      
      {/* View Submissions */}
      <div>
        <h3 className="text-lg font-semibold">Submissions on My Quests</h3>
        {submissions.length > 0 ? (
          submissions.map((submission) => (
            <div key={submission._id} className="border p-4 mb-2">
              <h4 className="font-bold">{submission.questTitle}</h4>
              <p>Submitted by: {submission.submitterName}</p>
              <p>{submission.response}</p>
            </div>
          ))
        ) : (
          <p>No submissions yet.</p>
        )}
      </div>
    </div>
  );
};

export default HirerDashboard;
