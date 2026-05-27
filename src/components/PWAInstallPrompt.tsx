import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Download } from 'lucide-react';
import { useAuth } from '../lib/AuthContext';

// Extend the Window interface for the beforeinstallprompt event
interface BeforeInstallPromptEvent extends Event {
  readonly platforms: Array<string>;
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

const PWAInstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone === true) {
      setIsStandalone(true);
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setIsStandalone(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
    }
    setDeferredPrompt(null);
  };

  // Only show if: user is logged in, app is not installed, prompt is available, and user hasn't dismissed it
  if (!user || isStandalone || !deferredPrompt || isDismissed) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="fixed bottom-28 left-4 right-4 md:left-auto md:right-8 md:w-96 z-[120]"
      >
        <div className="bg-white border border-zinc-200 rounded-2xl p-4 shadow-[0_20px_50px_rgba(0,0,0,0.3)] flex items-center gap-4">
          <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shrink-0 border border-zinc-100 overflow-hidden shadow-sm">
            <img 
              src="https://res.cloudinary.com/diyulegc1/image/upload/v1778406665/logo-removebg-preview_b9u9z8.png" 
              alt="MFC Logo" 
              className="w-10 h-10 object-contain drop-shadow-[0_0_8px_rgba(255,106,0,0.3)]"
            />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-bold text-zinc-900 mb-1">Install MFC App</h3>
            <p className="text-xs text-zinc-500 font-medium">Get the full app experience on your home screen.</p>
          </div>
          <div className="flex flex-col gap-2 shrink-0">
            <button
              onClick={handleInstallClick}
              className="bg-firefox-orange text-white px-4 py-1.5 rounded-lg text-xs font-black uppercase tracking-widest hover:bg-firefox-orange/90 transition-colors shadow-md"
            >
              Install
            </button>
            <button
              onClick={() => setIsDismissed(true)}
              className="text-zinc-400 hover:text-zinc-600 px-4 py-1 text-[10px] font-black uppercase tracking-widest transition-colors flex items-center justify-center gap-1"
            >
              <X size={12} /> Dismiss
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default PWAInstallPrompt;
