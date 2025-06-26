import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Calendar, MapPin, Mail, Phone, Shield, CheckCircle, AlertTriangle } from 'lucide-react';
import { saveAppointment, getUserProfile } from '../services/firebaseService';
import { useAuth } from '../contexts/AuthContext';
import toast, { Toaster } from 'react-hot-toast';

const EnhancedAppointmentBooking = () => {
  const navigate = useNavigate();
  const { user, userProfile, refreshUserProfile } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasExistingProfile, setHasExistingProfile] = useState(false);
  const [profileLoadError, setProfileLoadError] = useState(false);
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
    appointmentType: '',
    isEmergency: false,
    symptoms: '',
    preferredDate: '',
    preferredTime: ''
  });

  const appointmentTypes = [
    'Cleaning',
    'Exam',
    'Emergency',
    'Treatment'
  ];

  useEffect(() => {
    if (user) {
      // Pre-fill form with user data
      setFormData(prev => ({
        ...prev,
        email: user.email || '',
        firstName: user.displayName?.split(' ')[0] || '',
        lastName: user.displayName?.split(' ')[1] || ''
      }));

      // Check if user has existing profile data
      if (userProfile && userProfile.street && userProfile.phone) {
        // User has complete profile, pre-fill all data and skip to step 4
        setFormData(prev => ({
          ...prev,
          firstName: userProfile.firstName || prev.firstName,
          lastName: userProfile.lastName || prev.lastName,
          preferredName: userProfile.preferredName || '',
          dateOfBirth: userProfile.dateOfBirth || '',
          street: userProfile.street || '',
          city: userProfile.city || '',
          province: userProfile.province || '',
          postalCode: userProfile.postalCode || '',
          phone: userProfile.phone || '',
          hasInsurance: userProfile.hasInsurance || ''
        }));
        setHasExistingProfile(true);
        setCurrentStep(4); // Skip directly to appointment details
        toast.success('Welcome back! We\'ve pre-filled your information.');
      } else {
        // Try to refresh user profile
        refreshUserProfile().catch(() => {
          setProfileLoadError(true);
          console.log('Could not load user profile, continuing with manual entry.');
        });
      }
    }
  }, [user, userProfile, refreshUserProfile]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    });
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!(formData.firstName && formData.lastName && formData.dateOfBirth);
      case 2:
        return !!(formData.street && formData.city && formData.province && formData.postalCode);
      case 3:
        return !!(formData.email && formData.phone);
      case 4:
        return !!(formData.appointmentType);
      default:
        return true;
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 5));
    } else {
      toast.error('Please fill in all required fields before continuing.');
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateStep(4)) {
      toast.error('Please complete all required fields.');
      return;
    }

    setIsSubmitting(true);

    try {
      // Determine priority based on emergency status and appointment type
      let priority = 'low';
      let urgencyLevel = 'routine';
      let estimatedWaitTime = 90;

      if (formData.isEmergency || formData.appointmentType === 'Emergency') {
        priority = 'emergency';
        urgencyLevel = 'emergency';
        estimatedWaitTime = 10;
      } else if (formData.appointmentType === 'Treatment') {
        priority = 'medium';
        urgencyLevel = 'soon';
        estimatedWaitTime = 45;
      } else {
        priority = 'low';
        urgencyLevel = 'routine';
        estimatedWaitTime = 90;
      }

      const appointmentData = {
        ...formData,
        userId: user?.uid,
        status: 'scheduled',
        priority,
        urgencyLevel,
        estimatedWaitTime
      };

      const appointmentId = await saveAppointment(appointmentData);
      
      toast.success('Appointment request submitted successfully!');
      setCurrentStep(5);
      
      // Auto-redirect after showing success
      setTimeout(() => {
        navigate('/dashboard');
      }, 3000);
      
    } catch (error) {
      console.error('Error submitting appointment:', error);
      toast.error('Failed to submit appointment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Personal Information</h2>
            
            {profileLoadError && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="w-5 h-5 text-yellow-600" />
                  <span className="text-yellow-800 font-medium">
                    We couldn't load your saved profile information. Please enter your details below.
                  </span>
                </div>
              </div>
            )}
            
            <div className="grid md:grid-cols-2 gap-6">
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
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="flex items-center space-x-2 mb-6">
              <MapPin className="w-6 h-6 text-blue-600" />
              <h2 className="text-2xl font-bold text-gray-800">Address Information</h2>
            </div>
            
            <div className="space-y-4">
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
        );

      case 3:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Contact & Insurance</h2>
            
            <div className="grid md:grid-cols-2 gap-6">
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

            <div>
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
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="flex items-center space-x-2 mb-6">
              <Calendar className="w-6 h-6 text-blue-600" />
              <h2 className="text-2xl font-bold text-gray-800">Appointment Details</h2>
            </div>

            {hasExistingProfile && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-green-800 font-medium">
                    Welcome back! We've pre-filled your information from your profile.
                  </span>
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Appointment Type *</label>
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4">Is this an emergency?</label>
              <div className="flex space-x-6">
                <label className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                  <input
                    type="radio"
                    name="isEmergency"
                    value="true"
                    checked={formData.isEmergency === true}
                    onChange={(e) => setFormData(prev => ({ ...prev, isEmergency: e.target.value === 'true' }))}
                    className="w-4 h-4 text-red-600"
                  />
                  <span className="font-medium text-red-600">Yes - Emergency</span>
                </label>
                <label className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                  <input
                    type="radio"
                    name="isEmergency"
                    value="false"
                    checked={formData.isEmergency === false}
                    onChange={(e) => setFormData(prev => ({ ...prev, isEmergency: e.target.value === 'true' }))}
                    className="w-4 h-4 text-green-600"
                  />
                  <span className="font-medium text-green-600">No - Regular appointment</span>
                </label>
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Emergency appointments are for severe pain, trauma, or urgent dental issues requiring immediate attention.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Describe your symptoms or reason for visit (Optional)
              </label>
              <textarea
                name="symptoms"
                value={formData.symptoms}
                onChange={handleInputChange}
                rows={4}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="Please describe any pain, discomfort, or specific concerns..."
              />
            </div>
          </div>
        );

      case 5:
        return (
          <div className="text-center space-y-6">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-800">Appointment Request Submitted!</h2>
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <p className="text-green-800 mb-4">
                Thank you, {formData.firstName}! Your appointment request has been successfully submitted and processed by our AI scheduling system.
              </p>
              <div className="text-sm text-green-700 space-y-2">
                <p><strong>Appointment Type:</strong> {formData.appointmentType}</p>
                <p><strong>Emergency:</strong> {formData.isEmergency ? 'Yes' : 'No'}</p>
                <p><strong>Contact:</strong> {formData.email}</p>
              </div>
            </div>
            <p className="text-gray-600">
              Our AI system has automatically assigned you to the best available time slot based on your needs. 
              You can view your appointment details in your dashboard.
            </p>
            <button
              onClick={() => navigate('/dashboard')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
            >
              View My Dashboard
            </button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-teal-50 p-4">
      <Toaster position="top-right" />
      
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center mb-8">
          <button
            onClick={() => navigate('/dashboard')}
            className="mr-4 p-2 rounded-full hover:bg-white hover:shadow-md transition-all duration-200"
          >
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </button>
          <h1 className="text-3xl font-bold text-gray-800">Dental AI Clinic - Smart Appointment Booking</h1>
        </div>

        {/* Progress Bar */}
        {currentStep < 5 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">
                {hasExistingProfile && currentStep === 4 ? 'Appointment Details' : `Step ${currentStep} of 4`}
              </span>
              <span className="text-sm font-medium text-gray-600">
                {hasExistingProfile && currentStep === 4 ? '100% Complete' : `${Math.round((currentStep / 4) * 100)}% Complete`}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: hasExistingProfile && currentStep === 4 ? '100%' : `${(currentStep / 4) * 100}%` }}
              ></div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-xl p-8">
          {renderStep()}

          {/* Navigation Buttons */}
          {currentStep < 5 && (
            <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={prevStep}
                disabled={currentStep === 1 || (hasExistingProfile && currentStep === 4)}
                className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>
              
              {currentStep < 4 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
                >
                  Next
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-8 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg font-semibold transition-colors flex items-center space-x-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <span>Submit Appointment Request</span>
                  )}
                </button>
              )}
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default EnhancedAppointmentBooking;