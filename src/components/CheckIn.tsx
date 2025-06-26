import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, User, Calendar, FileText } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const CheckIn = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    appointmentTime: '',
    appointmentType: ''
  });

  useEffect(() => {
    if (user) {
      // Pre-fill form with user data
      setFormData(prev => ({
        ...prev,
        firstName: user.displayName?.split(' ')[0] || '',
        lastName: user.displayName?.split(' ')[1] || ''
      }));
    }
  }, [user]);

  const getCurrentTime = () => {
    return new Date().toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically verify the appointment and check the patient in
    alert('Check-in successful! Please have a seat and you will be called shortly.');
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-teal-50 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center mb-8">
          <button
            onClick={() => navigate('/dashboard')}
            className="mr-4 p-2 rounded-full hover:bg-white hover:shadow-md transition-all duration-200"
          >
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </button>
          <h1 className="text-3xl font-bold text-gray-800">Welcome to Dental AI Clinic</h1>
        </div>

        <div className="bg-white rounded-3xl shadow-xl p-8">
          {/* Check-in Time */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <Clock className="w-6 h-6 text-blue-600" />
              <h2 className="text-xl font-semibold text-gray-800">Check In Time: {getCurrentTime()}</h2>
            </div>
            <p className="text-gray-600">Welcome back, {user?.displayName?.split(' ')[0] || 'User'}!</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              {/* Personal Information */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">First Name *</label>
                  <input
                    type="text"
                    name="firstName"
                    required
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Last Name *</label>
                  <input
                    type="text"
                    name="lastName"
                    required
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth *</label>
                <input
                  type="date"
                  name="dateOfBirth"
                  required
                  value={formData.dateOfBirth}
                  onChange={handleInputChange}
                  className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Appointment Time *</label>
                <input
                  type="time"
                  name="appointmentTime"
                  required
                  value={formData.appointmentTime}
                  onChange={handleInputChange}
                  className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Appointment Type *</label>
                <select
                  name="appointmentType"
                  required
                  value={formData.appointmentType}
                  onChange={handleInputChange}
                  className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-lg"
                >
                  <option value="">Select appointment type</option>
                  <option value="Cleaning">Cleaning</option>
                  <option value="Exam">Exam</option>
                  <option value="Emergency">Emergency</option>
                  <option value="Treatment">Treatment</option>
                  <option value="Invisalign Consultant">Invisalign Consultant</option>
                  <option value="Denture Consultant">Denture Consultant</option>
                  <option value="Root Canal">Root Canal</option>
                  <option value="Extraction">Extraction</option>
                  <option value="Filling">Filling</option>
                  <option value="Crown/Bridge">Crown/Bridge</option>
                </select>
              </div>
            </div>

            {/* Instructions */}
            <div className="bg-blue-50 rounded-lg p-6 my-8">
              <div className="flex items-start space-x-3">
                <FileText className="w-5 h-5 text-blue-600 mt-1" />
                <div>
                  <p className="text-gray-700">
                    An email has previously been sent to you with our welcome form. 
                    Please fill it in and inform front desk once you are done.
                  </p>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-teal-600 hover:bg-teal-700 text-white py-4 px-8 rounded-2xl text-lg font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
            >
              Check In
            </button>
          </form>

          {/* Additional Information */}
          <div className="mt-6 text-center text-gray-600">
            <p className="text-sm">
              Please ensure all information is accurate. If you need to make any changes, 
              please speak with our front desk staff.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckIn;