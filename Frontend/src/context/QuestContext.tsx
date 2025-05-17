import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { Quest, Submission } from '../types';
import { mockQuests } from '../data/mockData';

interface QuestContextType {
  quests: Quest[];
  submissions: Submission[];
  getQuestById: (id: string) => Quest | undefined;
  getSubmissionsByQuestId: (questId: string) => Submission[];
  getSubmissionsByUserId: (userId: string) => Submission[];
  createQuest: (quest: Omit<Quest, '_id' | 'postedAt' | 'applicants'>) => void;
  submitToQuest: (submission: Omit<Submission, 'id' | 'submittedAt' | 'status'>) => void;
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

  const fetchQuests = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/quests');
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
    const ws = new WebSocket('ws://localhost:5000');

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      switch (data.type) {
        case 'NEW_QUEST':
          setQuests(prev => [...prev, data.quest]);
          break;
        case 'QUEST_UPDATED':
          setQuests(prev => prev.map(quest => 
            quest._id === data.quest._id ? data.quest : quest
          ));
          break;
        case 'QUEST_DELETED':
          setQuests(prev => prev.filter(quest => quest._id !== data.questId));
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

  const createQuest = (quest: Omit<Quest, '_id' | 'postedAt' | 'applicants'>) => {
    const newQuest: Quest = {
      ...quest,
      _id: `${quests.length + 1}`,
      postedAt: new Date().toISOString(),
      applicants: 0
    };
    setQuests([...quests, newQuest]);
  };

  const submitToQuest = (submission: Omit<Submission, 'id' | 'submittedAt' | 'status'>) => {
    const newSubmission: Submission = {
      ...submission,
      id: `${submissions.length + 1}`,
      submittedAt: new Date().toISOString(),
      status: 'pending'
    };
    setSubmissions([...submissions, newSubmission]);
    
    // Update quest applicants count
    setQuests(quests.map(quest => 
      quest.id === submission.questId 
        ? { ...quest, applicants: (quest.applicants || 0) + 1 } 
        : quest
    ));
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