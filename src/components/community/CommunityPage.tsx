import { useState, useEffect } from 'react';
import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Trophy, ExternalLink, Sparkles } from 'lucide-react';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Link } from 'react-router-dom';
import AdSenseBlock from '../AdSenseBlock';
import { useAuth } from '../../lib/AuthContext';
import AuthModal from '../AuthModal';

interface Profile {
  id: string;
  fullName: string;
  username: string;
  memberId: string;
  photoURL?: string;
  bio?: string;
  skills?: string[];
  department?: string;
  year?: string;
  socialLinks?: {
    github?: string;
    linkedin?: string;
    instagram?: string;
    twitter?: string;
  };
  isFoundingMember?: boolean;
  role?: string;
  membershipStatus?: string;
}

const CommunityPage = () => {
  const { user, loading: authLoading } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    const fetchProfiles = async () => {
      try {
        const q = query(collection(db, 'users'), orderBy('memberId', 'asc'), limit(50));
        const querySnapshot = await getDocs(q);
        const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Profile));
        
        // Sort active/premium members first
        data.sort((a, b) => {
          const aActive = a.membershipStatus === 'active' || ['admin', 'president', 'core_team'].includes(a.role || '');
          const bActive = b.membershipStatus === 'active' || ['admin', 'president', 'core_team'].includes(b.role || '');
          if (aActive && !bActive) return -1;
          if (!aActive && bActive) return 1;
          return 0;
        });

        setProfiles(data);
      } catch (err) {
        console.error("Error fetching profiles:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfiles();
  }, [user]);

  const filteredProfiles = profiles.filter(p => {
    const s = searchTerm.toLowerCase();
    const nameMatch = p.fullName ? p.fullName.toLowerCase().includes(s) : false;
    const userMatch = p.username ? p.username.toLowerCase().includes(s) : false;
    const idMatch = p.memberId ? p.memberId.toLowerCase().includes(s) : false;
    return nameMatch || userMatch || idMatch;
  });

  if (authLoading) {
    return (
      <div className="pt-32 pb-20 px-4 min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-firefox-orange border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="pt-32 pb-20 px-4 min-h-screen flex flex-col items-center justify-center text-center">
        <Trophy className="text-firefox-orange mb-6" size={64} />
        <h1 className="text-4xl md:text-5xl font-display font-black uppercase text-white mb-4">Members Only</h1>
        <p className="text-zinc-400 mb-8 max-w-md">You need to log in to view and connect with the MFC Open Web community members.</p>
        <button 
          onClick={() => setIsAuthModalOpen(true)}
          className="px-10 py-4 bg-firefox-orange text-white rounded-full font-display font-black text-sm uppercase tracking-widest hover:bg-white hover:text-black transition-all"
        >
          Sign In / Join
        </button>
        <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
      </div>
    );
  }

  return (
    <div className="pt-32 pb-20 px-4 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-6"
          >
            <Trophy className="text-firefox-orange" size={16} />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">MFC Open Web Community</span>
          </motion.div>
          <h1 className="text-5xl md:text-7xl font-display font-black uppercase tracking-tight mb-6">
            Meet The <span className="text-firefox-orange">Community</span>
          </h1>
          <p className="text-zinc-400 max-w-2xl mx-auto font-medium">
            Explore the talented individuals making an impact in the Mozilla Firefox Club at Zeal College. Connect, collaborate, and grow together.
          </p>
        </div>

        {/* Search */}
        <div className="relative max-w-xl mx-auto mb-20 group">
          <div className="absolute inset-0 bg-firefox-orange/20 blur-2xl opacity-0 group-focus-within:opacity-100 transition-opacity" />
          <div className="relative bg-zinc-900/50 border border-white/10 p-2 rounded-full backdrop-blur-xl flex items-center gap-4">
            <Search className="text-zinc-500 ml-4" size={20} />
            <input 
              type="text" 
              placeholder="Search by name, username, or Member ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-transparent border-none outline-none w-full text-white font-medium placeholder:text-zinc-600"
            />
          </div>
        </div>

        {/* AdSense Placeholder - Top */}
        <AdSenseBlock adSlot="community_top_banner" className="mb-12" />

        {/* Member Grid */}
        <AnimatePresence mode="popLayout">
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
              {[...Array(10)].map((_, i) => (
                <div key={i} className="h-48 bg-white/5 border border-white/5 rounded-2xl sm:rounded-3xl animate-pulse" />
              ))}
            </div>
          ) : (
            <motion.div 
              layout
              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 md:gap-6"
            >
              {filteredProfiles.map((profile, i) => (
                <React.Fragment key={profile.id}>
                  {/* Inject Advertisement every 12 profiles */}
                  {i > 0 && i % 12 === 0 && (
                    <div className="col-span-full w-full my-4">
                      <AdSenseBlock adSlot={`community_mid_${i}`} />
                    </div>
                  )}
                  <motion.div
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.05 }}
                    className="group relative bg-zinc-900/40 border border-white/5 p-2 sm:p-5 rounded-2xl sm:rounded-[1.5rem] hover:border-firefox-orange/30 transition-all duration-500 overflow-hidden flex flex-col items-center text-center h-full"
                  >
                    <div className="absolute top-0 right-0 w-24 h-24 bg-firefox-orange/5 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                    
                    <div className="relative w-12 h-12 sm:w-24 sm:h-24 mb-2 sm:mb-4 shrink-0">
                      {(profile.membershipStatus === 'active' || ['admin', 'president', 'core_team'].includes(profile.role || '')) && (
                        <div className="absolute inset-0 bg-firefox-orange rounded-full blur-xl opacity-20 scale-125 animate-pulse" />
                      )}
                      <img loading="lazy" 
                        src={profile.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.fullName || profile.username || 'User')}&background=FF5C00&color=fff&bold=true`} 
                        onError={(e) => { e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.fullName || profile.username || 'User')}&background=FF5C00&color=fff&bold=true`; }}
                        alt={profile.fullName || 'Unknown User'}
                        className="w-full h-full rounded-full object-cover aspect-square border-2 border-zinc-800 relative z-10"
                      />
                      {profile.isFoundingMember && (
                        <div className="absolute -top-1 -right-1 z-20 bg-yellow-500 text-black p-1.5 rounded-full border border-black shadow-lg">
                          <Sparkles size={12} />
                        </div>
                      )}
                    </div>

                    <h3 className="text-[10px] sm:text-base font-display font-black uppercase text-white group-hover:text-firefox-orange transition-colors line-clamp-1 w-full" title={profile.fullName || 'Unknown User'}>
                      {profile.fullName || 'Unknown User'}
                    </h3>
                    
                    <span className="text-[8px] sm:text-[10px] font-black tracking-widest text-firefox-orange uppercase mt-1 mb-2 sm:mb-4 bg-firefox-orange/10 px-2 sm:px-3 py-1 rounded-full border border-firefox-orange/20 line-clamp-1 w-max max-w-full">
                      {profile.memberId || 'GUEST'}
                    </span>

                    <div className="flex flex-wrap justify-center gap-1 text-[8px] uppercase tracking-wider font-bold mb-4">
                      {profile.department && (
                        <span className="text-zinc-400 bg-white/5 px-1.5 py-0.5 rounded border border-white/5 max-w-[80px] truncate">{profile.department}</span>
                      )}
                      {profile.year && (
                        <span className="text-zinc-400 bg-white/5 px-1.5 py-0.5 rounded border border-white/5">{profile.year} Yr</span>
                      )}
                    </div>

                    <Link 
                      to={`/profile/${profile.username}`}
                      className="mt-auto w-full inline-flex items-center justify-center gap-2 group/btn px-3 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-firefox-orange hover:border-firefox-orange hover:text-white transition-all duration-300 text-zinc-300"
                    >
                      <span className="text-[9px] font-black uppercase tracking-widest">Profile</span>
                      <ExternalLink size={10} className="group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
                    </Link>
                  </motion.div>
                </React.Fragment>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {filteredProfiles.length === 0 && !loading && (
          <div className="text-center py-20">
            <h3 className="text-2xl text-zinc-500 font-display uppercase tracking-widest">No members found</h3>
          </div>
        )}

        {/* AdSense Placeholder - Bottom */}
        <AdSenseBlock adSlot="community_bottom_banner" className="mt-12" />
      </div>
    </div>
  );
};

export default CommunityPage;
