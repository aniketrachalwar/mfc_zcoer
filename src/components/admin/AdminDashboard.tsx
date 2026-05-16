import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Users, UserCheck, Calendar, Briefcase, FileCheck, Activity } from 'lucide-react';

const StatCard = ({ title, value, icon: Icon, color }: any) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-white/5 border border-white/10 rounded-2xl p-6 flex items-start justify-between"
  >
    <div>
      <p className="text-zinc-400 text-[10px] font-black uppercase tracking-widest mb-1">{title}</p>
      <p className="text-3xl font-display font-black text-white">{value}</p>
    </div>
    <div className={`p-3 rounded-xl ${color}`}>
      <Icon size={20} />
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const usersSnap = await getDocs(collection(db, 'users'));
        const totalMembers = usersSnap.size;
        
        // This is a simplified fetch, you can expand it with actual queries 
        // depending on your firestore data structure.
        
        setStats({
          totalMembers,
          activeMembers: Math.floor(totalMembers * 0.8), // Placeholder logic
          totalProjects: 5, // Placeholder
          upcomingEvents: 2, // Placeholder
          pendingApprovals: 3, // Placeholder
          recentActivity: 12 // Placeholder
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
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-display font-black uppercase text-white mb-2">
          System <span className="text-firefox-orange">Overview</span>
        </h1>
        <p className="text-zinc-400 text-sm">Real-time metrics for MFC ZCOER platform.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        <StatCard 
          title="Total Members" 
          value={stats.totalMembers} 
          icon={Users} 
          color="bg-blue-500/10 text-blue-500" 
        />
        <StatCard 
          title="Active Members" 
          value={stats.activeMembers} 
          icon={UserCheck} 
          color="bg-green-500/10 text-green-500" 
        />
        <StatCard 
          title="Pending Approvals" 
          value={stats.pendingApprovals} 
          icon={FileCheck} 
          color="bg-yellow-500/10 text-yellow-500" 
        />
        <StatCard 
          title="Total Projects" 
          value={stats.totalProjects} 
          icon={Briefcase} 
          color="bg-purple-500/10 text-purple-500" 
        />
        <StatCard 
          title="Upcoming Events" 
          value={stats.upcomingEvents} 
          icon={Calendar} 
          color="bg-pink-500/10 text-pink-500" 
        />
        <StatCard 
          title="Recent Activity" 
          value={stats.recentActivity} 
          icon={Activity} 
          color="bg-firefox-orange/10 text-firefox-orange" 
        />
      </div>

      {/* Quick Actions or Recent Activity List could go here */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
        <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Recent System Activity</h2>
        <div className="space-y-4">
          {[1, 2, 3].map((_, i) => (
            <div key={i} className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 transition-colors">
              <div className="w-2 h-2 rounded-full bg-firefox-orange" />
              <div className="flex-1">
                <p className="text-sm text-white">System update placeholder</p>
                <p className="text-xs text-zinc-500">2 hours ago</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
