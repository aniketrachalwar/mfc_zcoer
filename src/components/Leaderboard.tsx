import { useState, useEffect } from 'react';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Trophy, Medal, Star, Award, Sparkles, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const LeaderboardPreview = () => {
  const [leaders, setLeaders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const [usersSnap, teamSnap] = await Promise.all([
          getDocs(query(collection(db, 'users'), orderBy('points', 'desc'), limit(50))),
          getDocs(collection(db, 'team'))
        ]);
        
        const teamDocs = teamSnap.docs.map(doc => doc.data() as any);
        const leadershipUserIds = new Set(
          teamDocs
            .filter(t => t.category === 'Core Leadership' || t.category === 'Department Leads')
            .map(t => t.userId)
        );

        const data = usersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        const filtered = data.filter((u: any) => 
          u.isLeadership !== true && 
          !['admin', 'president', 'core_team'].includes(u.role) &&
          !leadershipUserIds.has(u.id)
        ).slice(0, 3);
        setLeaders(filtered);
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
      <section id="leaderboard" className="py-20 relative bg-zinc-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-firefox-orange border-t-transparent rounded-full animate-spin" />
      </section>
    );
  }

  return (
    <section id="leaderboard" className="py-12 md:py-24 relative bg-zinc-950 overflow-hidden">
      {/* Significantly reduced effects for mobile performance */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
      
      <div className="max-w-4xl mx-auto px-4 relative z-10">
        <div className="text-center mb-8 md:mb-12">
          <div className="inline-flex items-center gap-3 px-4 py-2 bg-firefox-orange/10 border border-firefox-orange/20 rounded-full text-firefox-orange text-[10px] font-black uppercase tracking-[0.2em] mb-4">
            <Trophy size={14} />
            Hall of Fame
          </div>
          <h2 className="text-3xl md:text-5xl font-display font-black uppercase tracking-tighter mb-4">
            Top <span className="text-firefox-orange">Contributors</span>
          </h2>
          <p className="text-zinc-400 text-sm max-w-lg mx-auto font-medium">
            Leading the charts through active participation.
          </p>
        </div>

        <div className="flex flex-col gap-3 max-w-2xl mx-auto mb-10">
          {leaders.map((leader, index) => {
            return (
              <div key={leader.id} className={`relative flex items-center justify-between p-4 rounded-2xl border ${
                index === 0 ? 'bg-yellow-500/10 border-yellow-500/30' :
                index === 1 ? 'bg-zinc-300/10 border-zinc-300/30' :
                index === 2 ? 'bg-orange-700/10 border-orange-700/30' :
                'bg-white/5 border-white/10'
              }`}>
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-display font-black text-lg border ${
                    index === 0 ? 'bg-yellow-500 text-black border-yellow-400' :
                    index === 1 ? 'bg-zinc-300 text-black border-zinc-200' :
                    index === 2 ? 'bg-orange-700 text-white border-orange-600' :
                    'bg-zinc-800 text-zinc-400 border-zinc-700'
                  }`}>
                    {index === 0 ? <Trophy size={20} /> : index === 1 ? <Medal size={20} /> : index === 2 ? <Award size={20} /> : `#${index + 1}`}
                  </div>
                  <div className="flex items-center gap-3">
                    <img loading="lazy" 
                      src={leader.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${leader.username}`} 
                      alt={leader.fullName} 
                      className="w-10 h-10 rounded-full object-cover border border-white/20"
                    />
                    <div>
                      <h3 className={`font-display font-black uppercase tracking-wider text-sm md:text-base ${
                        index === 0 ? 'text-yellow-500' :
                        index === 1 ? 'text-zinc-300' :
                        index === 2 ? 'text-orange-500' :
                        'text-white'
                      }`}>
                        {leader.fullName}
                      </h3>
                      <div className="flex items-center gap-2">
                        <p className="text-zinc-500 text-[9px] md:text-[10px] font-black tracking-[0.2em] uppercase">@{leader.username}</p>
                        {leader.isFoundingMember && (
                          <span className="bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 px-1 py-0.5 rounded text-[8px] font-black uppercase tracking-wider flex items-center gap-1">
                            <Sparkles size={6} />
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 bg-black/40 px-3 py-1.5 rounded-full border border-white/5">
                  <Star className="w-4 h-4 text-firefox-orange" fill="currentColor" />
                  <span className="font-display font-black text-sm md:text-lg text-white">{leader.points || 0}</span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="text-center">
          <Link to="/leaderboard" className="inline-flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-xs font-black uppercase tracking-widest text-white transition-colors">
            View Full Leaderboard <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default LeaderboardPreview;
