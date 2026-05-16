import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Trophy, Medal, Star, Award } from 'lucide-react';
import { Link } from 'react-router-dom';

const Leaderboard = () => {
  const [leaders, setLeaders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const q = query(collection(db, 'users'), orderBy('points', 'desc'), limit(11));
        const snap = await getDocs(q);
        const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setLeaders(data);
      } catch (err) {
        console.error("Failed to fetch leaderboard", err);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, []);

  if (loading) {
    return (
      <section id="leaderboard" className="py-32 relative bg-zinc-950 overflow-hidden flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-firefox-orange border-t-transparent rounded-full animate-spin" />
      </section>
    );
  }

  return (
    <section id="leaderboard" className="py-32 relative bg-zinc-950 overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
      <div className="absolute left-0 top-1/4 w-96 h-96 bg-firefox-yellow/10 blur-[120px] rounded-full mix-blend-screen pointer-events-none" />
      <div className="absolute right-0 bottom-1/4 w-96 h-96 bg-firefox-orange/10 blur-[120px] rounded-full mix-blend-screen pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <div className="inline-flex items-center gap-3 px-4 py-2 bg-firefox-orange/10 border border-firefox-orange/20 rounded-full text-firefox-orange text-[10px] font-black uppercase tracking-[0.2em] mb-6">
            <Trophy size={14} />
            Hall of Fame
          </div>
          <h2 className="text-4xl md:text-7xl font-display font-black uppercase tracking-tighter mb-6">
            Global <span className="text-firefox-orange">Leaderboard</span>
          </h2>
          <p className="text-zinc-400 text-lg max-w-2xl mx-auto font-medium">
            Top 11 community members leading the charts through contributions, events, and active participation.
          </p>
        </motion.div>

        <div className="flex flex-col gap-4 max-w-4xl mx-auto">
          {leaders.map((leader, index) => {
            const isTop3 = index < 3;
            return (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                key={leader.id}
              >
                <Link to={`/profile/${leader.username}`} className="block">
                  <div className={`relative flex items-center justify-between p-4 md:p-6 rounded-[2rem] border transition-all duration-300 group hover:-translate-y-1 ${
                    index === 0 ? 'bg-gradient-to-r from-yellow-500/20 to-transparent border-yellow-500/50 shadow-[0_0_30px_rgba(234,179,8,0.2)]' :
                    index === 1 ? 'bg-gradient-to-r from-zinc-300/20 to-transparent border-zinc-300/50 shadow-[0_0_30px_rgba(212,212,216,0.1)]' :
                    index === 2 ? 'bg-gradient-to-r from-orange-700/20 to-transparent border-orange-700/50 shadow-[0_0_30px_rgba(194,65,12,0.2)]' :
                    'bg-white/5 border-white/10 hover:border-firefox-orange/30'
                  }`}>
                    <div className="flex items-center gap-4 md:gap-6">
                      <div className={`w-10 h-10 md:w-14 md:h-14 rounded-full flex items-center justify-center font-display font-black text-lg md:text-2xl border ${
                        index === 0 ? 'bg-yellow-500 text-black border-yellow-400' :
                        index === 1 ? 'bg-zinc-300 text-black border-zinc-200' :
                        index === 2 ? 'bg-orange-700 text-white border-orange-600' :
                        'bg-zinc-800 text-zinc-400 border-zinc-700'
                      }`}>
                        {index === 0 ? <Trophy size={24} /> : index === 1 ? <Medal size={24} /> : index === 2 ? <Award size={24} /> : `#${index + 1}`}
                      </div>
                      <div className="flex items-center gap-4">
                        <img 
                          src={leader.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${leader.username}`} 
                          alt={leader.fullName} 
                          className="w-12 h-12 md:w-16 md:h-16 rounded-full object-cover border border-white/20"
                        />
                        <div>
                          <h3 className={`font-display font-black uppercase tracking-wider text-base md:text-xl transition-colors ${
                            index === 0 ? 'text-yellow-500 group-hover:text-yellow-400' :
                            index === 1 ? 'text-zinc-300 group-hover:text-white' :
                            index === 2 ? 'text-orange-500 group-hover:text-orange-400' :
                            'text-white group-hover:text-firefox-orange'
                          }`}>
                            {leader.fullName}
                          </h3>
                          <p className="text-zinc-500 text-[10px] md:text-xs font-black tracking-[0.2em] uppercase">@{leader.username}</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 md:gap-3 bg-black/40 px-4 md:px-6 py-2 md:py-3 rounded-full border border-white/5">
                      <Star className={`w-4 h-4 md:w-5 md:h-5 ${isTop3 ? 'text-firefox-orange' : 'text-zinc-500'}`} fill={isTop3 ? 'currentColor' : 'none'} />
                      <span className="font-display font-black text-lg md:text-2xl text-white">{leader.points || 0}</span>
                      <span className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-zinc-500 hidden md:inline">PTS</span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}

          {leaders.length === 0 && (
            <div className="text-center py-12 border border-white/10 rounded-3xl bg-white/5">
              <p className="text-zinc-500 font-medium">The leaderboard is currently empty. Be the first to earn points!</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default Leaderboard;
