import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Calendar, MapPin, Trophy, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const EventDetails = () => {
  const eventDate = new Date('2026-05-25T09:00:00').getTime();
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [attending, setAttending] = useState(false);

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
    <div className="pt-32 pb-20 px-4 min-h-screen relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-firefox-orange/10 blur-[150px] rounded-full pointer-events-none" />
      
      <div className="max-w-6xl mx-auto relative z-10">
        <Link to="/" className="inline-flex items-center gap-2 text-zinc-500 hover:text-white transition-colors mb-12 group">
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          <span className="text-[10px] font-black uppercase tracking-widest">Back to Home</span>
        </Link>

        <div className="grid lg:grid-cols-2 gap-16 items-start">
          <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }}>
            <span className="inline-block px-4 py-2 bg-firefox-orange/20 text-firefox-orange rounded-full text-[10px] font-black uppercase tracking-widest mb-6 border border-firefox-orange/20">Upcoming Event</span>
            <h1 className="text-5xl md:text-7xl font-display font-black uppercase tracking-tight mb-8 leading-[0.9]">
              Open Source <br />
              <span className="text-firefox-orange">Hackathon</span> 2026
            </h1>
            
            <p className="text-zinc-400 text-lg mb-12 leading-relaxed">
              Join the brightest minds at ZCOER for a 48-hour coding marathon. Build innovative open-source tools, collaborate with peers, and win exciting prizes. Whether you are a beginner or a pro, there's a place for you here.
            </p>

            <div className="space-y-8 mb-12">
              <div className="flex items-center gap-6">
                <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-zinc-400">
                  <Calendar size={24} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Date & Time</p>
                  <p className="font-bold text-lg">May 25, 2026 • 09:00 AM IST</p>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-zinc-400">
                  <MapPin size={24} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Location</p>
                  <p className="font-bold text-lg">Innovation Hub, ZCOER Pune</p>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-zinc-400">
                  <Trophy size={24} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Prizes</p>
                  <p className="font-bold text-lg">₹50,000 Pool + Exclusive Swags</p>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} className="flex flex-col lg:items-end justify-center w-full sticky top-32">
            <div className="bg-zinc-900/50 border border-white/10 rounded-[3rem] p-8 md:p-12 backdrop-blur-xl w-full text-center relative overflow-hidden group hover:border-firefox-orange/30 transition-all duration-500">
              <div className="absolute inset-0 bg-gradient-to-b from-firefox-orange/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <div className="relative z-10">
                <h3 className="text-xs font-black uppercase tracking-[0.3em] text-zinc-400 mb-10">Event Starts In</h3>
                
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

                {!attending ? (
                  <motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setAttending(true)}
                    className="w-full py-6 bg-firefox-orange text-white rounded-2xl font-display font-black text-sm uppercase tracking-[0.2em] shadow-[0_0_40px_rgba(255,92,0,0.4)] hover:bg-white hover:text-black hover:shadow-[0_0_40px_rgba(255,255,255,0.4)] transition-all"
                  >
                    Attend Event
                  </motion.button>
                ) : (
                  <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="w-full py-6 bg-green-500/10 border border-green-500/30 text-green-400 rounded-2xl font-display font-black text-sm uppercase tracking-[0.2em] flex items-center justify-center gap-3 shadow-[0_0_30px_rgba(34,197,94,0.1)]"
                  >
                    <CheckCircle2 size={24} />
                    Ticket Confirmed
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
