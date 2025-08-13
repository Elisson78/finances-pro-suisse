import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import PrivateRoute from './components/common/PrivateRoute';
import { AuthProvider } from './contexts/AuthContext';
import DashboardHome from './pages/DashboardHome';
import Factures from './pages/Factures';
import Clients from './pages/Clients';
import ServicesPage from './pages/ServicesPage';
import Reports from './pages/Reports';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route 
            path="/dashboard" 
            element={
              <PrivateRoute>
                <DashboardPage />
              </PrivateRoute>
            } 
          >
            <Route index element={<DashboardHome />} />
            <Route path="factures" element={<Factures />} />
            <Route path="clients" element={<Clients />} />
            <Route path="services" element={<ServicesPage />} />
            <Route path="reports" element={<Reports />} />
          </Route>

        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;