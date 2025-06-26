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
  Timestamp,
  setDoc,
  getDoc 
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { Patient } from '../types';

// User Profile Management
export const saveUserProfile = async (userId: string, profileData: any) => {
  try {
    await setDoc(doc(db, 'users', userId), {
      ...profileData,
      userId, // Ensure userId is stored in the document
      createdAt: Timestamp.now()
    });
  } catch (error) {
    console.error('Error saving user profile:', error);
    throw error;
  }
};

export const getUserProfile = async (userId: string) => {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (userDoc.exists()) {
      return userDoc.data();
    }
    return null;
  } catch (error: any) {
    // Handle specific permission errors gracefully without logging as errors
    if (error.code === 'permission-denied') {
      console.log('Firebase permissions not configured for user profile access. User will need to re-enter information.');
      return null; // Return null instead of throwing to allow app to continue
    }
    
    // For other errors, log them but still return null to prevent app crashes
    console.warn('Could not retrieve user profile:', error.message || error);
    return null;
  }
};

// Appointments Collection
export const saveAppointment = async (appointmentData: any) => {
  try {
    // Get intelligent scheduling based on priority
    const schedulingData = await getIntelligentScheduling(appointmentData.urgencyLevel, appointmentData.priority);
    
    // Try to save user profile data for future use, but don't fail if permissions are insufficient
    if (appointmentData.userId) {
      try {
        await saveUserProfile(appointmentData.userId, {
          firstName: appointmentData.firstName,
          lastName: appointmentData.lastName,
          preferredName: appointmentData.preferredName,
          dateOfBirth: appointmentData.dateOfBirth,
          street: appointmentData.street,
          city: appointmentData.city,
          province: appointmentData.province,
          postalCode: appointmentData.postalCode,
          email: appointmentData.email,
          phone: appointmentData.phone,
          hasInsurance: appointmentData.hasInsurance
        });
      } catch (profileError: any) {
        console.log('Could not save user profile due to permissions, but appointment will still be created.');
        // Continue with appointment creation even if profile save fails
      }
    }
    
    const docRef = await addDoc(collection(db, 'appointments'), {
      ...appointmentData,
      ...schedulingData,
      createdAt: Timestamp.now(),
      status: 'scheduled',
      userId: appointmentData.userId || null
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

export const getUserAppointments = async (userId: string) => {
  try {
    // Use a simpler query that only filters by userId to avoid composite index requirement
    const q = query(
      collection(db, 'appointments'),
      where('userId', '==', userId)
    );
    const querySnapshot = await getDocs(q);
    
    // Sort the results in memory instead of using orderBy in the query
    const appointments = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    // Sort by createdAt in descending order (most recent first)
    return appointments.sort((a, b) => {
      const aTime = a.createdAt?.toMillis() || 0;
      const bTime = b.createdAt?.toMillis() || 0;
      return bTime - aTime;
    });
  } catch (error) {
    console.error('Error getting user appointments:', error);
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

// Chat History Collection with User Association
export const saveChatMessage = async (sessionId: string, message: any, userId?: string) => {
  try {
    // Filter out undefined values to prevent Firestore errors
    const cleanMessage = Object.fromEntries(
      Object.entries(message).filter(([_, value]) => value !== undefined)
    );

    await addDoc(collection(db, 'chatHistory'), {
      sessionId,
      userId: userId || null,
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

export const getUserChatHistory = async (userId: string) => {
  try {
    const q = query(
      collection(db, 'chatHistory'),
      where('userId', '==', userId)
    );
    const querySnapshot = await getDocs(q);
    
    const messages = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // Group messages by session
    const sessionMap = new Map();
    messages.forEach(message => {
      const sessionId = message.sessionId;
      if (!sessionMap.has(sessionId)) {
        sessionMap.set(sessionId, {
          id: sessionId,
          sessionId,
          messages: [],
          lastActivity: message.timestamp,
          triageResults: []
        });
      }
      
      const session = sessionMap.get(sessionId);
      session.messages.push(message);
      
      if (message.triageResult) {
        session.triageResults.push(message.triageResult);
      }
      
      // Update last activity to the most recent message
      if (message.timestamp && message.timestamp.toMillis() > session.lastActivity.toMillis()) {
        session.lastActivity = message.timestamp;
      }
    });

    // Convert to array and sort by last activity
    const sessions = Array.from(sessionMap.values()).sort((a, b) => 
      b.lastActivity.toMillis() - a.lastActivity.toMillis()
    );

    return sessions;
  } catch (error) {
    console.error('Error getting user chat history:', error);
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

// Intelligent Scheduling System
export const getIntelligentScheduling = async (urgencyLevel: string, priority: string) => {
  // Simulated clinic data with available slots
  const clinicData = [
    {
      name: "Dental AI Clinic - Downtown",
      address: "123 Main St, Toronto, ON M5V 3A8",
      phone: "(416) 555-0123",
      availableSlots: [
        { date: "2024-01-15", time: "09:00", priority: "emergency" },
        { date: "2024-01-15", time: "10:30", priority: "high" },
        { date: "2024-01-16", time: "14:00", priority: "medium" },
        { date: "2024-01-17", time: "11:00", priority: "low" }
      ]
    },
    {
      name: "Dental AI Clinic - North York",
      address: "456 Yonge St, North York, ON M2N 5S2",
      phone: "(416) 555-0124",
      availableSlots: [
        { date: "2024-01-15", time: "08:30", priority: "emergency" },
        { date: "2024-01-15", time: "15:00", priority: "high" },
        { date: "2024-01-16", time: "10:00", priority: "medium" },
        { date: "2024-01-18", time: "09:30", priority: "low" }
      ]
    },
    {
      name: "Dental AI Clinic - Scarborough",
      address: "789 Kingston Rd, Scarborough, ON M1M 1P5",
      phone: "(416) 555-0125",
      availableSlots: [
        { date: "2024-01-15", time: "13:00", priority: "emergency" },
        { date: "2024-01-16", time: "09:00", priority: "high" },
        { date: "2024-01-17", time: "16:00", priority: "medium" },
        { date: "2024-01-19", time: "14:30", priority: "low" }
      ]
    }
  ];

  // Find the best available slot based on urgency
  let targetPriority = priority;
  if (urgencyLevel === 'emergency') targetPriority = 'emergency';
  else if (urgencyLevel === 'urgent') targetPriority = 'high';
  else if (urgencyLevel === 'soon') targetPriority = 'medium';
  else targetPriority = 'low';

  // Find clinics with available slots for the target priority
  for (const clinic of clinicData) {
    const availableSlot = clinic.availableSlots.find(slot => 
      slot.priority === targetPriority || 
      (targetPriority === 'emergency' && ['emergency', 'high'].includes(slot.priority))
    );

    if (availableSlot) {
      return {
        scheduledDate: availableSlot.date,
        scheduledTime: availableSlot.time,
        clinicName: clinic.name,
        clinicAddress: clinic.address,
        clinicPhone: clinic.phone,
        assignedByAI: true,
        aiReasoning: `Assigned based on ${urgencyLevel} urgency level and ${priority} priority`
      };
    }
  }

  // Fallback to first available slot if no exact match
  const fallbackClinic = clinicData[0];
  const fallbackSlot = fallbackClinic.availableSlots[0];
  
  return {
    scheduledDate: fallbackSlot.date,
    scheduledTime: fallbackSlot.time,
    clinicName: fallbackClinic.name,
    clinicAddress: fallbackClinic.address,
    clinicPhone: fallbackClinic.phone,
    assignedByAI: true,
    aiReasoning: `Assigned to earliest available slot due to high demand`
  };
};

export const getNearbyClinicSlots = async () => {
  // Return available slots for user dashboard
  const clinicSlots = [
    {
      clinicName: "Dental AI Clinic - Downtown",
      address: "123 Main St, Toronto",
      date: "2024-01-15",
      time: "09:00",
      priority: "emergency",
      waitTime: 10
    },
    {
      clinicName: "Dental AI Clinic - North York", 
      address: "456 Yonge St, North York",
      date: "2024-01-15",
      time: "10:30",
      priority: "urgent",
      waitTime: 25
    },
    {
      clinicName: "Dental AI Clinic - Scarborough",
      address: "789 Kingston Rd, Scarborough", 
      date: "2024-01-16",
      time: "14:00",
      priority: "routine",
      waitTime: 45
    },
    {
      clinicName: "Dental AI Clinic - Downtown",
      address: "123 Main St, Toronto",
      date: "2024-01-17",
      time: "11:00", 
      priority: "routine",
      waitTime: 60
    }
  ];

  return clinicSlots;
};