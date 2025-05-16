import { User, Quest } from '../types';

export const mockUsers: User[] = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    role: 'job-seeker',
    profilePicture: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    title: 'Frontend Developer',
    skills: ['React', 'TypeScript', 'Tailwind CSS'],
    interests: ['Web Development', 'UI/UX Design']
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane@techcorp.com',
    role: 'hirer',
    profilePicture: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    title: 'Talent Acquisition Manager',
    company: 'TechCorp',
  },
  {
    id: '3',
    name: 'Alex Johnson',
    email: 'alex@example.com',
    role: 'job-seeker',
    profilePicture: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    title: 'Full Stack Developer',
    skills: ['Node.js', 'React', 'MongoDB', 'Express'],
    interests: ['Backend Development', 'API Design']
  }
];

export const mockQuests: Quest[] = [
  {
    id: '1',
    title: 'Build a Responsive Landing Page',
    company: 'TechCorp',
    companyLogo: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?ixlib=rb-1.2.1&auto=format&fit=crop&w=128&h=128&q=80',
    description: 'Create a responsive landing page for our new product launch. The page should be optimized for all devices and include animations.',
    requirements: [
      'Use React and Tailwind CSS',
      'Implement responsive design',
      'Add smooth animations',
      'Ensure accessibility compliance'
    ],
    skills: ['React', 'Tailwind CSS', 'Responsive Design'],
    deadline: '2025-06-15',
    compensation: '$500',
    location: 'Remote',
    remote: true,
    postedBy: '2',
    postedAt: '2025-05-20',
    applicants: 12
  },
  {
    id: '2',
    title: 'Develop a REST API for E-commerce Platform',
    company: 'ShopWave',
    companyLogo: 'https://images.unsplash.com/photo-1614680376573-df3480f0c6ff?ixlib=rb-1.2.1&auto=format&fit=crop&w=128&h=128&q=80',
    description: 'Design and implement a RESTful API for our e-commerce platform. The API should handle product listings, user authentication, and order processing.',
    requirements: [
      'Use Node.js and Express',
      'Implement JWT authentication',
      'Create comprehensive documentation',
      'Write unit tests'
    ],
    skills: ['Node.js', 'Express', 'MongoDB', 'API Design'],
    deadline: '2025-07-01',
    compensation: '$800',
    location: 'New York, NY',
    remote: true,
    postedBy: '2',
    postedAt: '2025-05-18',
    applicants: 8
  },
  {
    id: '3',
    title: 'Mobile App UI Design',
    company: 'DesignHub',
    companyLogo: 'https://images.unsplash.com/photo-1567095761054-7a02e69e5c43?ixlib=rb-1.2.1&auto=format&fit=crop&w=128&h=128&q=80',
    description: 'Create a modern and intuitive UI design for our mobile application. The design should follow the latest trends and ensure a great user experience.',
    requirements: [
      'Create wireframes and mockups',
      'Design for both iOS and Android',
      'Provide design assets in Figma',
      'Include dark mode version'
    ],
    skills: ['UI/UX Design', 'Figma', 'Mobile Design'],
    deadline: '2025-06-20',
    compensation: '$650',
    location: 'San Francisco, CA',
    remote: true,
    postedBy: '2',
    postedAt: '2025-05-15',
    applicants: 15
  },
  {
    id: '4',
    title: 'Implement Authentication System',
    company: 'SecureTech',
    companyLogo: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?ixlib=rb-1.2.1&auto=format&fit=crop&w=128&h=128&q=80',
    description: 'Develop a secure authentication system with multi-factor authentication, password recovery, and user management features.',
    requirements: [
      'Implement OAuth 2.0',
      'Add two-factor authentication',
      'Create password recovery flow',
      'Ensure GDPR compliance'
    ],
    skills: ['Security', 'Authentication', 'Backend Development'],
    deadline: '2025-06-30',
    compensation: '$750',
    location: 'Remote',
    remote: true,
    postedBy: '2',
    postedAt: '2025-05-10',
    applicants: 6
  }
];