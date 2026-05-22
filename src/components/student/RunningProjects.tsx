import { Code, ArrowRight } from 'lucide-react';
import { Link, useOutletContext } from 'react-router-dom';

export default function RunningProjects() {
  const { profile } = useOutletContext<{ profile: any }>();
  // In a real scenario, we'd fetch this from the database using profile.id
  // Currently showing empty state for future implementation
  const projects: any[] = [];

  return (
    <div className="space-y-8">
      <div className="mb-8 text-left">
        <h2 className="text-3xl font-display font-black uppercase text-white mb-2">Running <span className="text-firefox-orange">Projects</span></h2>
        <p className="text-zinc-500 font-medium">Track the open-source and community projects you are actively contributing to.</p>
      </div>

      {projects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {projects.map(project => (
            <div key={project.id} className="bg-zinc-900 border border-white/10 rounded-3xl p-6 hover:border-firefox-orange/30 transition-colors">
              <div className="flex justify-between items-start mb-4">
                <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-firefox-orange">
                  <Code size={20} />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 bg-white/5 px-3 py-1 rounded-full">
                  {project.status}
                </span>
              </div>
              <h3 className="text-lg font-bold text-white mb-1">{project.name}</h3>
              <p className="text-sm font-medium text-zinc-500 mb-6">Role: {project.role}</p>
              
              <Link to="/projects" className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-firefox-orange hover:text-white transition-colors group">
                View Details <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 border border-white/10 rounded-3xl bg-white/5">
          <p className="text-zinc-500 mb-4">You are not part of any running projects currently. Stay tuned for new opportunities!</p>
          <Link to="/projects" className="px-6 py-3 bg-firefox-orange text-white rounded-full font-display font-black text-[10px] uppercase tracking-widest inline-block hover:bg-orange-600 transition-colors">
            Browse Projects
          </Link>
        </div>
      )}
    </div>
  );
}
