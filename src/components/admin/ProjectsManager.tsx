import React from 'react';
import { Briefcase, Plus } from 'lucide-react';

const ProjectsManager = () => {
  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-display font-black uppercase text-white mb-2">
            Project <span className="text-firefox-orange">Management</span>
          </h1>
          <p className="text-zinc-400 text-sm">Manage open source projects and contributors.</p>
        </div>
        <button className="flex items-center gap-2 px-6 py-3 bg-firefox-orange text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-orange-600 transition-colors">
          <Plus size={16} />
          Add Project
        </button>
      </div>
      
      <div className="bg-white/5 border border-white/10 rounded-2xl p-12 text-center flex flex-col items-center justify-center">
        <div className="w-16 h-16 bg-white/5 border border-white/10 rounded-full flex items-center justify-center mb-4 text-zinc-500">
          <Briefcase size={24} />
        </div>
        <h3 className="text-xl font-display font-bold text-white mb-2">No Projects Found</h3>
        <p className="text-zinc-400 text-sm max-w-md">There are currently no active projects. Start by adding a new open source project.</p>
      </div>
    </div>
  );
};

export default ProjectsManager;
