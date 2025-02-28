import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { QuestProvider } from './context/QuestContext';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import QuestDetailPage from './pages/QuestDetailPage';
import CreateQuestPage from './pages/CreateQuestPage';
import ProfilePage from './pages/ProfilePage';

function App() {
  return (
    <Router>
      <AuthProvider>
        <QuestProvider>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/quest/:id" element={<QuestDetailPage />} />
            <Route path="/create-quest" element={<CreateQuestPage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Routes>
        </QuestProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;