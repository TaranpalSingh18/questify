import React, { createContext, useState, useContext, ReactNode } from 'react';
import { Quest, Submission } from '../types';
import { mockQuests } from '../data/mockData';

interface QuestContextType {
  quests: Quest[];
  submissions: Submission[];
  getQuestById: (id: string) => Quest | undefined;
  getSubmissionsByQuestId: (questId: string) => Submission[];
  getSubmissionsByUserId: (userId: string) => Submission[];
  createQuest: (quest: Omit<Quest, 'id' | 'postedAt' | 'applicants'>) => void;
  submitToQuest: (submission: Omit<Submission, 'id' | 'submittedAt' | 'status'>) => void;
}

const QuestContext = createContext<QuestContextType | undefined>(undefined);

export const QuestProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [quests, setQuests] = useState<Quest[]>(mockQuests);
  const [submissions, setSubmissions] = useState<Submission[]>([]);

  const getQuestById = (id: string): Quest | undefined => {
    return quests.find(quest => quest.id === id);
  };

  const getSubmissionsByQuestId = (questId: string): Submission[] => {
    return submissions.filter(submission => submission.questId === questId);
  };

  const getSubmissionsByUserId = (userId: string): Submission[] => {
    return submissions.filter(submission => submission.userId === userId);
  };

  const createQuest = (quest: Omit<Quest, 'id' | 'postedAt' | 'applicants'>) => {
    const newQuest: Quest = {
      ...quest,
      id: `${quests.length + 1}`,
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
      submitToQuest 
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