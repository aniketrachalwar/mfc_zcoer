import { motion } from 'motion/react';
import { Calendar, User, Clock, ArrowRight } from 'lucide-react';

const Blogs = () => {
  const blogs = [
    {
      title: "Rust for the Open Web",
      excerpt: "Why we are adopting Rust for our next generation of community tools and infrastructure projects.",
      tags: ["Tech", "Rust"],
      author: "Aditi Deshmukh",
      date: "Oct 24, 2024",
      readTime: "6 min read",
      img: "https://images.unsplash.com/photo-1558486012-817176f44ec0?auto=format&fit=crop&q=80&w=800"
    },
    {
      title: "Design Systems in 2024",
      excerpt: "Building MFC ZCOER's first unified design system. From Figma to functional CSS.",
      tags: ["Design", "UI/UX"],
      author: "Rahul Bansal",
      date: "Nov 02, 2024",
      readTime: "8 min read",
      img: "https://images.unsplash.com/photo-1586717791821-3f44a563dc4c?auto=format&fit=crop&q=80&w=800"
    },
    {
      title: "Community Scaling",
      excerpt: "How we managed to grow from 50 to 450 active members in just one semester through accountability.",
      tags: ["Ops", "Growth"],
      author: "Siddharth K.",
      date: "Nov 15, 2024",
      readTime: "5 min read",
      img: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=800"
    }
  ];

  return (
    <section id="blog" className="section-padding bg-zinc-50">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-8">
          <div>
            <span className="text-zinc-400 font-bold text-xs uppercase tracking-[0.3em]">Our Stories</span>
            <h2 className="text-4xl md:text-6xl font-display font-black mt-6 tracking-tighter text-zinc-950">Latest <span className="text-gradient">Insights</span></h2>
          </div>
          <button className="group flex items-center gap-3 text-xs font-black uppercase tracking-widest text-zinc-950 hover:text-firefox-orange transition-colors">
            Read All Articles <div className="w-8 h-8 rounded-full border border-zinc-200 flex items-center justify-center group-hover:bg-zinc-950 group-hover:text-white transition-all"><ArrowRight size={14} /></div>
          </button>
        </div>

        <div className="grid md:grid-cols-3 gap-10">
          {blogs.map((blog, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="group cursor-pointer"
            >
              <div className="aspect-[16/10] overflow-hidden rounded-[2rem] mb-8 border border-zinc-200 transition-all group-hover:shadow-2xl group-hover:shadow-black/5">
                <img src={blog.img} alt={blog.title} className="w-full h-full object-cover grayscale transition-all duration-700 group-hover:grayscale-0 group-hover:scale-105" />
              </div>
              <div className="flex gap-2 mb-6">
                {blog.tags.map(t => (
                  <span key={t} className="px-3 py-1 rounded-full bg-zinc-100 border border-zinc-200 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{t}</span>
                ))}
              </div>
              <h3 className="text-2xl font-black mb-4 text-zinc-950 tracking-tight group-hover:text-firefox-orange transition-colors">{blog.title}</h3>
              <p className="text-zinc-500 text-sm leading-relaxed mb-8 line-clamp-2 font-medium">{blog.excerpt}</p>
              
              <div className="flex items-center justify-between pt-6 border-t border-zinc-100">
                <div className="flex items-center gap-3">
                   <div className="w-8 h-8 rounded-full bg-zinc-200 overflow-hidden text-[8px] flex items-center justify-center font-black">{blog.author.split(' ').map(n=>n[0]).join('')}</div>
                   <div>
                      <p className="text-[10px] font-bold text-zinc-950 uppercase">{blog.author}</p>
                      <p className="text-[10px] font-bold text-zinc-400 uppercase">{blog.date}</p>
                   </div>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-zinc-400 uppercase">
                  <Clock size={12} /> {blog.readTime}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Blogs;
