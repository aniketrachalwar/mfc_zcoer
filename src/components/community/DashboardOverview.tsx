import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Sparkles, ArrowRight, Target, Calendar, Rocket, Bell, Shield } from 'lucide-react';
import { useOutletContext, Link } from 'react-router-dom';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../lib/AuthContext';
import ProposeWorkshopModal from './ProposeWorkshopModal';
import DashboardTour from './DashboardTour';

export default function DashboardOverview() {
  const { profile } = useOutletContext<{ profile: any }>();
  const [config, setConfig] = useState<any>(null);
  const [memberConfig, setMemberConfig] = useState<any>(null);
  const [isProposeModalOpen, setIsProposeModalOpen] = useState(false);
  const { user } = useAuth();
  const [myEvents, setMyEvents] = useState<any[]>([]);
  
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

  useEffect(() => {
    if (!user) return;
    const fetchMyEvents = async () => {
      try {
        const q = query(collection(db, 'tickets'), where('userId', '==', user.uid), where('cancelled', '==', false));
        const snap = await getDocs(q);
        
        const eventsData = await Promise.all(snap.docs.map(async (tDoc) => {
          const tData = tDoc.data();
          const eSnap = await getDoc(doc(db, 'events', tData.eventId));
          if (eSnap.exists()) {
            return { id: tDoc.id, ...tData, eventDetails: eSnap.data() };
          }
          return null;
        }));
        
        setMyEvents(eventsData.filter(Boolean));
      } catch (err) {
        console.error("Error fetching my events:", err);
      }
    };
    fetchMyEvents();
  }, [user]);

  const widgets = config?.widgets || [
    { id: 'recent_events', enabled: true }
  ];

  const renderWidget = (id: string) => {
    if (id === 'recent_events') {
      return (
        <div key="recent_events" className="bg-zinc-900 border border-white/10 rounded-3xl p-6 md:col-span-3 lg:col-span-3 group hover:border-firefox-orange/30 transition-colors">
          <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-firefox-orange mb-4">
            <Calendar size={20} />
          </div>
          <h3 className="text-lg font-bold text-white mb-4">My Events</h3>
          
          {myEvents.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center border-2 border-dashed border-white/5 rounded-2xl bg-black/20">
              <p className="text-sm font-medium text-zinc-500 mb-2">You haven't attended or registered for any events yet.</p>
              <Link to="/events" className="text-xs font-black uppercase tracking-widest text-firefox-orange hover:text-white transition-colors">
                Browse Events
              </Link>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {myEvents.map((evt) => {
                const isUpcoming = evt.eventDetails.date && new Date(evt.eventDetails.date) > new Date();
                let statusText = 'Registered';
                let statusClass = 'bg-yellow-500/20 text-yellow-400';
                
                if (isUpcoming) {
                  statusText = 'Reserved Spot';
                  statusClass = 'bg-blue-500/20 text-blue-400';
                } else if (evt.verified) {
                  statusText = 'Attended';
                  statusClass = 'bg-green-500/20 text-green-400';
                } else {
                  statusText = 'Missed';
                  statusClass = 'bg-red-500/20 text-red-400';
                }

                return (
                  <Link key={evt.id} to={`/event/${evt.eventId}`} className="bg-black/40 border border-white/5 p-4 rounded-2xl flex flex-col justify-between group hover:border-firefox-orange/50 transition-colors">
                    <div>
                      <h4 className="font-bold text-white mb-1 line-clamp-1 group-hover:text-firefox-orange transition-colors">{evt.eventDetails.title}</h4>
                      <p className="text-xs text-zinc-400 mb-2">
                        {evt.eventDetails.date ? new Date(evt.eventDetails.date).toLocaleDateString() : 'TBA'}
                      </p>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-md ${statusClass}`}>
                        {statusText}
                      </span>
                      <ArrowRight size={14} className="text-zinc-500 group-hover:text-firefox-orange group-hover:translate-x-1 transition-all" />
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      );
    }
    return null;
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
