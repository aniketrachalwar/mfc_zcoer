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
    <section id="blog" className="section-padding bg-zinc-950 border-t border-white/5 relative">
      <div className="absolute top-0 right-0 w-96 h-96 bg-firefox-orange/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-8">
          <div>
            <span className="text-zinc-400 font-bold text-xs uppercase tracking-[0.3em]">Our Stories</span>
            <h2 className="text-fluid-h2 font-display font-black mt-4 md:mt-6 tracking-tighter text-white">Latest <span className="text-gradient">Blogs</span></h2>
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            {user && (
              <button 
                onClick={() => navigate('/write-blog')}
                className="group flex items-center justify-center gap-3 px-6 py-3 min-h-[44px] bg-white/5 border border-white/10 text-white rounded-full text-xs font-black uppercase tracking-widest hover:bg-firefox-orange hover:border-firefox-orange transition-colors"
              >
                <PenTool size={14} /> Write a Blog
              </button>
            )}
            <button
              onClick={() => navigate('/blogs')}
              className="group flex items-center justify-center gap-3 px-4 py-3 min-h-[44px] text-xs font-black uppercase tracking-widest text-white hover:text-firefox-orange transition-colors bg-white/5 sm:bg-transparent rounded-full sm:rounded-none"
            >
              Read All Articles <div className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center group-hover:bg-white group-hover:border-white group-hover:text-black transition-all"><ArrowRight size={14} /></div>
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center p-12">
            <div className="w-8 h-8 border-4 border-firefox-orange border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-10">
            {blogs.map((blog, i) => (
              <div
                key={blog.id || i}
                className="group cursor-pointer transition-all duration-300 hover:-translate-y-1 bg-white/5 border border-white/10 p-6 md:p-8 rounded-[2rem] hover:border-firefox-orange/30 backdrop-blur-sm"
                onClick={() => blog.authorId !== 'mock' && navigate(`/blog/${blog.id}`)}
              >
                <div className="aspect-[16/10] overflow-hidden rounded-[1.5rem] mb-8 border border-white/5 relative">
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors z-10" />
                  <img loading="lazy" src={blog.img} alt={blog.title} className="w-full h-full object-cover transition-all duration-700 group-hover:scale-105" />
                </div>
                <div className="flex gap-2 mb-6">
                  {blog.tags.map(t => (
                    <span key={t} className="px-3 py-1 rounded-full bg-black/50 border border-white/10 text-[10px] font-bold text-firefox-orange uppercase tracking-widest">{t}</span>
                  ))}
                </div>
                <h3 className="text-2xl font-black mb-4 text-white tracking-tight group-hover:text-firefox-orange transition-colors line-clamp-2">{blog.title}</h3>
                <p className="text-zinc-400 text-sm leading-relaxed mb-8 line-clamp-2 font-medium">{blog.excerpt}</p>
                
                <div className="flex items-center justify-between pt-6 border-t border-white/10">
                  <div className="flex items-center gap-3">
                     <div className="w-8 h-8 rounded-full bg-white/10 border border-white/10 overflow-hidden text-[8px] flex items-center justify-center font-black text-white">
                       {blog.authorName.split(' ').map(n=>n[0]).join('').substring(0, 2)}
                     </div>
                     <div>
                        <p className="text-[10px] font-bold text-white uppercase">{blog.authorName}</p>
                        <p className="text-[10px] font-bold text-zinc-500 uppercase">{blog.date}</p>
                     </div>
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-zinc-400 uppercase">
                    <Clock size={12} /> {blog.readTime}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default Blogs;
