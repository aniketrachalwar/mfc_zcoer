import PageLoader from '../PageLoader';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';

import { Trophy, Medal, Star, Award, Sparkles, HelpCircle, X, CheckCircle2, Gift, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

const LeaderboardPage = () => {
  const [leaders, setLeaders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showRules, setShowRules] = useState(false);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const [usersSnap, teamSnap] = await Promise.all([
          getDocs(query(collection(db, 'users'), orderBy('points', 'desc'), limit(150))),
          getDocs(collection(db, 'team'))
        ]);
        
        const teamDocs = teamSnap.docs.map(doc => doc.data() as any);
        const leadershipUserIds = new Set(
          teamDocs
            .filter(t => t.category === 'Core Leadership' || t.category === 'Department Leads')
            .map(t => t.userId)
        );

        let data = usersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        data = data.filter((user: any) => !leadershipUserIds.has(user.id)).slice(0, 50);
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
        <PageLoader fullScreen={false} />
      </div>
    );
  }

  const top3 = leaders.slice(0, 3);
  const rest = leaders.slice(3);

  return (
    <>
      <Helmet>
        <title>Global Leaderboard | MFC Open Web</title>
        <meta name="description" content="Top community members leading the charts through contributions, events, and active participation in the MFC Open Web ecosystem." />
      </Helmet>
      
      <main className="min-h-screen pt-24 md:pt-32 pb-20 relative bg-zinc-950 overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
        
        <div className="hidden md:block absolute left-0 top-1/4 w-96 h-96 bg-firefox-yellow/5 blur-[80px] rounded-full mix-blend-screen pointer-events-none" />
        <div className="hidden md:block absolute right-0 bottom-1/4 w-96 h-96 bg-firefox-orange/5 blur-[80px] rounded-full mix-blend-screen pointer-events-none" />

        <div className="max-w-5xl mx-auto px-4 relative z-10">
          
          <header className="text-center mb-10 md:mb-16">
            <div className="inline-flex items-center gap-3 px-4 py-2 bg-firefox-orange/10 border border-firefox-orange/20 rounded-full text-firefox-orange text-[10px] font-black uppercase tracking-[0.2em] mb-6">
              <Trophy size={14} />
              Hall of Fame
            </div>
            <h1 className="text-3xl sm:text-5xl md:text-7xl font-display font-black uppercase tracking-tighter mb-6 text-white">
              Global <span className="text-firefox-orange">Leaderboard</span>
            </h1>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <p className="text-zinc-400 text-sm md:text-base font-medium">
                Top community members leading the charts through contributions and participation.
              </p>
              <button 
                onClick={() => setShowRules(true)}
                className="flex items-center gap-2 px-4 py-2 bg-zinc-900 border border-zinc-700 hover:bg-zinc-800 text-zinc-300 rounded-full text-xs font-bold uppercase tracking-wider transition-colors shrink-0"
              >
                <HelpCircle size={14} /> How it works
              </button>
            </div>
          </header>

          {/* AdSense Placeholder: Top Banner */}


          {leaders.length === 0 ? (
            <div className="text-center py-12 border border-white/10 rounded-3xl bg-white/5">
              <p className="text-zinc-500 font-medium">The leaderboard is currently empty. Be the first to earn points!</p>
            </div>
          ) : (
            <div className="space-y-16">
              
              {/* TOP 3 PODIUM */}
              <div className="flex items-end justify-center gap-2 sm:gap-6 md:gap-8 pt-10 pb-8 px-2">
                {/* 2ND PLACE */}
                {top3[1] && (
                  <motion.div 
                    initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                    className="flex flex-col items-center w-[30%] max-w-[160px]"
                  >
                    <Link to={`/profile/${top3[1].username}`} className="flex flex-col items-center group">
                      <div className="relative mb-3 md:mb-4">
                        <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full p-1 bg-gradient-to-b from-zinc-300 to-zinc-600 shadow-[0_0_30px_rgba(212,212,216,0.3)] group-hover:scale-105 transition-transform">
                          <img loading="lazy" src={top3[1].photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(top3[1].username)}&background=FF5C00&color=fff&bold=true`} alt={top3[1].fullName} className="w-full h-full rounded-full object-cover border-4 border-zinc-950 bg-zinc-900" />
                        </div>
                        <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-6 h-6 sm:w-8 sm:h-8 bg-zinc-300 text-black rounded-full flex items-center justify-center font-black text-xs sm:text-sm border-2 border-zinc-950">
                          2
                        </div>
                      </div>
                      <h3 className="text-xs sm:text-sm md:text-base font-black text-zinc-300 uppercase tracking-widest text-center line-clamp-1 w-full">{top3[1].fullName}</h3>
                      <p className="text-[10px] sm:text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2 text-center truncate w-full">@{top3[1].username}</p>
                      <div className="flex items-center gap-1 bg-white/5 border border-white/10 px-3 py-1 rounded-full">
                        <Star size={10} className="text-zinc-300" fill="currentColor" />
                        <span className="text-xs sm:text-sm font-black text-white">{top3[1].points || 0}</span>
                      </div>
                    </Link>
                  </motion.div>
                )}

                {/* 1ST PLACE */}
                {top3[0] && (
                  <motion.div 
                    initial={{ opacity: 0, y: 50, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ delay: 0 }}
                    className="flex flex-col items-center w-[35%] max-w-[200px] z-10 -mb-4 sm:-mb-6"
                  >
                    <Link to={`/profile/${top3[0].username}`} className="flex flex-col items-center group">
                      <Trophy size={28} className="text-yellow-400 mb-2 drop-shadow-[0_0_15px_rgba(250,204,21,0.5)] animate-pulse" />
                      <div className="relative mb-4 md:mb-5">
                        <div className="w-20 h-20 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-full p-1.5 bg-gradient-to-b from-yellow-400 to-yellow-600 shadow-[0_0_40px_rgba(250,204,21,0.4)] group-hover:scale-105 transition-transform">
                          <img loading="lazy" src={top3[0].photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(top3[0].username)}&background=FF5C00&color=fff&bold=true`} alt={top3[0].fullName} className="w-full h-full rounded-full object-cover border-4 border-zinc-950 bg-zinc-900" />
                        </div>
                        <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-8 h-8 sm:w-10 sm:h-10 bg-yellow-400 text-black rounded-full flex items-center justify-center font-black text-sm sm:text-base border-4 border-zinc-950">
                          1
                        </div>
                      </div>
                      <h3 className="text-sm sm:text-base md:text-xl font-black text-yellow-400 uppercase tracking-widest text-center line-clamp-1 w-full drop-shadow-md">{top3[0].fullName}</h3>
                      <p className="text-[10px] sm:text-xs font-bold text-yellow-600/80 uppercase tracking-widest mb-3 text-center truncate w-full">@{top3[0].username}</p>
                      <div className="flex items-center gap-1.5 bg-yellow-400/10 border border-yellow-400/20 px-4 py-1.5 rounded-full shadow-[0_0_15px_rgba(250,204,21,0.1)]">
                        <Star size={14} className="text-yellow-400" fill="currentColor" />
                        <span className="text-sm sm:text-lg font-black text-yellow-400">{top3[0].points || 0}</span>
                      </div>
                    </Link>
                  </motion.div>
                )}

                {/* 3RD PLACE */}
                {top3[2] && (
                  <motion.div 
                    initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                    className="flex flex-col items-center w-[30%] max-w-[160px]"
                  >
                    <Link to={`/profile/${top3[2].username}`} className="flex flex-col items-center group">
                      <div className="relative mb-3 md:mb-4">
                        <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full p-1 bg-gradient-to-b from-orange-700 to-orange-900 shadow-[0_0_30px_rgba(194,65,12,0.3)] group-hover:scale-105 transition-transform">
                          <img loading="lazy" src={top3[2].photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(top3[2].username)}&background=FF5C00&color=fff&bold=true`} alt={top3[2].fullName} className="w-full h-full rounded-full object-cover border-4 border-zinc-950 bg-zinc-900" />
                        </div>
                        <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-6 h-6 sm:w-8 sm:h-8 bg-orange-700 text-white rounded-full flex items-center justify-center font-black text-xs sm:text-sm border-2 border-zinc-950">
                          3
                        </div>
                      </div>
                      <h3 className="text-xs sm:text-sm md:text-base font-black text-orange-500 uppercase tracking-widest text-center line-clamp-1 w-full">{top3[2].fullName}</h3>
                      <p className="text-[10px] sm:text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2 text-center truncate w-full">@{top3[2].username}</p>
                      <div className="flex items-center gap-1 bg-white/5 border border-white/10 px-3 py-1 rounded-full">
                        <Star size={10} className="text-orange-500" fill="currentColor" />
                        <span className="text-xs sm:text-sm font-black text-white">{top3[2].points || 0}</span>
                      </div>
                    </Link>
                  </motion.div>
                )}
              </div>

              {/* LIST VIEW (RANKS 4-50) */}
              {rest.length > 0 && (
                <div className="flex flex-col gap-3 max-w-3xl mx-auto pt-8 border-t border-zinc-800">
                  {rest.map((leader, index) => {
                    const rank = index + 4; // Because top 3 are separated
                    return (
                      <motion.div
                        key={leader.id}
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, margin: "-50px" }}
                        className="group"
                      >
                        <Link to={`/profile/${leader.username}`} className="block">
                          <div className="flex items-center justify-between p-3 md:p-4 rounded-2xl bg-zinc-900/50 border border-zinc-800 hover:border-zinc-600 hover:bg-zinc-800/50 transition-all group-hover:-translate-y-0.5">
                            
                            <div className="flex items-center gap-4">
                              <div className="w-8 font-black text-zinc-500 text-right text-sm md:text-base">
                                #{rank}
                              </div>
                              <img loading="lazy" 
                                src={leader.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(leader.username)}&background=FF5C00&color=fff&bold=true`} 
                                alt={leader.fullName} 
                                className="w-10 h-10 md:w-12 md:h-12 rounded-full object-cover border border-zinc-700 bg-zinc-950"
                              />
                              <div>
                                <h3 className="font-black text-white text-sm md:text-base uppercase tracking-wider group-hover:text-firefox-orange transition-colors">
                                  {leader.fullName}
                                </h3>
                                <div className="flex items-center gap-2 mt-0.5">
                                  <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">@{leader.username}</p>
                                  {leader.isFoundingMember && (
                                    <span className="bg-yellow-500/10 text-yellow-500 px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider flex items-center gap-0.5">
                                      <Sparkles size={8} /> <span className="hidden sm:inline">Founding</span>
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-1.5 bg-black/40 px-3 py-1.5 rounded-full border border-white/5">
                              <span className="font-black text-sm md:text-base text-white">{leader.points || 0}</span>
                              <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500">PTS</span>
                            </div>

                          </div>
                        </Link>
                        
                        {/* AdSense Placeholder: Middle List Banner (inject every 10th item) */}
                        {rank % 10 === 0 && (
                          <div className="py-4">

                          </div>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* AdSense Placeholder: Bottom Banner */}

        </div>
      </main>

      {/* HOW IT WORKS MODAL */}
      <AnimatePresence>
        {showRules && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4 overflow-y-auto">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowRules(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-zinc-900 border border-zinc-800 rounded-[2rem] overflow-hidden shadow-2xl my-8"
            >
              <div className="sticky top-0 bg-zinc-900/80 backdrop-blur-md border-b border-zinc-800 px-6 py-4 flex items-center justify-between z-10">
                <h2 className="text-xl font-black text-white uppercase tracking-wider flex items-center gap-2">
                  <Star size={20} className="text-firefox-orange" /> How Scoring Works
                </h2>
                <button onClick={() => setShowRules(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-white transition-colors">
                  <X size={16} />
                </button>
              </div>

              <div className="p-6 sm:p-8 space-y-8 max-h-[70vh] overflow-y-auto">
                
                <div className="space-y-4">
                  <h3 className="text-sm font-black text-zinc-400 uppercase tracking-widest border-b border-zinc-800 pb-2">Insights & Content</h3>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-green-500/10 text-green-500 flex items-center justify-center shrink-0">
                      <CheckCircle2 size={20} />
                    </div>
                    <div>
                      <p className="text-white font-bold mb-1">Reading Internal Insights</p>
                      <p className="text-zinc-400 text-sm">Earn <strong className="text-white">+5 Points</strong> by reading a blog post and correctly answering the MCQ at the end. External links earn <strong className="text-white">+3 Points</strong>.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-firefox-orange/10 text-firefox-orange flex items-center justify-center shrink-0">
                      <Award size={20} />
                    </div>
                    <div>
                      <p className="text-white font-bold mb-1">Writing Insights (Authorship)</p>
                      <p className="text-zinc-400 text-sm">Write an insight that gets approved by the core team. You will earn a <strong className="text-white">1% share</strong> of all points generated by readers of your insight!</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-sm font-black text-zinc-400 uppercase tracking-widest border-b border-zinc-800 pb-2">Events & Workshops</h3>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0">
                      <Users size={20} />
                    </div>
                    <div>
                      <p className="text-white font-bold mb-1">Attending Workshops</p>
                      <p className="text-zinc-400 text-sm">Earn <strong className="text-white">+20 Points</strong> by attending a workshop and verifying your presence via the scanner.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center shrink-0">
                      <Trophy size={20} />
                    </div>
                    <div>
                      <p className="text-white font-bold mb-1">Conducting Workshops</p>
                      <p className="text-zinc-400 text-sm">Host a specific topic workshop and earn a massive <strong className="text-white">25% share</strong> of the total points distributed to all verified attendees!</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-sm font-black text-zinc-400 uppercase tracking-widest border-b border-zinc-800 pb-2">Community Growth</h3>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-yellow-500/10 text-yellow-500 flex items-center justify-center shrink-0">
                      <Gift size={20} />
                    </div>
                    <div>
                      <p className="text-white font-bold mb-1">Referral Program</p>
                      <p className="text-zinc-400 text-sm">Refer a friend to sign up using your referral code. You get <strong className="text-white">+20 Points</strong> and they get a bonus <strong className="text-white">+5 Points</strong> upon successful Google authentication!</p>
                    </div>
                  </div>
                </div>

              </div>
              
              <div className="p-6 bg-zinc-950 border-t border-zinc-800 text-center">
                <button onClick={() => setShowRules(false)} className="px-8 py-3 bg-firefox-orange text-white rounded-full font-black uppercase tracking-widest text-xs hover:scale-105 transition-transform">
                  Got it!
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </>
  );
};

export default LeaderboardPage;
