import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Github, Linkedin, Instagram, ChevronDown } from 'lucide-react';

const Team = () => {
  const [selectedCohort, setSelectedCohort] = useState('25-26');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const cohorts = {
    '25-26': [
      { name: "Aditi Deshmukh", role: "President", img: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=400" },
      { name: "Siddharth K.", role: "Vice President", img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400" },
      { name: "Rahul Bansal", role: "Technical Head", img: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=400" },
      { name: "Priya Sharma", role: "Public Relations Head", img: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=400" },
      { name: "Ishaan Mehta", role: "Social Media Head", img: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=400" },
      { name: "Ananya Nair", role: "Lead Designer", img: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400" },
      { name: "Arjun Das", role: "Lead Developer", img: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=400" },
      { name: "Sneha G.", role: "Event Coordinator", img: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=400" },
      { name: "Vikram R.", role: "Marketing Head", img: "https://images.unsplash.com/photo-1519345182560-3f2917c472ef?auto=format&fit=crop&q=80&w=400" },
      { name: "Tanmay B.", role: "Open Source Advocate", img: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&q=80&w=400" },
      { name: "Zoya Khan", role: "Content Writer", img: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&q=80&w=400" }
    ],
    '26-27': []
  };

  return (
    <section id="teams" className="section-padding bg-zinc-950 border-t border-white/5 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-firefox-orange/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2" />
      
      <div className="max-w-7xl mx-auto px-4 relative z-10">
        <div className="text-center mb-24">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <h2 className="text-5xl md:text-8xl font-display font-black tracking-[-0.05em] uppercase mb-8">
              Meet The <span className="text-gradient">Team</span>
            </h2>
            <div className="flex flex-col items-center gap-8 mt-12">
              <p className="text-[10px] uppercase tracking-[0.4em] font-black text-zinc-500">Select Cohort</p>
              
              <div className="relative min-w-[280px]">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="w-full bg-white/5 border border-white/10 text-white px-8 py-4 rounded-full font-display font-black text-[12px] uppercase tracking-[0.2em] flex items-center justify-between group hover:border-firefox-orange/50 transition-all shadow-lg backdrop-blur-md"
                >
                  <span>Academic Year 20{selectedCohort}</span>
                  <ChevronDown className={`transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} size={16} />
                </button>

                <AnimatePresence>
                  {isDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute top-full left-0 w-full mt-4 bg-zinc-900/90 border border-white/10 rounded-3xl p-2 backdrop-blur-xl z-50 shadow-2xl overflow-hidden"
                    >
                      {Object.keys(cohorts).map((cohort) => (
                        <button
                          key={cohort}
                          onClick={() => {
                            setSelectedCohort(cohort);
                            setIsDropdownOpen(false);
                          }}
                          className={`w-full text-left px-6 py-4 rounded-2xl font-display font-black text-[11px] uppercase tracking-[0.1em] transition-all hover:bg-firefox-orange hover:text-white ${
                            selectedCohort === cohort ? 'bg-firefox-orange/20 text-firefox-orange' : 'text-zinc-400'
                          }`}
                        >
                          Academic Year 20{cohort}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={selectedCohort}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
          >
            {cohorts[selectedCohort as keyof typeof cohorts].length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-20">
                {cohorts[selectedCohort as keyof typeof cohorts].map((member, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileHover={{ y: -10 }}
                    transition={{ 
                      type: "spring",
                      stiffness: 300,
                      damping: 20,
                      delay: i * 0.05 
                    }}
                    className="flex flex-col items-center text-center group cursor-default"
                  >
                    <div className="relative w-40 h-40 md:w-48 md:h-48 mb-8">
                      <div className="absolute inset-x-0 inset-y-0 rounded-full border-[2px] border-firefox-orange scale-110 group-hover:scale-115 transition-all duration-500 shadow-[0_0_30px_rgba(255,92,0,0.3)] opacity-0 group-hover:opacity-100" />
                      <div className="w-full h-full rounded-full overflow-hidden relative z-10 border-2 border-zinc-950 group-hover:border-firefox-orange/50 transition-colors duration-500">
                        <img src={member.img} alt={member.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                      </div>
                    </div>

                    <div className="space-y-1 transform group-hover:translate-y-[-4px] transition-transform duration-500">
                      <h3 className="text-xl md:text-2xl font-display font-black uppercase text-white tracking-tight">
                        {member.name.split(' ')[0]} <br />
                        <span className="text-transparent group-hover:text-white transition-colors duration-500" style={{ WebkitTextStroke: '1px rgba(255,255,255,0.3)' }}>
                          {member.name.split(' ').slice(1).join(' ')}
                        </span>
                      </h3>
                      <p className="text-firefox-orange font-bold text-[10px] uppercase tracking-widest">
                        {member.role}
                      </p>
                    </div>

                    <div className="mt-6 flex gap-4 opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-500 ease-out">
                      <motion.a 
                        href="#" 
                        whileHover={{ y: -3 }}
                        className="p-2 text-zinc-500 hover:text-white transition-colors"
                      >
                        <Linkedin size={16} />
                      </motion.a>
                      <motion.a 
                        href="#" 
                        whileHover={{ y: -3 }}
                        className="p-2 text-zinc-500 hover:text-white transition-colors"
                      >
                        <Github size={16} />
                      </motion.a>
                      <motion.a 
                        href="#" 
                        whileHover={{ y: -3 }}
                        className="p-2 text-zinc-500 hover:text-white transition-colors"
                      >
                        <Instagram size={16} />
                      </motion.a>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="min-h-[500px] flex items-center justify-center text-center relative">
                {/* Decorative background for coming soon */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg aspect-square bg-[#FF5C00]/5 blur-[120px] rounded-full" />
                
                <div className="relative z-10 space-y-6">
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.8 }}
                  >
                    <h3 className="text-7xl md:text-9xl lg:text-[10rem] font-display font-black uppercase text-white/5 select-none tracking-tighter leading-none">
                      Coming <br /> Soon
                    </h3>
                  </motion.div>
                  
                  <div className="space-y-4">
                    <p className="text-firefox-orange font-display text-[10px] md:text-[12px] uppercase tracking-[0.6em] font-black animate-pulse">
                      Preparing the new generation
                    </p>
                    <div className="w-12 h-[1px] bg-firefox-orange mx-auto opacity-50" />
                    <p className="text-zinc-600 font-display text-[9px] uppercase tracking-[0.3em]">
                      Wait for the new magic to unfold
                    </p>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
};

export default Team;
