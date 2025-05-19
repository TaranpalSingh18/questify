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
import Dashboard from './pages/Dashboard';
import NotificationsPage from './pages/NotificationsPage';
import ProtectedRoute from './components/ProtectedRoute';
import HirerSubmissionsPage from './pages/HirerSubmissionsPage';

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
            <Route path="/create-quest" element={<ProtectedRoute><CreateQuestPage /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
            <Route path="/submissions" element={<ProtectedRoute><HirerSubmissionsPage /></ProtectedRoute>} />
          </Routes>
        </QuestProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;