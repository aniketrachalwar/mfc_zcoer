import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

export const LOADING_PHRASES = [
  "We are genuinely building something beautiful...",
  "Our words hold true value...",
  "We always keep our promises...",
  "We don't compare, we just stand out...",
  "Waiting for Shree to reconnect...",
  "Prem is silently building the future...",
  "True value is never really lost...",
  "Some connections are worth waiting for...",
  "A genuine promise never expires...",
  "Building spaces you'd want to return to...",
  "Every single line holds deep value...",
  "The best connections find their way back...",
  "We genuinely value every interaction...",
  "Prem is keeping the promise...",
  "Shree's impact remains in the foundation...",
  "Building a legacy with genuine effort...",
  "Our commitment never drops...",
  "Waiting for the perfect callback...",
  "We never break our promises...",
  "Creating something worth coming back to...",
  "Prem is building what was promised...",
  "Genuinely waiting for the right ping...",
  "True value takes time to realize...",
  "The open web remembers genuine connections...",
  "Shree is always welcome in the ecosystem...",
  "We genuinely build with love..."
];

const PageLoader = ({ fullScreen = true }: { fullScreen?: boolean }) => {
  const [phraseIndex, setPhraseIndex] = useState(0);

  useEffect(() => {
    let currentIndex = Math.floor(Math.random() * LOADING_PHRASES.length);
    setPhraseIndex(currentIndex);
    
    const interval = setInterval(() => {
      let nextIndex = Math.floor(Math.random() * LOADING_PHRASES.length);
      while (nextIndex === currentIndex) {
        nextIndex = Math.floor(Math.random() * LOADING_PHRASES.length);
      }
      currentIndex = nextIndex;
      setPhraseIndex(nextIndex);
    }, 2500);
    
    return () => clearInterval(interval);
  }, []);

  const currentPhrase = LOADING_PHRASES[phraseIndex];
  const words = currentPhrase.split(' ');

  return (
    <div className={`${fullScreen ? 'min-h-[100dvh]' : 'min-h-[300px] w-full'} bg-transparent flex flex-col items-center justify-center text-center px-4`}>
      <AnimatePresence mode="wait">
        <motion.div
          key={phraseIndex}
          initial="hidden"
          animate="visible"
          exit={{ opacity: 0, transition: { duration: 0.2 } }}
          variants={{
            visible: { transition: { staggerChildren: 0.15 } }
          }}
          className="text-zinc-400 text-sm md:text-base font-bold tracking-widest uppercase max-w-md mx-auto flex flex-wrap justify-center gap-2"
        >
          {words.map((word, i) => (
            <motion.span
              key={i}
              variants={{
                hidden: { opacity: 0, y: 10 },
                visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100 } }
              }}
              className={word.includes('Shree') || word.includes('Prem') || word.includes('value') || word.includes('genuinely') ? 'text-firefox-orange' : ''}
            >
              {word}
            </motion.span>
          ))}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default PageLoader;
