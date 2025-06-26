import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './components/HomePage';
import EnhancedAppointmentBooking from './components/EnhancedAppointmentBooking';
import CheckIn from './components/CheckIn';
import EnhancedChatBot from './components/EnhancedChatBot';
import SmartWaitlistDashboard from './components/SmartWaitlistDashboard';
import ImpactAnalytics from './components/ImpactAnalytics';
import PreRegistrationForm from './components/PreRegistrationForm';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-teal-50">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/booking" element={<EnhancedAppointmentBooking />} />
          <Route path="/checkin" element={<CheckIn />} />
          <Route path="/chat" element={<EnhancedChatBot />} />
          <Route path="/dashboard" element={<SmartWaitlistDashboard />} />
          <Route path="/analytics" element={<ImpactAnalytics />} />
          <Route path="/pre-registration" element={<PreRegistrationForm />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;