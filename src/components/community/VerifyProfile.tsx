import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { ShieldCheck, XCircle, Loader2, ArrowLeft, Search, ScanLine } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const VerifyProfile = () => {
  const { username } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(!!username);
  const [error, setError] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);

  useEffect(() => {
    if (username) {
      const fetchProfile = async () => {
        try {
          const q = query(collection(db, 'users'), where('username', '==', username), limit(1));
          const querySnapshot = await getDocs(q);
          if (querySnapshot.empty) {
            setError("Profile not found.");
          } else {
            setProfile(querySnapshot.docs[0].data());
          }
        } catch (err) {
          console.error("Error fetching verify profile:", err);
          setError("Failed to load profile.");
        } finally {
          setLoading(false);
        }
      };
      fetchProfile();
    }
  }, [username]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchInput.trim()) return;
    
    setSearchLoading(true);
    setError(null);
    setProfile(null);
    
    try {
      // Try searching by username first
      let q = query(collection(db, 'users'), where('username', '==', searchInput.trim()), limit(1));
      let querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        // If not found, try by memberId (Serial No)
        q = query(collection(db, 'users'), where('memberId', '==', searchInput.trim()), limit(1));
        querySnapshot = await getDocs(q);
      }
      
      if (querySnapshot.empty) {
        setError("Profile not found.");
      } else {
        setProfile(querySnapshot.docs[0].data());
      }
    } catch (err) {
      console.error("Error searching profile:", err);
      setError("Failed to load profile.");
    } finally {
      setSearchLoading(false);
    }
  };

  if (!username && !profile && !error) {
    return (
      <div className="min-h-screen bg-[#09090b] pt-32 pb-20 px-4 flex flex-col items-center justify-center">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="max-w-md w-full bg-zinc-900 border border-white/10 rounded-[2rem] p-8 shadow-2xl relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-firefox-orange/10 blur-[80px] rounded-full pointer-events-none" />
          
          <div className="relative z-10 flex flex-col items-center text-center mb-8">
            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-6 text-firefox-orange border border-white/10">
              <ScanLine size={32} />
            </div>
            <h1 className="text-3xl font-display font-black uppercase text-white mb-2">Member Verification</h1>
            <p className="text-zinc-400 text-sm font-medium">Scan a QR code or manually enter a Serial Number / Username to verify authenticity.</p>
          </div>

          <form onSubmit={handleSearch} className="relative z-10 flex flex-col gap-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                <Search size={18} className="text-zinc-500" />
              </div>
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Enter Serial No. or Username"
                className="w-full bg-black/50 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white placeholder:text-zinc-600 focus:outline-none focus:border-firefox-orange transition-colors"
                required
              />
            </div>
            <button
              type="submit"
              disabled={searchLoading}
              className="w-full py-4 bg-firefox-orange text-white rounded-xl font-display font-black uppercase tracking-widest text-xs hover:shadow-[0_0_20px_rgba(255,92,0,0.4)] transition-all flex justify-center items-center h-[52px]"
            >
              {searchLoading ? <Loader2 className="animate-spin" size={20} /> : "Verify Member"}
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20 bg-[#09090b]">
        <Loader2 className="text-firefox-orange animate-spin" size={48} />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center pt-20 bg-[#09090b] text-center px-4 relative">
        <XCircle className="text-red-500 mb-6" size={80} />
        <h2 className="text-4xl font-display font-black uppercase text-white mb-4">Verification Failed</h2>
        <p className="text-zinc-500 mb-8 max-w-md">The provided identifier does not match any active MFC ZCOER member in our records.</p>
        
        <div className="flex gap-4">
          <button onClick={() => { setError(null); setSearchInput(''); }} className="px-8 py-3 bg-white/5 border border-white/10 rounded-full text-white font-display text-[10px] uppercase tracking-widest hover:bg-white/10 transition-all">
            Try Again
          </button>
          <Link to="/" className="px-8 py-3 bg-firefox-orange text-white rounded-full font-display text-[10px] uppercase tracking-widest hover:shadow-[0_0_20px_rgba(255,92,0,0.4)] transition-all">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#09090b] pt-32 pb-20 px-4 flex flex-col items-center justify-center">
      <Link 
        to={`/profile/${profile.username}`}
        className="absolute top-24 left-4 md:left-12 z-20 cursor-pointer inline-flex items-center gap-2 text-zinc-500 hover:text-white transition-colors group"
      >
        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
        <span className="text-[10px] font-black uppercase tracking-widest">View Full Profile</span>
      </Link>

      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="max-w-md w-full bg-zinc-900 border border-[#22c55e]/30 rounded-[2rem] p-8 shadow-[0_0_50px_rgba(34,197,94,0.1)] relative overflow-hidden text-center"
      >
        <div className="absolute inset-0 bg-gradient-to-b from-[#22c55e]/10 to-transparent pointer-events-none" />
        
        <div className="relative z-10 flex flex-col items-center">
          <div className="w-24 h-24 bg-[#22c55e]/20 rounded-full flex items-center justify-center mb-6">
            <ShieldCheck className="text-[#22c55e]" size={48} />
          </div>
          
          <h1 className="text-3xl font-display font-black uppercase text-[#22c55e] mb-2">Verified Member</h1>
          <p className="text-zinc-400 text-sm font-medium mb-8">This is an authentic MFC ZCOER member card.</p>

          <div className="w-24 h-24 rounded-full border-2 border-white/10 p-1 mb-4 overflow-hidden">
            <img 
              src={profile.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.username}`} 
              alt={profile.fullName}
              className="w-full h-full rounded-full object-cover" 
            />
          </div>

          <h2 className="text-2xl font-display font-black uppercase text-white mb-1">
            {profile.fullName}
          </h2>
          <p className="text-firefox-orange text-xs font-black uppercase tracking-[0.2em] mb-6">
            @{profile.username}
          </p>

          <div className="w-full space-y-3">
            <div className="flex justify-between items-center py-3 border-t border-white/10">
              <span className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">Member ID</span>
              <span className="text-white font-mono font-bold">{profile.memberId}</span>
            </div>
            {profile.department && (
              <div className="flex justify-between items-center py-3 border-t border-white/10">
                <span className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">Department</span>
                <span className="text-white text-xs font-bold uppercase">{profile.department}</span>
              </div>
            )}
            {profile.year && (
              <div className="flex justify-between items-center py-3 border-t border-white/10">
                <span className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">Year</span>
                <span className="text-white text-xs font-bold uppercase">{profile.year}</span>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default VerifyProfile;
