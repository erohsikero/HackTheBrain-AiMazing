import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, MessageCircle, User, LogOut, Clock, MapPin, Phone, AlertTriangle, CheckCircle, FileText, Camera, Edit, X } from 'lucide-react';
import { getUserAppointments, getUserChatHistory, updateAppointmentStatus, updatePatientStatus } from '../services/firebaseService';
import { useAuth } from '../contexts/AuthContext';
import toast, { Toaster } from 'react-hot-toast';

interface Appointment {
  id: string;
  appointmentType: string;
  urgencyLevel: string;
  priority: string;
  status: string;
  createdAt: any;
  scheduledDate?: string;
  scheduledTime?: string;
  clinicName?: string;
  clinicAddress?: string;
  clinicPhone?: string;
  estimatedWaitTime: number;
}

interface ChatSession {
  id: string;
  sessionId: string;
  messages: any[];
  lastActivity: any;
  triageResults?: any[];
}

const UserDashboard = () => {
  const navigate = useNavigate();
  const { user, userProfile, signOutUser } = useAuth();
  const [activeTab, setActiveTab] = useState('appointments');
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [chatHistory, setChatHistory] = useState<ChatSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [rescheduleData, setRescheduleData] = useState({
    preferredDate: '',
    preferredTime: '',
    reason: ''
  });

  useEffect(() => {
    if (user) {
      loadUserData(user.uid);
    }
  }, [user]);

  const loadUserData = async (userId: string) => {
    setIsLoading(true);
    try {
      const [userAppointments, userChats] = await Promise.all([
        getUserAppointments(userId),
        getUserChatHistory(userId)
      ]);

      setAppointments(userAppointments);
      setChatHistory(userChats);
    } catch (error) {
      console.error('Error loading user data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOutUser();
      toast.success('Signed out successfully');
      navigate('/');
    } catch (error) {
      toast.error('Failed to sign out');
    }
  };

  const handleConfirmAppointment = async (appointmentId: string) => {
    try {
      await updateAppointmentStatus(appointmentId, 'confirmed');
      
      // Update local state
      setAppointments(prev => 
        prev.map(apt => 
          apt.id === appointmentId 
            ? { ...apt, status: 'confirmed' }
            : apt
        )
      );
      
      toast.success('Appointment confirmed successfully!');
    } catch (error) {
      console.error('Error confirming appointment:', error);
      toast.error('Failed to confirm appointment. Please try again.');
    }
  };

  const handleRescheduleRequest = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setRescheduleData({
      preferredDate: '',
      preferredTime: '',
      reason: ''
    });
    setShowRescheduleModal(true);
  };

  const submitRescheduleRequest = async () => {
    if (!selectedAppointment || !rescheduleData.preferredDate || !rescheduleData.preferredTime) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      // Update appointment with reschedule request
      await updatePatientStatus(selectedAppointment.id, 'reschedule-requested', {
        rescheduleRequest: {
          preferredDate: rescheduleData.preferredDate,
          preferredTime: rescheduleData.preferredTime,
          reason: rescheduleData.reason,
          requestedAt: new Date().toISOString()
        }
      });

      // Update local state
      setAppointments(prev => 
        prev.map(apt => 
          apt.id === selectedAppointment.id 
            ? { ...apt, status: 'reschedule-requested' }
            : apt
        )
      );

      toast.success('Reschedule request submitted! Our team will contact you shortly.');
      setShowRescheduleModal(false);
      setSelectedAppointment(null);
    } catch (error) {
      console.error('Error submitting reschedule request:', error);
      toast.error('Failed to submit reschedule request. Please try again.');
    }
  };

  const handleCancelAppointment = async (appointmentId: string) => {
    if (!confirm('Are you sure you want to cancel this appointment?')) {
      return;
    }

    try {
      await updateAppointmentStatus(appointmentId, 'cancelled');
      
      // Update local state
      setAppointments(prev => 
        prev.map(apt => 
          apt.id === appointmentId 
            ? { ...apt, status: 'cancelled' }
            : apt
        )
      );
      
      toast.success('Appointment cancelled successfully');
    } catch (error) {
      console.error('Error cancelling appointment:', error);
      toast.error('Failed to cancel appointment. Please try again.');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'reschedule-requested': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-purple-100 text-purple-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'reschedule-requested': return 'Reschedule Requested';
      default: return status.charAt(0).toUpperCase() + status.slice(1);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'emergency': return 'text-red-600';
      case 'high': return 'text-orange-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const renderAppointments = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">My Appointments</h2>
        <button
          onClick={() => navigate('/booking')}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
        >
          <Calendar className="w-4 h-4" />
          <span>Book New Appointment</span>
        </button>
      </div>

      {appointments.length === 0 ? (
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">No Appointments Yet</h3>
          <p className="text-gray-500 mb-4">Book your first appointment to get started with AI-powered dental care.</p>
          <button
            onClick={() => navigate('/booking')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Book Appointment
          </button>
        </div>
      ) : (
        <div className="grid gap-6">
          {appointments.map((appointment) => (
            <div key={appointment.id} className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${
                    appointment.priority === 'emergency' ? 'bg-red-500' :
                    appointment.priority === 'high' ? 'bg-orange-500' :
                    appointment.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                  }`}></div>
                  <h3 className="text-lg font-semibold text-gray-800">{appointment.appointmentType}</h3>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(appointment.status)}`}>
                  {getStatusText(appointment.status)}
                </span>
              </div>

              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Clock className="w-4 h-4" />
                    <span>Urgency: <span className={`font-medium ${getPriorityColor(appointment.priority)}`}>
                      {appointment.urgencyLevel || appointment.priority}
                    </span></span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span>Requested: {formatDate(appointment.createdAt)}</span>
                  </div>
                  {appointment.scheduledDate && (
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <CheckCircle className="w-4 h-4" />
                      <span>Scheduled: {appointment.scheduledDate} at {appointment.scheduledTime}</span>
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  {appointment.clinicName && (
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <MapPin className="w-4 h-4" />
                      <span>{appointment.clinicName}</span>
                    </div>
                  )}
                  {appointment.clinicAddress && (
                    <div className="text-sm text-gray-500 ml-6">
                      {appointment.clinicAddress}
                    </div>
                  )}
                  {appointment.clinicPhone && (
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Phone className="w-4 h-4" />
                      <span>{appointment.clinicPhone}</span>
                    </div>
                  )}
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Clock className="w-4 h-4" />
                    <span>Est. Wait: {appointment.estimatedWaitTime} min</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3">
                {appointment.status === 'scheduled' && (
                  <>
                    <button 
                      onClick={() => handleConfirmAppointment(appointment.id)}
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2"
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span>Confirm Appointment</span>
                    </button>
                    <button 
                      onClick={() => handleRescheduleRequest(appointment)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2"
                    >
                      <Edit className="w-4 h-4" />
                      <span>Reschedule</span>
                    </button>
                    <button 
                      onClick={() => handleCancelAppointment(appointment.id)}
                      className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                      Cancel
                    </button>
                  </>
                )}
                
                {appointment.status === 'confirmed' && (
                  <>
                    <button 
                      onClick={() => handleRescheduleRequest(appointment)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2"
                    >
                      <Edit className="w-4 h-4" />
                      <span>Reschedule</span>
                    </button>
                    <button 
                      onClick={() => handleCancelAppointment(appointment.id)}
                      className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                      Cancel
                    </button>
                    {appointment.clinicPhone && (
                      <a 
                        href={`tel:${appointment.clinicPhone}`}
                        className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2"
                      >
                        <Phone className="w-4 h-4" />
                        <span>Call Clinic</span>
                      </a>
                    )}
                  </>
                )}

                {appointment.status === 'reschedule-requested' && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 w-full">
                    <p className="text-yellow-800 text-sm">
                      Your reschedule request has been submitted. Our team will contact you within 24 hours to confirm your new appointment time.
                    </p>
                  </div>
                )}

                {appointment.status === 'cancelled' && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 w-full">
                    <p className="text-red-800 text-sm">
                      This appointment has been cancelled. You can book a new appointment anytime.
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reschedule Modal */}
      {showRescheduleModal && selectedAppointment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-800">Reschedule Appointment</h3>
              <button
                onClick={() => setShowRescheduleModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Appointment
                </label>
                <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-600">
                  <div>{selectedAppointment.appointmentType}</div>
                  <div>{selectedAppointment.scheduledDate} at {selectedAppointment.scheduledTime}</div>
                  <div>{selectedAppointment.clinicName}</div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Preferred New Date *
                </label>
                <input
                  type="date"
                  value={rescheduleData.preferredDate}
                  onChange={(e) => setRescheduleData(prev => ({ ...prev, preferredDate: e.target.value }))}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Preferred Time *
                </label>
                <select
                  value={rescheduleData.preferredTime}
                  onChange={(e) => setRescheduleData(prev => ({ ...prev, preferredTime: e.target.value }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select time</option>
                  <option value="08:00">8:00 AM</option>
                  <option value="08:30">8:30 AM</option>
                  <option value="09:00">9:00 AM</option>
                  <option value="09:30">9:30 AM</option>
                  <option value="10:00">10:00 AM</option>
                  <option value="10:30">10:30 AM</option>
                  <option value="11:00">11:00 AM</option>
                  <option value="11:30">11:30 AM</option>
                  <option value="14:00">2:00 PM</option>
                  <option value="14:30">2:30 PM</option>
                  <option value="15:00">3:00 PM</option>
                  <option value="15:30">3:30 PM</option>
                  <option value="16:00">4:00 PM</option>
                  <option value="16:30">4:30 PM</option>
                  <option value="17:00">5:00 PM</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason for Reschedule (Optional)
                </label>
                <textarea
                  value={rescheduleData.reason}
                  onChange={(e) => setRescheduleData(prev => ({ ...prev, reason: e.target.value }))}
                  rows={3}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Please let us know why you need to reschedule..."
                />
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={submitRescheduleRequest}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium transition-colors"
              >
                Submit Request
              </button>
              <button
                onClick={() => setShowRescheduleModal(false)}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-3 px-4 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderChatHistory = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">Chat History & AI Analysis</h2>
        <button
          onClick={() => navigate('/chat')}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
        >
          <MessageCircle className="w-4 h-4" />
          <span>New Chat</span>
        </button>
      </div>

      {chatHistory.length === 0 ? (
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">No Chat History</h3>
          <p className="text-gray-500 mb-4">Start a conversation with our AI assistant to get personalized health insights and image analysis.</p>
          <button
            onClick={() => navigate('/chat')}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Start Chat
          </button>
        </div>
      ) : (
        <div className="grid gap-6">
          {chatHistory.map((session) => (
            <div key={session.id} className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">
                  Chat Session - {formatDate(session.lastActivity)}
                </h3>
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <MessageCircle className="w-4 h-4" />
                  <span>{session.messages.length} messages</span>
                </div>
              </div>

              {/* Show AI Analysis Results */}
              {session.messages.some(msg => msg.triageResult || msg.imageAnalysis) && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">AI Analysis Results:</h4>
                  <div className="space-y-2">
                    {session.messages.filter(msg => msg.triageResult).map((message, index) => (
                      <div key={`triage-${index}`} className={`p-3 rounded-lg border-l-4 ${
                        message.triageResult.priority === 'emergency' ? 'bg-red-50 border-red-500' :
                        message.triageResult.priority === 'high' ? 'bg-orange-50 border-orange-500' :
                        message.triageResult.priority === 'medium' ? 'bg-yellow-50 border-yellow-500' :
                        'bg-green-50 border-green-500'
                      }`}>
                        <div className="flex items-center space-x-2 mb-1">
                          <AlertTriangle className="w-4 h-4" />
                          <span className="font-medium text-sm">
                            Symptom Triage - {message.triageResult.priority.toUpperCase()} Priority
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">{message.triageResult.recommendedAction}</p>
                        <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                          <span>Wait Time: {message.triageResult.estimatedWaitTime} min</span>
                          <span>Type: {message.triageResult.appointmentType}</span>
                        </div>
                      </div>
                    ))}
                    
                    {session.messages.filter(msg => msg.imageAnalysis).map((message, index) => (
                      <div key={`image-${index}`} className={`p-3 rounded-lg border-l-4 ${
                        message.imageAnalysis.urgencyLevel === 'emergency' ? 'bg-red-50 border-red-500' :
                        message.imageAnalysis.urgencyLevel === 'urgent' ? 'bg-orange-50 border-orange-500' :
                        message.imageAnalysis.urgencyLevel === 'routine' ? 'bg-green-50 border-green-500' :
                        'bg-blue-50 border-blue-500'
                      }`}>
                        <div className="flex items-center space-x-2 mb-1">
                          <Camera className="w-4 h-4" />
                          <span className="font-medium text-sm">
                            Image Analysis - {message.imageAnalysis.urgencyLevel.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">{message.imageAnalysis.diagnosticAssessment.primaryDiagnosis}</p>
                        <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                          <span>Region: {message.imageAnalysis.anatomicalRegion}</span>
                          <span>Confidence: {message.imageAnalysis.diagnosticAssessment.confidenceLevel}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="bg-gray-50 rounded-lg p-4 max-h-40 overflow-y-auto">
                <div className="space-y-2">
                  {session.messages.slice(-3).map((message, index) => (
                    <div key={index} className={`text-sm ${message.isBot ? 'text-gray-600' : 'text-blue-600'}`}>
                      <span className="font-medium">{message.isBot ? 'AI:' : 'You:'}</span> {message.text.slice(0, 100)}
                      {message.text.length > 100 && '...'}
                    </div>
                  ))}
                </div>
              </div>

              
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderProfile = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Profile Settings</h2>
      
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center space-x-4 mb-6">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-teal-600 rounded-full flex items-center justify-center">
            <User className="w-8 h-8 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-800">{user?.displayName || 'User'}</h3>
            <p className="text-gray-600">{user?.email}</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-800 mb-3">Account Information</h4>
            <div className="space-y-2 text-sm text-gray-600">
              <div>Email: {user?.email}</div>
              <div>Member since: {user?.metadata?.creationTime ? new Date(user.metadata.creationTime).toLocaleDateString() : 'N/A'}</div>
              <div>Last sign in: {user?.metadata?.lastSignInTime ? new Date(user.metadata.lastSignInTime).toLocaleDateString() : 'N/A'}</div>
            </div>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-800 mb-3">Quick Stats</h4>
            <div className="space-y-2 text-sm text-gray-600">
              <div>Total Appointments: {appointments.length}</div>
              <div>Chat Sessions: {chatHistory.length}</div>
              <div>AI Analyses: {chatHistory.reduce((total, session) => 
                total + session.messages.filter(msg => msg.triageResult || msg.imageAnalysis).length, 0
              )}</div>
              <div>Account Status: Active</div>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <button
            onClick={handleSignOut}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-teal-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-teal-50 p-4">
      <Toaster position="top-right" />
      
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <button
              onClick={() => navigate('/')}
              className="mr-4 p-2 rounded-full hover:bg-white hover:shadow-md transition-all duration-200"
            >
              <ArrowLeft className="w-6 h-6 text-gray-600" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Patient Dashboard</h1>
              <p className="text-gray-600">Welcome back, {user?.displayName?.split(' ')[0] || 'User'}!</p>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-xl shadow-lg p-2 mb-8">
          <div className="flex space-x-2">
            <button
              onClick={() => setActiveTab('appointments')}
              className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2 ${
                activeTab === 'appointments'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>My Appointments</span>
            </button>
            <button
              onClick={() => setActiveTab('chat')}
              className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2 ${
                activeTab === 'chat'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <MessageCircle className="w-4 h-4" />
              <span>Chat</span>
            </button>
            <button
              onClick={() => setActiveTab('profile')}
              className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2 ${
                activeTab === 'profile'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <User className="w-4 h-4" />
              <span>Profile</span>
            </button>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'appointments' && renderAppointments()}
        {activeTab === 'chat' && renderChatHistory()}
        {activeTab === 'profile' && renderProfile()}
      </div>
    </div>
  );
};

export default UserDashboard;