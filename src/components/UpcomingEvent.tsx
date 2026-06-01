import { useState, useEffect } from 'react';
import { Calendar, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { collection, getDocs, query, orderBy, where } from 'firebase/firestore';
import { db } from '../lib/firebase';

const UpcomingEvent = () => {
  const [events, setEvents] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [loading, setLoading] = useState(true);

  // Fetch upcoming events from Firestore
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const now = new Date().getTime();
        const q = query(collection(db, 'events'), orderBy('date', 'asc'));
        const snap = await getDocs(q);
        
        const list = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        // Filter out pending events and past events
        const upcomingList = list.filter((e: any) => 
          (e.status === 'approved' || !e.status) && 
          new Date(e.date).getTime() >= now
        );
        
        upcomingList.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        setEvents(upcomingList);
      } catch (err) {
        console.error("Error fetching upcoming events:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  // Fallback to hardcoded event if no upcoming events are in the database
  const activeEvent = events.length > 0 ? events[currentIndex] : {
    id: "hackathon-2026",
    title: "Open Source Hackathon 2026",
    type: "Next Big Thing",
    desc: "Join us for a 48-hour coding marathon to build open-source tools for the community. Prizes, swags, and lots of caffeine!",
    date: "2026-05-25T09:00:00"
  };

  // Timer logic for the currently displayed event
  useEffect(() => {
    if (!activeEvent?.date) return;

    const eventDate = new Date(activeEvent.date).getTime();

    const calculateTime = () => {
      const now = new Date().getTime();
      const distance = eventDate - now;

      if (distance < 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      setTimeLeft({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000)
      });
    };

    calculateTime(); // run immediately
    const timer = setInterval(calculateTime, 1000);

    return () => clearInterval(timer);
  }, [activeEvent.date]);

  // Slide logic
  useEffect(() => {
    if (events.length <= 1) return;

    const slider = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % events.length);
    }, 8000); // slide every 8 seconds

    return () => clearInterval(slider);
  }, [events.length]);

  const handleNext = () => setCurrentIndex((prev) => (prev + 1) % events.length);
  const handlePrev = () => setCurrentIndex((prev) => (prev - 1 + events.length) % events.length);

  if (loading) {
    return (
      <section className="bg-zinc-950 py-16 flex items-center justify-center min-h-[300px]">
        <div className="w-8 h-8 border-4 border-firefox-orange border-t-transparent rounded-full animate-spin" />
      </section>
    );
  }



  return (
    <section className="relative w-full min-h-[100dvh] lg:min-h-screen flex items-center justify-center overflow-hidden border-b border-white/5 group/section">
      {/* Dynamic Background Image */}
      {activeEvent.img ? (
        <div 
          className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 group-hover/section:scale-105"
          style={{ backgroundImage: `url(${activeEvent.img})` }}
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 via-black to-zinc-900" />
      )}
      
      {/* Dark Overlay for Readability */}
      <div className="absolute inset-0 bg-black/50" />
      <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/80 to-transparent" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-firefox-orange/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 relative z-10 w-full py-12 lg:py-20">
        <AnimatePresence mode="wait">
          <motion.div 
            key={activeEvent.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-16"
          >
            <div className="text-center lg:text-left flex-1 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-firefox-orange/20 border border-firefox-orange/30 rounded-full mb-4 lg:mb-6">
                <span className="w-2 h-2 rounded-full bg-firefox-orange animate-pulse" />
                <span className="text-firefox-orange font-black text-[10px] uppercase tracking-[0.3em]">
                  {activeEvent.type || 'Featured Event'}
                </span>
              </div>
              
              <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-display font-black uppercase tracking-tighter mb-4 lg:mb-6 leading-[0.9]">
                {activeEvent.title?.split(' ').slice(0, 2).join(' ')} <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-white/50">
                  {activeEvent.title?.split(' ').slice(2).join(' ')}
                </span>
              </h2>
              
              <p className="text-zinc-300 text-sm md:text-base lg:text-lg mb-6 lg:mb-8 line-clamp-2 lg:line-clamp-3 leading-relaxed">
                {activeEvent.desc}
              </p>
              
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 text-white text-xs font-bold uppercase tracking-wider">
                 <span className="flex items-center gap-2 px-5 py-3 bg-white/10 backdrop-blur-md rounded-xl border border-white/10">
                   <Calendar size={18} className="text-firefox-orange"/> 
                   {new Date(activeEvent.date).toLocaleDateString(undefined, { weekday: 'short', month: 'long', day: 'numeric', year: 'numeric' })}
                 </span>
                 {activeEvent.location && (
                   <span className="flex items-center gap-2 px-5 py-3 bg-white/10 backdrop-blur-md rounded-xl border border-white/10">
                     <span className="w-4 h-4 text-firefox-orange">📍</span>
                     {activeEvent.location}
                   </span>
                 )}
              </div>
            </div>

            <div className="flex flex-col items-center lg:items-end gap-10 flex-1 w-full max-w-xl">
              <div className="grid grid-cols-4 gap-3 md:gap-4 w-full">
                {Object.entries(timeLeft).map(([unit, value]) => (
                  <div key={unit} className="bg-white/5 border border-white/10 rounded-2xl flex flex-col items-center justify-center py-4 lg:py-6 backdrop-blur-xl shadow-2xl relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <span className="text-2xl md:text-4xl lg:text-5xl font-display font-black text-white mb-1 relative z-10">{value.toString().padStart(2, '0')}</span>
                    <span className="text-[10px] md:text-xs uppercase tracking-[0.2em] text-firefox-orange font-bold relative z-10">{unit}</span>
                  </div>
                ))}
              </div>
              
              <div className="flex items-center justify-center lg:justify-end gap-4 w-full mt-4">
                {events.length > 1 && (
                  <div className="flex gap-2">
                    <button onClick={handlePrev} className="p-4 bg-white/5 border border-white/10 rounded-full hover:bg-firefox-orange hover:text-white transition-colors text-white backdrop-blur-md">
                      <ChevronLeft size={20} />
                    </button>
                    <button onClick={handleNext} className="p-4 bg-white/5 border border-white/10 rounded-full hover:bg-firefox-orange hover:text-white transition-colors text-white backdrop-blur-md">
                      <ChevronRight size={20} />
                    </button>
                  </div>
                )}
                <div className="relative">
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 z-20">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-4 w-4 bg-white border-2 border-firefox-orange"></span>
                  </span>
                  <Link to={`/event/${activeEvent.id}`} className="inline-flex items-center gap-3 px-8 py-4 bg-firefox-orange text-white rounded-full font-black text-xs uppercase tracking-[0.2em] hover:bg-white hover:text-black transition-all shadow-[0_0_30px_rgba(255,92,0,0.4)] group relative z-10">
                    Secure Your Spot <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
        
        {/* Pagination Dots */}
        {events.length > 1 && (
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3 z-20">
            {events.map((_, idx) => (
              <button 
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`h-1.5 rounded-full transition-all ${idx === currentIndex ? 'w-6 bg-firefox-orange' : 'w-1.5 bg-white/20 hover:bg-white/40'}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default UpcomingEvent;
