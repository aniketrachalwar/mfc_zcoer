import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Chrome, Loader2 } from 'lucide-react';
import { useAuth } from '../lib/AuthContext';
import { useNavigate } from 'react-router-dom';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const [loading, setLoading] = useState(false);
  const { loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const handleSuccess = () => {
    onClose();
    navigate('/dashboard');
  };

  const handleGoogleAuth = async () => {
    setLoading(true);
    try {
      await loginWithGoogle();
      handleSuccess();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
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
            className="relative w-full max-w-md bg-zinc-900/90 border border-white/10 p-8 rounded-[2rem] overflow-hidden backdrop-blur-xl shadow-2xl"
          >
            {/* Background Aura */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-firefox-orange/10 blur-[80px] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
            
            <button
              onClick={onClose}
              className="absolute top-6 right-6 text-zinc-500 hover:text-white transition-colors z-10"
            >
              <X size={20} />
            </button>

            <div className="relative z-10">
              <h2 className="text-3xl font-display font-black uppercase text-white mb-2">
                Join <span className="text-firefox-orange">MFC ZCOER</span>
              </h2>
              <p className="text-zinc-400 text-sm mb-8 font-medium">
                Sign in with your Google account to access your portal and become an official member.
              </p>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleGoogleAuth}
                disabled={loading}
                type="button"
                className="w-full py-4 bg-white text-black rounded-xl font-display font-black text-[11px] uppercase tracking-widest flex items-center justify-center gap-3 disabled:opacity-50 transition-all hover:bg-zinc-200"
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : <Chrome size={16} />}
                {loading ? 'Connecting...' : 'Continue with Google'}
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default AuthModal;
