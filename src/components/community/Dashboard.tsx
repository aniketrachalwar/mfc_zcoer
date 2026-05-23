import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../../lib/AuthContext';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import ProfileForm from './ProfileForm';
import ProfileCard from './ProfileCard';
import DashboardOverview from './DashboardOverview';
import { Settings, User as UserIcon, Layout, Share2, LogOut, ChevronRight, Sparkles, Shield, Clock, LayoutDashboard } from 'lucide-react';
import { Link, Navigate, useLocation } from 'react-router-dom';
import MembershipApply from '../membership/MembershipApply';

const Dashboard = () => {
  const { user, loading: authLoading, logout } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<'overview' | 'profile' | 'visual' | 'membership'>('overview');

  useEffect(() => {
    if (location.hash === '#membership') setActiveTab('membership');
    else if (location.hash === '#profile') setActiveTab('profile');
    else if (location.hash === '#visual') setActiveTab('visual');
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
          const profileData = docSnap.data();
          
          // Streak Logic
          const todayStr = new Date().toISOString().split('T')[0];
          let lastLogin = profileData.lastLoginStr;
          let streakCount = profileData.streakCount || 0;
          let points = profileData.points || 0;

          if (lastLogin !== todayStr) {
             const yesterday = new Date();
             yesterday.setDate(yesterday.getDate() - 1);
             const yesterdayStr = yesterday.toISOString().split('T')[0];
             
             if (lastLogin === yesterdayStr) {
                 streakCount += 1;
             } else {
                 streakCount = 1;
             }

             if (streakCount === 7) {
                 points += 30;
                 streakCount = 0; // reset streak for next 7 days
             }

             try {
               await updateDoc(docRef, {
                   lastLoginStr: todayStr,
                   streakCount: streakCount,
                   points: points
               });
               
               profileData.lastLoginStr = todayStr;
               profileData.streakCount = streakCount;
               profileData.points = points;
             } catch (updateErr) {
               console.error("Failed to update streak:", updateErr);
               // Even if update fails, we should still allow the user to see their dashboard
             }
          }

          setProfile(profileData);
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [user]);

  const membershipStatus = profile?.membershipStatus || 'public';
  const isProfileComplete = Boolean(
    profile?.fullName && profile?.username && profile?.department && profile?.year
  );

  const isAdminOrCore = profile?.role === 'admin' || profile?.role === 'president' || profile?.role === 'core_team';
  const hasAccess = isProfileComplete; // All users are automatically Free members
  const isPending = profile?.membershipStatus === 'pending';

  // Force tab state based on access
  useEffect(() => {
    if (!loading) {
      if (!profile || !isProfileComplete) {
        setActiveTab('profile');
      }
    }
  }, [loading, profile, isProfileComplete]);

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
            <h1 className="text-fluid-h2 font-display font-black uppercase tracking-tight mb-2">Member <span className="text-firefox-orange">Dashboard</span></h1>
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">
              <Link to="/" className="hover:text-white transition-colors min-h-[44px] flex items-center">Home</Link>
              <ChevronRight size={12} />
              <span className="text-firefox-orange">Command Center</span>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto mt-6 md:mt-0">
            {profile && (profile.role === 'admin' || profile.role === 'president' || profile.role === 'core_team') && (
              <Link 
                to="/admin"
                className="flex items-center justify-center gap-2 px-6 py-3 min-h-[44px] rounded-xl bg-firefox-orange/10 border border-firefox-orange/20 hover:bg-firefox-orange hover:text-white transition-all group text-firefox-orange"
              >
                <Shield size={16} className="group-hover:text-white transition-colors" />
                <span className="text-[10px] font-black uppercase tracking-widest group-hover:text-white transition-colors">Admin Portal</span>
              </Link>
            )}

            {profile && (
              <Link 
                to={`/profile/${profile.username}`}
                className="flex items-center justify-center gap-2 px-6 py-3 min-h-[44px] rounded-xl bg-white/5 border border-white/10 hover:border-firefox-orange transition-all group"
              >
                <Share2 size={16} className="text-zinc-500 group-hover:text-firefox-orange" />
                <span className="text-[10px] font-black uppercase tracking-widest text-white">Public Profile</span>
              </Link>
            )}
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
              disabled={!isProfileComplete}
              className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl border transition-all text-left ${
                activeTab === 'overview' 
                ? 'bg-firefox-orange border-firefox-orange text-white shadow-lg shadow-firefox-orange/20' 
                : 'bg-white/5 border-white/10 text-zinc-400 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed'
              }`}
            >
              <LayoutDashboard size={20} />
              <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase tracking-widest">Overview</span>
                <span className="text-[9px] font-bold opacity-60 uppercase">Dashboard Home</span>
              </div>
            </button>

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
              disabled={!hasAccess || !isProfileComplete}
              className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl border transition-all text-left ${
                activeTab === 'visual' 
                ? 'bg-firefox-orange border-firefox-orange text-white shadow-lg shadow-firefox-orange/20' 
                : 'bg-white/5 border-white/10 text-zinc-400 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed'
              }`}
            >
              <Layout size={20} />
              <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                  Member Card
                  {!hasAccess && <Shield size={12} className="text-firefox-orange" />}
                </span>
                <span className="text-[9px] font-bold opacity-60 uppercase">
                  {!hasAccess ? 'Locked' : 'Visual Identity'}
                </span>
              </div>
            </button>

            {isProfileComplete && profile?.membershipTier === 'free' && (
              <button 
                onClick={() => setActiveTab('membership')}
                className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl border transition-all text-left ${
                  activeTab === 'membership' 
                  ? 'bg-firefox-orange border-firefox-orange text-white shadow-lg shadow-firefox-orange/20' 
                  : 'bg-white/5 border-white/10 text-zinc-400 hover:bg-white/10'
                }`}
              >
                <Sparkles size={20} className={activeTab === 'membership' ? 'text-white' : 'text-firefox-orange'} />
                <div className="flex flex-col">
                  <span className={`text-[10px] font-black uppercase tracking-widest ${activeTab === 'membership' ? 'text-white' : 'text-firefox-orange'}`}>Upgrade Tier</span>
                  <span className="text-[9px] font-bold opacity-60 uppercase">
                    {isPending ? 'Under Review' : 'Unlock Premium'}
                  </span>
                </div>
              </button>
            )}
          </div>

          {/* Main Content */}
          <div className="bg-zinc-900/40 border border-white/5 rounded-[2.5rem] p-6 md:p-12 backdrop-blur-xl relative overflow-hidden">
             {/* Background Aura */}
             <div className="absolute top-0 right-0 w-96 h-96 bg-firefox-orange/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2" />
             
             <AnimatePresence mode="wait">
               {activeTab === 'overview' ? (
                 <motion.div
                   key="overview"
                   initial={{ opacity: 0, y: 20 }}
                   animate={{ opacity: 1, y: 0 }}
                   exit={{ opacity: 0, y: -20 }}
                 >
                   <DashboardOverview profile={profile} />
                 </motion.div>
               ) : activeTab === 'profile' ? (
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
                      setActiveTab('overview');
                    }} 
                   />
                 </motion.div>
               ) : activeTab === 'membership' ? (
                 <motion.div
                   key="membership"
                   initial={{ opacity: 0, y: 20 }}
                   animate={{ opacity: 1, y: 0 }}
                   exit={{ opacity: 0, y: -20 }}
                 >
                   {isPending ? (
                     <div className="text-center py-20">
                       <div className="w-24 h-24 bg-firefox-orange/10 rounded-full flex items-center justify-center mx-auto mb-8 border border-firefox-orange/20">
                         <Clock className="text-firefox-orange animate-pulse" size={48} />
                       </div>
                       <h2 className="text-3xl font-display font-black uppercase text-white mb-4">Application <span className="text-firefox-orange">Under Review</span></h2>
                       <p className="text-zinc-400 max-w-md mx-auto mb-8">
                         Your membership application and payment are currently being verified by the core team. This usually takes 24-48 hours.
                       </p>
                       <div className="inline-flex items-center gap-2 px-6 py-3 bg-white/5 rounded-xl border border-white/10">
                         <div className="w-2 h-2 rounded-full bg-yellow-500 animate-ping" />
                         <span className="text-xs font-bold uppercase tracking-widest text-zinc-300">Status: Pending Verification</span>
                       </div>
                     </div>
                   ) : (
                     <MembershipApply 
                       profile={profile} 
                       onComplete={() => setProfile({ ...profile, membershipStatus: 'pending' })} 
                     />
                   )}
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
