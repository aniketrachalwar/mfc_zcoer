import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../../lib/AuthContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { LayoutDashboard, GraduationCap, Code, ShoppingBag, Shield, ChevronRight, LogOut } from 'lucide-react';
import { Link, Navigate, useLocation } from 'react-router-dom';
import StudentOverview from './StudentOverview';
import RunningProjects from './RunningProjects';
import PurchasedItems from './PurchasedItems';
import MembershipHistory from './MembershipHistory';

const StudentDashboard = () => {
  const { user, loading: authLoading, logout } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<'overview' | 'projects' | 'purchases' | 'membership'>('overview');

  useEffect(() => {
    if (location.hash === '#projects') setActiveTab('projects');
    else if (location.hash === '#purchases') setActiveTab('purchases');
    else if (location.hash === '#membership') setActiveTab('membership');
    else setActiveTab('overview');
  }, [location.hash]);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      try {
        const docRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setProfile(docSnap.data());
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [user]);

  if (authLoading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-firefox-orange border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!user) return <Navigate to="/" />;

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-firefox-orange border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="pt-32 pb-20 px-4 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Top Navigation / Breadcrumb */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-16">
          <div>
            <h1 className="text-fluid-h2 font-display font-black uppercase tracking-tight mb-2">Student <span className="text-firefox-orange">Portal</span></h1>
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">
              <Link to="/" className="hover:text-white transition-colors min-h-[44px] flex items-center">Home</Link>
              <ChevronRight size={12} />
              <span className="text-firefox-orange">Community Track</span>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto mt-6 md:mt-0">
            <Link 
              to={`/profile/${profile?.username}`}
              className="flex items-center justify-center gap-2 px-6 py-3 min-h-[44px] rounded-xl bg-white/5 border border-white/10 hover:border-firefox-orange transition-all group"
            >
              <GraduationCap size={16} className="text-zinc-500 group-hover:text-firefox-orange" />
              <span className="text-[10px] font-black uppercase tracking-widest text-white">Public Profile</span>
            </Link>
            <button 
              onClick={logout}
              className="flex items-center justify-center gap-2 px-6 py-3 min-h-[44px] rounded-xl bg-red-500/10 border border-red-500/20 hover:bg-red-500 hover:text-white transition-all group text-red-500"
            >
              <LogOut size={16} />
              <span className="text-[10px] font-black uppercase tracking-widest">Logout</span>
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-[300px_1fr] gap-12">
          {/* Sidebar */}
          <div className="space-y-4">
            <button 
              onClick={() => setActiveTab('overview')}
              className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl border transition-all text-left ${
                activeTab === 'overview' 
                ? 'bg-firefox-orange border-firefox-orange text-white shadow-lg shadow-firefox-orange/20' 
                : 'bg-white/5 border-white/10 text-zinc-400 hover:bg-white/10'
              }`}
            >
              <LayoutDashboard size={20} />
              <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase tracking-widest">Overview</span>
                <span className="text-[9px] font-bold opacity-60 uppercase">Activity Summary</span>
              </div>
            </button>

            <button 
              onClick={() => setActiveTab('projects')}
              className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl border transition-all text-left ${
                activeTab === 'projects' 
                ? 'bg-firefox-orange border-firefox-orange text-white shadow-lg shadow-firefox-orange/20' 
                : 'bg-white/5 border-white/10 text-zinc-400 hover:bg-white/10'
              }`}
            >
              <Code size={20} />
              <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase tracking-widest">Running Projects</span>
                <span className="text-[9px] font-bold opacity-60 uppercase">Active Contributions</span>
              </div>
            </button>

            <button 
              onClick={() => setActiveTab('purchases')}
              className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl border transition-all text-left ${
                activeTab === 'purchases' 
                ? 'bg-firefox-orange border-firefox-orange text-white shadow-lg shadow-firefox-orange/20' 
                : 'bg-white/5 border-white/10 text-zinc-400 hover:bg-white/10'
              }`}
            >
              <ShoppingBag size={20} />
              <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase tracking-widest">Purchased Items</span>
                <span className="text-[9px] font-bold opacity-60 uppercase">Merch & Tickets</span>
              </div>
            </button>

            <button 
              onClick={() => setActiveTab('membership')}
              className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl border transition-all text-left ${
                activeTab === 'membership' 
                ? 'bg-firefox-orange border-firefox-orange text-white shadow-lg shadow-firefox-orange/20' 
                : 'bg-white/5 border-white/10 text-zinc-400 hover:bg-white/10'
              }`}
            >
              <Shield size={20} />
              <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase tracking-widest">Membership</span>
                <span className="text-[9px] font-bold opacity-60 uppercase">Status & History</span>
              </div>
            </button>
          </div>

          {/* Main Content */}
          <div className="bg-zinc-900/40 border border-white/5 rounded-[2.5rem] p-6 md:p-12 backdrop-blur-xl relative overflow-hidden">
             {/* Background Aura */}
             <div className="absolute top-0 right-0 w-96 h-96 bg-firefox-orange/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
             
             <AnimatePresence mode="wait">
               {activeTab === 'overview' ? (
                 <motion.div
                   key="overview"
                   initial={{ opacity: 0, y: 20 }}
                   animate={{ opacity: 1, y: 0 }}
                   exit={{ opacity: 0, y: -20 }}
                 >
                   <StudentOverview profile={profile} />
                 </motion.div>
               ) : activeTab === 'projects' ? (
                 <motion.div
                   key="projects"
                   initial={{ opacity: 0, y: 20 }}
                   animate={{ opacity: 1, y: 0 }}
                   exit={{ opacity: 0, y: -20 }}
                 >
                   <RunningProjects profile={profile} />
                 </motion.div>
               ) : activeTab === 'purchases' ? (
                 <motion.div
                   key="purchases"
                   initial={{ opacity: 0, y: 20 }}
                   animate={{ opacity: 1, y: 0 }}
                   exit={{ opacity: 0, y: -20 }}
                 >
                   <PurchasedItems profile={profile} />
                 </motion.div>
               ) : (
                 <motion.div
                   key="membership"
                   initial={{ opacity: 0, y: 20 }}
                   animate={{ opacity: 1, y: 0 }}
                   exit={{ opacity: 0, y: -20 }}
                 >
                   <MembershipHistory profile={profile} />
                 </motion.div>
               )}
             </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
