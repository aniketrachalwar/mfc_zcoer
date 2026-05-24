import React, { useState, useEffect } from 'react';
import { Download, Share, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Extend Window interface for the beforeinstallprompt event
interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export default function InstallPwaBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if already installed
    const isPwa = window.matchMedia('(display-mode: standalone)').matches || 
                  (window.navigator as any).standalone === true;
    setIsStandalone(isPwa);

    if (isPwa) return;

    // Check for iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIosDevice);

    // Only show for mobile
    const isMobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
    
    if (isMobile && !isPwa) {
      // If iOS, show prompt right away since there's no event
      if (isIosDevice) {
        // Only show if they haven't dismissed it before
        const hasDismissed = localStorage.getItem('pwa_prompt_dismissed');
        if (!hasDismissed) {
          // Delay slightly so it doesn't interrupt immediate rendering
          setTimeout(() => setShowPrompt(true), 2000);
        }
      }
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      
      const hasDismissed = localStorage.getItem('pwa_prompt_dismissed');
      if (!hasDismissed) {
        setTimeout(() => setShowPrompt(true), 2000);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setShowPrompt(false);
      }
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('pwa_prompt_dismissed', 'true');
  };

  if (!showPrompt || isStandalone) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 50 }}
        className="fixed bottom-4 left-4 right-4 z-50 md:hidden"
      >
        <div className="bg-white border border-black/5 rounded-2xl p-4 shadow-[0_8px_30px_rgb(0,0,0,0.12)] flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center shrink-0">
              <svg width="24" height="24" viewBox="0 0 512 512" className="text-firefox-orange w-8 h-8">
                <path d="M120 370 V160 L256 280 L392 160 V370" stroke="currentColor" strokeWidth="52" strokeLinecap="round" strokeLinejoin="round" fill="none" />
              </svg>
            </div>
            <div className="flex flex-col">
              <h4 className="text-black font-bold text-sm m-0">Install MFC App</h4>
              <p className="text-zinc-500 text-xs mt-0.5 leading-tight">
                {isIOS ? 'Tap Share \u2192 Add to Home Screen' : 'Access the ecosystem faster from your home screen.'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 shrink-0">
            {!isIOS && (
              <button 
                onClick={handleInstallClick}
                className="bg-firefox-orange text-white px-4 py-2 rounded-xl text-xs font-bold shadow-md hover:bg-orange-600 transition-colors"
              >
                Install
              </button>
            )}
            {isIOS && (
              <div className="bg-zinc-100 text-zinc-500 p-2 rounded-xl flex items-center justify-center shrink-0">
                <Share size={16} />
              </div>
            )}
            <button 
              onClick={handleDismiss}
              className="p-2 text-zinc-400 hover:text-zinc-600 transition-colors"
              aria-label="Dismiss"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
