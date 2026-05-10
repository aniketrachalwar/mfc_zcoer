import { motion } from 'motion/react';
import { Terminal, PenTool, Layout } from 'lucide-react';

const Domains = () => {
  const domains = [
    {
      name: "Technical",
      icon: Terminal,
      members: "180+",
      projects: 12,
      growth: "+45%",
      focus: ["Fullstack Dev", "Cloud Architecture", "DevOps"],
      color: "text-blue-600",
      bg: "bg-blue-50"
    },
    {
      name: "Design",
      icon: PenTool,
      members: "120+",
      projects: 8,
      growth: "+32%",
      focus: ["UI/UX Design", "Motion Graphics", "Brand Identity"],
      color: "text-purple-600",
      bg: "bg-purple-50"
    },
    {
      name: "Management",
      icon: Layout,
      members: "150+",
      projects: 15,
      growth: "+28%",
      focus: ["Product Mgmt", "Public Relations", "Event Ops"],
      color: "text-orange-600",
      bg: "bg-orange-50"
    }
  ];

  return (
    <section id="domains" className="section-padding bg-zinc-50">
      <div className="max-w-7xl mx-auto">
        <div className="mb-20 text-center">
          <span className="text-zinc-400 font-bold text-xs uppercase tracking-[0.3em]">Specialized Areas</span>
          <h2 className="text-4xl md:text-6xl font-display font-black mt-6 tracking-tighter text-zinc-950">Expert <span className="text-gradient">Domains</span></h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {domains.map((domain, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              whileHover={{ y: -10 }}
              transition={{ 
                delay: i * 0.1,
                duration: 0.3
              }}
              className="p-10 bg-white rounded-[2rem] border border-zinc-200 shadow-sm hover:shadow-xl transition-all duration-500 group"
            >
              <div className={`w-16 h-16 rounded-2xl ${domain.bg} flex items-center justify-center mb-8 border border-zinc-100 group-hover:scale-110 transition-transform`}>
                <domain.icon size={32} className={domain.color} />
              </div>
              <h3 className="text-2xl font-black mb-2 text-zinc-900 uppercase tracking-tight">{domain.name}</h3>
              <div className="flex items-center gap-3 mb-8">
                <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">{domain.members} Members</span>
                <div className="w-1 h-1 rounded-full bg-zinc-200" />
                <span className="text-xs font-bold text-green-600 uppercase tracking-widest">{domain.growth} Growth</span>
              </div>

              <div className="space-y-6">
                <div>
                  <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-3">Focus Areas</p>
                  <div className="flex flex-wrap gap-2">
                    {domain.focus.map(f => (
                      <span key={f} className="px-3 py-1 rounded-full bg-zinc-50 border border-zinc-100 text-[10px] font-bold text-zinc-600">
                        {f}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div className="pt-6 border-t border-zinc-100 flex justify-between items-center">
                   <div className="text-center">
                      <p className="text-xl font-bold text-zinc-900">{domain.projects}</p>
                      <p className="text-[10px] font-bold text-zinc-400 uppercase">Live Projects</p>
                   </div>
                   <motion.button 
                     whileHover={{ x: 5 }}
                     className="text-xs font-black uppercase tracking-widest text-zinc-950 hover:text-firefox-orange transition-colors"
                   >
                     Apply Now →
                   </motion.button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Domains;
