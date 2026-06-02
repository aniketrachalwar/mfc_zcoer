import { motion } from 'motion/react';
import { ArrowRight, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useEvents } from '../lib/useEvents';

const Hero = () => {
  const { events } = useEvents();
  const nextEventId = events.length > 0 ? events[0].id : null;

  return (
    <section id="hero" className="relative min-h-[100dvh] flex flex-col items-center justify-center overflow-hidden bg-black px-6 text-center pt-20">
      
      {/* Ultra-subtle Linear-style background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-firefox-orange/10 blur-[100px] rounded-full pointer-events-none opacity-50" />
      
      {/* Super fine grid (Notion/Linear style) */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:64px_64px] pointer-events-none mix-blend-screen" />

      <div className="relative z-10 w-full max-w-5xl mx-auto flex flex-col items-center">
        
        {/* Huge Message */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="text-5xl sm:text-6xl md:text-7xl lg:text-[5.5rem] font-bold text-white tracking-tighter leading-[1.1] mb-6 max-w-4xl"
        >
          Find events.<br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-zinc-200 via-white to-zinc-500">
            Build opportunities.
          </span>
        </motion.h1>

        {/* Concise Subtext */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="text-zinc-400 text-lg md:text-xl max-w-2xl font-medium tracking-tight mb-10 leading-relaxed"
        >
          Your gateway to open-source collaboration. Discover workshops, hackathons, and a community of builders pushing the web forward.
        </motion.p>

        {/* Sleek CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto"
        >
          <Link 
            to="/events" 
            className="w-full sm:w-auto px-8 py-3.5 bg-white text-black rounded-full font-semibold text-sm hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2"
          >
            <Calendar size={16} className="text-black" />
            Explore Events
          </Link>
          
          <Link 
            to={nextEventId ? `/event/${nextEventId}` : "/events"}
            className="w-full sm:w-auto px-8 py-3.5 bg-transparent border border-white/20 text-white rounded-full font-semibold text-sm hover:bg-white/5 transition-colors flex items-center justify-center gap-2 group"
          >
            {nextEventId ? 'Our Next Event' : 'Attend Event'} <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
