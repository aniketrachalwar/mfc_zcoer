import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Calendar, MapPin, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';

const EventsPage = () => {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const snap = await getDocs(collection(db, 'events'));
        const list = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        // Sort by date ascending
        list.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        setEvents(list);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  if (loading) {
    return (
      <div className="pt-32 pb-20 px-4 min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-firefox-orange border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const now = new Date().getTime();
  const upcomingEvents = events.filter(e => new Date(e.date).getTime() >= now);
  const pastEvents = events.filter(e => new Date(e.date).getTime() < now);

  const EventCard = ({ event }: { event: any }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden group flex flex-col"
    >
      <div className="h-48 bg-zinc-900 relative overflow-hidden">
        {event.img ? (
          <img src={event.img} alt={event.title} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-zinc-900 to-black">
            <Calendar size={32} className="text-zinc-800" />
          </div>
        )}
        <div className="absolute top-4 left-4">
          <span className="px-3 py-1 bg-black/50 backdrop-blur border border-white/10 rounded-full text-[10px] font-black uppercase tracking-widest text-firefox-orange">
            {event.type}
          </span>
        </div>
      </div>
      <div className="p-6 flex-1 flex flex-col">
        <h3 className="text-xl font-display font-bold text-white mb-2">{event.title}</h3>
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
          className="flex items-center gap-2 text-white font-bold text-sm hover:text-firefox-orange transition-colors mt-auto"
        >
          View Details <ArrowRight size={16} />
        </Link>
      </div>
    </motion.div>
  );

  return (
    <div className="pt-32 pb-20 px-4 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="mb-16">
          <span className="text-firefox-orange font-bold uppercase tracking-widest text-xs">Sessions</span>
          <h1 className="text-4xl md:text-6xl font-display font-black uppercase tracking-tight mt-2 mb-4">
            All <span className="text-firefox-orange">Events</span>
          </h1>
          <p className="text-zinc-400 max-w-2xl text-lg">
            Join our upcoming hackathons, workshops, and open-source sprints. Or browse our past events to see what we've been up to.
          </p>
        </div>

        {upcomingEvents.length > 0 && (
          <div className="mb-20">
            <h2 className="text-2xl font-display font-black uppercase text-white mb-8 flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              Upcoming Sessions
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {upcomingEvents.map(event => <EventCard key={event.id} event={event} />)}
            </div>
          </div>
        )}

        {pastEvents.length > 0 && (
          <div>
            <h2 className="text-2xl font-display font-black uppercase text-zinc-500 mb-8">
              Completed Sessions
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 opacity-75 hover:opacity-100 transition-opacity">
              {pastEvents.map(event => <EventCard key={event.id} event={event} />)}
            </div>
          </div>
        )}
        
        {events.length === 0 && (
          <div className="text-center py-20 bg-white/5 border border-white/10 rounded-3xl">
            <Calendar size={48} className="mx-auto text-zinc-600 mb-4" />
            <h3 className="text-xl font-display font-bold text-white mb-2">No Events Found</h3>
            <p className="text-zinc-400">We are planning some exciting sessions. Check back soon!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventsPage;
