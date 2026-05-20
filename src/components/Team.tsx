import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Github, Linkedin, Instagram, ChevronDown, User } from 'lucide-react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Link, useNavigate } from 'react-router-dom';

const Team = () => {
  const [selectedCohort, setSelectedCohort] = useState('25-26');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const navigate = useNavigate();
  
  const [cohorts, setCohorts] = useState<Record<string, any[]>>({ '25-26': [], '26-27': [], '27-28': [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTeam = async () => {
      try {
        const [usersSnap, teamSnap] = await Promise.all([
          getDocs(collection(db, 'users')),
          getDocs(collection(db, 'team'))
        ]);
        
        const usersList = usersSnap.docs.map(d => ({ id: d.id, ...d.data() }));
        const teamList = teamSnap.docs.map(d => ({ id: d.id, ...d.data() }));
        
        const newCohorts: Record<string, any[]> = { '25-26': [], '26-27': [], '27-28': [] };
        
        teamList.forEach(tm => {
          const user = usersList.find(u => u.id === tm.userId);
          if (user) {
            if (!newCohorts[tm.cohort]) {
              newCohorts[tm.cohort] = [];
            }
            newCohorts[tm.cohort].push({
              id: user.id,
              name: user.fullName || user.username || 'Unknown',
              username: user.username || user.id,
              role: tm.role,
              img: user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`,
              github: user.githubUrl || '#',
              linkedin: user.linkedinUrl || '#',
              instagram: user.instagramUrl || '#'
            });
          }
        });
        
        setCohorts(newCohorts);
      } catch (err) {
        console.error("Error fetching team", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTeam();
  }, []);

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
            <h2 className="text-fluid-h1 font-display font-black tracking-[-0.05em] uppercase mb-4 md:mb-8">
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
                            setShowAll(false);
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

        {loading ? (
          <div className="min-h-[500px] flex items-center justify-center text-center relative">
            <div className="w-12 h-12 border-4 border-firefox-orange border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedCohort}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              {cohorts[selectedCohort]?.length > 0 ? (
                <div className="flex flex-col items-center w-full">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-12 md:gap-y-20 w-full">
                    {cohorts[selectedCohort].slice(0, showAll ? undefined : 4).map((member, i) => (
                      <motion.div
                        key={member.id}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        whileHover={{ y: -10 }}
                        transition={{ 
                          type: "spring",
                          stiffness: 300,
                          damping: 20,
                          delay: (i % 4) * 0.05 
                        }}
                        onClick={() => navigate(`/profile/${member.username}`)}
                        className="flex flex-col items-center text-center group cursor-pointer"
                      >
                        <div className="relative w-40 h-40 md:w-48 md:h-48 mb-8">
                          <div className="absolute inset-x-0 inset-y-0 rounded-full border-[2px] border-firefox-orange scale-110 group-hover:scale-115 transition-all duration-500 shadow-[0_0_30px_rgba(255,92,0,0.3)] opacity-0 group-hover:opacity-100" />
                          <div className="w-full h-full rounded-full overflow-hidden relative z-10 border-2 border-zinc-950 group-hover:border-firefox-orange/50 transition-colors duration-500">
                            <img loading="lazy" src={member.img} alt={member.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
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

                        <div className="mt-6 flex gap-4 opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-500 ease-out items-center">
                          {member.linkedin && member.linkedin !== '#' && (
                            <motion.a 
                              href={member.linkedin} target="_blank" rel="noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              whileHover={{ y: -3 }}
                              className="w-11 h-11 flex items-center justify-center text-zinc-500 hover:text-white transition-colors"
                            >
                              <Linkedin size={20} />
                            </motion.a>
                          )}
                          {member.github && member.github !== '#' && (
                            <motion.a 
                              href={member.github} target="_blank" rel="noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              whileHover={{ y: -3 }}
                              className="w-11 h-11 flex items-center justify-center text-zinc-500 hover:text-white transition-colors"
                            >
                              <Github size={20} />
                            </motion.a>
                          )}
                          {member.instagram && member.instagram !== '#' && (
                            <motion.a 
                              href={member.instagram} target="_blank" rel="noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              whileHover={{ y: -3 }}
                              className="w-11 h-11 flex items-center justify-center text-zinc-500 hover:text-white transition-colors"
                            >
                              <Instagram size={20} />
                            </motion.a>
                          )}
                          <Link 
                            to={`/profile/${member.username}`}
                            onClick={(e) => e.stopPropagation()}
                            className="px-4 py-2 min-h-[44px] bg-white/5 border border-white/10 hover:border-firefox-orange/50 hover:bg-firefox-orange hover:text-white transition-all rounded-full font-display font-black text-[9px] uppercase tracking-widest text-zinc-400 flex items-center gap-2"
                          >
                            <User size={14} /> Profile
                          </Link>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {!showAll && cohorts[selectedCohort].length > 4 && (
                    <motion.button
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      onClick={() => setShowAll(true)}
                      className="mt-24 px-8 py-4 bg-white/5 border border-white/10 hover:border-firefox-orange/50 hover:bg-firefox-orange/10 transition-all rounded-full font-display font-black text-[12px] uppercase tracking-[0.2em] text-white flex items-center gap-3 group"
                    >
                      Want to see more?
                      <ChevronDown className="group-hover:translate-y-1 transition-transform text-firefox-orange" size={16} />
                    </motion.button>
                  )}
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
        )}
      </div>
    </section>
  );
};

export default Team;
