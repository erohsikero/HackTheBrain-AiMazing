import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, UserCheck, MessageCircle, QrCode, Clock, Stethoscope } from 'lucide-react';

const HomePage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-teal-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <Stethoscope className="w-12 h-12 text-blue-600 mr-3" />
            <h1 className="text-4xl font-bold text-gray-800">MH2 Dental Clinic</h1>
          </div>
          <p className="text-xl text-gray-600">What brings you in today?</p>
        </div>

        {/* Main Action Cards */}
        <div className="bg-white rounded-3xl shadow-xl p-8 mb-8">
          <div className="space-y-6">
            {/* Appointment Booking */}
            <button
              onClick={() => navigate('/booking')}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6 px-8 rounded-2xl text-xl font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-lg flex items-center justify-center space-x-3"
            >
              <Calendar className="w-6 h-6" />
              <span>Appointment Booking</span>
            </button>

            {/* Check In */}
            <button
              onClick={() => navigate('/checkin')}
              className="w-full bg-teal-600 hover:bg-teal-700 text-white py-6 px-8 rounded-2xl text-xl font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-lg flex items-center justify-center space-x-3"
            >
              <UserCheck className="w-6 h-6" />
              <span>Check In</span>
            </button>

            {/* ChatBot */}
            <div className="relative">
              <button
                onClick={() => navigate('/chat')}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-6 px-8 rounded-2xl text-xl font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-lg flex items-center justify-center space-x-3"
              >
                <MessageCircle className="w-6 h-6" />
                <span>Speak to enamAI ChatBot</span>
              </button>
            </div>
          </div>
        </div>

        {/* Additional Services */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">
            For other inquiries/services please refer to front desk
          </h3>
          <div className="flex items-center justify-center space-x-4 text-gray-600">
            <Clock className="w-5 h-5" />
            <span>Mon-Fri: 8:00 AM - 6:00 PM</span>
            <span>•</span>
            <span>Sat: 9:00 AM - 2:00 PM</span>
          </div>
        </div>

        {/* Quick Access to Dashboard for Staff */}
        <div className="mt-8 text-center">
          <button
            onClick={() => navigate('/dashboard')}
            className="text-blue-600 hover:text-blue-800 underline text-sm"
          >
            Staff Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default HomePage;