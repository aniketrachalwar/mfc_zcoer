import { motion } from 'motion/react';
import { Users } from 'lucide-react';

const About = () => {
  return (
    <section id="about" className="section-padding bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-20 items-center mb-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="text-firefox-orange font-mono text-sm tracking-widest uppercase mb-4 block">Our Identity</span>
            <h2 className="text-5xl md:text-7xl font-display font-extrabold mb-8 tracking-tighter text-zinc-900">
              Mozilla Firefox <br/>
              Club <span className="text-firefox-orange">ZCOER</span>
            </h2>
            <p className="text-zinc-600 text-xl leading-relaxed mb-12">
              MFC ZCOER is a community of makers, builders, and learners. 
              We bridge the gap between academic theory and industry reality through 
              relentless open-source contribution and collaborative product building.
            </p>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-12">
              {[
                { label: "Active Members", val: "450+" },
                { label: "Projects Launched", val: "24" },
                { label: "Years Innovating", val: "3" }
              ].map((stat, i) => (
                <motion.div 
                  key={i} 
                  whileHover={{ y: -5 }}
                  className="border-l-2 border-firefox-orange/20 pl-6 cursor-default"
                >
                  <h3 className="text-4xl font-display font-black text-zinc-900 mb-1">{stat.val}</h3>
                  <p className="text-xs uppercase tracking-widest text-zinc-500 font-bold">{stat.label}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative p-12 bg-zinc-50 rounded-[2.5rem] border border-zinc-100 group"
          >
            <div className="absolute top-0 right-0 p-8 opacity-5">
              <Users size={160} className="text-zinc-950 -rotate-12 translate-x-12 -translate-y-6 group-hover:rotate-0 group-hover:scale-110 transition-transform duration-700" />
            </div>
            <h3 className="text-2xl font-bold mb-10 tracking-tight text-zinc-900">The Mission</h3>
            <ul className="space-y-8">
              {[
                "Democratizing technology for everyone",
                "Building tools for a healthy, open web",
                "Merit-based growth through tangible output",
                "Fostering a culture of accountability"
              ].map((item, i) => (
                <motion.li 
                  key={i} 
                  whileHover={{ x: 10 }}
                  className="flex items-start gap-5 cursor-default"
                >
                  <div className="w-10 h-10 rounded-xl bg-firefox-orange text-white flex items-center justify-center flex-shrink-0 font-bold italic shadow-lg shadow-firefox-orange/20">
                    0{i+1}
                  </div>
                  <span className="text-zinc-700 font-semibold text-lg">{item}</span>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default About;
