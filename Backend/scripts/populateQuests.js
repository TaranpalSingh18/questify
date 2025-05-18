const mongoose = require('mongoose');
const Quest = require('../src/models/Quest');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/questify')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Could not connect to MongoDB:', err));

// Demo quests data
const demoQuests = [
  {
    title: "Build a React Native Mobile App",
    company: "TechStart Inc.",
    companyLogo: "https://logo.clearbit.com/techstart.com",
    description: "We need a skilled developer to create a cross-platform mobile app using React Native. The app should include user authentication, real-time data synchronization, and offline capabilities.",
    requirements: [
      "3+ years of React Native experience",
      "Experience with Redux or similar state management",
      "Knowledge of iOS and Android development principles",
      "Strong understanding of RESTful APIs"
    ],
    skills: ["React Native", "JavaScript", "TypeScript", "Redux", "Mobile Development"],
    deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    compensation: "$5000",
    location: "San Francisco, CA",
    remote: true,
    postedBy: "65f1234567890123456789ab", // Replace with an actual user ID from your database
    applicants: 0
  },
  {
    title: "Develop an AI-Powered Chatbot",
    company: "AInnova Labs",
    companyLogo: "https://logo.clearbit.com/ainnovalabs.com",
    description: "Looking for an AI engineer to develop a sophisticated chatbot using natural language processing. The chatbot should be able to handle customer inquiries and provide relevant responses.",
    requirements: [
      "Experience with NLP libraries",
      "Python programming expertise",
      "Knowledge of machine learning frameworks",
      "Background in conversational AI"
    ],
    skills: ["Python", "NLP", "Machine Learning", "TensorFlow", "PyTorch"],
    deadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000), // 45 days from now
    compensation: "$7500",
    location: "Boston, MA",
    remote: true,
    postedBy: "65f1234567890123456789ab", // Replace with an actual user ID from your database
    applicants: 0
  },
  {
    title: "Design and Implement a Microservices Architecture",
    company: "CloudScale Solutions",
    companyLogo: "https://logo.clearbit.com/cloudscale.com",
    description: "We're seeking a senior backend developer to design and implement a scalable microservices architecture. The project involves breaking down a monolithic application into microservices.",
    requirements: [
      "Experience with microservices architecture",
      "Proficiency in Docker and Kubernetes",
      "Knowledge of cloud platforms (AWS/Azure/GCP)",
      "Strong background in API design"
    ],
    skills: ["Microservices", "Docker", "Kubernetes", "Node.js", "AWS"],
    deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days from now
    compensation: "$10000",
    location: "Seattle, WA",
    remote: false,
    postedBy: "65f1234567890123456789ab", // Replace with an actual user ID from your database
    applicants: 0
  }
];

// Function to insert quests
async function populateQuests() {
  try {
    // Clear existing quests
    await Quest.deleteMany({});
    
    // Insert demo quests
    const insertedQuests = await Quest.insertMany(demoQuests);
    console.log('Demo quests inserted successfully:', insertedQuests);
    
    // Close the connection
    await mongoose.connection.close();
    console.log('Database connection closed');
  } catch (error) {
    console.error('Error populating quests:', error);
    await mongoose.connection.close();
  }
}

// Run the population script
populateQuests(); 