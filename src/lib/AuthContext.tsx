import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User, 
  onAuthStateChanged, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut 
} from 'firebase/auth';
import { auth } from './firebase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: () => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  signupWithEmail: (email: string, pass: string) => Promise<void>;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
  success: string | null;
  clearSuccess: () => void;
  setSuccessMessage: (msg: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
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
      const { createUserWithEmailAndPassword } = await import('firebase/auth');
      await createUserWithEmailAndPassword(auth, email, pass);
      setSuccess("Account created successfully!");
    } catch (err: any) {
      if (err.code === 'auth/email-already-in-use') {
        setError("An account with this email already exists. Please log in.");
      } else if (err.code === 'auth/weak-password') {
        setError("Password is too weak. Please use at least 6 characters.");
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
      const { signInWithEmailAndPassword } = await import('firebase/auth');
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

  const clearError = () => setError(null);
  const clearSuccess = () => setSuccess(null);
  const setSuccessMessage = (msg: string) => setSuccess(msg);

  return (
    <AuthContext.Provider value={{ 
      user, loading, error, success, 
      login, loginWithGoogle, signupWithEmail, loginWithEmail, logout, 
      clearError, clearSuccess, setSuccessMessage 
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
