import React, { useState, useEffect } from 'react';
import { Joyride, STATUS, Step } from 'react-joyride';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';

const EcosystemTour = () => {
  const [run, setRun] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    // Check if user has seen tour
    const hasSeenTour = localStorage.getItem('ecosystem-tour-completed');
    
    // Only run automatically on the home page for new users
    if (!hasSeenTour && location.pathname === '/' && !user) {
      // Delay slightly to let the page load animations finish
      const timer = setTimeout(() => setRun(true), 1500);
      return () => clearTimeout(timer);
    }

    // Listen for manual trigger from Footer
    const handleStartTour = () => {
      // If we aren't on home, go to home first
      if (location.pathname !== '/') {
        navigate('/');
        setTimeout(() => setRun(true), 500);
      } else {
        setRun(true);
      }
    };

    window.addEventListener('start-ecosystem-tour', handleStartTour);
    return () => window.removeEventListener('start-ecosystem-tour', handleStartTour);
  }, [location.pathname, navigate, user]);

  const steps: Step[] = [
    {
      target: 'body',
      content: (
        <div className="text-left">
          <h3 className="text-base md:text-lg font-black uppercase tracking-tight text-zinc-900 mb-2">Welcome to MFC Open Web</h3>
          <p className="text-xs md:text-sm text-zinc-600 leading-relaxed font-medium">Step into a premium student startup ecosystem. Let us give you a quick tour of our digital headquarters.</p>
        </div>
      ),
      placement: 'center',
    },
    {
      target: '.tour-step-notifications',
      content: (
        <div className="text-left">
          <h3 className="text-xs md:text-sm font-black uppercase tracking-widest text-firefox-orange mb-1">Live Broadcasts</h3>
          <p className="text-xs md:text-sm text-zinc-600 leading-relaxed font-medium">Stay updated with real-time announcements, critical events, and fast-moving ecosystem updates directly from this ticker.</p>
        </div>
      ),
      placement: 'bottom',
    },
    {
      target: '.tour-step-navbar',
      content: (
        <div className="text-left">
          <h3 className="text-xs md:text-sm font-black uppercase tracking-widest text-firefox-orange mb-1">Command Center</h3>
          <p className="text-xs md:text-sm text-zinc-600 leading-relaxed font-medium">Navigate effortlessly between events, projects, blogs, and the leaderboard using our newly designed dynamic navigation pills.</p>
        </div>
      ),
      placement: 'bottom',
    },
    {
      target: isMobile ? '.tour-step-community-mobile' : '.tour-step-community',
      content: (
        <div className="text-left">
          <h3 className="text-xs md:text-sm font-black uppercase tracking-widest text-firefox-orange mb-1">The Builder Network</h3>
          <p className="text-xs md:text-sm text-zinc-600 leading-relaxed font-medium">Connect with the elite contributors, builders, and leaders who drive this ecosystem forward.</p>
        </div>
      ),
      placement: isMobile ? 'top' : 'bottom',
    },
    {
      target: isMobile ? '.tour-step-join-mobile' : '.tour-step-join',
      content: (
        <div className="text-left">
          <h3 className="text-xs md:text-sm font-black uppercase tracking-widest text-firefox-orange mb-1">Claim Your Spot</h3>
          <p className="text-xs md:text-sm text-zinc-600 leading-relaxed font-medium">Ready to dive in? Create your profile, unlock exclusive member tools, and start building with us today.</p>
        </div>
      ),
      placement: isMobile ? 'top' : 'bottom-end',
    }
  ];

  const handleJoyrideCallback = (data: any) => {
    const { status, type } = data;
    
    // Check if finished or skipped
    if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status as any)) {
      setRun(false);
      localStorage.setItem('ecosystem-tour-completed', 'true');
    }
  };

  return (
    <Joyride
      onEvent={handleJoyrideCallback}
      continuous
      run={run}
      scrollToFirstStep
      steps={steps}
      options={{
        buttons: ['back', 'close', 'primary', 'skip'],
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
        buttonBack: {
          color: '#71717a', // zinc-500
          fontSize: isMobile ? '10px' : '12px',
          fontWeight: 800,
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          marginRight: '8px',
        },
        buttonSkip: {
          color: '#a1a1aa', // zinc-400
          fontSize: isMobile ? '9px' : '10px',
          fontWeight: 800,
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
        },
        buttonClose: {
          width: isMobile ? '24px' : '32px',
          height: isMobile ? '24px' : '32px',
          color: '#a1a1aa', // zinc-400
          padding: '4px',
        }
      }}
    />
  );
};

export default EcosystemTour;
