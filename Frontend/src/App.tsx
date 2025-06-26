import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './components/HomePage';
import AppointmentBooking from './components/AppointmentBooking';
import CheckIn from './components/CheckIn';
import ChatBot from './components/ChatBot';
import WaitlistDashboard from './components/WaitlistDashboard';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-teal-50">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/booking" element={<AppointmentBooking />} />
          <Route path="/checkin" element={<CheckIn />} />
          <Route path="/chat" element={<ChatBot />} />
          <Route path="/dashboard" element={<WaitlistDashboard />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;