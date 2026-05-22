import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import AdSenseBlock from '../AdSenseBlock';
import { Trophy, Medal, Star, Award, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

const LeaderboardPage = () => {
  const [leaders, setLeaders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const q = query(collection(db, 'users'), orderBy('points', 'desc'), limit(50));
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
      <div className="min-h-screen pt-32 pb-20 relative bg-zinc-950 overflow-hidden flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-firefox-orange border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Global Leaderboard | Mozilla Firefox Club ZCOER</title>
        <meta name="description" content="Top community members leading the charts through contributions, events, and active participation in the MFC ZCOER ecosystem." />
      </Helmet>
      
      <main className="min-h-screen pt-32 pb-20 relative bg-zinc-950 overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
        
        {/* Reduced blur radius for performance */}
        <div className="absolute left-0 top-1/4 w-96 h-96 bg-firefox-yellow/5 blur-[80px] rounded-full mix-blend-screen pointer-events-none" />
        <div className="absolute right-0 bottom-1/4 w-96 h-96 bg-firefox-orange/5 blur-[80px] rounded-full mix-blend-screen pointer-events-none" />

        <div className="max-w-6xl mx-auto px-4 relative z-10">
          <header className="text-center mb-12">
            <div className="inline-flex items-center gap-3 px-4 py-2 bg-firefox-orange/10 border border-firefox-orange/20 rounded-full text-firefox-orange text-[10px] font-black uppercase tracking-[0.2em] mb-6">
              <Trophy size={14} />
              Hall of Fame
            </div>
            <h1 className="text-4xl md:text-7xl font-display font-black uppercase tracking-tighter mb-6">
              Global <span className="text-firefox-orange">Leaderboard</span>
            </h1>
            <p className="text-zinc-400 text-lg max-w-2xl mx-auto font-medium">
              Top community members leading the charts through contributions, events, and active participation.
            </p>
          </header>

          {/* AdSense Placeholder: Top Banner */}
          <AdSenseBlock adSlot="leaderboard_top_banner" className="mb-8" />

          <section className="flex flex-col gap-2 max-w-4xl mx-auto">
            {leaders.map((leader, index) => {
              const isTop3 = index < 3;
              return (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index < 10 ? index * 0.05 : 0 }}
                  key={leader.id}
                >
                  <Link to={`/profile/${leader.username}`} className="block">
                    <div className={`relative flex items-center justify-between p-2 md:p-3 rounded-xl border transition-all duration-300 group hover:-translate-y-0.5 ${
                      index === 0 ? 'bg-gradient-to-r from-yellow-500/10 to-transparent border-yellow-500/30' :
                      index === 1 ? 'bg-gradient-to-r from-zinc-300/10 to-transparent border-zinc-300/30' :
                      index === 2 ? 'bg-gradient-to-r from-orange-700/10 to-transparent border-orange-700/30' :
                      'bg-white/5 border-white/10 hover:border-firefox-orange/30'
                    }`}>
                      <div className="flex items-center gap-2 md:gap-3">
                        <div className={`w-6 h-6 md:w-8 md:h-8 rounded-full flex items-center justify-center font-display font-black text-xs md:text-sm border shrink-0 ${
                          index === 0 ? 'bg-yellow-500 text-black border-yellow-400' :
                          index === 1 ? 'bg-zinc-300 text-black border-zinc-200' :
                          index === 2 ? 'bg-orange-700 text-white border-orange-600' :
                          'bg-zinc-800 text-zinc-400 border-zinc-700'
                        }`}>
                          {index === 0 ? <Trophy size={14} /> : index === 1 ? <Medal size={14} /> : index === 2 ? <Award size={14} /> : `#${index + 1}`}
                        </div>
                        <div className="flex items-center gap-2 md:gap-3">
                          <img loading="lazy" 
                            src={leader.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${leader.username}`} 
                            alt={leader.fullName} 
                            className="w-8 h-8 md:w-10 md:h-10 rounded-full object-cover border border-white/20 shrink-0"
                          />
                          <div className="min-w-0">
                            <h3 className={`font-display font-black uppercase tracking-wider text-xs md:text-sm truncate transition-colors ${
                              index === 0 ? 'text-yellow-500 group-hover:text-yellow-400' :
                              index === 1 ? 'text-zinc-300 group-hover:text-white' :
                              index === 2 ? 'text-orange-500 group-hover:text-orange-400' :
                              'text-white group-hover:text-firefox-orange'
                            }`}>
                              {leader.fullName}
                            </h3>
                            <div className="flex items-center gap-1.5 md:gap-2">
                              <p className="text-zinc-500 text-[8px] md:text-[9px] font-black tracking-[0.2em] uppercase truncate">@{leader.username}</p>
                              {leader.isFoundingMember && (
                                <span className="bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 px-1 py-0.5 rounded text-[7px] font-black uppercase tracking-wider flex items-center gap-0.5 shrink-0">
                                  <Sparkles size={8} /> <span className="hidden sm:inline">Founding</span>
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 md:gap-1.5 bg-black/40 px-2.5 md:px-3 py-1 md:py-1.5 rounded-full border border-white/5 shrink-0 ml-2">
                        <Star className={`w-3 h-3 ${isTop3 ? 'text-firefox-orange' : 'text-zinc-500'}`} fill={isTop3 ? 'currentColor' : 'none'} />
                        <span className="font-display font-black text-sm md:text-base text-white">{leader.points || 0}</span>
                        <span className="text-[7px] font-black uppercase tracking-widest text-zinc-500 hidden md:inline">PTS</span>
                      </div>
                    </div>
                  </Link>
                  
                  {/* AdSense Placeholder: Middle List Banner (inject every 10th item) */}
                  {(index + 1) % 10 === 0 && (
                    <div className="py-2">
                      <AdSenseBlock adSlot={`leaderboard_middle_${index}`} />
                    </div>
                  )}
                </motion.div>
              );
            })}

            {leaders.length === 0 && (
              <div className="text-center py-12 border border-white/10 rounded-3xl bg-white/5">
                <p className="text-zinc-500 font-medium">The leaderboard is currently empty. Be the first to earn points!</p>
              </div>
            )}
            
            {/* AdSense Placeholder: Bottom Banner */}
            <AdSenseBlock adSlot="leaderboard_bottom_banner" className="mt-12" />
          </section>
        </div>
      </main>
    </>
  );
};

export default LeaderboardPage;
