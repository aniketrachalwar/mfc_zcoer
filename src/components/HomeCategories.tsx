import { MonitorPlay, Users, Code, HelpCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const HomeCategories = () => {
  return (
    <div className="bg-zinc-950 pb-24 relative">
      <div className="max-w-7xl mx-auto px-4 relative z-10">
        <div className="text-center">
          <div className="inline-flex items-center gap-3 px-4 py-2 bg-firefox-orange/10 border border-firefox-orange/20 rounded-full text-firefox-orange text-[10px] font-black uppercase tracking-[0.2em] mb-6">
            <MonitorPlay size={14} />
            Ecosystem
          </div>
          <h2 className="text-3xl md:text-5xl font-display font-black uppercase tracking-tighter mb-4 text-white">
            Explore <span className="text-firefox-orange">Categories</span>
          </h2>
          <p className="text-zinc-400 max-w-2xl mx-auto mb-12">
            The MFC Open Web ecosystem is built around engaging events designed to help you grow, network, and build.
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { icon: MonitorPlay, title: 'Workshops', desc: 'Hands-on tech sessions', color: 'text-blue-400', bg: 'bg-blue-400/10 border-blue-400/20 group-hover:border-blue-400/40' },
              { icon: Users, title: 'Meetups', desc: 'Network & grow', color: 'text-green-400', bg: 'bg-green-400/10 border-green-400/20 group-hover:border-green-400/40' },
              { icon: Code, title: 'Hackathons', desc: 'Build & compete', color: 'text-purple-400', bg: 'bg-purple-400/10 border-purple-400/20 group-hover:border-purple-400/40' },
              { icon: HelpCircle, title: 'Guest Lectures', desc: 'Industry insights', color: 'text-yellow-400', bg: 'bg-yellow-400/10 border-yellow-400/20 group-hover:border-yellow-400/40' }
            ].map((cat, i) => (
              <Link to="/events" key={i} className={`rounded-2xl p-6 transition-all group ${cat.bg} backdrop-blur-sm relative overflow-hidden`}>
                 <div className="absolute right-0 top-0 w-32 h-32 bg-white/5 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110" />
                 <cat.icon size={32} className={`${cat.color} mb-4 relative z-10 group-hover:scale-110 transition-transform`} />
                 <h3 className="text-lg font-black uppercase tracking-wider text-white mb-2 relative z-10">{cat.title}</h3>
                 <p className="text-zinc-400 text-sm relative z-10">{cat.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeCategories;
