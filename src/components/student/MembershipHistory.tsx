import { Shield, CheckCircle, Clock } from 'lucide-react';
import { Link, useOutletContext } from 'react-router-dom';

export default function MembershipHistory() {
  const { profile } = useOutletContext<{ profile: any }>();
  const isPending = profile?.membershipStatus === 'pending';
  
  return (
    <div className="space-y-8">
      <div className="mb-8 text-left">
        <h2 className="text-3xl font-display font-black uppercase text-white mb-2">Membership <span className="text-firefox-orange">Status</span></h2>
        <p className="text-zinc-500 font-medium">Track your community membership journey and perks.</p>
      </div>

      <div className="bg-zinc-900 border border-white/10 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-center gap-8">
        <div className="w-24 h-24 rounded-full bg-black/40 border border-white/10 flex items-center justify-center shrink-0">
          <Shield size={48} className={profile?.membershipTier === 'platinum' ? 'text-yellow-500' : profile?.membershipTier === 'silver' ? 'text-zinc-300' : 'text-firefox-orange'} />
        </div>
        
        <div className="flex-1 text-center md:text-left">
          <h3 className="text-xl font-bold text-white mb-2">Current Tier: <span className="capitalize">{profile?.membershipTier || 'Free'}</span></h3>
          <p className="text-zinc-400 text-sm mb-4">
            {profile?.membershipTier === 'free' 
              ? 'You have basic access to community resources. Upgrade to unlock premium perks!' 
              : 'You are enjoying premium community perks. Keep contributing!'}
          </p>
          
          {profile?.membershipTier === 'free' && !isPending && (
            <Link to="/dashboard#membership" className="inline-block px-6 py-3 bg-firefox-orange text-white rounded-full font-display font-black text-[10px] uppercase tracking-widest">
              Upgrade Now
            </Link>
          )}
          
          {isPending && (
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-500/10 text-yellow-500 rounded-full border border-yellow-500/20 text-xs font-bold uppercase tracking-widest">
              <Clock size={14} /> Pending Verification
            </div>
          )}
        </div>
      </div>

      <div className="bg-zinc-900 border border-white/10 rounded-3xl p-6 md:p-8">
        <h3 className="text-lg font-bold text-white mb-6">Membership Timeline</h3>
        <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-white/10 before:to-transparent">
          
          <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
            <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white/10 bg-zinc-900 text-firefox-orange shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow">
              <CheckCircle size={16} />
            </div>
            <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white/5 border border-white/10 p-4 rounded-xl">
              <div className="flex items-center justify-between space-x-2 mb-1">
                <div className="font-bold text-white">Joined MFC Open Web</div>
                <time className="font-mono text-xs text-zinc-500">Date Joined</time>
              </div>
              <div className="text-zinc-400 text-sm">Account created and Free tier activated.</div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
