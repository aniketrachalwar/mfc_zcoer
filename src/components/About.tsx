import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Users, Target, Award, Quote, Sparkles } from 'lucide-react';
import { db } from '../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { Helmet } from 'react-helmet-async';

interface AboutData {
  identityText: string;
  identityDescription: string;
  stats: { label: string; val: string }[];
  missionItems: string[];
  leadershipMessages: { id: string; name: string; role: string; message: string; imageUrl: string }[];
  achievements: { id: string; title: string; description: string; date: string; imageUrl: string }[];
  gallery: string[];
}

const defaultData: AboutData = {
  identityText: "MFC Open Web",
  identityDescription: "MFC Open Web is a community of makers, builders, and learners. We bridge the gap between academic theory and industry reality through relentless open-source contribution and collaborative product building.",
  stats: [
    { label: "Active Members", val: "450+" },
    { label: "Projects Launched", val: "24" },
    { label: "Years Innovating", val: "3" }
  ],
  missionItems: [
    "Democratizing technology for everyone",
    "Building tools for a healthy, open web",
    "Merit-based growth through tangible output",
    "Fostering a culture of accountability"
  ],
  leadershipMessages: [],
  achievements: [],
  gallery: []
};

const About = () => {
  const [data, setData] = useState<AboutData>(defaultData);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const docRef = doc(db, 'settings', 'about');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setData({ ...defaultData, ...docSnap.data() } as AboutData);
        }
      } catch (err) {
        console.error("Failed to load about data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-firefox-orange border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>About Us | MFC Open Web</title>
        <meta name="description" content={data.identityDescription} />
      </Helmet>

      <div className="bg-zinc-950 min-h-screen pt-24 md:pt-32 pb-24 overflow-hidden">
        
        {/* IDENTITY SECTION */}
        <section className="px-4 mb-24 md:mb-32">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <span className="flex items-center gap-2 text-firefox-orange font-mono text-[10px] md:text-xs tracking-widest uppercase mb-4 md:mb-6">
                  <Sparkles size={14} /> Our Identity
                </span>
                <h1 className="text-3xl sm:text-5xl md:text-7xl lg:text-8xl font-display font-black mb-6 md:mb-8 tracking-tighter text-white leading-[0.9]">
                  {data.identityText.split(' ').map((word, i) => (
                    <span key={i} className={i === data.identityText.split(' ').length - 1 ? 'text-firefox-orange' : ''}>
                      {word}{' '}
                    </span>
                  ))}
                </h1>
                <p className="text-zinc-400 text-lg md:text-xl leading-relaxed mb-10 max-w-2xl font-serif">
                  {data.identityDescription}
                </p>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 md:gap-12">
                  {data.stats.map((stat, i) => (
                    <motion.div 
                      key={i} 
                      whileHover={{ y: -5 }}
                      className="border-l-2 border-firefox-orange/30 pl-4 md:pl-6 cursor-default"
                    >
                      <h3 className="text-3xl md:text-5xl font-display font-black text-white mb-1 md:mb-2">{stat.val}</h3>
                      <p className="text-[9px] md:text-xs uppercase tracking-widest text-zinc-500 font-bold">{stat.label}</p>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* MISSION SECTION (Embedded next to Identity on Desktop) */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="relative p-8 md:p-12 bg-zinc-900/50 backdrop-blur-sm rounded-[2rem] md:rounded-[3rem] border border-zinc-800 group"
              >
                <div className="absolute top-0 right-0 p-8 opacity-5">
                  <Target size={120} className="text-white -rotate-12 translate-x-8 -translate-y-4 group-hover:rotate-0 group-hover:scale-110 transition-transform duration-700" />
                </div>
                <h3 className="text-2xl md:text-3xl font-display font-black mb-8 md:mb-10 tracking-tight text-white flex items-center gap-3">
                  <Target className="text-firefox-orange" /> The Mission
                </h3>
                <ul className="space-y-6 md:space-y-8">
                  {data.missionItems.map((item, i) => (
                    <motion.li 
                      key={i} 
                      whileHover={{ x: 10 }}
                      className="flex items-start gap-4 cursor-default"
                    >
                      <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-firefox-orange/10 border border-firefox-orange/20 text-firefox-orange flex items-center justify-center shrink-0 font-black text-sm md:text-base">
                        0{i+1}
                      </div>
                      <span className="text-zinc-300 font-medium text-base md:text-lg pt-1 leading-snug">{item}</span>
                    </motion.li>
                  ))}
                </ul>
              </motion.div>
            </div>
          </div>
        </section>

        {/* LEADERSHIP MESSAGES */}
        {data.leadershipMessages.length > 0 && (
          <section className="px-4 mb-24 md:mb-32">
            <div className="max-w-7xl mx-auto">
              <div className="text-center mb-12 md:mb-16">
                <span className="text-firefox-orange font-mono text-[10px] md:text-xs tracking-widest uppercase mb-4 block">Leadership</span>
                <h2 className="text-2xl sm:text-3xl md:text-5xl font-display font-black text-white">Words of Wisdom</h2>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6 md:gap-8">
                {data.leadershipMessages.map((msg, i) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="bg-zinc-900 border border-zinc-800 rounded-[2rem] p-8 relative flex flex-col h-full"
                  >
                    <Quote size={120} className="absolute top-4 right-4 text-white/[0.02] -z-0" />
                    
                    <div className="flex items-center gap-4 mb-6 relative z-10">
                      <div className="w-16 h-16 rounded-full overflow-hidden bg-zinc-800 border border-zinc-700 shrink-0">
                        {msg.imageUrl ? (
                          <img src={msg.imageUrl} alt={msg.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-zinc-600">
                            <Users size={24} />
                          </div>
                        )}
                      </div>
                      <div>
                        <h4 className="text-lg font-black text-white">{msg.name}</h4>
                        <p className="text-xs font-bold uppercase tracking-widest text-firefox-orange">{msg.role}</p>
                      </div>
                    </div>
                    
                    <p className="text-zinc-400 leading-relaxed font-serif text-lg italic relative z-10 flex-1">
                      "{msg.message}"
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ACHIEVEMENTS TIMELINE */}
        {data.achievements.length > 0 && (
          <section className="px-4 mb-24 md:mb-32">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12 md:mb-16">
                <span className="text-firefox-orange font-mono text-[10px] md:text-xs tracking-widest uppercase mb-4 block">Milestones</span>
                <h2 className="text-2xl sm:text-3xl md:text-5xl font-display font-black text-white">Our Achievements</h2>
              </div>

              <div className="space-y-8 md:space-y-12 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-zinc-800 before:to-transparent">
                {data.achievements.map((ach, i) => (
                  <motion.div 
                    key={ach.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active"
                  >
                    {/* Icon */}
                    <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-zinc-950 bg-zinc-900 text-firefox-orange shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-[0_0_0_4px_rgba(255,106,0,0.1)] z-10 relative left-0 md:left-1/2">
                      <Award size={16} />
                    </div>
                    
                    {/* Card */}
                    <div className="w-[calc(100%-4rem)] md:w-[calc(50%-3rem)] bg-zinc-900 border border-zinc-800 rounded-[2rem] p-6 md:p-8 hover:border-zinc-700 transition-colors group-hover:-translate-y-1 duration-300">
                      <div className="flex flex-col sm:flex-row gap-6 items-start">
                        {ach.imageUrl && (
                          <div className="w-full sm:w-24 h-32 sm:h-24 shrink-0 rounded-xl overflow-hidden bg-zinc-950">
                            <img src={ach.imageUrl} alt={ach.title} className="w-full h-full object-cover" />
                          </div>
                        )}
                        <div>
                          <span className="text-[10px] font-black uppercase tracking-widest text-firefox-orange mb-2 block">{ach.date}</span>
                          <h4 className="text-xl font-black text-white mb-2 leading-tight">{ach.title}</h4>
                          <p className="text-zinc-400 text-sm leading-relaxed">{ach.description}</p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* GALLERY */}
        {data.gallery.length > 0 && (
          <section className="px-4">
            <div className="max-w-7xl mx-auto">
              <div className="text-center mb-12 md:mb-16">
                <span className="text-firefox-orange font-mono text-[10px] md:text-xs tracking-widest uppercase mb-4 block">Memories</span>
                <h2 className="text-2xl sm:text-3xl md:text-5xl font-display font-black text-white">Photo Gallery</h2>
              </div>

              {/* CSS columns for Masonry layout */}
              <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 md:gap-6 space-y-4 md:space-y-6">
                {data.gallery.map((url, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: (i % 3) * 0.1 }}
                    className="break-inside-avoid rounded-2xl md:rounded-[2rem] overflow-hidden bg-zinc-900 border border-zinc-800"
                  >
                    <img 
                      loading="lazy" 
                      src={url} 
                      alt={`Gallery Memory ${i + 1}`} 
                      className="w-full h-auto object-cover hover:scale-105 transition-transform duration-700 cursor-pointer"
                    />
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
        )}
        
      </div>
    </>
  );
};

export default About;
