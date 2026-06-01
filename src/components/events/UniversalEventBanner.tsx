import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const UniversalEventBanner = () => {
  const location = useLocation();
  const isEventsPage = location.pathname === '/events';

  const handleScroll = (e: React.MouseEvent) => {
    if (isEventsPage) {
      e.preventDefault();
      document.getElementById('explore')?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="bg-gradient-to-r from-firefox-orange/10 via-firefox-orange/5 to-transparent border border-firefox-orange/20 rounded-[2rem] p-8 md:p-12 mb-12 relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-64 h-64 bg-firefox-orange/20 blur-[100px] pointer-events-none group-hover:bg-firefox-orange/30 transition-colors" />
      <div className="relative z-10 max-w-3xl">
        <h2 className="text-2xl md:text-4xl font-display font-black uppercase tracking-tight text-white mb-4">
          College's First Universal <br className="hidden md:block" />
          <span className="text-firefox-orange">Event Platform</span>
        </h2>
        <p className="text-zinc-300 md:text-lg mb-8 leading-relaxed">
          Discover and attend any hackathon, workshop, or meetup happening on campus. 
          Are you organizing something awesome? Showcase your event here and reach the entire student ecosystem!
        </p>
        <div className="flex flex-wrap gap-4">
          <Link to="/host-event" className="px-8 py-3 bg-firefox-orange text-white rounded-full font-bold uppercase tracking-widest text-xs shadow-[0_0_20px_rgba(255,106,0,0.3)] hover:bg-white hover:text-black transition-all">
            Host an Event
          </Link>
          {isEventsPage ? (
             <a href="#explore" onClick={handleScroll} className="px-8 py-3 bg-white/5 border border-white/10 text-white rounded-full font-bold uppercase tracking-widest text-xs hover:bg-white/10 transition-all">
               Browse Events
             </a>
          ) : (
             <Link to="/events" className="px-8 py-3 bg-white/5 border border-white/10 text-white rounded-full font-bold uppercase tracking-widest text-xs hover:bg-white/10 transition-all">
               Browse Events
             </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default UniversalEventBanner;
