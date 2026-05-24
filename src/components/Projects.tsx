import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, ArrowUpRight, Briefcase, Github, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../lib/AuthContext';
import { Project } from '../types/project';
import AdSenseBlock from './AdSenseBlock';

const Projects = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProject, setActiveProject] = useState(0);
  const [loading, setLoading] = useState(true);
  const { userProfile } = useAuth();

  const canManageProjects = ['admin', 'president', 'core_team'].includes(userProfile?.role);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'projects'));
        const fetchedProjects = snapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() } as Project))
          .filter(project => project.status === 'active')
          .sort((a, b) => b.createdAt - a.createdAt);

        setProjects(fetchedProjects);
      } catch (err) {
        console.error('Failed to fetch projects:', err);
        setProjects([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  const active = useMemo(() => projects[activeProject] || projects[0], [projects, activeProject]);

  return (
    <main className="min-h-screen bg-zinc-950 text-white pt-32 pb-20 px-4 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="mb-10">
          <Link to="/" className="inline-flex items-center gap-2 text-zinc-500 hover:text-white transition-colors group">
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-[10px] font-black uppercase tracking-widest">Back to Home</span>
          </Link>
        </div>

        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-10 mb-16">
          <div className="max-w-2xl">
            <span className="text-firefox-orange font-mono text-sm tracking-[0.3em] uppercase mb-4 block font-bold">Project Lab</span>
            <h1 className="text-3xl sm:text-5xl md:text-7xl font-display font-black tracking-tighter leading-[0.95]">
              Open Source <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-zinc-300 to-zinc-600">Projects.</span>
            </h1>
          </div>
          <div className="max-w-sm space-y-5">
            <p className="text-zinc-500 text-base md:text-lg font-medium">
              Selected work from MFC Open Web members, built for the open web and real-world campus needs.
            </p>
            {canManageProjects && (
              <Link
                to="/admin/projects"
                className="inline-flex items-center gap-2 px-5 py-3 bg-firefox-orange text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-orange-600 transition-colors"
              >
                <Plus size={16} />
                Add Project
              </Link>
            )}
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-24">
            <div className="w-10 h-10 border-4 border-firefox-orange border-t-transparent rounded-full animate-spin" />
          </div>
        ) : projects.length === 0 ? (
          <div className="bg-white/5 border border-white/10 rounded-2xl sm:rounded-[2rem] p-6 sm:p-12 text-center flex flex-col items-center">
            <Briefcase className="text-zinc-600 mb-4" size={44} />
            <h2 className="text-2xl font-display font-black text-white mb-3">No Projects Yet</h2>
            <p className="text-zinc-400 max-w-md">Projects added by admins and core team members will appear here.</p>
          </div>
        ) : (
          <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            <div className="lg:col-span-4 space-y-4">
              {projects.map((project, i) => (
                <motion.button
                  key={project.id}
                  type="button"
                  onClick={() => setActiveProject(i)}
                  onMouseEnter={() => setActiveProject(i)}
                  className={`w-full text-left p-6 md:p-8 rounded-3xl cursor-pointer transition-all border ${
                    activeProject === i ? 'bg-white/5 border-white/20' : 'border-transparent hover:bg-white/[0.02]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <span className="text-xs font-mono text-zinc-500 mb-2 block">{String(i + 1).padStart(2, '0')}</span>
                      <h2 className={`text-xl md:text-2xl font-bold transition-colors ${activeProject === i ? 'text-white' : 'text-zinc-500'}`}>
                        {project.title}
                      </h2>
                    </div>
                    <ArrowUpRight size={20} className={activeProject === i ? 'text-firefox-orange' : 'text-zinc-700'} />
                  </div>
                </motion.button>
              ))}
            </div>

            {active && (
              <div className="lg:col-span-8">
                <div className="relative aspect-[16/10] md:aspect-video rounded-[2rem] md:rounded-[2.5rem] overflow-hidden group bg-zinc-900 border border-white/10">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={active.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.5 }}
                      className="absolute inset-0"
                    >
                      <img loading="lazy"
                        src={active.img}
                        alt={active.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/55 to-transparent" />
                    </motion.div>
                  </AnimatePresence>
                </div>

                <motion.div
                  key={`${active.id}-details`}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-8 bg-white/[0.03] border border-white/10 rounded-[2rem] p-6 md:p-8"
                >
                  <div className="flex flex-wrap gap-2 mb-5">
                    {active.tech.map(item => (
                      <span key={item} className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold text-zinc-300 uppercase tracking-widest">
                        {item}
                      </span>
                    ))}
                  </div>
                  <h2 className="text-3xl md:text-5xl font-display font-black tracking-tight mb-4">{active.title}</h2>
                  <p className="text-zinc-300 text-base md:text-lg leading-relaxed mb-5">{active.desc}</p>
                  {active.details && (
                    <p className="text-zinc-500 text-sm md:text-base leading-7 mb-8 whitespace-pre-wrap">{active.details}</p>
                  )}

                  <div className="flex flex-col sm:flex-row gap-3">
                    {active.demoUrl && (
                      <a
                        href={active.demoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-black rounded-xl font-bold text-sm tracking-widest uppercase hover:bg-firefox-orange hover:text-white transition-colors"
                      >
                        View Demo <ArrowUpRight size={16} />
                      </a>
                    )}
                    {active.githubUrl && (
                      <a
                        href={active.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white/10 text-white rounded-xl font-bold text-sm tracking-widest uppercase backdrop-blur-md hover:bg-white/20 transition-colors"
                      >
                        <Github size={16} /> GitHub
                      </a>
                    )}
                  </div>
                </motion.div>
                
                <AdSenseBlock adSlot="projects_details_bottom" className="mt-8" />
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
};

export default Projects;
