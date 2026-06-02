import PageLoader from './PageLoader';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Github, Linkedin, Instagram, User, ArrowRight } from 'lucide-react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import TeamApplicationModal from './TeamApplicationModal';

const DOMAINS = [
  'Technical',
  'Events & Community',
  'Marketing & Media',
  'Content & Newsletter',
  'Design',
  'Growth & Partnerships',
  'Operations'
];

const TeamPage = () => {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const [isApplicationModalOpen, setIsApplicationModalOpen] = useState(false);

  useEffect(() => {
    if (location.search.includes('apply=true')) {
      setIsApplicationModalOpen(true);
    }
  }, [location.search]);

  const [coreLeadership, setCoreLeadership] = useState<any[]>([]);
  const [domainMembers, setDomainMembers] = useState<Record<string, any[]>>({});

  const [availableCohorts, setAvailableCohorts] = useState<string[]>([]);
  const [selectedCohort, setSelectedCohort] = useState<string>('');
  const [cohortData, setCohortData] = useState<Record<string, { core: any[], domains: Record<string, any[]> }>>({});

  useEffect(() => {
    const fetchTeam = async () => {
      try {
        const [usersSnap, teamSnap] = await Promise.all([
          getDocs(collection(db, 'users')),
          getDocs(collection(db, 'team'))
        ]);
        
        const usersList = usersSnap.docs.map(d => ({ id: d.id, ...d.data() } as any));
        const teamList = teamSnap.docs.map(d => ({ id: d.id, ...d.data() } as any));
        
        const dataMap: Record<string, { core: any[], domains: Record<string, any[]> }> = {};
        const cohortsSet = new Set<string>();
        
        teamList.forEach(tm => {
          const user = usersList.find(u => u.id === tm.userId);
          if (user) {
            const cohort = tm.cohort || '25-26'; // fallback if no cohort specified
            cohortsSet.add(cohort);

            if (!dataMap[cohort]) {
              dataMap[cohort] = { core: [], domains: {} };
              DOMAINS.forEach(d => dataMap[cohort].domains[d] = []);
            }

            const memberData = {
              id: user.id,
              name: user.fullName || user.username || 'Unknown',
              username: user.username || user.id,
              role: tm.role || 'Member',
              img: user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.username)}&background=FF5C00&color=fff&bold=true`,
              github: user.githubUrl || '#',
              linkedin: user.linkedinUrl || '#',
              instagram: user.instagramUrl || '#',
              points: user.points || 0
            };

            const category = tm.category;
            
            if (category === 'Core Leadership') {
              dataMap[cohort].core.push(memberData);
            } else if (DOMAINS.includes(category)) {
              dataMap[cohort].domains[category].push(memberData);
            }
          }
        });
        
        let sortedCohorts = Array.from(cohortsSet).sort((a, b) => b.localeCompare(a));
        sortedCohorts = sortedCohorts.filter(c => c !== '24-25'); // Exclude 24-25 per user request
        setAvailableCohorts(sortedCohorts);
        setCohortData(dataMap);
        
        if (sortedCohorts.length > 0) {
          const defaultCohort = sortedCohorts.includes('25-26') ? '25-26' : sortedCohorts[0];
          setSelectedCohort(defaultCohort);
          
          const sortedCore = [...dataMap[defaultCohort].core].sort((a, b) => {
            const aIsPres = (a.role || '').toLowerCase().includes('president') ? 1 : 0;
            const bIsPres = (b.role || '').toLowerCase().includes('president') ? 1 : 0;
            return bIsPres - aIsPres;
          });
          
          const sortedDomains: Record<string, any[]> = {};
          DOMAINS.forEach(d => {
            sortedDomains[d] = [...(dataMap[defaultCohort].domains[d] || [])].sort((a, b) => b.points - a.points);
          });
          
          setCoreLeadership(sortedCore);
          setDomainMembers(sortedDomains);
        }
      } catch (err) {
        console.error("Error fetching team", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTeam();
  }, []);

  const MemberGrid = ({ members }: { members: any[] }) => {
    if (members.length === 0) {
      return (
        <p className="text-zinc-500 text-sm text-center col-span-full py-8 border border-white/5 rounded-2xl">
          Positions currently unassigned or pending update.
        </p>
      );
    }
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 w-full">
        {members.map((member, i) => (
          <motion.div
            key={member.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -5 }}
            transition={{ 
              type: "spring",
              stiffness: 300,
              damping: 20,
              delay: (i % 4) * 0.05 
            }}
            onClick={() => navigate(`/profile/${member.username}`, { state: { fromTeamPage: true } })}
            className="flex flex-col items-center text-center group cursor-pointer bg-white/[0.02] border border-white/5 hover:border-white/10 hover:bg-white/[0.04] p-4 sm:p-6 rounded-3xl transition-all h-full"
          >
            <div className="relative w-24 h-24 sm:w-32 sm:h-32 mb-4 sm:mb-6 shrink-0">
              <div className="absolute inset-x-0 inset-y-0 rounded-full border-[1px] border-firefox-orange scale-110 group-hover:scale-[1.15] transition-all duration-500 shadow-[0_0_20px_rgba(255,92,0,0.1)] opacity-0 group-hover:opacity-100" />
              <div className="w-full h-full rounded-full overflow-hidden relative z-10 border border-white/10 group-hover:border-firefox-orange/50 transition-colors duration-500">
                <img loading="lazy" src={member.img} alt={member.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
              </div>
            </div>

            <div className="space-y-1 mb-4 flex-1 flex flex-col justify-center">
              <h3 className="text-sm sm:text-base font-display font-black uppercase text-white tracking-tight leading-tight">
                {member.name.split(' ')[0]} <br className="hidden sm:block" />
                <span className="text-transparent group-hover:text-white transition-colors duration-500" style={{ WebkitTextStroke: '1px rgba(255,255,255,0.3)' }}>
                  {member.name.split(' ').slice(1).join(' ')}
                </span>
              </h3>
              <div className="flex flex-col items-center justify-center">
                <p className="text-firefox-orange font-bold text-[9px] sm:text-[10px] uppercase tracking-widest line-clamp-2 mt-2 mb-1">
                  {member.role}
                </p>
                {/* Only show points if they aren't in Core Leadership (which doesn't use the points system) */}
                {member.points > 0 && !coreLeadership.find(c => c.id === member.id) && (
                  <p className="text-zinc-500 font-bold text-[8px] uppercase tracking-widest">
                    {member.points} Points
                  </p>
                )}
              </div>
            </div>

            <div className="flex gap-2 sm:gap-3 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transform sm:translate-y-4 sm:group-hover:translate-y-0 transition-all duration-500 ease-out items-center mt-auto pt-4 border-t border-white/5 w-full justify-center">
              {member.linkedin && member.linkedin !== '#' && (
                <a 
                  href={member.linkedin} target="_blank" rel="noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="w-8 h-8 flex items-center justify-center text-zinc-500 hover:text-white transition-colors"
                >
                  <Linkedin size={16} />
                </a>
              )}
              {member.github && member.github !== '#' && (
                <a 
                  href={member.github} target="_blank" rel="noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="w-8 h-8 flex items-center justify-center text-zinc-500 hover:text-white transition-colors"
                >
                  <Github size={16} />
                </a>
              )}
              <Link 
                to={`/profile/${member.username}`}
                state={{ fromTeamPage: true }}
                onClick={(e) => e.stopPropagation()}
                className="px-3 py-1.5 bg-white/5 border border-white/10 hover:border-firefox-orange/50 hover:bg-firefox-orange hover:text-white transition-all rounded-full font-display font-black text-[8px] uppercase tracking-widest text-zinc-400 flex items-center gap-1.5"
              >
                <User size={12} /> Profile
              </Link>
            </div>
          </motion.div>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white relative">
      <div className="hidden md:block absolute top-0 right-0 w-[600px] h-[600px] bg-firefox-orange/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />

      {/* Hero Section */}
      <section className="pt-32 pb-16 px-4 relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-3xl mx-auto"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8">
            <span className="w-2 h-2 rounded-full bg-firefox-orange animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">MFC Open Web Ecosystem</span>
          </div>
          <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-display font-black uppercase tracking-tighter mb-6 leading-[0.9]">
            The <span className="text-gradient">Builders</span> <br />
            Behind the Scene
          </h1>
          <p className="text-zinc-400 max-w-xl mx-auto md:text-lg">
            Meet the professional community leaders, developers, and designers actively contributing to the Mozilla Firefox Club ecosystem.
          </p>
        </motion.div>
      </section>

      {/* Main Content */}
      <section className="px-4 pb-32 relative z-10">
        <div className="max-w-7xl mx-auto space-y-16 md:space-y-32">
          
          {loading ? (
            <div className="flex justify-center items-center py-24">
              <PageLoader fullScreen={false} />
            </div>
          ) : (
            <>
              {/* Cohort Filter Dropdown */}
              {availableCohorts.length > 0 && (
                <div className="flex justify-center mb-16 relative z-20">
                  <div className="relative">
                    <label className="absolute -top-6 left-2 text-[10px] font-black uppercase tracking-widest text-zinc-500">Academic Year</label>
                    <select
                      value={selectedCohort}
                      onChange={(e) => {
                        const cohort = e.target.value;
                        setSelectedCohort(cohort);
                        
                        const sortedCore = [...cohortData[cohort].core].sort((a, b) => {
                          const aIsPres = (a.role || '').toLowerCase().includes('president') ? 1 : 0;
                          const bIsPres = (b.role || '').toLowerCase().includes('president') ? 1 : 0;
                          return bIsPres - aIsPres;
                        });
                        
                        const sortedDomains: Record<string, any[]> = {};
                        DOMAINS.forEach(d => {
                          sortedDomains[d] = [...(cohortData[cohort].domains[d] || [])].sort((a, b) => b.points - a.points);
                        });

                        setCoreLeadership(sortedCore);
                        setDomainMembers(sortedDomains);
                      }}
                      className="appearance-none px-6 py-3 pr-10 bg-zinc-900 border border-white/10 rounded-xl font-display font-black text-sm uppercase tracking-widest text-white focus:outline-none focus:border-firefox-orange transition-colors shadow-lg cursor-pointer"
                    >
                      {availableCohorts.map(cohort => (
                        <option key={cohort} value={cohort}>
                          AY 20{cohort}
                        </option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                      <svg className="w-4 h-4 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                    </div>
                  </div>
                </div>
              )}

              <AnimatePresence mode="wait">
                <motion.div
                  key={selectedCohort}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-32"
                >
                {/* Core Leadership */}
                <div>
                  <div className="mb-12 border-b border-white/10 pb-6">
                    <h2 className="text-2xl md:text-3xl font-display font-black uppercase tracking-tight text-white mb-2">Core Leadership</h2>
                    <p className="text-zinc-500 text-sm uppercase tracking-widest font-bold text-[10px]">Ecosystem Direction & Strategy</p>
                  </div>
                  <MemberGrid members={coreLeadership} />
                </div>

                {/* Domains */}
                {DOMAINS.map(domain => (
                  <div key={domain}>
                    <div className="mb-12 border-b border-white/10 pb-6">
                      <h2 className="text-2xl md:text-3xl font-display font-black uppercase tracking-tight text-white mb-2">{domain}</h2>
                    </div>
                    <MemberGrid members={domainMembers[domain] || []} />
                  </div>
                ))}

              </motion.div>
              </AnimatePresence>
            </>
          )}

          {/* Open Positions CTA */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-zinc-900 border border-white/10 rounded-3xl p-6 sm:p-8 md:p-16 text-center max-w-4xl mx-auto relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-firefox-orange/10 to-transparent pointer-events-none" />
            <h2 className="text-2xl md:text-4xl font-display font-black uppercase tracking-tight mb-4 text-white relative z-10">
              Ready to Join the Team?
            </h2>
            <p className="text-zinc-400 mb-8 max-w-lg mx-auto relative z-10">
              We are constantly looking for passionate developers, designers, and community managers to help scale the ecosystem.
            </p>
            <button 
              onClick={() => setIsApplicationModalOpen(true)}
              className="inline-flex items-center gap-2 px-8 py-4 bg-firefox-orange text-white rounded-xl font-display font-black text-[12px] uppercase tracking-widest hover:bg-orange-600 transition-colors shadow-[0_0_20px_rgba(255,106,0,0.2)] relative z-10"
            >
              View Open Positions <ArrowRight size={16} />
            </button>
          </motion.div>

        </div>
      </section>

      <TeamApplicationModal 
        isOpen={isApplicationModalOpen} 
        onClose={() => setIsApplicationModalOpen(false)} 
      />
    </div>
  );
};

export default TeamPage;
