import { motion, AnimatePresence } from 'motion/react';
import { ExternalLink, Github, ArrowUpRight } from 'lucide-react';
import { useState } from 'react';

const Projects = () => {
  const [activeProject, setActiveProject] = useState(0);

  const projects = [
    {
      id: "01",
      title: "FoxFire Dashboard",
      desc: "Real-time contribution engine for 400+ members. Built with React and optimized for low-latency updates.",
      tech: ["React", "Firebase", "WebSockets"],
      img: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=1200"
    },
    {
      id: "02",
      title: "Artemis Auth",
      desc: "Open-source authentication library specifically designed for campus-scale applications.",
      tech: ["Node.js", "OAuth2", "Redis"],
      img: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=1200"
    },
    {
      id: "03",
      title: "Zeal Map 2.0",
      desc: "Interactive campus navigation system with real-time room availability and event markers.",
      tech: ["Next.js", "Mapbox", "Three.js"],
      img: "https://images.unsplash.com/photo-1526628953301-3e589a6a8b74?auto=format&fit=crop&q=80&w=1200"
    }
  ];

  return (
    <section id="projects" className="section-padding bg-zinc-950 text-white overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-end mb-24 gap-12">
          <div className="max-w-2xl">
            <span className="text-firefox-orange font-mono text-sm tracking-[0.3em] uppercase mb-4 block font-bold">Showcase</span>
            <h2 className="text-5xl md:text-8xl font-display font-black tracking-tighter leading-[0.9]">
              Featured <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-zinc-400 to-zinc-600">Products.</span>
            </h2>
          </div>
          <p className="text-zinc-500 max-w-sm text-lg font-medium">
             Selected work that demonstrates our commitment to the open web and technical excellence.
          </p>
        </div>

        <div className="grid lg:grid-cols-12 gap-12 items-start">
          <div className="lg:col-span-4 space-y-4">
            {projects.map((project, i) => (
              <motion.div
                key={project.id}
                onMouseEnter={() => setActiveProject(i)}
                className={`p-8 rounded-3xl cursor-pointer transition-all border ${activeProject === i ? 'bg-white/5 border-white/20' : 'border-transparent hover:bg-white/[0.02]'}`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <span className="text-xs font-mono text-zinc-500 mb-2 block">{project.id}</span>
                    <h3 className={`text-2xl font-bold transition-colors ${activeProject === i ? 'text-white' : 'text-zinc-500'}`}>{project.title}</h3>
                  </div>
                  <ArrowUpRight size={20} className={activeProject === i ? 'text-firefox-orange' : 'text-zinc-700'} />
                </div>
              </motion.div>
            ))}
          </div>

          <div className="lg:col-span-8 relative aspect-video rounded-[2.5rem] overflow-hidden group">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeProject}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.5 }}
                className="absolute inset-0"
              >
                <img 
                  src={projects[activeProject].img} 
                  alt={projects[activeProject].title}
                  className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-12">
                   <p className="text-lg text-zinc-300 max-w-xl mb-6 font-medium">{projects[activeProject].desc}</p>
                   <div className="flex gap-4">
                      <motion.button 
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="px-6 py-3 bg-white text-black rounded-xl font-bold text-sm tracking-widest uppercase hover:bg-firefox-orange hover:text-white transition-colors"
                      >
                        View Demo
                      </motion.button>
                      <motion.button 
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="px-6 py-3 bg-white/10 text-white rounded-xl font-bold text-sm tracking-widest uppercase backdrop-blur-md hover:bg-white/20 transition-colors"
                      >
                        GitHub
                      </motion.button>
                   </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Projects;
