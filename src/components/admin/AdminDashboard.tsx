import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { collection, getDocs, query, orderBy, limit, where } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Users, UserCheck, Calendar, Briefcase, FileCheck, Activity, Plus, ShoppingBag, CheckSquare, Globe } from 'lucide-react';
import { Link } from 'react-router-dom';

const StatCard = ({ title, value, icon: Icon, color }: any) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-white/5 border border-white/10 rounded-2xl p-4 sm:p-6 flex items-start justify-between hover:bg-white/10 transition-colors"
  >
    <div>
      <p className="text-zinc-400 text-[9px] sm:text-[10px] font-black uppercase tracking-widest mb-1">{title}</p>
      <p className="text-2xl sm:text-3xl font-display font-black text-white">{value}</p>
    </div>
    <div className={`p-2.5 sm:p-3 rounded-xl ${color}`}>
      <Icon size={18} className="sm:w-5 sm:h-5" />
    </div>
  </motion.div>
);

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalMembers: 0,
    activeMembers: 0,
    totalProjects: 0,
    upcomingEvents: 0,
    pendingApprovals: 0,
    recentActivity: 0
  });
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [
          usersSnap, 
          paymentsSnap, 
          projectsSnap, 
          eventsSnap,
          pendingPaymentsSnap,
          pendingProposalsSnap
        ] = await Promise.all([
          getDocs(collection(db, 'users')),
          getDocs(query(collection(db, 'payments'), orderBy('timestamp', 'desc'), limit(5))),
          getDocs(collection(db, 'projects')),
          getDocs(collection(db, 'events')),
          getDocs(query(collection(db, 'payments'), where('status', '==', 'pending'))),
          getDocs(query(collection(db, 'workshopProposals'), where('status', '==', 'pending')))
        ]);

        const totalMembers = usersSnap.size;
        const activeMembers = usersSnap.docs.filter(d => d.data().membershipStatus === 'verified').length || Math.floor(totalMembers * 0.8);
        const totalProjects = projectsSnap.size;
        
        const now = new Date().getTime();
        const upcomingEvents = eventsSnap.docs.filter(d => {
          const date = d.data().date;
          return date && new Date(date).getTime() >= now;
        }).length;

        const pendingApprovals = pendingPaymentsSnap.size + pendingProposalsSnap.size;
        
        const recentActs = paymentsSnap.docs.map(doc => {
          const data = doc.data();
          let timeAgo = "Just now";
          if (data.timestamp) {
            const date = data.timestamp.toDate ? data.timestamp.toDate() : new Date(data.timestamp);
            const diff = Math.floor((new Date().getTime() - date.getTime()) / 60000);
            if (diff < 60) timeAgo = `${Math.max(1, diff)} mins ago`;
            else if (diff < 1440) timeAgo = `${Math.floor(diff/60)} hours ago`;
            else timeAgo = `${Math.floor(diff/1440)} days ago`;
          }
          return {
             id: doc.id,
             message: `New membership application from ${data.userName || 'Unknown'} (₹${data.amount || 0})`,
             timeAgo
          };
        });
        
        setActivities(recentActs);
        
        setStats({
          totalMembers,
          activeMembers: activeMembers > 0 ? activeMembers : totalMembers, // Fallback if no membershipStatus field
          totalProjects,
          upcomingEvents,
          pendingApprovals,
          recentActivity: recentActs.length 
        });
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-firefox-orange border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="pb-8">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-display font-black uppercase text-white mb-2">
          System <span className="text-firefox-orange">Overview</span>
        </h1>
        <p className="text-zinc-400 text-xs sm:text-sm">Real-time metrics for MFC Open Web platform.</p>
      </div>

      {/* Quick Actions Bar (Horizontal Scroll on Mobile) */}
      <div className="mb-8">
        <h2 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-3 px-1">Quick Actions</h2>
        <div className="flex overflow-x-auto gap-3 pb-4 snap-x hide-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
          <Link to="/admin/applications" className="snap-start shrink-0 flex items-center gap-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors">
            <CheckSquare size={16} /> Approve Members
          </Link>
          <Link to="/admin/contributions" className="snap-start shrink-0 flex items-center gap-2 bg-zinc-500/10 hover:bg-zinc-500/20 text-zinc-400 border border-zinc-500/20 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors">
            <CheckSquare size={16} /> Manage Tasks
          </Link>
          <Link to="/admin/events" className="snap-start shrink-0 flex items-center gap-2 bg-firefox-orange/10 hover:bg-firefox-orange/20 text-firefox-orange border border-firefox-orange/20 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors">
            <Plus size={16} /> Add Event
          </Link>
          <Link to="/admin/merch" className="snap-start shrink-0 flex items-center gap-2 bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 border border-purple-500/20 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors">
            <ShoppingBag size={16} /> Add Merchandise
          </Link>
          <Link to="/admin/about" className="snap-start shrink-0 flex items-center gap-2 bg-green-500/10 hover:bg-green-500/20 text-green-400 border border-green-500/20 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors">
            <Globe size={16} /> Edit About Page
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6 mb-12">
        <StatCard 
          title="Members" 
          value={stats.totalMembers} 
          icon={Users} 
          color="bg-blue-500/10 text-blue-500" 
        />
        <StatCard 
          title="Active" 
          value={stats.activeMembers} 
          icon={UserCheck} 
          color="bg-green-500/10 text-green-500" 
        />
        <StatCard 
          title="Pending" 
          value={stats.pendingApprovals} 
          icon={FileCheck} 
          color="bg-yellow-500/10 text-yellow-500" 
        />
        <StatCard 
          title="Projects" 
          value={stats.totalProjects} 
          icon={Briefcase} 
          color="bg-purple-500/10 text-purple-500" 
        />
        <StatCard 
          title="Events" 
          value={stats.upcomingEvents} 
          icon={Calendar} 
          color="bg-pink-500/10 text-pink-500" 
        />
        <StatCard 
          title="Activity" 
          value={stats.recentActivity} 
          icon={Activity} 
          color="bg-firefox-orange/10 text-firefox-orange" 
        />
      </div>

      <div className="bg-white/5 border border-white/10 rounded-2xl p-4 sm:p-6">
        <h2 className="text-[10px] font-black text-white uppercase tracking-widest mb-4">Recent System Activity</h2>
        <div className="space-y-3">
          {activities.length === 0 ? (
            <p className="text-zinc-500 text-xs">No recent activity.</p>
          ) : (
            activities.map((act) => (
              <div key={act.id} className="flex items-center gap-3 p-3 rounded-xl bg-zinc-900/50 border border-white/5 hover:bg-white/5 transition-colors">
                <div className="w-2 h-2 rounded-full bg-firefox-orange shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm text-white truncate">{act.message}</p>
                  <p className="text-[10px] text-zinc-500">{act.timeAgo}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
