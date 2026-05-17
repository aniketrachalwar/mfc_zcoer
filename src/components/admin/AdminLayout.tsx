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
  Star
} from 'lucide-react';
import { motion } from 'motion/react';

const AdminLayout = () => {
  const { user, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

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
    { name: 'Team', path: '/admin/team', icon: Star },
    { name: 'Contributions', path: '/admin/contributions', icon: Award },
    { name: 'Events', path: '/admin/events', icon: Calendar },
    { name: 'Projects', path: '/admin/projects', icon: Briefcase },
    { name: 'Merchandise', path: '/admin/merch', icon: ShoppingBag },
    { name: 'Notifications', path: '/admin/notifications', icon: Bell },
  ];

  const visibleNavItems = navItems.filter(item => {
    if ((item.name === 'Members' || item.name === 'Team') && !isStrictAdmin) return false;
    return true;
  });

  return (
    <div className="pt-32 pb-20 px-4 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row gap-8">
          
          {/* Admin Sidebar */}
          <div className="w-full md:w-64 shrink-0 space-y-2">
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
          <div className="flex-1 bg-zinc-900/40 border border-white/5 rounded-[2.5rem] p-8 backdrop-blur-xl relative overflow-hidden min-h-[600px]">
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
    </div>
  );
};

export default AdminLayout;
