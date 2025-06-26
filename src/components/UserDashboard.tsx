import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../config/firebase';
import { ArrowLeft, Calendar, MessageCircle, User, LogOut, Clock, MapPin, Phone, AlertTriangle, CheckCircle, FileText } from 'lucide-react';
import { getUserAppointments, getUserChatHistory, getNearbyClinicSlots } from '../services/firebaseService';
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
  const [activeTab, setActiveTab] = useState('appointments');
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [chatHistory, setChatHistory] = useState<ChatSession[]>([]);
  const [availableSlots, setAvailableSlots] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUser(user);
        loadUserData(user.uid);
      } else {
        navigate('/auth');
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const loadUserData = async (userId: string) => {
    setIsLoading(true);
    try {
      const [userAppointments, userChats, clinicSlots] = await Promise.all([
        getUserAppointments(userId),
        getUserChatHistory(userId),
        getNearbyClinicSlots()
      ]);

      setAppointments(userAppointments);
      setChatHistory(userChats);
      setAvailableSlots(clinicSlots);
    } catch (error) {
      console.error('Error loading user data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      toast.success('Signed out successfully');
      navigate('/');
    } catch (error) {
      toast.error('Failed to sign out');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-purple-100 text-purple-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
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
                  {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
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
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Clock className="w-4 h-4" />
                    <span>Est. Wait: {appointment.estimatedWaitTime} min</span>
                  </div>
                </div>
              </div>

              {appointment.status === 'scheduled' && (
                <div className="flex space-x-3">
                  <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                    Confirm Appointment
                  </button>
                  <button className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                    Reschedule
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Available Slots Based on Priority */}
      {availableSlots.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Recommended Appointment Slots</h3>
          <p className="text-sm text-gray-600 mb-4">
            Based on your previous triage results, here are the best available slots:
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            {availableSlots.slice(0, 4).map((slot, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-800">{slot.clinicName}</h4>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    slot.priority === 'emergency' ? 'bg-red-100 text-red-800' :
                    slot.priority === 'urgent' ? 'bg-orange-100 text-orange-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {slot.priority}
                  </span>
                </div>
                <div className="text-sm text-gray-600 space-y-1">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-3 h-3" />
                    <span>{slot.date} at {slot.time}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-3 h-3" />
                    <span>{slot.address}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="w-3 h-3" />
                    <span>Wait time: {slot.waitTime} min</span>
                  </div>
                </div>
                <button className="w-full mt-3 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-sm font-medium transition-colors">
                  Book This Slot
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderChatHistory = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">Chat History & Triage Results</h2>
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
          <p className="text-gray-500 mb-4">Start a conversation with our AI assistant to get personalized health insights.</p>
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
                <span className="text-sm text-gray-500">
                  {session.messages.length} messages
                </span>
              </div>

              {session.triageResults && session.triageResults.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Triage Results:</h4>
                  <div className="space-y-2">
                    {session.triageResults.map((result, index) => (
                      <div key={index} className={`p-3 rounded-lg border-l-4 ${
                        result.priority === 'emergency' ? 'bg-red-50 border-red-500' :
                        result.priority === 'high' ? 'bg-orange-50 border-orange-500' :
                        result.priority === 'medium' ? 'bg-yellow-50 border-yellow-500' :
                        'bg-green-50 border-green-500'
                      }`}>
                        <div className="flex items-center space-x-2 mb-1">
                          <AlertTriangle className="w-4 h-4" />
                          <span className="font-medium text-sm">
                            {result.priority.toUpperCase()} Priority
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">{result.recommendedAction}</p>
                        <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                          <span>Wait Time: {result.estimatedWaitTime} min</span>
                          <span>Type: {result.appointmentType}</span>
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

              <button
                onClick={() => navigate('/chat')}
                className="mt-4 text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                Continue this conversation →
              </button>
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
              <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
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
              <span>Chat History</span>
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