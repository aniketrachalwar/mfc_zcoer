import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';

interface AdSenseBlockProps {
  adSlot: string;
  adFormat?: 'auto' | 'fluid' | 'rectangle';
  className?: string;
  id?: string;
}

const AdSenseBlock: React.FC<AdSenseBlockProps> = ({ 
  adSlot, 
  adFormat = 'auto', 
  className = '',
  id
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // We wrap this in a timeout to ensure the DOM has updated
    // before pushing the ad request to Google's script
    const loadAd = () => {
      try {
        if (typeof window !== 'undefined') {
          // @ts-ignore
          const adsbygoogle = window.adsbygoogle || [];
          adsbygoogle.push({});
          setIsLoaded(true);
        }
      } catch (err) {
        console.error('AdSense Error:', err);
      }
    };

    // Use IntersectionObserver to lazy load the ad when it enters the viewport
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !isLoaded) {
            loadAd();
            observer.disconnect();
          }
        });
      },
      { threshold: 0.1, rootMargin: '200px' }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [isLoaded]);

  return (
    <div 
      id={id}
      ref={containerRef}
      className={`w-full max-w-4xl mx-auto my-12 relative flex items-center justify-center min-h-[100px] overflow-hidden group ${className}`}
    >
      {/* Premium Skeleton Placeholder */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjIiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wNSkiLz48L3N2Zz4=')] opacity-50" />
          <motion.div 
            initial={{ opacity: 0.3 }}
            animate={{ opacity: 1 }}
            transition={{ repeat: Infinity, duration: 1.5, repeatType: "reverse" }}
            className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600 relative z-10"
          >
            Sponsor
          </motion.div>
        </div>
      )}
      
      {/* Decorative label to maintain premium feel even when ad is loaded */}
      {isLoaded && (
        <div className="absolute -top-3 left-6 px-3 py-1 bg-zinc-900 border border-white/10 rounded-full z-10 text-[8px] font-black uppercase tracking-[0.3em] text-zinc-500 group-hover:text-firefox-orange transition-colors duration-300">
          Advertisement
        </div>
      )}

      <div className={`relative z-0 w-full flex justify-center bg-transparent rounded-2xl ${isLoaded ? 'p-4 border border-white/5 bg-black/20 backdrop-blur-sm' : ''}`}>
        <ins
          className="adsbygoogle"
          style={{ display: 'block', width: '100%', minHeight: '100px' }}
          data-ad-client="ca-pub-XXXXXXXXXXXXXXXX" // Replace with actual Publisher ID if provided in future
          data-ad-slot={adSlot}
          data-ad-format={adFormat}
          data-full-width-responsive="true"
        />
      </div>
    </div>
  );
};

export default AdSenseBlock;
