import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import axios from 'axios';
import { useNavigate } from "react-router-dom";



interface AuthContextType {
  currentUser: any;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (name: string, email: string, password: string, role: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const token = localStorage.getItem("token");

    if (storedUser && token) {
      setCurrentUser(JSON.parse(storedUser));
      setIsAuthenticated(true);
    }
  }, []);
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await axios.post("http://localhost:5000/api/auth/login", { email, password });
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user)); 

      setCurrentUser(response.data.user);
      setIsAuthenticated(true);
      const navigate = useNavigate();
      if (response.data.user.role === "hirer") {
        navigate("/hirer-dashboard");
      } else {
        navigate("/");
      }
      
      return true;
    } catch (error) {
      console.error("Login error:", (error as any).response ? (error as any).response.data : error);
      return false;
    }
  };

  const signup = async (name: string, email: string, password: string, role: string): Promise<boolean> => {
    try {
      console.log("🔍 Sending to backend:", { name, email, password, role }); // Debug log
      const response = await axios.post("http://localhost:5000/api/auth/signup", { name, email, password, role });
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));
      setCurrentUser(response.data.user);
      setIsAuthenticated(true);
      return true;
    } catch (error) {
      console.error("Signup error:", (error as any).response ? (error as any).response.data : error);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setCurrentUser(null);
    setIsAuthenticated(false);
    const navigate = useNavigate();
    navigate("/login");
  };

  return (
    <AuthContext.Provider value={{ currentUser, isAuthenticated, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
