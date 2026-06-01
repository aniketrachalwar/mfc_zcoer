import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Calendar, MapPin, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';

const HomeUpcoming = () => {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const q = query(collection(db, 'events'), orderBy('date', 'asc'));
        const snap = await getDocs(q);
        const now = new Date().getTime();
        
        const fetchedEvents = snap.docs
          .map(doc => ({ id: doc.id, ...doc.data() } as any))
          .filter((event: any) => (event.status === 'approved' || !event.status) && new Date(event.date).getTime() > now)
          .slice(0, 3); // Just show top 3 upcoming

        setEvents(fetchedEvents);
      } catch (err) {
        console.error("Error fetching upcoming events:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  return (
    <div className="bg-zinc-950 pt-16 pb-16 relative border-t border-white/5">
      {/* Background elements */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-96 h-96 bg-firefox-orange/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 relative z-10">
        {/* Upcoming Events Grid */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="inline-flex items-center gap-3 px-4 py-2 bg-white/5 border border-white/10 rounded-full text-white text-[10px] font-black uppercase tracking-[0.2em] mb-4">
              <Calendar size={14} className="text-firefox-orange" />
              Calendar
            </div>
            <h2 className="text-3xl md:text-5xl font-display font-black uppercase tracking-tighter text-white">
              Upcoming <span className="text-firefox-orange">Events</span> ⭐
            </h2>
          </div>
          <Link to="/events" className="inline-flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-[10px] font-black uppercase tracking-widest text-white transition-all hover:scale-105 shrink-0">
            View All Events <ArrowRight size={14} />
          </Link>
        </div>

        {loading ? (
           <div className="flex justify-center py-12">
             <div className="w-8 h-8 border-2 border-firefox-orange border-t-transparent rounded-full animate-spin" />
           </div>
        ) : events.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event, i) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-zinc-900/50 border border-white/10 rounded-2xl overflow-hidden group flex flex-col hover:border-firefox-orange/30 transition-all backdrop-blur-md"
              >
                <div className="h-48 bg-zinc-950 relative overflow-hidden">
                  {event.img ? (
                    <img loading="lazy" src={event.img} alt={event.title} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-zinc-900 to-black">
                      <Calendar size={32} className="text-zinc-800" />
                    </div>
                  )}
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 bg-black/60 backdrop-blur-md border border-white/10 rounded-full text-[10px] font-black uppercase tracking-widest text-firefox-orange">
                      {event.type || 'Event'}
                    </span>
                  </div>
                </div>
                <div className="p-6 flex-1 flex flex-col">
                  <h3 className="text-xl font-display font-bold text-white mb-2 line-clamp-2">{event.title}</h3>
                  <p className="text-zinc-400 text-sm line-clamp-2 mb-6 flex-1">{event.desc}</p>
                  <div className="space-y-2 mb-6">
                    <div className="flex items-center gap-2 text-xs text-zinc-500 font-bold tracking-wider">
                      <Calendar size={14} className="text-firefox-orange" />
                      {new Date(event.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </div>
                    {event.location && (
                      <div className="flex items-center gap-2 text-xs text-zinc-500 font-bold tracking-wider">
                        <MapPin size={14} className="text-firefox-orange" />
                        {event.location}
                      </div>
                    )}
                  </div>
                  <Link 
                    to={`/event/${event.id}`}
                    className="flex items-center gap-2 text-white font-bold text-[10px] uppercase tracking-widest hover:text-firefox-orange transition-colors mt-auto group/btn"
                  >
                    View Details <ArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white/5 border border-white/10 rounded-3xl">
            <Calendar size={48} className="mx-auto text-zinc-600 mb-4" />
            <h3 className="text-xl font-display font-bold text-white mb-2">More Events Coming Soon</h3>
            <p className="text-zinc-400 max-w-md mx-auto">We are planning some exciting sessions. Keep an eye on our calendar!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default HomeUpcoming;
