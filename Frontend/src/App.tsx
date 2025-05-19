import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { QuestProvider } from './context/QuestContext';
import { WalletContextProvider } from './context/WalletContext';
import AppRoutes from './routes';

const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <QuestProvider>
          <WalletContextProvider>
            <AppRoutes />
          </WalletContextProvider>
        </QuestProvider>
      </AuthProvider>
    </Router>
  );
};

export default App;