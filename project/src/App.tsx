import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { DataProvider } from './contexts/DataContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { useAuth } from './contexts/AuthContext';
import Login from './components/Login';
import Register from './components/Register';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import PatientsList from './components/PatientsList';
import PatientManagement from './components/PatientManagement';
import MedicationProgramming from './components/MedicationProgramming';
import PatientKardex from './components/PatientKardex';
import PatientDetail from './components/PatientDetail';
import Billing from './components/Billing';
import Reports from './components/Reports';
import AdvancedReports from './components/AdvancedReports';
import UserProfile from './components/UserProfile';
import ErrorBoundary from './components/ErrorBoundary';

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  
  return user ? <>{children}</> : <Navigate to="/login" />;
};

const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  
  return !user ? <>{children}</> : <Navigate to="/dashboard" />;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={
        <PublicRoute>
          <Login />
        </PublicRoute>
      } />
      <Route path="/register" element={
        <PublicRoute>
          <Register />
        </PublicRoute>
      } />
      <Route path="/dashboard" element={
        <PrivateRoute>
          <Layout>
            <Dashboard />
          </Layout>
        </PrivateRoute>
      } />
      <Route path="/patients" element={
        <PrivateRoute>
          <Layout>
            <PatientsList />
          </Layout>
        </PrivateRoute>
      } />
      <Route path="/patient-management" element={
        <PrivateRoute>
          <Layout>
            <PatientManagement />
          </Layout>
        </PrivateRoute>
      } />
      <Route path="/patients/:id" element={
        <PrivateRoute>
          <Layout>
            <PatientDetail />
          </Layout>
        </PrivateRoute>
      } />
      <Route path="/patients/:id/kardex" element={
        <PrivateRoute>
          <Layout>
            <PatientKardex />
          </Layout>
        </PrivateRoute>
      } />
      <Route path="/medications" element={
        <PrivateRoute>
          <Layout>
            <MedicationProgramming />
          </Layout>
        </PrivateRoute>
      } />
      <Route path="/billing" element={
        <PrivateRoute>
          <Layout>
            <Billing />
          </Layout>
        </PrivateRoute>
      } />
      <Route path="/reports" element={
        <PrivateRoute>
          <Layout>
            <Reports />
          </Layout>
        </PrivateRoute>
      } />
      <Route path="/advanced-reports" element={
        <PrivateRoute>
          <Layout>
            <AdvancedReports />
          </Layout>
        </PrivateRoute>
      } />
      <Route path="/profile" element={
        <PrivateRoute>
          <Layout>
            <UserProfile />
          </Layout>
        </PrivateRoute>
      } />
      <Route path="/" element={<Navigate to="/dashboard" />} />
    </Routes>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <DataProvider>
            <Router>
              <div className="min-h-screen bg-gray-50 dark:bg-dark-900">
                <AppRoutes />
              </div>
            </Router>
          </DataProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;