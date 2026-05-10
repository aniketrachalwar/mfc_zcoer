import { motion } from 'motion/react';
import { UserPlus, BookOpen, Hammer, Gift, Award } from 'lucide-react';

const System = () => {
  const steps = [
    { icon: UserPlus, label: "Join", desc: "Get assigned to a team" },
    { icon: BookOpen, label: "Learn", desc: "Weekly tasks & workshops" },
    { icon: Hammer, label: "Build", desc: "Work on real projects" },
    { icon: Gift, label: "Contribute", desc: "Open-source & events" },
    { icon: Award, label: "Lead", desc: "Propose initiatives & mentor" }
  ];

  return (
    <section id="works" className="py-24 px-4 bg-gradient-to-b from-obsidian to-black">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-6xl font-display font-bold mb-6 tracking-tight">How the <span className="text-gradient">System</span> Works</h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            MFC ZCOER runs on a structured, performance-driven system that ensures 
            every member grows based on their actual contribution.
          </p>
        </div>

        <div className="relative flex flex-col md:flex-row justify-between items-center gap-12">
          {/* Connector Line */}
          <div className="absolute top-1/2 left-0 w-full h-0.5 bg-white/5 -translate-y-1/2 hidden md:block" />
          
          {steps.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="relative z-10 flex flex-col items-center text-center group"
            >
              <div className="w-20 h-20 rounded-full glass flex items-center justify-center mb-6 group-hover:bg-firefox-orange group-hover:text-white transition-all duration-500 shadow-xl shadow-black/50">
                <step.icon size={32} />
              </div>
              <h3 className="text-xl font-bold mb-2">{step.label}</h3>
              <p className="text-gray-500 text-sm max-w-[150px]">{step.desc}</p>
              
              {/* Step indicator on mobile */}
              <div className="md:hidden w-1 h-12 bg-white/5 my-4" />
            </motion.div>
          ))}
        </div>

        <div className="mt-24 grid md:grid-cols-2 gap-8">
          <div className="p-8 rounded-3xl glass border-white/5">
            <h4 className="text-xl font-bold mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-firefox-orange" />
              The Accountability Framework
            </h4>
            <p className="text-gray-400 leading-relaxed text-sm">
              We operate on a simple principle: **no work, no role.** Leadership positions,
              special tags, and event ownership are all earned through demonstrated contribution.
              There is no favoritism, no random selection, and no political maneuvering. 
            </p>
          </div>
          <div className="p-8 rounded-3xl glass border-white/5">
            <h4 className="text-xl font-bold mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-firefox-purple" />
              What Gets Tracked
            </h4>
            <div className="grid grid-cols-2 gap-4 text-xs font-bold uppercase tracking-widest text-white/40">
              <div className="flex items-center gap-2"><div className="w-1 h-1 bg-white/20" /> Weekly Completion</div>
              <div className="flex items-center gap-2"><div className="w-1 h-1 bg-white/20" /> Project Commits</div>
              <div className="flex items-center gap-2"><div className="w-1 h-1 bg-white/20" /> PRs Merged</div>
              <div className="flex items-center gap-2"><div className="w-1 h-1 bg-white/20" /> Workshop Scores</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default System;
