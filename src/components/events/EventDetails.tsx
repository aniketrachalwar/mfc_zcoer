import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Calendar, MapPin, Trophy, ArrowLeft, CheckCircle2, Clock, Download } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../lib/AuthContext';
import { QRCodeSVG } from 'qrcode.react';
import { toPng } from 'html-to-image';

const EventDetails = () => {
  const { id } = useParams<{ id: string }>();
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [attending, setAttending] = useState(false);
  const [ticketId, setTicketId] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchEvent = async () => {
      if (!id) return;
      
      // Fallback for hardcoded preview event
      if (id === 'hackathon-2026') {
        setEvent({
          id: 'hackathon-2026',
          title: "Open Source Hackathon 2026",
          type: "Upcoming Event",
          desc: "Join the brightest minds at ZCOER for a 48-hour coding marathon. Build innovative open-source tools, collaborate with peers, and win exciting prizes. Whether you are a beginner or a pro, there's a place for you here.",
          date: "2026-05-25T09:00:00",
          location: "Innovation Hub, ZCOER Pune",
          prizes: "₹50,000 Pool + Exclusive Swags"
        });
        setLoading(false);
        return;
      }

      try {
        const docRef = doc(db, 'events', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setEvent({ id: docSnap.id, ...docSnap.data() });
        } else {
          console.error("Event not found");
        }
      } catch (err) {
        console.error("Error fetching event details:", err);
      }
      
      // Check if user already has a ticket
      if (user && id && id !== 'hackathon-2026') {
        try {
          const tktRef = doc(db, 'tickets', `${user.uid}_${id}`);
          const tktSnap = await getDoc(tktRef);
          if (tktSnap.exists()) {
            setAttending(true);
            setTicketId(tktSnap.id);
          }
        } catch (err) {
          console.error("Error fetching ticket:", err);
        }
      }
      
      setLoading(false);
    };
    fetchEvent();
  }, [id, user]);

  useEffect(() => {
    if (!event || !event.date) return;

    const eventDate = new Date(event.date).getTime();

    const calculateTime = () => {
      const now = new Date().getTime();
      const distance = eventDate - now;

      if (distance < 0) {
        clearInterval(timer);
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

    calculateTime();
    var timer = setInterval(calculateTime, 1000);

    return () => clearInterval(timer);
  }, [event]);

  if (loading) {
    return (
      <div className="pt-32 pb-20 px-4 min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-firefox-orange border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="pt-32 pb-20 px-4 min-h-screen text-center flex flex-col items-center justify-center">
        <h1 className="text-4xl font-display font-black uppercase text-white mb-4">Event Not Found</h1>
        <p className="text-zinc-400 mb-8">The event you are looking for does not exist or has been removed.</p>
        <Link to="/" className="px-8 py-3 bg-firefox-orange text-white rounded-full font-display font-black text-[10px] uppercase tracking-widest">
          Return Home
        </Link>
      </div>
    );
  }

  const handleAttend = async () => {
    if (!user) {
      alert("Please log in to register for events.");
      return;
    }
    
    if (id === 'hackathon-2026') {
      setAttending(true);
      return;
    }

    const newTicketId = `${user.uid}_${id}`;
    try {
      await setDoc(doc(db, 'tickets', newTicketId), {
        userId: user.uid,
        eventId: id,
        verified: false,
        timestamp: new Date().toISOString()
      });
      setAttending(true);
      setTicketId(newTicketId);
    } catch (e) {
      console.error("Failed to register for event", e);
      alert("Failed to register. Please try again.");
    }
  };

  const handleDownloadTicket = async () => {
    const ticketElement = document.getElementById('ticket-card');
    if (!ticketElement) return;

    try {
      const dataUrl = await toPng(ticketElement, { cacheBust: true, backgroundColor: '#09090b' });
      const link = document.createElement('a');
      link.download = `ticket-${id}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Failed to download ticket image', err);
    }
  };

  const isPast = new Date(event.date).getTime() < new Date().getTime();

  return (
    <div className="pt-32 pb-20 px-4 min-h-screen relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-firefox-orange/10 blur-[150px] rounded-full pointer-events-none" />
      
      <div className="max-w-6xl mx-auto relative z-10">
        <Link to="/" className="inline-flex items-center gap-2 text-zinc-500 hover:text-white transition-colors mb-12 group">
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          <span className="text-[10px] font-black uppercase tracking-widest">Back to Home</span>
        </Link>

        <div className="grid lg:grid-cols-2 gap-16 items-start">
          <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }}>
            <span className="inline-block px-4 py-2 bg-firefox-orange/20 text-firefox-orange rounded-full text-[10px] font-black uppercase tracking-widest mb-6 border border-firefox-orange/20">
              {event.type || 'Event'}
            </span>
            <h1 className="text-5xl md:text-7xl font-display font-black uppercase tracking-tight mb-8 leading-[0.9]">
              {event.title?.split(' ').slice(0, 2).join(' ')} <br />
              <span className="text-firefox-orange">{event.title?.split(' ').slice(2).join(' ')}</span>
            </h1>
            
            <p className="text-zinc-400 text-lg mb-12 leading-relaxed">
              {event.desc}
            </p>

            <div className="space-y-8 mb-12">
              <div className="flex items-center gap-6">
                <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-zinc-400">
                  <Calendar size={24} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Date & Time</p>
                  <p className="font-bold text-lg">
                    {new Date(event.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} • {new Date(event.date).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-zinc-400">
                  <MapPin size={24} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Location</p>
                  <p className="font-bold text-lg">{event.location || 'TBA'}</p>
                </div>
              </div>
              {event.prizes && (
                <div className="flex items-center gap-6">
                  <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-zinc-400">
                    <Trophy size={24} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Prizes</p>
                    <p className="font-bold text-lg">{event.prizes}</p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} className="flex flex-col lg:items-end justify-center w-full sticky top-32">
            <div className="bg-zinc-900/50 border border-white/10 rounded-[3rem] p-8 md:p-12 backdrop-blur-xl w-full text-center relative overflow-hidden group hover:border-firefox-orange/30 transition-all duration-500">
              <div className="absolute inset-0 bg-gradient-to-b from-firefox-orange/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <div className="relative z-10">
                <h3 className="text-xs font-black uppercase tracking-[0.3em] text-zinc-400 mb-10">
                  {isPast ? 'Event Concluded' : 'Event Starts In'}
                </h3>
                
                {!isPast ? (
                  <div className="grid grid-cols-4 gap-3 md:gap-6 mb-12">
                    {Object.entries(timeLeft).map(([unit, value]) => (
                      <div key={unit} className="flex flex-col items-center">
                        <div className="w-full aspect-square bg-zinc-950 rounded-3xl flex items-center justify-center border border-white/5 mb-4 shadow-inner">
                          <span className="text-3xl md:text-5xl font-display font-black text-white">{value.toString().padStart(2, '0')}</span>
                        </div>
                        <span className="text-[9px] md:text-[11px] uppercase tracking-[0.2em] text-zinc-500 font-bold">{unit}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex justify-center mb-12">
                    <div className="w-32 h-32 bg-white/5 border border-white/10 rounded-full flex items-center justify-center text-zinc-500 shadow-inner">
                      <Clock size={48} />
                    </div>
                  </div>
                )}

                {isPast ? (
                  <div className="w-full py-6 bg-white/5 border border-white/10 text-zinc-500 rounded-2xl font-display font-black text-sm uppercase tracking-[0.2em]">
                    Registrations Closed
                  </div>
                ) : !attending ? (
                  <motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleAttend}
                    className="w-full py-6 bg-firefox-orange text-white rounded-2xl font-display font-black text-sm uppercase tracking-[0.2em] shadow-[0_0_40px_rgba(255,92,0,0.4)] hover:bg-white hover:text-black hover:shadow-[0_0_40px_rgba(255,255,255,0.4)] transition-all"
                  >
                    Attend Event
                  </motion.button>
                ) : (
                  <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="w-full bg-white/5 border border-white/10 rounded-3xl p-6 flex flex-col items-center gap-4"
                  >
                    <div id="ticket-card" className="w-full flex flex-col items-center bg-[#09090b] p-6 rounded-2xl border border-white/10">
                      <div className="w-full flex items-center justify-center gap-2 text-green-400 font-display font-black text-sm uppercase tracking-widest mb-4">
                        <CheckCircle2 size={20} />
                        Ticket Confirmed
                      </div>
                      <h3 className="text-white font-bold text-center mb-2">{event.title}</h3>
                      <div className="flex items-center gap-2 text-zinc-400 text-xs font-bold uppercase tracking-widest mb-6">
                        <Calendar size={14} />
                        {new Date(event.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })} • {new Date(event.date).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                      </div>
                      {ticketId ? (
                        <>
                          <div className="bg-white p-4 rounded-2xl mb-4">
                            <QRCodeSVG value={`${window.location.origin}/verify/${ticketId}`} size={150} />
                          </div>
                          <p className="text-zinc-500 text-[10px] font-mono uppercase tracking-widest text-center">ID: {ticketId.substring(0, 15)}...</p>
                        </>
                      ) : (
                        <p className="text-zinc-400 text-xs text-center my-8">You are registered for this preview event!</p>
                      )}
                    </div>
                    {ticketId && (
                      <>
                        <p className="text-zinc-400 text-xs text-center mt-2">Show this QR code at the entrance to verify your attendance.</p>
                        <button 
                          onClick={handleDownloadTicket}
                          className="w-full py-4 mt-2 bg-firefox-orange/20 text-firefox-orange rounded-xl font-display font-black text-[10px] uppercase tracking-widest hover:bg-firefox-orange hover:text-white transition-all flex items-center justify-center gap-2"
                        >
                          <Download size={14} /> Download Ticket
                        </button>
                      </>
                    )}
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default EventDetails;
