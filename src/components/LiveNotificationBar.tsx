import React, { useEffect, useState } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { motion, AnimatePresence } from 'motion/react';
import { Radio } from 'lucide-react';

interface LiveNotification {
  id: string;
  text: string;
  isImportant: boolean;
  expiryDate?: string;
}

interface LiveNotificationConfig {
  enabled: boolean;
  autoScroll: boolean;
  messages: LiveNotification[];
}

const LiveNotificationBar: React.FC = () => {
  const [config, setConfig] = useState<LiveNotificationConfig | null>(null);

  useEffect(() => {
    const docRef = doc(db, 'config', 'dashboardSettings');
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.liveNotifications) {
          setConfig(data.liveNotifications);
        } else {
          setConfig(null);
        }
      }
    }, (error) => {
      console.error("Error fetching live notifications:", error);
    });

    return () => unsubscribe();
  }, []);

  if (!config || !config.enabled || !config.messages || config.messages.length === 0) {
    return null;
  }

  // Filter out expired messages
  const activeMessages = config.messages.filter(msg => {
    if (!msg.expiryDate) return true;
    return new Date(msg.expiryDate).getTime() > Date.now();
  });

  if (activeMessages.length === 0) return null;

  const hasImportant = activeMessages.some(m => m.isImportant);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: 'auto', opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        className="tour-step-notifications w-full bg-[#050505] border-b border-white/5 relative z-50 overflow-hidden flex items-center h-8 sm:h-10"
      >
        {/* Left LIVE Badge */}
        <div className="absolute left-0 top-0 bottom-0 z-10 flex items-center px-3 sm:px-6 bg-gradient-to-r from-[#050505] via-[#050505] to-transparent shrink-0">
          <div className="flex items-center gap-2 bg-[#1a1a1a] border border-firefox-orange/30 px-3 py-1 rounded-full shadow-[0_0_15px_rgba(255,106,0,0.1)]">
            <Radio size={12} className="text-firefox-orange" />
            <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] text-white">Live</span>
            {hasImportant && (
              <div className="w-1.5 h-1.5 rounded-full bg-firefox-orange animate-pulse shadow-[0_0_8px_rgba(255,106,0,0.8)] ml-1" />
            )}
          </div>
        </div>

        {/* Scrolling Content */}
        <div className="flex-1 overflow-hidden pl-24 sm:pl-32 relative h-full flex items-center">
          <div className={`flex items-center whitespace-nowrap h-full ${config.autoScroll ? 'animate-[marquee_30s_linear_infinite]' : ''}`}>
            {/* Render twice for seamless loop if autoScroll is enabled */}
            <div className="flex items-center gap-8 px-4 shrink-0">
              {activeMessages.map((msg, idx) => (
                <div key={`${msg.id}-${idx}`} className="flex items-center gap-3">
                  <span className={`text-[11px] sm:text-[12px] font-medium tracking-wide ${msg.isImportant ? 'text-white' : 'text-zinc-400'}`}>
                    {msg.isImportant && <span className="text-firefox-orange font-black uppercase tracking-widest mr-2 text-[10px]">Important:</span>}
                    {msg.text}
                  </span>
                  {idx < activeMessages.length - 1 && (
                    <div className="w-1 h-1 rounded-full bg-zinc-800" />
                  )}
                </div>
              ))}
            </div>
            
            {/* Duplicate for infinite loop */}
            {config.autoScroll && (
              <div className="flex items-center gap-8 px-4 shrink-0 border-l border-zinc-800 ml-4 pl-8">
                {activeMessages.map((msg, idx) => (
                  <div key={`dup-${msg.id}-${idx}`} className="flex items-center gap-3">
                    <span className={`text-[11px] sm:text-[12px] font-medium tracking-wide ${msg.isImportant ? 'text-white' : 'text-zinc-400'}`}>
                      {msg.isImportant && <span className="text-firefox-orange font-black uppercase tracking-widest mr-2 text-[10px]">Important:</span>}
                      {msg.text}
                    </span>
                    {idx < activeMessages.length - 1 && (
                      <div className="w-1 h-1 rounded-full bg-zinc-800" />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Right fade */}
          <div className="absolute right-0 top-0 bottom-0 w-8 sm:w-16 bg-gradient-to-l from-[#050505] to-transparent z-10 pointer-events-none" />
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default LiveNotificationBar;
