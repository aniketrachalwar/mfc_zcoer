import React, { useState, useEffect } from 'react';
import { Joyride, STATUS, Step } from 'react-joyride';

const DashboardTour = () => {
  const [run, setRun] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const hasSeenTour = localStorage.getItem('dashboard-tour-completed');
    
    // Only run automatically for new users who haven't seen it
    if (!hasSeenTour) {
      const timer = setTimeout(() => setRun(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const steps: Step[] = [
    {
      target: 'body',
      content: (
        <div className="text-left">
          <h3 className="text-base md:text-lg font-black uppercase tracking-tight text-zinc-900 mb-2">Ecosystem Identity</h3>
          <p className="text-xs md:text-sm text-zinc-600 leading-relaxed font-medium">Track contributions, events, opportunities, and ecosystem growth here.</p>
        </div>
      ),
      placement: 'center',
    }
  ];

  const handleJoyrideCallback = (data: any) => {
    const { status } = data;
    if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status as any)) {
      setRun(false);
      localStorage.setItem('dashboard-tour-completed', 'true');
    }
  };

  return (
    <Joyride
      onEvent={handleJoyrideCallback}
      continuous
      run={run}
      steps={steps}
      options={{
        buttons: ['close', 'primary'],
        overlayClickAction: false,
        closeButtonAction: 'skip'
      }}
      styles={{
        overlay: {
          backgroundColor: 'rgba(9, 9, 11, 0.65)',
        },
        tooltip: {
          backgroundColor: '#ffffff',
          color: '#18181b',
          borderRadius: '16px',
          boxShadow: '0 10px 40px -10px rgba(0,0,0,0.2)',
          padding: isMobile ? '16px' : '24px',
          fontFamily: 'inherit',
          width: 'min(345px, 92vw)',
        },
        buttonPrimary: {
          backgroundColor: '#ff6a00',
          borderRadius: '8px',
          padding: isMobile ? '6px 12px' : '8px 16px',
          fontSize: isMobile ? '10px' : '12px',
          fontWeight: 800,
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
        },
        buttonClose: {
          width: isMobile ? '24px' : '32px',
          height: isMobile ? '24px' : '32px',
          color: '#a1a1aa',
          padding: '4px',
        }
      }}
    />
  );
};

export default DashboardTour;
