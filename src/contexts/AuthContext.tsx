import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../config/firebase';
import { getUserProfile } from '../services/firebaseService';

interface UserProfile {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  dateOfBirth?: string;
  street?: string;
  city?: string;
  province?: string;
  postalCode?: string;
  hasInsurance?: string;
  createdAt?: string;
}

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signOutUser: () => Promise<void>;
  refreshUserProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const loadUserProfile = async (userId: string) => {
    try {
      const profile = await getUserProfile(userId);
      setUserProfile(profile);
    } catch (error) {
      console.error('Error loading user profile:', error);
      setUserProfile(null);
    }
  };

  const refreshUserProfile = async () => {
    if (user) {
      await loadUserProfile(user.uid);
    }
  };

  const signOutUser = async () => {
    try {
      await signOut(auth);
      // Clear user session data
      setUser(null);
      setUserProfile(null);
      setIsAuthenticated(false);
      
      // Clear any stored session data
      localStorage.removeItem('userSession');
      sessionStorage.clear();
      
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setIsLoading(true);
      
      if (firebaseUser) {
        setUser(firebaseUser);
        setIsAuthenticated(true);
        
        // Store basic session info
        const sessionData = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          lastSignIn: new Date().toISOString()
        };
        localStorage.setItem('userSession', JSON.stringify(sessionData));
        
        // Load user profile
        await loadUserProfile(firebaseUser.uid);
      } else {
        setUser(null);
        setUserProfile(null);
        setIsAuthenticated(false);
        
        // Clear session data
        localStorage.removeItem('userSession');
        sessionStorage.clear();
      }
      
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Check for existing session on app start
  useEffect(() => {
    const storedSession = localStorage.getItem('userSession');
    if (storedSession && !user) {
      try {
        const sessionData = JSON.parse(storedSession);
        // Verify session is still valid (less than 24 hours old)
        const lastSignIn = new Date(sessionData.lastSignIn);
        const now = new Date();
        const hoursDiff = (now.getTime() - lastSignIn.getTime()) / (1000 * 60 * 60);
        
        if (hoursDiff > 24) {
          // Session expired, clear it
          localStorage.removeItem('userSession');
        }
      } catch (error) {
        console.error('Error parsing stored session:', error);
        localStorage.removeItem('userSession');
      }
    }
  }, [user]);

  const value: AuthContextType = {
    user,
    userProfile,
    isLoading,
    isAuthenticated,
    signOutUser,
    refreshUserProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};