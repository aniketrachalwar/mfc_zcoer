import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Clock, ArrowRight, PenTool } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { db } from '../lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { Blog } from '../types/blog';
import { useAuth } from '../lib/AuthContext';

const Blogs = () => {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const q = query(
          collection(db, 'blogs'), 
          where('status', '==', 'approved')
        );
        const snapshot = await getDocs(q);
        const fetchedBlogs = snapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() } as Blog))
          .sort((a, b) => b.createdAt - a.createdAt)
          .slice(0, 1);
        
        if (fetchedBlogs.length > 0) {
          setBlogs(fetchedBlogs);
        } else {
          // Fallback to initial mock data if no blogs in Firestore
          setBlogs([
            {
              id: '1',
              title: "Rust for the Open Web",
              excerpt: "Why we are adopting Rust for our next generation of community tools and infrastructure projects.",
              tags: ["Tech", "Rust"],
              authorName: "Aditi Deshmukh",
              authorId: 'mock',
              date: "Oct 24, 2024",
              readTime: "6 min read",
              img: "https://images.unsplash.com/photo-1558486012-817176f44ec0?auto=format&fit=crop&q=80&w=800",
              status: 'approved',
              createdAt: Date.now(),
              content: ''
            }
          ]);
        }
      } catch (err) {
        console.error("Failed to fetch blogs:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchBlogs();
  }, []);

  return (
    <section id="blog" className="section-padding bg-zinc-50">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-8">
          <div>
            <span className="text-zinc-400 font-bold text-xs uppercase tracking-[0.3em]">Our Stories</span>
            <h2 className="text-4xl md:text-6xl font-display font-black mt-6 tracking-tighter text-zinc-950">Latest <span className="text-gradient">Blogs</span></h2>
          </div>
          <div className="flex gap-4">
            {user && (
              <button 
                onClick={() => navigate('/write-blog')}
                className="group flex items-center gap-3 px-6 py-3 bg-zinc-900 text-white rounded-full text-xs font-black uppercase tracking-widest hover:bg-firefox-orange transition-colors"
              >
                <PenTool size={14} /> Write a Blog
              </button>
            )}
            <button
              onClick={() => navigate('/blogs')}
              className="group flex items-center gap-3 text-xs font-black uppercase tracking-widest text-zinc-950 hover:text-firefox-orange transition-colors"
            >
              Read All Articles <div className="w-8 h-8 rounded-full border border-zinc-200 flex items-center justify-center group-hover:bg-zinc-950 group-hover:text-white transition-all"><ArrowRight size={14} /></div>
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center p-12">
            <div className="w-8 h-8 border-4 border-firefox-orange border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid max-w-3xl gap-10">
            {blogs.map((blog, i) => (
              <motion.div
                key={blog.id || i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group cursor-pointer"
                onClick={() => blog.authorId !== 'mock' && navigate(`/blog/${blog.id}`)}
              >
                <div className="aspect-[16/10] overflow-hidden rounded-[2rem] mb-8 border border-zinc-200 transition-all group-hover:shadow-2xl group-hover:shadow-black/5">
                  <img loading="lazy" src={blog.img} alt={blog.title} className="w-full h-full object-cover grayscale transition-all duration-700 group-hover:grayscale-0 group-hover:scale-105" />
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
                     <div className="w-8 h-8 rounded-full bg-zinc-200 overflow-hidden text-[8px] flex items-center justify-center font-black">
                       {blog.authorName.split(' ').map(n=>n[0]).join('').substring(0, 2)}
                     </div>
                     <div>
                        <p className="text-[10px] font-bold text-zinc-950 uppercase">{blog.authorName}</p>
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
        )}
      </div>
    </section>
  );
};

export default Blogs;
