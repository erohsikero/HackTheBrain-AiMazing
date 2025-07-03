import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Calendar, MapPin, Mail, Phone, Shield } from 'lucide-react';

const AppointmentBooking = () => {
  const navigate = useNavigate();
  const [patientType, setPatientType] = useState('new');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    preferredName: '',
    dateOfBirth: '',
    street: '',
    city: '',
    province: '',
    postalCode: '',
    email: '',
    phone: '',
    hasInsurance: '',
    appointmentType: ''
  });

  const appointmentTypes = [
    'Cleaning',
    'Exam',
    'Emergency',
    'Treatment'
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically submit to your backend API
    alert('Appointment request submitted! You will receive a confirmation email shortly.');
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-teal-50 p-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center mb-8">
          <button
            onClick={() => navigate('/')}
            className="mr-4 p-2 rounded-full hover:bg-white hover:shadow-md transition-all duration-200"
          >
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </button>
          <h1 className="text-3xl font-bold text-gray-800">AI Dental Clinic Appointment Booking</h1>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-xl p-8">
          {/* Patient Type Selection */}
          <div className="mb-8">
            <div className="flex items-center space-x-4 mb-6">
              <User className="w-6 h-6 text-blue-600" />
              <span className="text-lg font-semibold text-gray-800">I am a...</span>
            </div>
            <div className="flex space-x-4">
              <button
                type="button"
                onClick={() => setPatientType('new')}
                className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
                  patientType === 'new'
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                New Patient
              </button>
              <button
                type="button"
                onClick={() => setPatientType('returning')}
                className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
                  patientType === 'returning'
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Returning Patient
              </button>
            </div>
          </div>

          {/* Personal Information */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">First Name *</label>
              <input
                type="text"
                name="firstName"
                required
                value={formData.firstName}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
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
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Name</label>
              <input
                type="text"
                name="preferredName"
                value={formData.preferredName}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth *</label>
              <input
                type="date"
                name="dateOfBirth"
                required
                value={formData.dateOfBirth}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>
          </div>

          {/* Address Information */}
          <div className="mb-8">
            <div className="flex items-center space-x-2 mb-4">
              <MapPin className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-800">Home Address</h3>
            </div>
            <div className="grid gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Street Address *</label>
                <input
                  type="text"
                  name="street"
                  required
                  value={formData.street}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">City *</label>
                  <input
                    type="text"
                    name="city"
                    required
                    value={formData.city}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Province *</label>
                  <select
                    name="province"
                    required
                    value={formData.province}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  >
                    <option value="">Select</option>
                    <option value="ON">Ontario</option>
                    <option value="QC">Quebec</option>
                    <option value="BC">British Columbia</option>
                    <option value="AB">Alberta</option>
                    <option value="MB">Manitoba</option>
                    <option value="SK">Saskatchewan</option>
                    <option value="NS">Nova Scotia</option>
                    <option value="NB">New Brunswick</option>
                    <option value="NL">Newfoundland and Labrador</option>
                    <option value="PE">Prince Edward Island</option>
                    <option value="NT">Northwest Territories</option>
                    <option value="NU">Nunavut</option>
                    <option value="YT">Yukon</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Postal Code *</label>
                  <input
                    type="text"
                    name="postalCode"
                    required
                    value={formData.postalCode}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <Mail className="w-4 h-4 text-blue-600" />
                <label className="block text-sm font-medium text-gray-700">Email Address *</label>
              </div>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <Phone className="w-4 h-4 text-blue-600" />
                <label className="block text-sm font-medium text-gray-700">Phone Number *</label>
              </div>
              <input
                type="tel"
                name="phone"
                required
                value={formData.phone}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>
          </div>

          {/* Insurance Information */}
          <div className="mb-8">
            <div className="flex items-center space-x-2 mb-4">
              <Shield className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-800">Do you have insurance?</h3>
            </div>
            <div className="flex space-x-6">
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="hasInsurance"
                  value="yes"
                  checked={formData.hasInsurance === 'yes'}
                  onChange={handleInputChange}
                  className="w-4 h-4 text-blue-600"
                />
                <span>Yes</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="hasInsurance"
                  value="no"
                  checked={formData.hasInsurance === 'no'}
                  onChange={handleInputChange}
                  className="w-4 h-4 text-blue-600"
                />
                <span>No</span>
              </label>
            </div>
          </div>

          {/* Appointment Type */}
          <div className="mb-8">
            <div className="flex items-center space-x-2 mb-4">
              <Calendar className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-800">What is your appointment for? *</h3>
            </div>
            <select
              name="appointmentType"
              required
              value={formData.appointmentType}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            >
              <option value="">Select appointment type</option>
              {appointmentTypes.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 px-8 rounded-2xl text-lg font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
          >
            Book Appointment
          </button>

          <p className="text-sm text-gray-600 mt-4 text-center">
            You will receive a confirmation email with your appointment details and any pre-visit instructions.
          </p>
        </form>
      </div>
    </div>
  );
};

export default AppointmentBooking;