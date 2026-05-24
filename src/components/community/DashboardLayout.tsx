import React, { useEffect, useState } from 'react';
import { Navigate, Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../lib/AuthContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { 
  LayoutDashboard, 
  Settings, 
  IdCard, 
  Sparkles, 
  Share2, 
  Shield, 
  LogOut,
  Code,
  ShoppingBag,
  MoreHorizontal,
  X,
  User as UserIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const DashboardLayout = () => {
  const { user, loading: authLoading, logout } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [dashboardConfig, setDashboardConfig] = useState<any>({
    enableProjectsTab: true,
    enablePurchasesTab: true,
    enableMembershipHistory: true,
  });
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const [isMoreOpen, setIsMoreOpen] = useState(false);

  // Close drawer on route change
  useEffect(() => {
    setIsMoreOpen(false);
  }, [location.pathname]);

  const fetchData = async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    try {
      const [profileSnap, configSnap] = await Promise.all([
        getDoc(doc(db, 'users', user.uid)),
        getDoc(doc(db, 'config', 'membersDashboard'))
      ]);
      if (profileSnap.exists()) {
        setProfile(profileSnap.data());
      }
      if (configSnap.exists()) {
        setDashboardConfig(configSnap.data());
      }
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  if (authLoading || loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-firefox-orange border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!user) return <Navigate to="/" />;

  const primaryTabs = [
    { name: 'Overview', path: '/dashboard', icon: LayoutDashboard },
    ...(dashboardConfig.enableProjectsTab ? [{ name: 'Projects', path: '/dashboard/projects', icon: Code }] : []),
    ...(dashboardConfig.enablePurchasesTab ? [{ name: 'Purchases', path: '/dashboard/purchases', icon: ShoppingBag }] : []),
    ...(dashboardConfig.enableMembershipHistory ? [{ name: 'History', path: '/dashboard/membership-history', icon: Shield }] : []),
    { name: 'ID Card', path: '/dashboard/id-card', icon: IdCard },
  ];

  const secondaryTabs = [
    { name: 'Upgrade Tier', path: '/dashboard/membership', icon: Sparkles },
    { name: 'Settings', path: '/dashboard/settings', icon: Settings },
  ];

  const mobilePrimaryTabs = [
    { name: 'Overview', path: '/dashboard', icon: LayoutDashboard },
    ...(dashboardConfig.enableProjectsTab ? [{ name: 'Projects', path: '/dashboard/projects', icon: Code }] : []),
    { name: 'ID Card', path: '/dashboard/id-card', icon: IdCard },
  ];

  const mobileSecondaryTabs = [
    ...(dashboardConfig.enablePurchasesTab ? [{ name: 'Purchases', path: '/dashboard/purchases', icon: ShoppingBag }] : []),
    ...(dashboardConfig.enableMembershipHistory ? [{ name: 'History', path: '/dashboard/membership-history', icon: Shield }] : []),
    ...secondaryTabs,
  ];

  const allTabs = [...primaryTabs, ...secondaryTabs];
  const isAdmin = profile && (profile.role === 'admin' || profile.role === 'president' || profile.role === 'core_team');

  return (
    <div className="pt-24 md:pt-32 pb-24 md:pb-20 px-2 sm:px-4 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row gap-4 md:gap-8">
          
          {/* Sidebar (Desktop Only) */}
          <div className="hidden md:flex flex-col w-64 shrink-0 space-y-2">
            <div className="mb-8 px-4">
              <h2 className="text-xs font-black uppercase tracking-[0.2em] text-firefox-orange mb-1">Command Center</h2>
              <p className="text-sm font-bold text-white">Member Dashboard</p>
            </div>
            
            {allTabs.map((item) => {
              const isActive = location.pathname === item.path || (item.path !== '/dashboard' && location.pathname.startsWith(item.path));
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                    isActive 
                      ? 'bg-firefox-orange text-white shadow-lg shadow-firefox-orange/20' 
                      : 'text-zinc-400 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <item.icon size={18} />
                  <span className="text-[10px] font-black uppercase tracking-widest">{item.name}</span>
                </Link>
              );
            })}

            <div className="flex-1" />
            
            {isAdmin && (
              <Link 
                to="/admin"
                className="mt-8 flex items-center justify-center gap-2 px-6 py-3 min-h-[44px] rounded-xl bg-firefox-orange/10 border border-firefox-orange/20 hover:bg-firefox-orange hover:text-white transition-all group text-firefox-orange"
              >
                <Shield size={16} className="group-hover:text-white transition-colors" />
                <span className="text-[10px] font-black uppercase tracking-widest group-hover:text-white transition-colors">Admin Portal</span>
              </Link>
            )}



            <Link 
              to={`/profile/${profile?.username}`}
              className="mt-2 flex items-center justify-center gap-2 px-6 py-3 min-h-[44px] rounded-xl bg-white/5 border border-white/10 hover:border-firefox-orange transition-all group"
            >
              <Share2 size={16} className="text-zinc-500 group-hover:text-firefox-orange" />
              <span className="text-[10px] font-black uppercase tracking-widest text-white">Public Profile</span>
            </Link>

            <button 
              onClick={logout}
              className="mt-2 flex items-center justify-center gap-2 px-6 py-3 min-h-[44px] rounded-xl bg-red-500/10 border border-red-500/20 hover:bg-red-500 hover:text-white transition-all group text-red-500"
            >
              <LogOut size={16} />
              <span className="text-[10px] font-black uppercase tracking-widest">Logout</span>
            </button>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 bg-zinc-900/40 border border-white/5 rounded-3xl md:rounded-[2.5rem] p-4 sm:p-6 md:p-8 backdrop-blur-xl relative overflow-hidden min-h-[600px]">
            <div className="absolute top-0 right-0 w-96 h-96 bg-firefox-orange/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
            <Outlet context={{ profile, setProfile, refreshProfile: fetchData }} />
          </div>
          
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-[#080808]/90 backdrop-blur-xl border-t border-white/5 z-50 px-2 pb-safe pt-2">
        <div className="flex items-center justify-around relative">
          {mobilePrimaryTabs.map((item) => {
            const isActive = location.pathname === item.path || (item.path !== '/dashboard' && location.pathname.startsWith(item.path));
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center justify-center p-2 rounded-xl transition-colors min-w-[64px] ${
                  isActive && !isMoreOpen ? 'text-firefox-orange' : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                <item.icon size={20} className="mb-1" />
                <span className="text-[9px] font-bold uppercase tracking-wider truncate w-full text-center">{item.name}</span>
              </Link>
            );
          })}
          
          <button
            onClick={() => setIsMoreOpen(!isMoreOpen)}
            className={`flex flex-col items-center justify-center p-2 rounded-xl transition-colors min-w-[64px] ${
              isMoreOpen || mobileSecondaryTabs.some(t => location.pathname.startsWith(t.path)) 
                ? 'text-firefox-orange' : 'text-zinc-500'
            }`}
          >
            {isMoreOpen ? <X size={20} className="mb-1" /> : <MoreHorizontal size={20} className="mb-1" />}
            <span className="text-[9px] font-bold uppercase tracking-wider">More</span>
          </button>
        </div>

        {/* Mobile More Drawer */}
        <AnimatePresence>
          {isMoreOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="absolute bottom-full left-0 right-0 bg-[#121212] border-t border-white/10 overflow-hidden rounded-t-3xl"
            >
              <div className="p-4 space-y-2 pb-6">
                <div className="w-12 h-1.5 bg-white/10 rounded-full mx-auto mb-6" />
                
                {mobileSecondaryTabs.map((item) => {
                  const isActive = location.pathname.startsWith(item.path);
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                        isActive 
                          ? 'bg-firefox-orange text-white shadow-lg shadow-firefox-orange/20' 
                          : 'text-zinc-400 hover:bg-white/5 hover:text-white'
                      }`}
                    >
                      <item.icon size={18} />
                      <span className="text-[10px] font-black uppercase tracking-widest">{item.name}</span>
                    </Link>
                  );
                })}

                <div className="h-px bg-white/10 my-4" />

                {isAdmin && (
                  <Link 
                    to="/admin"
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-firefox-orange hover:bg-firefox-orange/10 transition-all font-bold"
                  >
                    <Shield size={18} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Admin Portal</span>
                  </Link>
                )}



                <Link 
                  to={`/profile/${profile?.username}`}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-zinc-400 hover:bg-white/5 transition-all"
                >
                  <Share2 size={18} />
                  <span className="text-[10px] font-black uppercase tracking-widest">Public Profile</span>
                </Link>

                <button 
                  onClick={logout}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-500/10 transition-all font-bold"
                >
                  <LogOut size={18} />
                  <span className="text-[10px] font-black uppercase tracking-widest">Logout</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default DashboardLayout;
