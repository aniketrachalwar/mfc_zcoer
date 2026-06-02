import { MonitorPlay, Users, Code, GitBranch, HelpCircle, Tag } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useEvents } from '../lib/useEvents';

const CATEGORY_STYLES: Record<string, any> = {
  'Workshop': { icon: MonitorPlay, color: 'text-blue-400', bg: 'bg-blue-400/10 border-blue-400/20 group-hover:border-blue-400/40' },
  'Meetup': { icon: Users, color: 'text-green-400', bg: 'bg-green-400/10 border-green-400/20 group-hover:border-green-400/40' },
  'Hackathon': { icon: Code, color: 'text-purple-400', bg: 'bg-purple-400/10 border-purple-400/20 group-hover:border-purple-400/40' },
  'Open Source': { icon: GitBranch, color: 'text-firefox-orange', bg: 'bg-firefox-orange/10 border-firefox-orange/20 group-hover:border-firefox-orange/40' },
  'Guest Lecture': { icon: HelpCircle, color: 'text-yellow-400', bg: 'bg-yellow-400/10 border-yellow-400/20 group-hover:border-yellow-400/40' },
  'Default': { icon: Tag, color: 'text-zinc-400', bg: 'bg-zinc-400/10 border-zinc-400/20 group-hover:border-zinc-400/40' }
};

const DEFAULT_CATEGORIES = [
  { title: 'Workshops', type: 'Workshop', desc: 'Hands-on tech sessions' },
  { title: 'Meetups', type: 'Meetup', desc: 'Network & grow' },
  { title: 'Hackathons', type: 'Hackathon', desc: 'Build & compete' },
  { title: 'Open Source', type: 'Open Source', desc: 'Contribute & collaborate' }
];

const HomeCategories = () => {
  const { events } = useEvents();
  
  // Extract unique types from upcoming events
  const uniqueTypes = Array.from(new Set(events.filter(e => e.type).map(e => e.type)));
  
  // If we have event types, build dynamic categories (max 4)
  const displayCategories = uniqueTypes.length > 0 
    ? uniqueTypes.slice(0, 4).map(type => ({
        title: type as string,
        type: type as string,
        desc: `Explore ${type} events`
      }))
    : DEFAULT_CATEGORIES;

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
            {displayCategories.map((cat, i) => {
              const style = CATEGORY_STYLES[cat.type] || CATEGORY_STYLES['Default'];
              const Icon = style.icon;
              
              return (
                <Link to={`/events?category=${encodeURIComponent(cat.type)}`} key={i} className={`rounded-2xl p-6 transition-all group ${style.bg} backdrop-blur-sm relative overflow-hidden`}>
                   <div className="absolute right-0 top-0 w-32 h-32 bg-white/5 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110" />
                   <Icon size={32} className={`${style.color} mb-4 relative z-10 group-hover:scale-110 transition-transform`} />
                   <h3 className="text-lg font-black uppercase tracking-wider text-white mb-2 relative z-10">{cat.title}</h3>
                   <p className="text-zinc-400 text-sm relative z-10">{cat.desc}</p>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeCategories;
