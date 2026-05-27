import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Sparkles, ArrowRight, Target, Calendar, Rocket, Bell, Shield } from 'lucide-react';
import { useOutletContext, Link } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import ProposeWorkshopModal from './ProposeWorkshopModal';
import DashboardTour from './DashboardTour';

export default function DashboardOverview() {
  const { profile } = useOutletContext<{ profile: any }>();
  const [config, setConfig] = useState<any>(null);
  const [memberConfig, setMemberConfig] = useState<any>(null);
  const [isProposeModalOpen, setIsProposeModalOpen] = useState(false);
  
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const docRef = doc(db, 'config', 'dashboardSettings');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setConfig(docSnap.data());
        }

        const memberDocRef = doc(db, 'config', 'membersDashboard');
        const memberDocSnap = await getDoc(memberDocRef);
        if (memberDocSnap.exists()) {
          setMemberConfig(memberDocSnap.data());
        }
      } catch (err) {
        console.error('Error fetching dashboard config:', err);
      }
    };
    fetchConfig();
  }, []);

  // Calculate profile completion percentage
  const calculateProgress = () => {
    let completed = 0;
    const totalFields = 6;
    if (profile?.fullName) completed++;
    if (profile?.username) completed++;
    if (profile?.bio) completed++;
    if (profile?.department) completed++;
    if (profile?.year) completed++;
    if (profile?.githubProfile) completed++;
    return Math.round((completed / totalFields) * 100);
  };

  const progress = calculateProgress();

  const widgets = config?.widgets || [
    { id: 'stats', enabled: true },
    { id: 'recent_events', enabled: true }
  ];

  const renderWidget = (id: string) => {
    switch (id) {
      case 'stats':
        return (
          <div key="stats" className="bg-zinc-900 border border-white/10 rounded-3xl p-6 flex flex-col justify-between group hover:border-firefox-orange/30 transition-colors h-full">
            <div>
              <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-firefox-orange mb-4">
                <Target size={20} />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Profile Setup</h3>
              <p className="text-zinc-400 text-sm mb-6">Complete your profile to unlock all community features and appear on the leaderboard.</p>
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Progress</span>
                <span className="text-[10px] font-black uppercase tracking-widest text-firefox-orange">{progress}%</span>
              </div>
              <div className="w-full h-2 bg-black/50 rounded-full overflow-hidden border border-white/5">
                <div 
                  className="h-full bg-firefox-orange rounded-full transition-all duration-1000"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>
        );

      case 'recent_events':
        return (
          <div key="recent_events" className="bg-zinc-900 border border-white/10 rounded-3xl p-6 md:col-span-2 lg:col-span-1 group hover:border-firefox-orange/30 transition-colors h-full">
            <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-firefox-orange mb-4">
              <Calendar size={20} />
            </div>
            <h3 className="text-lg font-bold text-white mb-4">Upcoming</h3>
            
            <div className="flex flex-col items-center justify-center h-40 text-center border-2 border-dashed border-white/5 rounded-2xl bg-black/20">
              <p className="text-sm font-medium text-zinc-500 mb-2">Check the events page for the latest updates.</p>
              <Link to="/events" className="text-xs font-black uppercase tracking-widest text-firefox-orange hover:text-white transition-colors">
                View Events
              </Link>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const activeAnnouncements = config?.announcements?.filter((a: any) => a.active) || [];

  return (
    <div className="space-y-8">
      <DashboardTour />
      {/* Welcome Banner */}
      <div className="bg-gradient-to-br from-firefox-orange/10 to-transparent border border-firefox-orange/20 rounded-3xl p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-firefox-orange/10 blur-[80px] rounded-full pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h2 className="text-3xl font-display font-black text-white uppercase tracking-tight mb-2">
              Welcome back, <span className="text-firefox-orange">{profile?.fullName?.split(' ')[0] || 'Builder'}</span>
            </h2>
            <p className="text-zinc-400 font-medium">Your hub for community access, resources, and events.</p>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex items-center gap-4 bg-black/40 px-6 py-4 rounded-2xl border border-white/5">
              <Shield className="text-firefox-orange" size={24} />
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-zinc-500">Current Tier</p>
                <p className={`text-2xl font-display font-black capitalize ${profile?.membershipTier === 'platinum' ? 'text-yellow-500' : profile?.membershipTier === 'silver' ? 'text-zinc-300' : 'text-white'}`}>
                  {profile?.membershipTier || 'Free'}
                </p>
              </div>
            </div>
            {!profile?.isLeadership && (
              <div className="flex items-center gap-4 bg-black/40 px-6 py-4 rounded-2xl border border-white/5">
                <Sparkles className="text-yellow-500" size={24} />
                <div>
                  <p className="text-xs font-black uppercase tracking-widest text-zinc-500">Total Points</p>
                  <p className="text-2xl font-display font-black text-white">{profile?.points || 0}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Dynamic Next Actions */}
      {(memberConfig?.nextActions || [
        { id: '1', title: 'Browse Events', link: '/events', enabled: true },
        { id: '2', title: 'Explore Projects', link: '/projects', enabled: true }
      ]).filter((a: any) => a.enabled).length > 0 && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          <div className="col-span-full">
            <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
              <Rocket size={20} className="text-firefox-orange" /> Next Actions
            </h3>
            <p className="text-sm text-zinc-400 mb-4">Recommended steps for you to take right now.</p>
          </div>
          {(memberConfig?.nextActions || [
            { id: '1', title: 'Browse Events', link: '/events', enabled: true },
            { id: '2', title: 'Explore Projects', link: '/projects', enabled: true }
          ]).filter((a: any) => a.enabled).map((action: any) => {
            const isExternal = action.link.startsWith('http');
            const linkClasses = "flex items-center justify-between p-5 rounded-2xl bg-zinc-900 border border-white/10 hover:border-firefox-orange/50 hover:bg-white/5 transition-all group";
            const innerContent = (
              <>
                <span className="text-sm font-bold text-white group-hover:text-firefox-orange transition-colors">{action.title}</span>
                <ArrowRight size={16} className="text-zinc-500 group-hover:text-firefox-orange group-hover:translate-x-1 transition-all" />
              </>
            );

            return isExternal ? (
              <a 
                key={action.id} 
                href={action.link} 
                target="_blank" 
                rel="noopener noreferrer"
                className={linkClasses}
              >
                {innerContent}
              </a>
            ) : (
              <Link 
                key={action.id} 
                to={action.link} 
                className={linkClasses}
              >
                {innerContent}
              </Link>
            );
          })}
        </div>
      )}

      {activeAnnouncements.length > 0 && (
        <div className="space-y-3">
          {activeAnnouncements.map((ann: any) => (
            <div key={ann.id} className="bg-firefox-orange/10 border border-firefox-orange/30 p-4 rounded-2xl flex items-start gap-4">
              <Bell className="text-firefox-orange shrink-0 mt-0.5" size={18} />
              <p className="text-sm font-medium text-white">{ann.text}</p>
            </div>
          ))}
        </div>
      )}

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {widgets.filter((w: any) => w.enabled && w.id !== 'quick_actions').sort((a: any, b: any) => (a.order || 0) - (b.order || 0)).map((w: any) => renderWidget(w.id))}
      </div>

      {/* Propose Workshop Banner - Moved to bottom */}
      <button 
        onClick={() => setIsProposeModalOpen(true)}
        className="w-full bg-zinc-900 border border-white/10 hover:border-firefox-orange/30 rounded-3xl p-6 flex items-center justify-between group transition-all mt-8"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-firefox-orange/10 rounded-xl flex items-center justify-center text-firefox-orange group-hover:scale-110 transition-transform">
            <Rocket size={24} />
          </div>
          <div className="text-left">
            <h3 className="text-lg font-bold text-white mb-1 group-hover:text-firefox-orange transition-colors">Propose a Workshop</h3>
            <p className="text-sm text-zinc-400">Share your expertise! Propose an event or workshop and co-host it with the community.</p>
          </div>
        </div>
        <ArrowRight className="text-zinc-500 group-hover:text-firefox-orange group-hover:translate-x-1 transition-all" />
      </button>

      <ProposeWorkshopModal 
        isOpen={isProposeModalOpen} 
        onClose={() => setIsProposeModalOpen(false)} 
        profile={profile} 
      />
    </div>
  );
}
