import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User, 
  onAuthStateChanged, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  deleteUser
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from './firebase';

interface AuthContextType {
  user: User | null;
  userProfile: Record<string, any> | null;
  loading: boolean;
  error: string | null;
  login: () => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  signupWithEmail: (email: string, pass: string) => Promise<void>;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
  deleteAccount: () => Promise<void>;
  setError: (msg: string | null) => void;
  setSuccess: (msg: string | null) => void;
  clearError: () => void;
  success: string | null;
  clearSuccess: () => void;
  setSuccessMessage: (msg: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<Record<string, any> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);

      if (!currentUser) {
        setUserProfile(null);
        setLoading(false);
        return;
      }

      try {
        const profileSnap = await getDoc(doc(db, 'users', currentUser.uid));
        if (profileSnap.exists()) {
          const data = profileSnap.data();
          setUserProfile({ 
            id: profileSnap.id, 
            membershipStatus: data.membershipStatus || 'public',
            isFoundingMember: data.isFoundingMember || false,
            membershipTier: data.membershipTier || 'free',
            subscriptionStart: data.subscriptionStart || null,
            subscriptionEnd: data.subscriptionEnd || null,
            paymentStatus: data.paymentStatus || 'none',
            ...data 
          });
        } else {
          setUserProfile(null);
        }
      } catch (err) {
        console.error('Failed to load user profile:', err);
        setUserProfile(null);
      } finally {
        setLoading(false);
      }
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const loginWithGoogle = async () => {
    setError(null);
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      setSuccess("Successfully logged in with Google!");
    } catch (err: any) {
      if (err.code === 'auth/popup-closed-by-user') {
        setError("The login popup was closed before completion. Please try again and keep the window open.");
      } else if (err.code === 'auth/blocked-at-popup-request') {
        setError("Login popup was blocked by your browser. Please allow popups for this site or open the app in a new tab.");
      } else {
        setError("Login failed. Please try again or open the app in a new tab.");
      }
      console.error("Login failed:", err);
      throw err;
    }
  };

  const login = loginWithGoogle; // default backward compatibility

  const signupWithEmail = async (email: string, pass: string) => {
    setError(null);
    try {
      await createUserWithEmailAndPassword(auth, email, pass);
      setSuccess("Account created successfully!");
    } catch (err: any) {
      if (err.code === 'auth/email-already-in-use') {
        setError("An account with this email already exists. Please log in.");
      } else if (err.code === 'auth/weak-password') {
        setError("Password is too weak. Please use at least 6 characters.");
      } else if (err.code === 'auth/operation-not-allowed') {
        setError("Email/password accounts are not enabled. Please contact support or enable it in Firebase console.");
      } else {
        setError("Failed to create account: " + err.message);
      }
      console.error("Signup failed:", err);
      throw err;
    }
  };

  const loginWithEmail = async (email: string, pass: string) => {
    setError(null);
    try {
      await signInWithEmailAndPassword(auth, email, pass);
      setSuccess("Successfully logged in!");
    } catch (err: any) {
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found') {
        setError("Invalid email or password. Please try again.");
      } else {
        setError("Login failed: " + err.message);
      }
      console.error("Login failed:", err);
      throw err;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  const deleteAccount = async () => {
    if (!auth.currentUser) return;
    try {
      await deleteUser(auth.currentUser);
      setUser(null);
      setSuccess("Account deleted successfully.");
    } catch (err: any) {
      if (err.code === 'auth/requires-recent-login') {
        setError("Please log out and log back in to delete your account.");
      } else {
        setError("Failed to delete account: " + err.message);
      }
      console.error("Account deletion failed:", err);
      throw err;
    }
  };

  const clearError = () => setError(null);
  const clearSuccess = () => setSuccess(null);
  const setSuccessMessage = (msg: string) => setSuccess(msg);

  return (
    <AuthContext.Provider value={{ 
      user, userProfile, loading, error, success, 
      login, loginWithGoogle, signupWithEmail, loginWithEmail, logout, deleteAccount,
      setError, setSuccess, clearError, clearSuccess, setSuccessMessage 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
