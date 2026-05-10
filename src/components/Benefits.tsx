import { motion } from 'motion/react';
import { Briefcase, Layers, TrendingUp, Lightbulb, ShieldCheck } from 'lucide-react';

const Benefits = () => {
  const gains = [
    {
      title: "Real Projects for Your Portfolio",
      desc: "Every project you work on is a portfolio piece. Every commit on GitHub is proof of your skills.",
      icon: Layers
    },
    {
      title: "Practical Skills, Not Theory",
      desc: "Learn technologies by using them. Version control, project management, and collaborative coding.",
      icon: Lightbulb
    },
    {
      title: "Team Experience",
      desc: "Structured team experience: sprint planning, code reviews, collaborative problem solving.",
      icon: Briefcase
    },
    {
      title: "Leadership Opportunities",
      desc: "Every leadership role is earned through contribution. Lead a team or a system as you grow.",
      icon: TrendingUp
    }
  ];

  return (
    <section className="py-24 px-4 bg-obsidian">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-6xl font-display font-bold mb-6 tracking-tight">What You <span className="text-gradient">Gain</span></h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
             Personal growth here is directly tied to your career. 
             Here is exactly what membership in MFC ZCOER delivers.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {gains.map((gain, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: i % 2 === 0 ? -30 : 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="p-8 rounded-3xl glass flex flex-col md:flex-row gap-6 items-start"
            >
              <div className="w-16 h-16 rounded-2xl bg-firefox-orange/10 flex items-center justify-center flex-shrink-0">
                <gain.icon size={28} className="text-firefox-orange" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-3">{gain.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{gain.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-16 grid grid-cols-2 md:grid-cols-3 gap-8 pt-16 border-t border-white/5">
          {[
            { label: "Learning by Doing", val: "80%" },
            { label: "Merit-Based Roles", val: "100%" },
            { label: "Team Collaboration", val: "70%" }
          ].map((item, i) => (
            <div key={i} className="text-center">
              <div className="text-5xl font-display font-bold text-white mb-2">{item.val}</div>
              <div className="text-xs uppercase tracking-widest text-firefox-purple font-bold">{item.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Benefits;
