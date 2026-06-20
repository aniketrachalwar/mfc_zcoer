import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

export const LOADING_PHRASES = [
  "Building the future...",
  "Innovation takes time...",
  "Great things are coming...",
  "Fueling your potential...",
  "Preparing your workspace...",
  "Almost there, keep going...",
  "Success is a journey...",
  "Empowering your ideas...",
  "Crafting a better experience...",
  "Stay curious, keep learning...",
  "Unlocking new possibilities...",
  "Connecting the dots...",
  "Loading brilliance...",
  "Your next big idea awaits...",
  "Pushing the boundaries..."
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
              className={['future', 'innovation', 'great', 'potential', 'success', 'empowering', 'curious', 'possibilities', 'brilliance', 'idea', 'boundaries'].some(w => word.toLowerCase().includes(w)) ? 'text-firefox-orange' : ''}
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
