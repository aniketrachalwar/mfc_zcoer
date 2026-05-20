import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Trophy, MapPin, ExternalLink, Github, Linkedin, Instagram, Twitter } from 'lucide-react';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Link } from 'react-router-dom';
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
        setProfiles(data);
      } catch (err) {
        console.error("Error fetching profiles:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfiles();
  }, [user]);

  const filteredProfiles = profiles.filter(p => 
    p.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.memberId.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
        <p className="text-zinc-400 mb-8 max-w-md">You need to log in to view and connect with the MFC ZCOER community members.</p>
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
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">MFC ZCOER Community</span>
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

        {/* Member Grid */}
        <AnimatePresence mode="popLayout">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-64 bg-white/5 border border-white/5 rounded-3xl animate-pulse" />
              ))}
            </div>
          ) : (
            <motion.div 
              layout
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {filteredProfiles.map((profile, i) => (
                <motion.div
                  key={profile.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className="group relative bg-zinc-900/40 border border-white/5 p-8 rounded-[2.5rem] hover:border-firefox-orange/30 transition-all duration-500 overflow-hidden"
                >
                  {/* Background Aura */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-firefox-orange/5 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
                  
                  <div className="relative flex items-start justify-between mb-8">
                    <div className="relative w-20 h-20">
                      <div className="absolute inset-0 bg-firefox-orange rounded-full blur-xl opacity-20 scale-150 animate-pulse" />
                      <img loading="lazy" 
                        src={profile.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.username}`} 
                        alt={profile.fullName}
                        className="w-full h-full rounded-full object-cover border-2 border-zinc-800 relative z-10"
                      />
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-black tracking-widest text-firefox-orange bg-firefox-orange/10 px-3 py-1 rounded-full uppercase">
                        {profile.memberId}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-4 mb-8">
                    <h3 className="text-2xl font-display font-black uppercase text-white group-hover:text-firefox-orange transition-colors">
                      {profile.fullName}
                    </h3>
                    <p className="text-zinc-500 text-sm line-clamp-2 min-h-[2.5rem]">
                      {profile.bio || "No bio yet."}
                    </p>
                    <div className="flex flex-wrap gap-2 text-[10px] uppercase tracking-wider font-bold">
                      {profile.department && (
                        <span className="text-zinc-400 bg-white/5 px-2 py-1 rounded border border-white/5">{profile.department}</span>
                      )}
                      {profile.year && (
                        <span className="text-zinc-400 bg-white/5 px-2 py-1 rounded border border-white/5">{profile.year} Year</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex gap-3">
                      {profile.socialLinks?.github && (
                        <a 
                          href={profile.socialLinks.github.startsWith('http') ? profile.socialLinks.github : `https://github.com/${profile.socialLinks.github.replace('@', '')}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                        >
                          <Github size={16} className="text-zinc-500 hover:text-white transition-colors cursor-pointer" />
                        </a>
                      )}
                      {profile.socialLinks?.linkedin && (
                        <a 
                          href={profile.socialLinks.linkedin.startsWith('http') ? profile.socialLinks.linkedin : `https://linkedin.com/in/${profile.socialLinks.linkedin.replace(/^\//, '')}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                        >
                          <Linkedin size={16} className="text-zinc-500 hover:text-white transition-colors cursor-pointer" />
                        </a>
                      )}
                    </div>
                    <Link 
                      to={`/profile/${profile.username}`}
                      className="inline-flex items-center gap-2 group/btn px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-firefox-orange transition-all duration-300"
                    >
                      <span className="text-[10px] font-black uppercase tracking-widest">View Profile</span>
                      <ExternalLink size={12} className="group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
                    </Link>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {filteredProfiles.length === 0 && !loading && (
          <div className="text-center py-20">
            <h3 className="text-2xl text-zinc-500 font-display uppercase tracking-widest">No members found</h3>
          </div>
        )}
      </div>
    </div>
  );
};

export default CommunityPage;
