import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, Clock, AlertTriangle, CheckCircle, Calendar, Phone, Mail, Bell, TrendingUp } from 'lucide-react';
import { subscribeToAppointments, updatePatientStatus } from '../services/firebaseService';
import toast, { Toaster } from 'react-hot-toast';

interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  appointmentType: string;
  scheduledTime?: string;
  checkInTime?: string;
  status: 'scheduled' | 'checked-in' | 'in-treatment' | 'completed';
  priority: 'low' | 'medium' | 'high' | 'emergency';
  phone: string;
  email: string;
  estimatedWaitTime: number;
  urgencyLevel?: string;
  symptoms?: string;
}

const SmartWaitlistDashboard = () => {
  const navigate = useNavigate();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [notifications, setNotifications] = useState<string[]>([]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    // Subscribe to real-time appointments
    const unsubscribe = subscribeToAppointments((appointments) => {
      const formattedPatients = appointments.map((apt: any) => ({
        id: apt.id,
        firstName: apt.firstName || 'Unknown',
        lastName: apt.lastName || 'Patient',
        appointmentType: apt.appointmentType || 'General',
        scheduledTime: apt.preferredTime || '09:00',
        checkInTime: apt.checkInTime,
        status: apt.status || 'scheduled',
        priority: apt.priority || 'low',
        phone: apt.phone || '',
        email: apt.email || '',
        estimatedWaitTime: apt.estimatedWaitTime || 30,
        urgencyLevel: apt.urgencyLevel,
        symptoms: apt.symptoms
      }));
      
      setPatients(formattedPatients);
    });

    return () => unsubscribe();
  }, []);

  // Auto-reorder queue based on priority and wait time
  useEffect(() => {
    const interval = setInterval(() => {
      setPatients(prev => {
        const reordered = [...prev].sort((a, b) => {
          const priorityOrder = { emergency: 0, high: 1, medium: 2, low: 3 };
          const aPriority = priorityOrder[a.priority];
          const bPriority = priorityOrder[b.priority];
          
          if (aPriority !== bPriority) {
            return aPriority - bPriority;
          }
          
          // If same priority, sort by check-in time
          if (a.checkInTime && b.checkInTime) {
            return a.checkInTime.localeCompare(b.checkInTime);
          }
          
          return 0;
        });
        
        return reordered;
      });
    }, 30000); // Reorder every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-gray-100 text-gray-800';
      case 'checked-in': return 'bg-blue-100 text-blue-800';
      case 'in-treatment': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'emergency': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'emergency': return <AlertTriangle className="w-4 h-4" />;
      case 'high': return <AlertTriangle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const handleStatusUpdate = async (patientId: string, newStatus: Patient['status']) => {
    try {
      await updatePatientStatus(patientId, newStatus, {
        checkInTime: newStatus === 'checked-in' ? new Date().toISOString() : undefined
      });
      
      const patient = patients.find(p => p.id === patientId);
      if (patient) {
        toast.success(`${patient.firstName} ${patient.lastName} status updated to ${newStatus.replace('-', ' ')}`);
        
        // Add notification
        const notification = `${patient.firstName} ${patient.lastName} moved to ${newStatus.replace('-', ' ')}`;
        setNotifications(prev => [notification, ...prev.slice(0, 4)]);
      }
    } catch (error) {
      toast.error('Failed to update patient status');
    }
  };

  const simulateNotification = (patientId: string, message: string) => {
    const patient = patients.find(p => p.id === patientId);
    if (patient) {
      toast.success(`📱 SMS sent to ${patient.firstName}: ${message}`);
      setNotifications(prev => [`SMS sent to ${patient.firstName}: ${message}`, ...prev.slice(0, 4)]);
    }
  };

  const checkedInPatients = patients.filter(p => p.status === 'checked-in');
  const inTreatmentPatients = patients.filter(p => p.status === 'in-treatment');
  const scheduledPatients = patients.filter(p => p.status === 'scheduled');
  const completedToday = patients.filter(p => p.status === 'completed').length;

  const avgWaitTime = patients.length > 0 
    ? Math.round(patients.reduce((acc, p) => acc + p.estimatedWaitTime, 0) / patients.length)
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-teal-50 p-4">
      <Toaster position="top-right" />
      
      <div className="max-w-7xl mx-auto">
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
              <p className="text-gray-600">AI-powered patient management and real-time scheduling</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-gray-800">
              {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
            <div className="text-sm text-gray-600">
              {currentTime.toLocaleDateString()}
            </div>
          </div>
        </div>

        {/* Real-time Notifications */}
        {notifications.length > 0 && (
          <div className="mb-6 bg-white rounded-xl shadow-lg p-4">
            <div className="flex items-center space-x-2 mb-3">
              <Bell className="w-5 h-5 text-blue-600" />
              <h3 className="font-semibold text-gray-800">Recent Notifications</h3>
            </div>
            <div className="space-y-2">
              {notifications.slice(0, 3).map((notification, index) => (
                <div key={index} className="text-sm text-gray-600 bg-blue-50 p-2 rounded">
                  {notification}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Waiting</p>
                <p className="text-2xl font-bold text-gray-800">{checkedInPatients.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">In Treatment</p>
                <p className="text-2xl font-bold text-gray-800">{inTreatmentPatients.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Scheduled</p>
                <p className="text-2xl font-bold text-gray-800">{scheduledPatients.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Completed Today</p>
                <p className="text-2xl font-bold text-gray-800">{completedToday}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Avg Wait</p>
                <p className="text-2xl font-bold text-gray-800">{avgWaitTime}m</p>
              </div>
            </div>
          </div>
        </div>

        {/* Patient Lists */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Smart Waiting Room Queue */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800">Smart Queue (Auto-Prioritized)</h2>
              <div className="text-sm text-gray-500">Updates every 30s</div>
            </div>
            <div className="space-y-4">
              {checkedInPatients.map((patient, index) => (
                <div key={patient.id} className="bg-blue-50 rounded-lg p-4 border-l-4 border-blue-500">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-2">
                        <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full font-bold">
                          #{index + 1}
                        </span>
                        <div className={`w-3 h-3 rounded-full ${getPriorityColor(patient.priority)}`}></div>
                      </div>
                      <h3 className="font-semibold text-gray-800">{patient.firstName} {patient.lastName}</h3>
                      {getPriorityIcon(patient.priority)}
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(patient.status)}`}>
                      WAITING
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-3">
                    <div>Type: {patient.appointmentType}</div>
                    <div>Priority: {patient.priority.toUpperCase()}</div>
                    <div>Checked In: {patient.checkInTime ? new Date(patient.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A'}</div>
                    <div>Est. Wait: {patient.estimatedWaitTime} min</div>
                  </div>
                  {patient.symptoms && (
                    <div className="text-sm text-gray-600 mb-3 p-2 bg-gray-50 rounded">
                      <strong>Symptoms:</strong> {patient.symptoms}
                    </div>
                  )}
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleStatusUpdate(patient.id, 'in-treatment')}
                      className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm transition-colors"
                    >
                      Start Treatment
                    </button>
                    <button 
                      onClick={() => simulateNotification(patient.id, "You're next! Please be ready.")}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm transition-colors flex items-center space-x-1"
                    >
                      <Bell className="w-3 h-3" />
                      <span>Notify</span>
                    </button>
                    <button className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-3 py-1 rounded text-sm transition-colors flex items-center space-x-1">
                      <Phone className="w-3 h-3" />
                      <span>Call</span>
                    </button>
                  </div>
                </div>
              ))}
              {checkedInPatients.length === 0 && (
                <div className="text-center text-gray-500 py-8">
                  No patients currently waiting
                </div>
              )}
            </div>
          </div>

          {/* In Treatment */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-6">Currently in Treatment</h2>
            <div className="space-y-4">
              {inTreatmentPatients.map((patient) => (
                <div key={patient.id} className="bg-green-50 rounded-lg p-4 border-l-4 border-green-500">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${getPriorityColor(patient.priority)}`}></div>
                      <h3 className="font-semibold text-gray-800">{patient.firstName} {patient.lastName}</h3>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(patient.status)}`}>
                      IN TREATMENT
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-3">
                    <div>Type: {patient.appointmentType}</div>
                    <div>Started: {patient.checkInTime ? new Date(patient.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A'}</div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleStatusUpdate(patient.id, 'completed')}
                      className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded text-sm transition-colors"
                    >
                      Complete Treatment
                    </button>
                  </div>
                </div>
              ))}
              {inTreatmentPatients.length === 0 && (
                <div className="text-center text-gray-500 py-8">
                  No patients currently in treatment
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Upcoming Appointments */}
        <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-6">Upcoming Appointments</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4">Patient</th>
                  <th className="text-left py-3 px-4">Type</th>
                  <th className="text-left py-3 px-4">Urgency</th>
                  <th className="text-left py-3 px-4">Priority</th>
                  <th className="text-left py-3 px-4">Contact</th>
                  <th className="text-left py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {scheduledPatients.map((patient) => (
                  <tr key={patient.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium">{patient.firstName} {patient.lastName}</td>
                    <td className="py-3 px-4">{patient.appointmentType}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        patient.urgencyLevel === 'emergency' ? 'bg-red-100 text-red-800' :
                        patient.urgencyLevel === 'urgent' ? 'bg-orange-100 text-orange-800' :
                        patient.urgencyLevel === 'soon' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {patient.urgencyLevel || 'routine'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        <div className={`w-2 h-2 rounded-full ${getPriorityColor(patient.priority)}`}></div>
                        <span className="capitalize">{patient.priority}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex space-x-2">
                        <a href={`tel:${patient.phone}`} className="text-blue-600 hover:text-blue-800">
                          <Phone className="w-4 h-4" />
                        </a>
                        <a href={`mailto:${patient.email}`} className="text-blue-600 hover:text-blue-800">
                          <Mail className="w-4 h-4" />
                        </a>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => handleStatusUpdate(patient.id, 'checked-in')}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm transition-colors"
                      >
                        Check In
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {scheduledPatients.length === 0 && (
              <div className="text-center text-gray-500 py-8">
                No upcoming appointments
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SmartWaitlistDashboard;