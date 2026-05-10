import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../../lib/AuthContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import ProfileForm from './ProfileForm';
import ProfileCard from './ProfileCard';
import { Settings, User as UserIcon, Layout, Share2, LogOut, ChevronRight, Sparkles } from 'lucide-react';
import { Link, Navigate } from 'react-router-dom';

const Dashboard = () => {
  const { user, loading: authLoading, logout } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'profile' | 'visual'>('profile');

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
            <h1 className="text-4xl md:text-5xl font-display font-black uppercase tracking-tight mb-2">Member <span className="text-firefox-orange">Dashboard</span></h1>
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">
              <Link to="/" className="hover:text-white transition-colors">Home</Link>
              <ChevronRight size={12} />
              <span className="text-firefox-orange">Command Center</span>
            </div>
          </div>
          <div className="flex gap-4">
            {profile && (
              <Link 
                to={`/profile/${profile.username}`}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white/5 border border-white/10 hover:border-firefox-orange transition-all group"
              >
                <Share2 size={16} className="text-zinc-500 group-hover:text-firefox-orange" />
                <span className="text-[10px] font-black uppercase tracking-widest text-white">Public Profile</span>
              </Link>
            )}
            <button 
              onClick={logout}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-red-500/10 border border-red-500/20 hover:bg-red-500 hover:text-white transition-all group text-red-500"
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
              onClick={() => setActiveTab('profile')}
              className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl border transition-all text-left ${
                activeTab === 'profile' 
                ? 'bg-firefox-orange border-firefox-orange text-white shadow-lg shadow-firefox-orange/20' 
                : 'bg-white/5 border-white/10 text-zinc-400 hover:bg-white/10'
              }`}
            >
              <Settings size={20} />
              <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase tracking-widest">Settings</span>
                <span className="text-[9px] font-bold opacity-60 uppercase">Update Info</span>
              </div>
            </button>

            <button 
              onClick={() => setActiveTab('visual')}
              className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl border transition-all text-left ${
                activeTab === 'visual' 
                ? 'bg-firefox-orange border-firefox-orange text-white shadow-lg shadow-firefox-orange/20' 
                : 'bg-white/5 border-white/10 text-zinc-400 hover:bg-white/10'
              }`}
            >
              <Layout size={20} />
              <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase tracking-widest">Member Card</span>
                <span className="text-[9px] font-bold opacity-60 uppercase">Visual Identity</span>
              </div>
            </button>
          </div>

          {/* Main Content */}
          <div className="bg-zinc-900/40 border border-white/5 rounded-[2.5rem] p-8 md:p-12 backdrop-blur-xl relative overflow-hidden">
             {/* Background Aura */}
             <div className="absolute top-0 right-0 w-96 h-96 bg-firefox-orange/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2" />
             
             <AnimatePresence mode="wait">
               {activeTab === 'profile' ? (
                 <motion.div
                   key="profile"
                   initial={{ opacity: 0, y: 20 }}
                   animate={{ opacity: 1, y: 0 }}
                   exit={{ opacity: 0, y: -20 }}
                 >
                   <div className="mb-12">
                     <h2 className="text-3xl font-display font-black uppercase text-white mb-2">Edit <span className="text-firefox-orange">Profile</span></h2>
                     <p className="text-zinc-500 font-medium">Keep your credentials up to date for the ZCOER community.</p>
                   </div>
                   <ProfileForm 
                    user={user} 
                    initialData={profile} 
                    onSave={(data) => {
                      setProfile(data);
                      setActiveTab('visual');
                    }} 
                   />
                 </motion.div>
               ) : (
                 <motion.div
                   key="visual"
                   initial={{ opacity: 0, y: 20 }}
                   animate={{ opacity: 1, y: 0 }}
                   exit={{ opacity: 0, y: -20 }}
                 >
                   <div className="mb-12 text-center">
                     <div className="inline-flex items-center gap-3 px-4 py-2 bg-firefox-orange/10 border border-firefox-orange/20 rounded-full text-firefox-orange text-[10px] font-black uppercase tracking-[0.2em] mb-6">
                       <Sparkles size={14} />
                       Your Identity is Ready
                     </div>
                     <h2 className="text-3xl font-display font-black uppercase text-white mb-2">Your <span className="text-firefox-orange">Member Card</span></h2>
                     <p className="text-zinc-500 font-medium">Download and share your unique Mozilla ZCOER identity.</p>
                   </div>
                   {profile ? (
                     <ProfileCard profile={profile} />
                   ) : (
                     <div className="text-center py-20">
                       <p className="text-zinc-500 mb-6">You need to complete your profile first.</p>
                       <button 
                         onClick={() => setActiveTab('profile')}
                         className="px-8 py-3 bg-firefox-orange text-white rounded-full font-display font-black text-[10px] uppercase tracking-widest"
                       >
                         Complete Profile
                       </button>
                     </div>
                   )}
                 </motion.div>
               )}
             </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
