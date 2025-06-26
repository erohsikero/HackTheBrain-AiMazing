import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  updateDoc, 
  doc,
  onSnapshot,
  Timestamp 
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { Patient } from '../types';

// Appointments Collection
export const saveAppointment = async (appointmentData: any) => {
  try {
    const docRef = await addDoc(collection(db, 'appointments'), {
      ...appointmentData,
      createdAt: Timestamp.now(),
      status: 'scheduled'
    });
    return docRef.id;
  } catch (error) {
    console.error('Error saving appointment:', error);
    throw error;
  }
};

export const getAppointments = async () => {
  try {
    const q = query(collection(db, 'appointments'), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting appointments:', error);
    return [];
  }
};

export const updateAppointmentStatus = async (appointmentId: string, status: string) => {
  try {
    const appointmentRef = doc(db, 'appointments', appointmentId);
    await updateDoc(appointmentRef, {
      status,
      updatedAt: Timestamp.now()
    });
  } catch (error) {
    console.error('Error updating appointment status:', error);
    throw error;
  }
};

// Chat History Collection
export const saveChatMessage = async (sessionId: string, message: any) => {
  try {
    // Filter out undefined values to prevent Firestore errors
    const cleanMessage = Object.fromEntries(
      Object.entries(message).filter(([_, value]) => value !== undefined)
    );

    await addDoc(collection(db, 'chatHistory'), {
      sessionId,
      ...cleanMessage,
      timestamp: Timestamp.now()
    });
  } catch (error) {
    console.error('Error saving chat message:', error);
  }
};

export const getChatHistory = async (sessionId: string) => {
  try {
    // Use a simpler query that doesn't require a composite index
    const q = query(
      collection(db, 'chatHistory'),
      where('sessionId', '==', sessionId)
    );
    const querySnapshot = await getDocs(q);
    
    // Sort the results in memory instead of using orderBy in the query
    const messages = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    // Sort by timestamp in ascending order
    return messages.sort((a, b) => {
      const aTime = a.timestamp?.toMillis() || 0;
      const bTime = b.timestamp?.toMillis() || 0;
      return aTime - bTime;
    });
  } catch (error) {
    console.error('Error getting chat history:', error);
    return [];
  }
};

// Real-time listeners
export const subscribeToAppointments = (callback: (appointments: any[]) => void) => {
  const q = query(collection(db, 'appointments'), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (querySnapshot) => {
    const appointments = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    callback(appointments);
  });
};

// Waitlist Management
export const updatePatientStatus = async (patientId: string, status: Patient['status'], additionalData?: any) => {
  try {
    const patientRef = doc(db, 'appointments', patientId);
    await updateDoc(patientRef, {
      status,
      ...additionalData,
      updatedAt: Timestamp.now()
    });
  } catch (error) {
    console.error('Error updating patient status:', error);
    throw error;
  }
};