import React, { useEffect, useRef, useState } from 'react';

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
  const [adStatus, setAdStatus] = useState<'loading' | 'filled' | 'unfilled'>('loading');
  const containerRef = useRef<HTMLDivElement>(null);
  const insRef = useRef<HTMLModElement>(null);

  useEffect(() => {
    // Observe ad status changes directly from the AdSense <ins> tag
    if (!insRef.current) return;
    
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'data-ad-status') {
          const status = (mutation.target as HTMLElement).getAttribute('data-ad-status');
          if (status === 'filled') {
            setAdStatus('filled');
          } else if (status === 'unfilled') {
            setAdStatus('unfilled');
          }
        }
      });
    });

    observer.observe(insRef.current, { attributes: true });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
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

  // If AdSense specifically says it's unfilled, we can collapse completely
  if (adStatus === 'unfilled') return null;

  return (
    <div 
      id={id}
      ref={containerRef}
      className={`w-full max-w-4xl mx-auto relative flex items-center justify-center transition-all duration-500 overflow-hidden group ${className} ${
        adStatus === 'filled' ? 'my-12 min-h-[100px]' : 'my-0 h-0 opacity-0'
      }`}
    >
      {adStatus === 'filled' && (
        <div className="absolute -top-3 left-6 px-3 py-1 bg-zinc-900 border border-white/10 rounded-full z-10 text-[8px] font-black uppercase tracking-[0.3em] text-zinc-500 group-hover:text-firefox-orange transition-colors duration-300">
          Advertisement
        </div>
      )}

      <div className={`relative z-0 w-full flex justify-center bg-transparent rounded-2xl transition-all duration-500 ${
        adStatus === 'filled' ? 'p-4 border border-white/5 bg-black/20 backdrop-blur-sm opacity-100' : 'opacity-0'
      }`}>
        <ins
          ref={insRef}
          className="adsbygoogle"
          style={{ display: 'block', width: '100%' }}
          data-ad-client="ca-pub-8341369304240746"
          data-ad-slot={adSlot}
          data-ad-format={adFormat}
          data-full-width-responsive="true"
        />
      </div>
    </div>
  );
};

export default AdSenseBlock;
