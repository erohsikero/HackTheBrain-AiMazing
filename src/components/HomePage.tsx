import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, UserCheck, MessageCircle, Clock, Stethoscope, FileText, Brain, LogIn } from 'lucide-react';

const HomePage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-teal-50 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-teal-600 rounded-full flex items-center justify-center mr-4">
              <Stethoscope className="w-10 h-10 text-white" />
            </div>
            <div className="text-left">
              <h1 className="text-4xl font-bold text-gray-800">Dental AI Clinic</h1>
              <p className="text-lg text-blue-600 font-medium">AI-Powered Healthcare Access Optimizer</p>
            </div>
          </div>
          <p className="text-xl text-gray-600">What brings you in today?</p>
        </div>

        {/* Authentication Notice */}
        <div className="bg-blue-100 border border-blue-200 rounded-2xl p-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <LogIn className="w-6 h-6 text-blue-600" />
              <div>
                <h3 className="text-lg font-semibold text-blue-800">Sign In Required</h3>
                <p className="text-blue-700">Please sign in to access appointments, chat, and personalized features.</p>
              </div>
            </div>
            <button
              onClick={() => navigate('/auth')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              Sign In / Sign Up
            </button>
          </div>
        </div>

        {/* Main Action Cards */}
        <div className="bg-white rounded-3xl shadow-xl p-8 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Appointment Booking */}
            <button
              onClick={() => navigate('/auth')}
              className="bg-blue-600 hover:bg-blue-700 text-white py-6 px-8 rounded-2xl text-xl font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-lg flex items-center justify-center space-x-3"
            >
              <Calendar className="w-6 h-6" />
              <span>Smart Appointment Booking</span>
            </button>

            {/* Check In */}
            <button
              onClick={() => navigate('/auth')}
              className="bg-teal-600 hover:bg-teal-700 text-white py-6 px-8 rounded-2xl text-xl font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-lg flex items-center justify-center space-x-3"
            >
              <UserCheck className="w-6 h-6" />
              <span>Quick Check In</span>
            </button>

            {/* AI ChatBot */}
            <button
              onClick={() => navigate('/auth')}
              className="bg-green-600 hover:bg-green-700 text-white py-6 px-8 rounded-2xl text-xl font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-lg flex items-center justify-center space-x-3 md:col-span-2"
            >
              <div className="flex items-center space-x-2">
                <Brain className="w-6 h-6" />
                <MessageCircle className="w-6 h-6" />
              </div>
              <span>AI Triage & Chat with enamAI</span>
            </button>
          </div>
        </div>

        {/* Secondary Services */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Pre-Registration */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center space-x-3 mb-4">
              <FileText className="w-6 h-6 text-purple-600" />
              <h3 className="text-lg font-semibold text-gray-800">Pre-Registration Forms</h3>
            </div>
            <p className="text-gray-600 mb-4">
              Complete your paperwork online before your appointment to reduce wait times.
            </p>
            <button
              onClick={() => navigate('/pre-registration')}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              Complete Forms
            </button>
          </div>

          {/* Clinic Information */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center space-x-3 mb-4">
              <Clock className="w-6 h-6 text-orange-600" />
              <h3 className="text-lg font-semibold text-gray-800">Clinic Hours</h3>
            </div>
            <div className="text-gray-600 space-y-1">
              <p><strong>Mon-Fri:</strong> 8:00 AM - 6:00 PM</p>
              <p><strong>Saturday:</strong> 9:00 AM - 2:00 PM</p>
              <p><strong>Sunday:</strong> Closed</p>
              <p className="text-sm text-blue-600 mt-2">Emergency appointments available 24/7</p>
            </div>
          </div>
        </div>

        {/* AI Features Highlight */}
        <div className="bg-gradient-to-r from-blue-600 to-teal-600 rounded-2xl shadow-lg p-6 text-white text-center">
          <h3 className="text-xl font-bold mb-2">🚀 Powered by Advanced AI</h3>
          <p className="text-blue-100">
            Experience intelligent triage, smart scheduling, and reduced wait times through our AI-powered healthcare optimization system.
          </p>
        </div>
      </div>
    </div>
  );
};

export default HomePage;