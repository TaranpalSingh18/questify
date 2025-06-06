export type UserRole = 'hirer' | 'job-seeker';

export interface User {
  _id: string;
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  profilePicture?: string;
  title?: string;
  company?: string;
  skills?: string[];
  interests?: string[];
}

export interface Quest {
  _id: string;
  title: string;
  company: string;
  companyLogo?: string;
  description: string;
  requirements: string[];
  skills: string[];
  deadline: string;
  compensation?: string;
  location: string;
  remote: boolean;
  postedBy: string;
  postedAt: string;
  applicants?: number;
}

export interface Submission {
  _id: string;
  questId: string;
  userId: string;
  videoDemo: string;
  githubLink: string;
  description: string;
  submittedAt: string;
  status: 'pending' | 'approved' | 'rejected';
}