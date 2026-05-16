import { motion } from 'motion/react';
import { ChevronDown } from 'lucide-react';

const Hero = () => {
  return (
    <section id="hero" className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-[#0A0A0A] px-6 text-center">
      {/* Background radial glow at bottom */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-full h-[600px] bg-[#FF5C00]/10 blur-[150px] rounded-full pointer-events-none" />

      <div className="relative z-10 w-full max-w-7xl mx-auto flex flex-col items-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col items-center"
        >
          <div className="mb-8">
            {/*<motion.img
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 1, delay: 0.2 }}
              src="https://res.cloudinary.com/diyulegc1/image/upload/v1778406665/logo-removebg-preview_b9u9z8.png"
              alt="Mozilla Logo"
              className="w-20 h-20 md:w-28 md:h-28 drop-shadow-[0_0_50px_rgba(255,92,0,0.4)]"
            />*/}
          </div>
          <h1 className="flex flex-col leading-[0.85] font-display font-black uppercase text-center">
            <motion.span
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 1, delay: 0.4 }}
              className="text-white tracking-[0.1em] md:tracking-[0.2em]"
              style={{ fontSize: 'clamp(2.5rem, 10vw, 9rem)' }}
            >
              MOZILLA
            </motion.span>
            <motion.span
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 1, delay: 0.6 }}
              className="tracking-[0.1em] md:tracking-[0.2em]"
              style={{
                fontSize: 'clamp(2.5rem, 10vw, 9rem)',
                color: 'transparent',
                WebkitTextStroke: 'clamp(1px, 0.2vw, 2px) #FF5C00'
              }}
            >
              FIREFOX
            </motion.span>
          </h1>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 1 }}
            className="mt-16 flex flex-col md:flex-row items-center gap-6 md:gap-12 text-[#A0A0A0] text-sm md:text-[1.1rem] tracking-[0.1em] md:tracking-[0.3em] font-bold uppercase font-display max-w-6xl px-4 text-center"
          >
            <span>Firefox Answers To No One</span>

            <div className="flex flex-col items-center gap-4 py-4">
              <span className="text-[9px] font-black uppercase tracking-[0.5em] rotate-90 mb-4 opacity-50 text-firefox-orange">SCROLL</span>
              <div className="w-[1px] h-12 bg-gradient-to-b from-firefox-orange to-transparent" />
            </div>

            <span>But To You</span>
          </motion.div>
        </motion.div>
      </div>

      {/* Decorative vertical lines */}
      <div className="absolute inset-0 z-0 opacity-5 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-[1px] h-full bg-gradient-to-b from-transparent via-white to-transparent" />
        <div className="absolute top-0 right-1/4 w-[1px] h-full bg-gradient-to-b from-transparent via-white to-transparent" />
      </div>

    </section>
  );
};

export default Hero;
