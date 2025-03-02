import Dashboard from './pages/Dashboard';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { QuestProvider } from './context/QuestContext';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import QuestDetailPage from './pages/QuestDetailPage';
import CreateQuestPage from './pages/CreateQuestPage';
import ProfilePage from './pages/ProfilePage';
import ProtectedRoute from './components/ProtectedRoute';
import HirerDashboard from "./pages/HirerDashboard";

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
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/hirer-dashboard" element={<HirerDashboard />} />

      
          </Routes>
        </QuestProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;