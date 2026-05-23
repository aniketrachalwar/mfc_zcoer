import React, { useEffect, useState } from 'react';
import { Navigate, Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../lib/AuthContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { 
  LayoutDashboard, 
  Users, 
  Award, 
  Calendar, 
  Briefcase, 
  ShoppingBag, 
  Bell, 
  LogOut,
  ShieldAlert,
  Star,
  FileText,
  Settings as SettingsIcon,
  CheckSquare,
  MonitorSmartphone,
  Globe,
  Ticket,
  MoreHorizontal,
  X,
  Plus,
  Lightbulb
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const AdminLayout = () => {
  const { user, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const [isMoreOpen, setIsMoreOpen] = useState(false);

  // Handle drawer close on route change
  useEffect(() => {
    setIsMoreOpen(false);
  }, [location.pathname]);

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

  if (authLoading || loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-firefox-orange border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!user) return <Navigate to="/" />;

  const isAdmin = profile?.role === 'admin' || profile?.role === 'president' || profile?.role === 'core_team';
  const isStrictAdmin = profile?.role === 'admin';

  if (!isAdmin) return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
      <ShieldAlert size={64} className="text-red-500 mb-6" />
      <h1 className="text-4xl font-display font-black uppercase text-white mb-4">Access Denied</h1>
      <p className="text-zinc-400 max-w-md mb-8">You do not have the required permissions to view this page.</p>
      <Link to="/" className="px-8 py-3 bg-firefox-orange text-white rounded-full font-display font-black text-[10px] uppercase tracking-widest">
        Return Home
      </Link>
    </div>
  );

  const navItems = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { name: 'Members', path: '/admin/members', icon: Users },
    { name: 'Applications', path: '/admin/applications', icon: CheckSquare },
    { name: 'Team', path: '/admin/team', icon: Star },
    { name: 'Contributions', path: '/admin/contributions', icon: Award },
    { name: 'Events', path: '/admin/events', icon: Calendar },
    { name: 'Projects', path: '/admin/projects', icon: Briefcase },
    { name: 'Blogs', path: '/admin/blogs', icon: FileText },
    { name: 'Merchandise', path: '/admin/merch', icon: ShoppingBag },
    { name: 'Notifications', path: '/admin/notifications', icon: Bell },
    { name: 'About Page', path: '/admin/about', icon: Globe },
    { name: 'Members Dashboard', path: '/admin/members-dashboard', icon: LayoutDashboard },
    { name: 'Workshop Proposals', path: '/admin/proposals', icon: Lightbulb },
    { name: 'Coupons', path: '/admin/coupons', icon: Ticket },
    { name: 'Settings', path: '/admin/settings', icon: SettingsIcon },
  ];

  const visibleNavItems = navItems.filter(item => {
    if ((item.name === 'Members' || item.name === 'Team' || item.name === 'Applications' || item.name === 'Settings' || item.name === 'About Page' || item.name === 'Coupons') && !isStrictAdmin) return false;
    return true;
  });

  const primaryTabs = visibleNavItems.filter(item => ['Dashboard', 'Members', 'Events', 'Applications'].includes(item.name));
  const secondaryTabs = visibleNavItems.filter(item => !['Dashboard', 'Members', 'Events', 'Applications'].includes(item.name));


  return (
    <div className="pt-24 md:pt-32 pb-24 md:pb-20 px-2 sm:px-4 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row gap-4 md:gap-8">
          
          {/* Admin Sidebar (Desktop Only) */}
          <div className="hidden md:block w-64 shrink-0 space-y-2">
            <div className="mb-8 px-4">
              <h2 className="text-xs font-black uppercase tracking-[0.2em] text-firefox-orange mb-1">Command Center</h2>
              <p className="text-sm font-bold text-white">Admin Portal</p>
            </div>
            
            {visibleNavItems.map((item) => {
              const isActive = location.pathname === item.path || (location.pathname.startsWith(item.path) && item.path !== '/admin');
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
          </div>

          {/* Main Content Area */}
          <div className="flex-1 bg-zinc-900/40 border border-white/5 rounded-3xl md:rounded-[2.5rem] p-4 sm:p-6 md:p-8 backdrop-blur-xl relative overflow-hidden min-h-[600px]">
            <div className="absolute top-0 right-0 w-96 h-96 bg-firefox-orange/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
            {(location.pathname === '/admin/members' || location.pathname === '/admin/team') && !isStrictAdmin ? (
              <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center">
                <ShieldAlert size={48} className="text-red-500 mb-4" />
                <h2 className="text-2xl font-display font-black uppercase text-white mb-2">Access Restricted</h2>
                <p className="text-zinc-400">Only administrators can manage this section.</p>
              </div>
            ) : (
              <Outlet />
            )}
          </div>
          
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-[#080808]/90 backdrop-blur-xl border-t border-white/5 z-50 px-2 pb-safe pt-2">
        <div className="flex items-center justify-around">
          {primaryTabs.map((item) => {
            const isActive = location.pathname === item.path || (location.pathname.startsWith(item.path) && item.path !== '/admin');
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center justify-center p-2 rounded-xl transition-colors min-w-[64px] ${
                  isActive ? 'text-firefox-orange' : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                <item.icon size={20} className="mb-1" />
                <span className="text-[9px] font-bold uppercase tracking-wider truncate w-full text-center">{item.name === 'Applications' ? 'Apps' : item.name}</span>
              </Link>
            );
          })}
          
          {/* More Button */}
          <button
            onClick={() => setIsMoreOpen(true)}
            className={`flex flex-col items-center justify-center p-2 rounded-xl transition-colors min-w-[64px] ${
              isMoreOpen ? 'text-firefox-orange' : 'text-zinc-500'
            }`}
          >
            <MoreHorizontal size={20} className="mb-1" />
            <span className="text-[9px] font-bold uppercase tracking-wider">More</span>
          </button>
        </div>
      </div>

      {/* Mobile "More" Drawer */}
      <AnimatePresence>
        {isMoreOpen && (
          <motion.div
            key="drawer-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMoreOpen(false)}
            className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
          />
        )}
        {isMoreOpen && (
          <motion.div
            key="drawer-content"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="md:hidden fixed bottom-0 left-0 right-0 bg-zinc-950 border-t border-white/10 z-[70] rounded-t-3xl max-h-[85vh] flex flex-col"
          >
            <div className="flex items-center justify-between p-6 border-b border-white/5">
              <h2 className="text-sm font-black uppercase tracking-widest text-white">More Tools</h2>
              <button onClick={() => setIsMoreOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-white/5 text-zinc-400 hover:text-white transition-colors">
                <X size={18} />
              </button>
            </div>
            <div className="p-4 overflow-y-auto grid grid-cols-2 gap-3 pb-24">
              {secondaryTabs.map((item) => {
                const isActive = location.pathname === item.path || (location.pathname.startsWith(item.path) && item.path !== '/admin');
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsMoreOpen(false)}
                    className={`flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all ${
                      isActive 
                        ? 'bg-firefox-orange/10 border-firefox-orange/30 text-firefox-orange' 
                        : 'bg-white/5 border-white/5 text-zinc-400 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <item.icon size={24} />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-center">{item.name}</span>
                  </Link>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminLayout;
