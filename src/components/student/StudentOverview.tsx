import { Shield, Sparkles, Activity } from 'lucide-react';
import { useOutletContext } from 'react-router-dom';

export default function StudentOverview() {
  const { profile } = useOutletContext<{ profile: any }>();
  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-br from-firefox-orange/10 to-transparent border border-firefox-orange/20 rounded-3xl p-8 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h2 className="text-3xl font-display font-black text-white uppercase tracking-tight mb-2">
              Welcome back, <span className="text-firefox-orange">{profile?.fullName?.split(' ')[0] || 'Student'}</span>
            </h2>
            <p className="text-zinc-400 font-medium">Your hub for tracking community progress and activities.</p>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex items-center gap-4 bg-black/40 px-6 py-4 rounded-2xl border border-white/5">
              <Shield className="text-firefox-orange" size={24} />
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-zinc-500">Membership</p>
                <p className="text-2xl font-display font-black text-white capitalize">{profile?.membershipTier || 'Free'}</p>
              </div>
            </div>
            <div className="flex items-center gap-4 bg-black/40 px-6 py-4 rounded-2xl border border-white/5">
              <Sparkles className="text-yellow-500" size={24} />
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-zinc-500">Points Earned</p>
                <p className="text-2xl font-display font-black text-white">{profile?.points || 0}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-zinc-900 border border-white/10 rounded-3xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-firefox-orange">
            <Activity size={20} />
          </div>
          <h3 className="text-lg font-bold text-white">Recent Activity</h3>
        </div>
        <div className="text-center py-12 border-2 border-dashed border-white/5 rounded-2xl bg-black/20">
          <p className="text-sm font-medium text-zinc-500">No recent activity to show right now.</p>
        </div>
      </div>
    </div>
  );
}
