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
        const now = new Date().toISOString();
        const q = query(collection(db, 'events'), orderBy('date', 'asc'));
        const snap = await getDocs(q);
        
        const fetchedEvents = snap.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          // Filter out past events
          .filter((event: any) => new Date(event.date).getTime() > new Date().getTime());

        setEvents(fetchedEvents);
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
    <section className="bg-zinc-950 border-b border-white/5 py-16 relative overflow-hidden min-h-[400px] flex items-center">
      <div className="absolute inset-0 bg-firefox-orange/5 blur-3xl rounded-full translate-y-1/2 pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-4 relative z-10 w-full">
        <AnimatePresence mode="wait">
          <motion.div 
            key={activeEvent.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col lg:flex-row items-center justify-between gap-12"
          >
            <div className="text-center lg:text-left flex-1">
              <span className="text-firefox-orange font-bold text-[10px] uppercase tracking-[0.3em] mb-4 block">
                {activeEvent.type || 'Upcoming Event'}
              </span>
              
              <h2 className="text-4xl md:text-5xl font-display font-black uppercase tracking-tight mb-4">
                {activeEvent.title?.split(' ').slice(0, 2).join(' ')} <br/>
                <span className="text-transparent" style={{ WebkitTextStroke: '1px rgba(255,255,255,0.5)' }}>
                  {activeEvent.title?.split(' ').slice(2).join(' ')}
                </span>
              </h2>
              
              <p className="text-zinc-400 max-w-lg mx-auto lg:mx-0 text-sm mb-6 line-clamp-3">
                {activeEvent.desc}
              </p>
              
              <div className="flex items-center justify-center lg:justify-start gap-4 text-zinc-300 text-sm font-bold uppercase tracking-wider">
                 <span className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/10">
                   <Calendar size={16} className="text-firefox-orange"/> 
                   {new Date(activeEvent.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                 </span>
              </div>
            </div>

            <div className="flex flex-col items-center lg:items-end gap-8 flex-1 w-full">
              <div className="flex gap-3 md:gap-4 text-center justify-center lg:justify-end w-full">
                {Object.entries(timeLeft).map(([unit, value]) => (
                  <div key={unit} className="w-16 h-16 md:w-20 md:h-20 bg-zinc-900 border border-white/10 rounded-2xl flex flex-col items-center justify-center backdrop-blur-md shadow-xl">
                    <span className="text-2xl md:text-3xl font-display font-black text-white">{value.toString().padStart(2, '0')}</span>
                    <span className="text-[8px] md:text-[10px] uppercase tracking-widest text-zinc-500 font-bold">{unit}</span>
                  </div>
                ))}
              </div>
              
              <div className="flex items-center gap-4">
                {events.length > 1 && (
                  <div className="flex gap-2">
                    <button onClick={handlePrev} className="p-3 bg-white/5 border border-white/10 rounded-full hover:bg-firefox-orange hover:text-white transition-colors text-zinc-400">
                      <ChevronLeft size={16} />
                    </button>
                    <button onClick={handleNext} className="p-3 bg-white/5 border border-white/10 rounded-full hover:bg-firefox-orange hover:text-white transition-colors text-zinc-400">
                      <ChevronRight size={16} />
                    </button>
                  </div>
                )}
                <Link to={`/event/${activeEvent.id}`} className="inline-flex items-center gap-2 px-8 py-4 bg-firefox-orange text-white rounded-full font-display font-black text-[10px] uppercase tracking-[0.2em] hover:bg-white hover:text-black transition-all shadow-[0_0_20px_rgba(255,92,0,0.2)] group">
                  View Details <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
        
        {/* Pagination Dots */}
        {events.length > 1 && (
          <div className="absolute bottom-[-20px] left-1/2 -translate-x-1/2 flex gap-2">
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
