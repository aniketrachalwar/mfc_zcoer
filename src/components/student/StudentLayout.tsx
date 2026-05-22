import React, { useEffect, useState } from 'react';
import { Navigate, Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../lib/AuthContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { 
  LayoutDashboard, 
  Code, 
  ShoppingBag, 
  Shield, 
  MoreHorizontal, 
  X,
  GraduationCap
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const StudentLayout = () => {
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

  const navItems = [
    { name: 'Overview', path: '/student', icon: LayoutDashboard },
    { name: 'Projects', path: '/student/projects', icon: Code },
    { name: 'Purchases', path: '/student/purchases', icon: ShoppingBag },
    { name: 'Membership', path: '/student/membership', icon: Shield },
  ];

  // We only have 4 tabs, so they can all be primary tabs on mobile
  const primaryTabs = navItems;

  return (
    <div className="pt-24 md:pt-32 pb-24 md:pb-20 px-2 sm:px-4 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row gap-4 md:gap-8">
          
          {/* Sidebar (Desktop Only) */}
          <div className="hidden md:flex flex-col w-64 shrink-0 space-y-2">
            <div className="mb-8 px-4">
              <h2 className="text-xs font-black uppercase tracking-[0.2em] text-firefox-orange mb-1">Community Track</h2>
              <p className="text-sm font-bold text-white">Student Portal</p>
            </div>
            
            {navItems.map((item) => {
              const isActive = location.pathname === item.path || (item.path !== '/student' && location.pathname.startsWith(item.path));
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
            
            <Link 
              to={`/profile/${profile?.username}`}
              className="mt-8 flex items-center justify-center gap-2 px-6 py-3 min-h-[44px] rounded-xl bg-white/5 border border-white/10 hover:border-firefox-orange transition-all group"
            >
              <GraduationCap size={16} className="text-zinc-500 group-hover:text-firefox-orange" />
              <span className="text-[10px] font-black uppercase tracking-widest text-white">Public Profile</span>
            </Link>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 bg-zinc-900/40 border border-white/5 rounded-3xl md:rounded-[2.5rem] p-4 sm:p-6 md:p-8 backdrop-blur-xl relative overflow-hidden min-h-[600px]">
            <div className="absolute top-0 right-0 w-96 h-96 bg-firefox-orange/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
            <Outlet context={{ profile }} />
          </div>
          
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-[#080808]/90 backdrop-blur-xl border-t border-white/5 z-50 px-2 pb-safe pt-2">
        <div className="flex items-center justify-around">
          {primaryTabs.map((item) => {
            const isActive = location.pathname === item.path || (item.path !== '/student' && location.pathname.startsWith(item.path));
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center justify-center p-2 rounded-xl transition-colors min-w-[64px] ${
                  isActive ? 'text-firefox-orange' : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                <item.icon size={20} className="mb-1" />
                <span className="text-[9px] font-bold uppercase tracking-wider truncate w-full text-center">{item.name}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default StudentLayout;
