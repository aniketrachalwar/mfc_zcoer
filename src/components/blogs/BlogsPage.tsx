import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Clock, PenTool, Edit3 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { db } from '../../lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { Blog } from '../../types/blog';
import { useAuth } from '../../lib/AuthContext';

const BlogsPage = () => {
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
          .sort((a, b) => b.createdAt - a.createdAt);
        setBlogs(fetchedBlogs);
      } catch (err) {
        console.error("Failed to fetch blogs:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchBlogs();
  }, []);

  const topBlogs = blogs.slice(0, 2); // Highlight the top 2
  const otherBlogs = blogs.slice(2);

  return (
    <div className="min-h-screen pt-32 pb-20 px-4 bg-zinc-950">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
          <div>
            <span className="text-zinc-500 font-bold text-xs uppercase tracking-[0.3em]">Knowledge Base</span>
            <h1 className="text-4xl md:text-6xl font-display font-black mt-4 tracking-tighter text-white">Latest <span className="text-gradient">Insights</span></h1>
          </div>
          {user && (
            <button 
              onClick={() => navigate('/write-blog')}
              className="group flex items-center gap-3 px-6 py-3 bg-firefox-orange text-white rounded-full text-xs font-black uppercase tracking-widest shadow-xl shadow-firefox-orange/20 hover:scale-105 transition-all"
            >
              <PenTool size={14} /> Write an Insight
            </button>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center p-20">
            <div className="w-12 h-12 border-4 border-firefox-orange border-t-transparent rounded-full animate-spin" />
          </div>
        ) : blogs.length === 0 ? (
          <div className="text-center py-20 text-zinc-500">
            <p className="mb-4">No insights published yet.</p>
            {user && (
              <button 
                onClick={() => navigate('/write-blog')}
                className="text-firefox-orange hover:underline uppercase text-[10px] font-black tracking-widest"
              >
                Be the first to write
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-16">
            {/* Top / Featured Blogs */}
            {topBlogs.length > 0 && (
              <div className="grid md:grid-cols-2 gap-8">
                {topBlogs.map((blog, i) => (
                  <motion.div
                    key={blog.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="group relative flex flex-col justify-end min-h-[400px] rounded-[2rem] overflow-hidden border border-zinc-800 cursor-pointer"
                    onClick={() => navigate(`/blog/${blog.id}`)}
                  >
                    <div className="absolute inset-0">
                      <img loading="lazy" src={blog.img} alt={blog.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent" />
                    </div>
                    
                    <div className="relative p-8 z-10">
                      <div className="flex gap-2 mb-4">
                        {blog.tags.slice(0, 2).map(t => (
                          <span key={t} className="px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-[10px] font-bold text-white uppercase tracking-widest">{t}</span>
                        ))}
                      </div>
                      <h2 className="text-3xl font-black text-white mb-3 tracking-tight group-hover:text-firefox-orange transition-colors">{blog.title}</h2>
                      <p className="text-zinc-400 text-sm line-clamp-2 mb-6">{blog.excerpt}</p>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-[10px] font-black text-white border border-zinc-700">
                            {blog.authorName.split(' ').map(n=>n[0]).join('').substring(0, 2)}
                          </div>
                          <div>
                            <p className="text-xs font-bold text-white uppercase">{blog.authorName}</p>
                            <p className="text-[10px] font-bold text-zinc-500 uppercase">{blog.date}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1.5 text-[10px] font-bold text-zinc-400 uppercase">
                            <Clock size={12} /> {blog.readTime}
                          </div>
                          {user && user.uid === blog.authorId && (
                            <button
                              onClick={(e) => { e.stopPropagation(); navigate(`/edit-blog/${blog.id}`); }}
                              className="w-8 h-8 rounded-full bg-white/10 hover:bg-firefox-orange text-white flex items-center justify-center transition-colors"
                              title="Edit Blog"
                            >
                              <Edit3 size={14} />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Other Blogs */}
            {otherBlogs.length > 0 && (
              <div>
                <h3 className="text-2xl font-display font-black text-white mb-8 border-b border-zinc-800 pb-4">More Insights</h3>
                <div className="grid md:grid-cols-3 gap-8">
                  {otherBlogs.map((blog, i) => (
                    <motion.div
                      key={blog.id}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.1 }}
                      className="group cursor-pointer bg-zinc-900 border border-zinc-800 rounded-[2rem] overflow-hidden hover:border-zinc-700 transition-all flex flex-col h-full"
                      onClick={() => navigate(`/blog/${blog.id}`)}
                    >
                      <div className="aspect-[16/10] overflow-hidden relative">
                        <img loading="lazy" src={blog.img} alt={blog.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                        <div className="absolute top-4 right-4">
                          {user && user.uid === blog.authorId && (
                            <button
                              onClick={(e) => { e.stopPropagation(); navigate(`/edit-blog/${blog.id}`); }}
                              className="w-8 h-8 rounded-full bg-black/50 backdrop-blur hover:bg-firefox-orange text-white flex items-center justify-center transition-colors shadow-lg"
                              title="Edit Blog"
                            >
                              <Edit3 size={14} />
                            </button>
                          )}
                        </div>
                      </div>
                      <div className="p-6 flex flex-col flex-1">
                        <div className="flex gap-2 mb-4">
                          {blog.tags.slice(0, 2).map(t => (
                            <span key={t} className="px-2 py-1 rounded-full bg-zinc-800 text-[9px] font-bold text-zinc-400 uppercase tracking-widest">{t}</span>
                          ))}
                        </div>
                        <h3 className="text-xl font-black mb-3 text-white tracking-tight group-hover:text-firefox-orange transition-colors">{blog.title}</h3>
                        <p className="text-zinc-500 text-sm mb-6 line-clamp-3 flex-1">{blog.excerpt}</p>
                        
                        <div className="flex items-center justify-between pt-4 border-t border-zinc-800 mt-auto">
                          <div>
                            <p className="text-[10px] font-bold text-white uppercase">{blog.authorName}</p>
                            <p className="text-[10px] font-bold text-zinc-500 uppercase">{blog.date}</p>
                          </div>
                          <div className="flex items-center gap-1.5 text-[10px] font-bold text-zinc-500 uppercase">
                            <Clock size={12} /> {blog.readTime}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default BlogsPage;
