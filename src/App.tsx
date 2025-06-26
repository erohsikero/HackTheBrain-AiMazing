import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './components/HomePage';
import AuthPage from './components/AuthPage';
import UserDashboard from './components/UserDashboard';
import EnhancedAppointmentBooking from './components/EnhancedAppointmentBooking';
import CheckIn from './components/CheckIn';
import EnhancedChatBot from './components/EnhancedChatBot';
import SmartWaitlistDashboard from './components/SmartWaitlistDashboard';
import ImpactAnalytics from './components/ImpactAnalytics';
import PreRegistrationForm from './components/PreRegistrationForm';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-teal-50">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <UserDashboard />
            </ProtectedRoute>
          } />
          <Route path="/booking" element={
            <ProtectedRoute>
              <EnhancedAppointmentBooking />
            </ProtectedRoute>
          } />
          <Route path="/checkin" element={
            <ProtectedRoute>
              <CheckIn />
            </ProtectedRoute>
          } />
          <Route path="/chat" element={
            <ProtectedRoute>
              <EnhancedChatBot />
            </ProtectedRoute>
          } />
          <Route path="/staff-dashboard" element={<SmartWaitlistDashboard />} />
          <Route path="/analytics" element={<ImpactAnalytics />} />
          <Route path="/pre-registration" element={<PreRegistrationForm />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;