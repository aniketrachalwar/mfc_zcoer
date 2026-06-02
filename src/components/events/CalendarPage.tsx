import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Calendar, ArrowLeft, MapPin } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import PageLoader from '../PageLoader';
import { motion } from 'motion/react';

const CalendarPage = () => {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const snap = await getDocs(collection(db, 'events'));
        const list = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
        const approvedEvents = list.filter(e => e.status === 'approved' || !e.status);
        setEvents(approvedEvents);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  if (loading) {
    return <PageLoader fullScreen={true} />;
  }

  const now = new Date().getTime();
  
  // Only future events (or those happening today), sorted from closest to farthest
  const upcomingEvents = events
    .filter(e => new Date(e.date).getTime() >= now - 86400000) // Keep events from today as well
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <div className="pt-32 pb-20 px-4 min-h-screen relative">
      <div className="max-w-4xl mx-auto relative z-10">
        <div className="mb-12 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <span className="text-firefox-orange font-bold uppercase tracking-widest text-xs mb-2 block">Timeline</span>
            <h1 className="text-4xl md:text-5xl font-display font-black uppercase tracking-tight">
              Event <span className="text-firefox-orange">Calendar</span>
            </h1>
          </div>
          <Link
            to="/events"
            className="flex items-center gap-2 px-6 py-3 rounded-full font-bold text-sm uppercase tracking-widest transition-all bg-white/5 text-zinc-300 hover:text-white hover:bg-white/10 self-start md:self-auto border border-white/10"
          >
            <ArrowLeft size={18} /> Back to Events
          </Link>
        </div>

        {upcomingEvents.length > 0 ? (
          <div className="relative border-l-2 border-white/10 ml-4 md:ml-8 py-8 space-y-12">
            {upcomingEvents.map((event, index) => (
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                key={event.id} 
                className="relative pl-8 md:pl-12 group"
              >
                <div className="absolute -left-[9px] top-8 w-4 h-4 bg-firefox-orange rounded-full shadow-[0_0_15px_rgba(255,92,0,0.6)]" />
                
                <div 
                  onClick={() => navigate(`/event/${event.id}`)} 
                  className="relative overflow-hidden rounded-3xl cursor-pointer transition-all hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(255,92,0,0.2)] border border-white/10 group-hover:border-firefox-orange/50 min-h-[220px] flex flex-col justify-end p-6 md:p-8"
                >
                  {/* Background Image */}
                  {event.img && (
                    <div 
                      className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                      style={{ backgroundImage: `url(${event.img})` }}
                    />
                  )}
                  {/* Gradient Overlay for Text Readability */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/80 to-transparent" />
                  
                  {/* Content */}
                  <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-4 mt-12">
                    <div className="flex-1">
                      <div className="text-firefox-orange text-xs font-bold tracking-widest mb-3 uppercase flex items-center gap-2 drop-shadow-md">
                        <Calendar size={14} />
                        {new Date(event.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                      </div>
                      <h3 className="text-2xl md:text-3xl font-display font-black text-white mb-3 drop-shadow-lg leading-tight">{event.title}</h3>
                      {event.location && (
                         <div className="flex items-center gap-2 text-xs text-zinc-300 font-bold tracking-wider">
                           <MapPin size={14} className="text-firefox-orange" />
                           {event.location}
                         </div>
                      )}
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="px-4 py-2 bg-firefox-orange/20 backdrop-blur-md border border-firefox-orange/50 rounded-full text-[10px] font-black uppercase tracking-widest text-firefox-orange whitespace-nowrap shadow-xl">
                        {event.type || 'Event'}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white/5 border border-white/10 rounded-3xl">
            <Calendar size={48} className="mx-auto text-zinc-600 mb-4" />
            <h3 className="text-xl font-display font-bold text-white mb-2">No Upcoming Events</h3>
            <p className="text-zinc-400">Stay tuned for future events!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CalendarPage;
