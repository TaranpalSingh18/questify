import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { Quest, Submission } from '../types';
import { useAuth } from './AuthContext';

interface QuestContextType {
  quests: Quest[];
  submissions: Submission[];
  getQuestById: (id: string) => Quest | undefined;
  getSubmissionsByQuestId: (questId: string) => Submission[];
  getSubmissionsByUserId: (userId: string) => Submission[];
  createQuest: (quest: Omit<Quest, '_id' | 'postedAt' | 'applicants'>) => Promise<void>;
  submitToQuest: (submission: Omit<Submission, 'id' | 'submittedAt' | 'status'>) => Promise<void>;
  loading: boolean;
  error: string | null;
  refreshQuests: () => Promise<void>;
}

const QuestContext = createContext<QuestContextType | undefined>(undefined);

export const QuestProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [quests, setQuests] = useState<Quest[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { currentUser } = useAuth();

  const fetchQuests = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/quests', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) {
        throw new Error('Failed to fetch quests');
      }
      const data = await response.json();
      setQuests(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch quests');
    } finally {
      setLoading(false);
    }
  };

  const refreshQuests = async () => {
    setLoading(true);
    await fetchQuests();
  };

  useEffect(() => {
    fetchQuests();

    // Set up WebSocket connection for real-time updates
    const token = localStorage.getItem('token');
    if (!token) return;

    const ws = new WebSocket('ws://localhost:5000');

    ws.onopen = () => {
      // Send authentication message
      ws.send(JSON.stringify({
        type: 'auth',
        token: token
      }));
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      switch (data.type) {
        case 'CREATE':
          setQuests(prev => [...prev, data.quest]);
          break;
        case 'UPDATE':
          setQuests(prev => prev.map(quest => 
            quest._id === data.quest._id ? data.quest : quest
          ));
          break;
        case 'DELETE':
          setQuests(prev => prev.filter(quest => quest._id !== data.quest._id));
          break;
        case 'NOTIFICATION':
          // Handle notifications if needed
          break;
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    return () => {
      ws.close();
    };
  }, []);

  const getQuestById = (id: string): Quest | undefined => {
    return quests.find(quest => quest._id === id);
  };

  const getSubmissionsByQuestId = (questId: string): Submission[] => {
    return submissions.filter(submission => submission.questId === questId);
  };

  const getSubmissionsByUserId = (userId: string): Submission[] => {
    return submissions.filter(submission => submission.userId === userId);
  };

  const createQuest = async (quest: Omit<Quest, '_id' | 'postedAt' | 'applicants'>) => {
    try {
      const response = await fetch('http://localhost:5000/api/quests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(quest)
      });

      if (!response.ok) {
        throw new Error('Failed to create quest');
      }

      const newQuest = await response.json();
      setQuests(prev => [...prev, newQuest.quest]);
    } catch (error) {
      console.error('Error creating quest:', error);
      throw error;
    }
  };

  const submitToQuest = async (submission: Omit<Submission, 'id' | 'submittedAt' | 'status'>) => {
    try {
      const response = await fetch('http://localhost:5000/api/submissions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(submission)
      });

      if (!response.ok) {
        throw new Error('Failed to submit solution');
      }

      const newSubmission = await response.json();
      setSubmissions(prev => [...prev, newSubmission.submission]);
      
      // Update quest applicants count
      setQuests(quests.map(quest => 
        quest._id === submission.questId 
          ? { ...quest, applicants: (quest.applicants || 0) + 1 } 
          : quest
      ));
    } catch (error) {
      console.error('Error submitting solution:', error);
      throw error;
    }
  };

  return (
    <QuestContext.Provider value={{ 
      quests, 
      submissions, 
      getQuestById, 
      getSubmissionsByQuestId, 
      getSubmissionsByUserId, 
      createQuest, 
      submitToQuest,
      loading,
      error,
      refreshQuests
    }}>
      {children}
    </QuestContext.Provider>
  );
};

export const useQuests = (): QuestContextType => {
  const context = useContext(QuestContext);
  if (context === undefined) {
    throw new Error('useQuests must be used within a QuestProvider');
  }
  return context;
};