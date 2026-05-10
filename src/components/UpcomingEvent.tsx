import { useState, useEffect } from 'react';
import { Calendar, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const UpcomingEvent = () => {
  const eventDate = new Date('2026-05-25T09:00:00').getTime();
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = eventDate - now;

      if (distance < 0) {
        clearInterval(timer);
        return;
      }

      setTimeLeft({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000)
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [eventDate]);

  return (
    <section className="bg-zinc-950 border-b border-white/5 py-16 relative overflow-hidden">
      <div className="absolute inset-0 bg-firefox-orange/5 blur-3xl rounded-full translate-y-1/2" />
      <div className="max-w-7xl mx-auto px-4 relative z-10 flex flex-col lg:flex-row items-center justify-between gap-12">
        <div className="text-center lg:text-left flex-1">
          <span className="text-firefox-orange font-bold text-[10px] uppercase tracking-[0.3em] mb-4 block">Next Big Thing</span>
          <h2 className="text-4xl md:text-5xl font-display font-black uppercase tracking-tight mb-4">Open Source <br/><span className="text-transparent" style={{ WebkitTextStroke: '1px rgba(255,255,255,0.5)' }}>Hackathon 2026</span></h2>
          <p className="text-zinc-400 max-w-lg mx-auto lg:mx-0 text-sm mb-6">Join us for a 48-hour coding marathon to build open-source tools for the community. Prizes, swags, and lots of caffeine!</p>
          <div className="flex items-center justify-center lg:justify-start gap-4 text-zinc-300 text-sm font-bold uppercase tracking-wider">
             <span className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/10"><Calendar size={16} className="text-firefox-orange"/> May 25, 2026</span>
          </div>
        </div>

        <div className="flex flex-col items-center lg:items-end gap-8 flex-1">
          <div className="flex gap-3 md:gap-4 text-center">
            {Object.entries(timeLeft).map(([unit, value]) => (
              <div key={unit} className="w-16 h-16 md:w-20 md:h-20 bg-zinc-900 border border-white/10 rounded-2xl flex flex-col items-center justify-center backdrop-blur-md shadow-xl">
                <span className="text-2xl md:text-3xl font-display font-black text-white">{value.toString().padStart(2, '0')}</span>
                <span className="text-[8px] md:text-[10px] uppercase tracking-widest text-zinc-500 font-bold">{unit}</span>
              </div>
            ))}
          </div>
          <Link to="/event/hackathon-2026" className="inline-flex items-center gap-2 px-8 py-4 bg-firefox-orange text-white rounded-full font-display font-black text-[10px] uppercase tracking-[0.2em] hover:bg-white hover:text-black transition-all shadow-[0_0_20px_rgba(255,92,0,0.2)] group">
            View Details <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default UpcomingEvent;
