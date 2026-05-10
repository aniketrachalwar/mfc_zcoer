import { motion } from 'motion/react';

interface BigHeroTextProps {
  title1?: string;
  title2?: string;
  tagline?: string;
}

const BigHeroText = ({ 
  title1 = "MOZILLA", 
  title2 = "FIREFOX", 
  tagline = "FIREFOX ANSWERS TO NO ONE BUT TO YOU" 
}: BigHeroTextProps) => {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-[#0A0A0A] px-6 text-center">
      {/* Background radial glow at bottom */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-full h-[500px] bg-[#FF5C00]/5 blur-[150px] rounded-full pointer-events-none" />
      
      <div className="relative z-10 w-full max-w-7xl mx-auto flex flex-col items-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col items-center"
        >
          <h1 className="flex flex-col leading-[0.9] font-display font-extra-bold uppercase">
            <span 
              className="text-white tracking-[0.1em] md:tracking-[0.2em]"
              style={{ fontSize: 'clamp(2.5rem, 10vw, 9rem)' }}
            >
              {title1}
            </span>
            <span 
              className="tracking-[0.1em] md:tracking-[0.2em]"
              style={{ 
                fontSize: 'clamp(2.5rem, 10vw, 9rem)',
                color: 'transparent',
                WebkitTextStroke: 'clamp(1px, 0.2vw, 2px) #FF5C00'
              }}
            >
              {title2}
            </span>
          </h1>

          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 1 }}
            className="mt-8 text-[#A0A0A0] text-sm md:text-[1.25rem] tracking-[0.3em] font-medium uppercase font-display max-w-4xl"
          >
            {tagline}
          </motion.p>
        </motion.div>
      </div>

      {/* Decorative vertical lines or something? User didn't ask but "futuristic" feel */}
      <div className="absolute inset-0 z-0 opacity-10 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-[1px] h-full bg-gradient-to-b from-transparent via-white to-transparent" />
        <div className="absolute top-0 right-1/4 w-[1px] h-full bg-gradient-to-b from-transparent via-white to-transparent" />
      </div>
    </section>
  );
};

export default BigHeroText;
