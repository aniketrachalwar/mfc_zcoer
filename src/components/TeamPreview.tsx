import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, User } from 'lucide-react';

const TeamPreview = () => {
  const [featuredMembers, setFeaturedMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFeaturedTeam = async () => {
      try {
        const [usersSnap, teamSnap] = await Promise.all([
          getDocs(collection(db, 'users')),
          getDocs(collection(db, 'team'))
        ]);
        
        const usersList = usersSnap.docs.map(d => ({ id: d.id, ...d.data() } as any));
        const teamList = teamSnap.docs.map(d => ({ id: d.id, ...d.data() } as any));
        
        // Find Core Leadership of year 25-26
        let coreMembers = teamList
          .filter(tm => tm.category === 'Core Leadership' && (tm.cohort || '25-26') === '25-26')
          .map(tm => {
            const user = usersList.find(u => u.id === tm.userId);
            return {
              id: tm.id,
              userId: tm.userId,
              name: user?.fullName || user?.username || 'Unknown',
              username: user?.username,
              role: tm.role,
              img: user?.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.username)}&background=FF5C00&color=fff&bold=true`,
            };
          })
          .filter(m => m.username); // ensure valid user

        // Sort: President first
        coreMembers.sort((a, b) => {
          const aIsPres = (a.role || '').toLowerCase().includes('president') ? 1 : 0;
          const bIsPres = (b.role || '').toLowerCase().includes('president') ? 1 : 0;
          return bIsPres - aIsPres;
        });

        // Show all of them on the homepage
        setFeaturedMembers(coreMembers);
      } catch (err) {
        console.error("Error fetching featured team", err);
      } finally {
        setLoading(false);
      }
    };
    fetchFeaturedTeam();
  }, []);

  if (loading || featuredMembers.length === 0) {
    return null; // Do not render if loading or empty on homepage
  }

  return (
    <section className="py-24 bg-zinc-950 border-t border-white/5 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-firefox-orange/5 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2" />
      
      <div className="max-w-7xl mx-auto px-4 relative z-10 flex flex-col md:flex-row items-center gap-16">
        <div className="w-full md:w-1/3 text-center md:text-left">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-display font-black tracking-[-0.05em] uppercase mb-4">
              Meet Our <br className="hidden md:block" />
              <span className="text-gradient">Core Team</span>
            </h2>
            <p className="text-zinc-400 mb-8 text-sm max-w-sm mx-auto md:mx-0">
              The driving force behind the Mozilla Firefox Club ecosystem. Discover the builders leading the community.
            </p>
            <Link 
              to="/team" 
              className="inline-flex items-center gap-2 px-8 py-4 bg-white/5 border border-white/10 hover:border-firefox-orange/50 hover:bg-firefox-orange/10 transition-all rounded-full font-display font-black text-[12px] uppercase tracking-[0.2em] text-white group"
            >
              View Full Team
              <ArrowRight className="group-hover:translate-x-1 transition-transform text-firefox-orange" size={16} />
            </Link>
          </motion.div>
        </div>

        <div className="w-full md:w-2/3 flex justify-center md:justify-end gap-4 sm:gap-8 flex-wrap">
          {featuredMembers.map((member, i) => (
            <motion.div
              key={member.id}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              onClick={() => navigate(`/profile/${member.username}`)}
              className="group cursor-pointer flex flex-col items-center text-center"
            >
              <div className="relative w-24 h-24 sm:w-32 sm:h-32 mb-4">
                <div className="absolute inset-x-0 inset-y-0 rounded-full border-[1px] border-firefox-orange scale-110 group-hover:scale-115 transition-all duration-500 shadow-[0_0_20px_rgba(255,92,0,0.1)] opacity-0 group-hover:opacity-100" />
                <div className="w-full h-full rounded-full overflow-hidden relative z-10 border border-white/10 group-hover:border-firefox-orange/50 transition-colors duration-500">
                  <img loading="lazy" src={member.img} alt={member.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                </div>
              </div>
              <div className="space-y-1 transform group-hover:-translate-y-1 transition-transform duration-500">
                <h3 className="text-sm sm:text-base font-display font-black uppercase text-white tracking-tight">
                  {member.name.split(' ')[0]}
                </h3>
                <p className="text-firefox-orange font-bold text-[8px] sm:text-[9px] uppercase tracking-widest max-w-[120px] mx-auto truncate">
                  {member.role}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TeamPreview;
