import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { X, Chrome, Loader2, Mail, Lock, AlertCircle } from 'lucide-react';
import { useAuth } from '../lib/AuthContext';
import { useNavigate } from 'react-router-dom';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState('');
  
  const { loginWithGoogle, loginWithEmail, signupWithEmail } = useAuth();
  const navigate = useNavigate();

  const handleSuccess = () => {
    onClose();
    navigate('/dashboard');
  };

  const handleGoogleAuth = async () => {
    setLoading(true);
    setLocalError('');
    try {
      await loginWithGoogle();
      handleSuccess();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setLocalError('Please fill in all fields.');
      return;
    }
    
    setLoading(true);
    setLocalError('');
    try {
      if (isLogin) {
        await loginWithEmail(email, password);
      } else {
        if (referralCode.trim()) {
          sessionStorage.setItem('pendingReferral', referralCode.trim().toUpperCase());
        }
        await signupWithEmail(email, password);
      }
      handleSuccess();
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-md bg-zinc-900/90 border border-white/10 p-5 sm:p-8 rounded-2xl sm:rounded-[2rem] overflow-y-auto overflow-x-hidden max-h-[90vh] backdrop-blur-xl shadow-2xl"
          >
            {/* Background Aura */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-firefox-orange/10 blur-[80px] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
            
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-zinc-400 hover:text-white transition-colors z-50 w-11 h-11 flex items-center justify-center rounded-full hover:bg-white/5"
              aria-label="Close modal"
            >
              <X size={20} />
            </button>

            <div className="relative z-10">
              <h2 className="text-2xl sm:text-3xl font-display font-black uppercase text-white mb-1.5">
                Join <span className="text-firefox-orange">MFC Open Web</span>
              </h2>
              <p className="text-zinc-400 text-xs sm:text-sm mb-4 sm:mb-6 font-medium">
                {isLogin ? 'Sign in to access your portal and manage your profile.' : 'Create an account to become an official member.'}
              </p>

              {localError && (
                <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-2 text-red-400 text-sm">
                  <AlertCircle size={16} />
                  {localError}
                </div>
              )}

              <form onSubmit={handleEmailAuth} className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
                <div>
                  <div className="relative">
                    <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
                    <input
                      type="email"
                      placeholder="Email Address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-black/50 border border-white/5 rounded-xl py-2.5 sm:py-3 pl-12 pr-4 text-[15px] sm:text-[16px] text-white placeholder-zinc-500 focus:outline-none focus:border-firefox-orange/50 transition-colors"
                      required
                    />
                  </div>
                </div>
                <div>
                  <div className="relative">
                    <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
                    <input
                      type="password"
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-black/50 border border-white/5 rounded-xl py-2.5 sm:py-3 pl-12 pr-4 text-[15px] sm:text-[16px] text-white placeholder-zinc-500 focus:outline-none focus:border-firefox-orange/50 transition-colors"
                      required
                      minLength={6}
                    />
                  </div>
                </div>

                {!isLogin && (
                  <div>
                    <div className="relative">
                      <Chrome size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
                      <input
                        type="text"
                        placeholder="Referral Code (Optional)"
                        value={referralCode}
                        onChange={(e) => setReferralCode(e.target.value)}
                        className="w-full bg-black/50 border border-white/5 rounded-xl py-2.5 sm:py-3 pl-12 pr-4 text-[15px] sm:text-[16px] text-white placeholder-zinc-500 focus:outline-none focus:border-firefox-orange/50 transition-colors uppercase"
                      />
                    </div>
                  </div>
                )}

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 sm:py-4 bg-gradient-to-r from-firefox-orange to-firefox-yellow text-white rounded-xl font-display font-black text-[10px] sm:text-[11px] uppercase tracking-widest flex items-center justify-center gap-3 disabled:opacity-50 transition-all shadow-lg shadow-firefox-orange/20"
                >
                  {loading ? <Loader2 size={16} className="animate-spin" /> : null}
                  {loading ? 'Processing...' : (isLogin ? 'Sign In with Email' : 'Sign Up with Email')}
                </motion.button>
              </form>

              <div className="relative flex items-center gap-3 sm:gap-4 py-2 sm:py-4">
                <div className="flex-1 h-[1px] bg-white/10" />
                <span className="text-zinc-500 text-[10px] sm:text-xs font-medium uppercase tracking-wider">or</span>
                <div className="flex-1 h-[1px] bg-white/10" />
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleGoogleAuth}
                disabled={loading}
                type="button"
                className="w-full mt-2 sm:mt-4 py-3 sm:py-4 bg-white text-black rounded-xl font-display font-black text-[10px] sm:text-[11px] uppercase tracking-widest flex items-center justify-center gap-3 disabled:opacity-50 transition-all hover:bg-zinc-200"
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : <Chrome size={16} />}
                {loading ? 'Connecting...' : 'Continue with Google'}
              </motion.button>

              <div className="mt-4 sm:mt-6 text-center">
                <button
                  type="button"
                  onClick={() => setIsLogin(!isLogin)}
                  className="text-zinc-400 hover:text-white text-xs sm:text-sm transition-colors"
                >
                  {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default AuthModal;
