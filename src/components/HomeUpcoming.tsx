import { useState } from 'react';
import { motion } from 'motion/react';
import { Calendar, MapPin, ArrowRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useEvents } from '../lib/useEvents';

const HomeUpcoming = () => {
  const { events: allEvents, loading } = useEvents();
  const events = allEvents.slice(0, 3);
  const navigate = useNavigate();

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
                onClick={() => navigate(`/event/${event.id}`)}
                className="relative h-[340px] rounded-3xl overflow-hidden group flex flex-col justify-end cursor-pointer border border-white/10 hover:border-firefox-orange/50 transition-all shadow-2xl"
              >
                {/* Background Image */}
                <div className="absolute inset-0 bg-zinc-950">
                  {event.img ? (
                    <img loading="lazy" src={event.img} alt={event.title} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-zinc-900 to-black">
                      <Calendar size={48} className="text-zinc-800" />
                    </div>
                  )}
                </div>

                {/* Gradient Overlay for Text Readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent opacity-90 group-hover:opacity-100 transition-opacity" />
                
                {/* Content */}
                <div className="relative z-10 p-6 w-full flex flex-col gap-3 translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                  <div className="flex items-start">
                    <span className="px-3 py-1 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-[10px] font-black uppercase tracking-widest text-firefox-orange mb-2">
                      {event.type || 'Event'}
                    </span>
                  </div>
                  
                  <h3 className="text-2xl font-display font-black text-white line-clamp-2 uppercase tracking-tight group-hover:text-firefox-orange transition-colors">
                    {event.title}
                  </h3>
                  
                  <div className="flex items-center justify-between mt-2 pt-4 border-t border-white/10">
                    <div className="flex items-center gap-2 text-xs text-zinc-300 font-bold tracking-widest uppercase">
                      <Calendar size={14} className="text-firefox-orange" />
                      {new Date(event.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </div>
                    
                    <div className="w-8 h-8 rounded-full bg-firefox-orange/20 flex items-center justify-center text-firefox-orange group-hover:bg-firefox-orange group-hover:text-white transition-all shadow-[0_0_15px_rgba(255,92,0,0)] group-hover:shadow-[0_0_15px_rgba(255,92,0,0.5)]">
                      <ArrowRight size={14} className="group-hover:-rotate-45 transition-transform" />
                    </div>
                  </div>
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
