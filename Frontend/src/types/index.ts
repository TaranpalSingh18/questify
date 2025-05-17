export interface Quest {
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

export interface Submission {
  _id: string;
  questId: string;
  userId: string;
  videoDemo: string;
  githubLink: string;
  description?: string;
  submittedAt: string;
  status: 'pending' | 'accepted' | 'rejected';
} 