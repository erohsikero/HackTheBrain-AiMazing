export interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  appointmentType: string;
  scheduledTime: string;
  checkInTime?: string;
  status: 'scheduled' | 'checked-in' | 'in-treatment' | 'completed';
  priority: 'low' | 'medium' | 'high' | 'emergency';
  hasInsurance: boolean;
  estimatedWaitTime: number;
}

export interface Appointment {
  id: string;
  patientId: string;
  type: string;
  scheduledTime: string;
  duration: number;
  notes?: string;
  status: 'scheduled' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled';
}

export interface ChatMessage {
  id: string;
  text: string;
  isBot: boolean;
  timestamp: Date;
}