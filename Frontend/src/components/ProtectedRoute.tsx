import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // Adjust the path if needed

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { currentUser } = useAuth(); // Check if the user is authenticated

  return currentUser ? children : <Navigate to="/login" />;
};

export default ProtectedRoute;
