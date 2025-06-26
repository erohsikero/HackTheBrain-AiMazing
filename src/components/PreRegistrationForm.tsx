import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, FileText, Shield, AlertTriangle, CheckCircle } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

const PreRegistrationForm = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const appointmentId = searchParams.get('appointmentId');
  
  const [formData, setFormData] = useState({
    // Medical History
    allergies: '',
    medications: '',
    medicalConditions: '',
    previousDentalWork: '',
    lastDentalVisit: '',
    
    // Dental History
    brushingFrequency: '',
    flossingFrequency: '',
    dentalConcerns: '',
    painLevel: '0',
    
    // Insurance Details
    insuranceProvider: '',
    policyNumber: '',
    groupNumber: '',
    
    // Emergency Contact
    emergencyName: '',
    emergencyPhone: '',
    emergencyRelation: '',
    
    // Consent
    treatmentConsent: false,
    privacyConsent: false,
    communicationConsent: false
  });

  const [currentSection, setCurrentSection] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const validateSection = (section: number): boolean => {
    switch (section) {
      case 1:
        return !!(formData.lastDentalVisit && formData.brushingFrequency);
      case 2:
        return !!(formData.emergencyName && formData.emergencyPhone);
      case 3:
        return formData.treatmentConsent && formData.privacyConsent;
      default:
        return true;
    }
  };

  const nextSection = () => {
    if (validateSection(currentSection)) {
      setCurrentSection(prev => Math.min(prev + 1, 4));
    } else {
      toast.error('Please complete all required fields before continuing.');
    }
  };

  const prevSection = () => {
    setCurrentSection(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateSection(3)) {
      toast.error('Please complete all required fields and consent forms.');
      return;
    }

    setIsSubmitting(true);

    try {
      // Simulate saving pre-registration data
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast.success('Pre-registration completed successfully!');
      setCurrentSection(4);
      
      setTimeout(() => {
        navigate('/');
      }, 3000);
      
    } catch (error) {
      console.error('Error submitting pre-registration:', error);
      toast.error('Failed to submit pre-registration. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderSection = () => {
    switch (currentSection) {
      case 1:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Medical & Dental History</h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  When was your last dental visit? *
                </label>
                <select
                  name="lastDentalVisit"
                  required
                  value={formData.lastDentalVisit}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                >
                  <option value="">Select timeframe</option>
                  <option value="less-than-6-months">Less than 6 months ago</option>
                  <option value="6-12-months">6-12 months ago</option>
                  <option value="1-2-years">1-2 years ago</option>
                  <option value="more-than-2-years">More than 2 years ago</option>
                  <option value="never">Never</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  How often do you brush your teeth? *
                </label>
                <select
                  name="brushingFrequency"
                  required
                  value={formData.brushingFrequency}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                >
                  <option value="">Select frequency</option>
                  <option value="twice-daily">Twice daily</option>
                  <option value="once-daily">Once daily</option>
                  <option value="few-times-week">A few times a week</option>
                  <option value="rarely">Rarely</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Do you have any allergies? (medications, materials, etc.)
              </label>
              <textarea
                name="allergies"
                value={formData.allergies}
                onChange={handleInputChange}
                rows={3}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="Please list any known allergies..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Current medications
              </label>
              <textarea
                name="medications"
                value={formData.medications}
                onChange={handleInputChange}
                rows={3}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="Please list all current medications..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Medical conditions or concerns
              </label>
              <textarea
                name="medicalConditions"
                value={formData.medicalConditions}
                onChange={handleInputChange}
                rows={3}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="Diabetes, heart conditions, pregnancy, etc..."
              />
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current pain level (0-10)
                </label>
                <input
                  type="range"
                  name="painLevel"
                  min="0"
                  max="10"
                  value={formData.painLevel}
                  onChange={handleInputChange}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>No pain (0)</span>
                  <span className="font-medium">Current: {formData.painLevel}</span>
                  <span>Severe (10)</span>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dental concerns
                </label>
                <textarea
                  name="dentalConcerns"
                  value={formData.dentalConcerns}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="What brings you in today?"
                />
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Insurance & Emergency Contact</h2>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-start space-x-3">
                <Shield className="w-5 h-5 text-blue-600 mt-1" />
                <div>
                  <h3 className="font-semibold text-blue-800">Insurance Information</h3>
                  <p className="text-sm text-blue-700">
                    We accept CDCP and most private insurance plans. Provincial insurance is not accepted.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Insurance Provider
                </label>
                <input
                  type="text"
                  name="insuranceProvider"
                  value={formData.insuranceProvider}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="e.g., Blue Cross, Sun Life"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Policy Number
                </label>
                <input
                  type="text"
                  name="policyNumber"
                  value={formData.policyNumber}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Group Number
                </label>
                <input
                  type="text"
                  name="groupNumber"
                  value={formData.groupNumber}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>
            </div>

            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Emergency Contact</h3>
              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="emergencyName"
                    required
                    value={formData.emergencyName}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    name="emergencyPhone"
                    required
                    value={formData.emergencyPhone}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Relationship
                  </label>
                  <select
                    name="emergencyRelation"
                    value={formData.emergencyRelation}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  >
                    <option value="">Select relationship</option>
                    <option value="spouse">Spouse</option>
                    <option value="parent">Parent</option>
                    <option value="child">Child</option>
                    <option value="sibling">Sibling</option>
                    <option value="friend">Friend</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Consent & Authorization</h2>
            
            <div className="space-y-6">
              <div className="border border-gray-200 rounded-lg p-6">
                <label className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    name="treatmentConsent"
                    checked={formData.treatmentConsent}
                    onChange={handleInputChange}
                    className="mt-1 w-4 h-4 text-blue-600"
                    required
                  />
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-2">Treatment Consent *</h3>
                    <p className="text-sm text-gray-600">
                      I consent to the dental treatment recommended by the dentist. I understand that no guarantee 
                      has been made regarding the outcome of treatment. I acknowledge that I have been informed of 
                      the risks, benefits, and alternatives to the proposed treatment.
                    </p>
                  </div>
                </label>
              </div>

              <div className="border border-gray-200 rounded-lg p-6">
                <label className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    name="privacyConsent"
                    checked={formData.privacyConsent}
                    onChange={handleInputChange}
                    className="mt-1 w-4 h-4 text-blue-600"
                    required
                  />
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-2">Privacy & Information Consent *</h3>
                    <p className="text-sm text-gray-600">
                      I consent to the collection, use, and disclosure of my personal health information for the 
                      purposes of providing dental care, processing insurance claims, and clinic administration. 
                      I understand my rights regarding my personal information.
                    </p>
                  </div>
                </label>
              </div>

              <div className="border border-gray-200 rounded-lg p-6">
                <label className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    name="communicationConsent"
                    checked={formData.communicationConsent}
                    onChange={handleInputChange}
                    className="mt-1 w-4 h-4 text-blue-600"
                  />
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-2">Communication Consent</h3>
                    <p className="text-sm text-gray-600">
                      I consent to receive appointment reminders, treatment updates, and clinic communications 
                      via phone, email, or SMS. I can withdraw this consent at any time.
                    </p>
                  </div>
                </label>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="w-5 h-5 text-yellow-600 mt-1" />
                <div>
                  <h3 className="font-semibold text-yellow-800">Important Notice</h3>
                  <p className="text-sm text-yellow-700">
                    Please ensure all information provided is accurate and complete. Incomplete or inaccurate 
                    information may affect your treatment and insurance coverage.
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="text-center space-y-6">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-800">Pre-Registration Complete!</h2>
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <p className="text-green-800 mb-4">
                Thank you for completing your pre-registration forms. This will significantly speed up your check-in process.
              </p>
              <div className="text-sm text-green-700 space-y-2">
                <p><strong>Next Steps:</strong></p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Arrive 10 minutes before your appointment</li>
                  <li>Bring a valid ID and insurance card</li>
                  <li>Inform front desk that you've completed pre-registration</li>
                </ul>
              </div>
            </div>
            <p className="text-gray-600">
              Your information has been securely saved and will be available to our clinical team.
              You will be redirected to the home page shortly.
            </p>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-teal-50 p-4">
      <Toaster position="top-right" />
      
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center mb-8">
          <button
            onClick={() => navigate('/')}
            className="mr-4 p-2 rounded-full hover:bg-white hover:shadow-md transition-all duration-200"
          >
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </button>
          <div className="flex items-center space-x-3">
            <FileText className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Pre-Registration Forms</h1>
              <p className="text-gray-600">Complete your paperwork before your appointment</p>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        {currentSection < 4 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">Section {currentSection} of 3</span>
              <span className="text-sm font-medium text-gray-600">{Math.round((currentSection / 3) * 100)}% Complete</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(currentSection / 3) * 100}%` }}
              ></div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-xl p-8">
          {renderSection()}

          {/* Navigation Buttons */}
          {currentSection < 4 && (
            <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={prevSection}
                disabled={currentSection === 1}
                className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>
              
              {currentSection < 3 ? (
                <button
                  type="button"
                  onClick={nextSection}
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
                    <span>Complete Pre-Registration</span>
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

export default PreRegistrationForm;