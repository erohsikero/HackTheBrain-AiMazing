import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, Clock, AlertTriangle, CheckCircle, Calendar, Phone, Mail } from 'lucide-react';

interface Patient {
  id: string;
  name: string;
  appointmentType: string;
  scheduledTime: string;
  checkInTime?: string;
  status: 'scheduled' | 'checked-in' | 'in-treatment' | 'completed';
  priority: 'low' | 'medium' | 'high' | 'emergency';
  phone: string;
  email: string;
  estimatedWaitTime: number;
}

const WaitlistDashboard = () => {
  const navigate = useNavigate();
  const [patients, setPatients] = useState<Patient[]>([
    {
      id: '1',
      name: 'Sarah Johnson',
      appointmentType: 'Emergency',
      scheduledTime: '09:00',
      checkInTime: '08:45',
      status: 'checked-in',
      priority: 'emergency',
      phone: '(555) 123-4567',
      email: 'sarah.j@email.com',
      estimatedWaitTime: 5
    },
    {
      id: '2',
      name: 'Michael Chen',
      appointmentType: 'Cleaning',
      scheduledTime: '09:30',
      checkInTime: '09:15',
      status: 'in-treatment',
      priority: 'low',
      phone: '(555) 234-5678',
      email: 'mchen@email.com',
      estimatedWaitTime: 0
    },
    {
      id: '3',
      name: 'Emily Rodriguez',
      appointmentType: 'Filling',
      scheduledTime: '10:00',
      status: 'scheduled',
      priority: 'medium',
      phone: '(555) 345-6789',
      email: 'emily.r@email.com',
      estimatedWaitTime: 25
    },
    {
      id: '4',
      name: 'David Wilson',
      appointmentType: 'Root Canal',
      scheduledTime: '10:30',
      checkInTime: '10:20',
      status: 'checked-in',
      priority: 'high',
      phone: '(555) 456-7890',
      email: 'dwilson@email.com',
      estimatedWaitTime: 15
    }
  ]);

  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
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

  const updatePatientStatus = (patientId: string, newStatus: Patient['status']) => {
    setPatients(prev => 
      prev.map(patient => 
        patient.id === patientId 
          ? { ...patient, status: newStatus }
          : patient
      )
    );
  };

  const checkedInPatients = patients.filter(p => p.status === 'checked-in');
  const inTreatmentPatients = patients.filter(p => p.status === 'in-treatment');
  const scheduledPatients = patients.filter(p => p.status === 'scheduled');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-teal-50 p-4">
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
              <h1 className="text-3xl font-bold text-gray-800">Waitlist Dashboard</h1>
              <p className="text-gray-600">Real-time patient management and scheduling</p>
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

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Checked In</p>
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
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Avg Wait Time</p>
                <p className="text-2xl font-bold text-gray-800">
                  {Math.round(patients.reduce((acc, p) => acc + p.estimatedWaitTime, 0) / patients.length)} min
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Patient Lists */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Waiting Room Queue */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-6">Waiting Room Queue</h2>
            <div className="space-y-4">
              {checkedInPatients
                .sort((a, b) => {
                  const priorityOrder = { emergency: 0, high: 1, medium: 2, low: 3 };
                  return priorityOrder[a.priority] - priorityOrder[b.priority];
                })
                .map((patient) => (
                <div key={patient.id} className="bg-blue-50 rounded-lg p-4 border-l-4 border-blue-500">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${getPriorityColor(patient.priority)}`}></div>
                      <h3 className="font-semibold text-gray-800">{patient.name}</h3>
                      {getPriorityIcon(patient.priority)}
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(patient.status)}`}>
                      {patient.status.replace('-', ' ').toUpperCase()}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-3">
                    <div>Type: {patient.appointmentType}</div>
                    <div>Scheduled: {patient.scheduledTime}</div>
                    <div>Checked In: {patient.checkInTime}</div>
                    <div>Est. Wait: {patient.estimatedWaitTime} min</div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => updatePatientStatus(patient.id, 'in-treatment')}
                      className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm transition-colors"
                    >
                      Start Treatment
                    </button>
                    <button className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-3 py-1 rounded text-sm transition-colors flex items-center space-x-1">
                      <Phone className="w-3 h-3" />
                      <span>Call</span>
                    </button>
                  </div>
                </div>
              ))}
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
                      <h3 className="font-semibold text-gray-800">{patient.name}</h3>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(patient.status)}`}>
                      IN TREATMENT
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-3">
                    <div>Type: {patient.appointmentType}</div>
                    <div>Scheduled: {patient.scheduledTime}</div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => updatePatientStatus(patient.id, 'completed')}
                      className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded text-sm transition-colors"
                    >
                      Complete Treatment
                    </button>
                  </div>
                </div>
              ))}
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
                  <th className="text-left py-3 px-4">Time</th>
                  <th className="text-left py-3 px-4">Priority</th>
                  <th className="text-left py-3 px-4">Contact</th>
                  <th className="text-left py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {scheduledPatients.map((patient) => (
                  <tr key={patient.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium">{patient.name}</td>
                    <td className="py-3 px-4">{patient.appointmentType}</td>
                    <td className="py-3 px-4">{patient.scheduledTime}</td>
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
                        onClick={() => updatePatientStatus(patient.id, 'checked-in')}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm transition-colors"
                      >
                        Mark Arrived
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WaitlistDashboard;