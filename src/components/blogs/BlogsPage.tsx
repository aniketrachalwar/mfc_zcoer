import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Clock, PenTool, Edit3, ExternalLink, TrendingUp, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { db } from '../../lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { Blog } from '../../types/blog';
import { useAuth } from '../../lib/AuthContext';
import { Helmet } from 'react-helmet-async';
import AdSenseBlock from '../AdSenseBlock';
import PageLoader from '../PageLoader';

const BlogsPage = () => {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
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
          .sort((a, b) => {
            const scoreA = a.engagementScore || 0;
            const scoreB = b.engagementScore || 0;
            if (scoreB !== scoreA) {
              return scoreB - scoreA;
            }
            return b.createdAt - a.createdAt;
          });
        setBlogs(fetchedBlogs);
      } catch (err) {
        console.error("Failed to fetch blogs:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchBlogs();
  }, []);

  // Extract unique categories (tags)
  const allCategories = ['All', ...Array.from(new Set(blogs.flatMap(blog => blog.tags)))];

  const filteredBlogs = selectedCategory === 'All' 
    ? blogs 
    : blogs.filter(blog => blog.tags.includes(selectedCategory));

  // For Medium style, we might use topBlogs for the "Trending" sidebar
  const trendingBlogs = blogs.slice(0, 3);

  return (
    <>
      <Helmet>
        <title>Insights & Blogs | MFC Open Web</title>
        <meta name="description" content="Read the latest insights, tutorials, and engineering blogs from the MFC Open Web community." />
      </Helmet>

      <main className="min-h-screen pt-24 md:pt-32 pb-24 md:pb-20 px-4 bg-zinc-950">
        <div className="max-w-7xl mx-auto">
          
          <header className="mb-10 md:mb-16 border-b border-zinc-800 pb-8">
            <span className="text-zinc-500 font-bold text-[10px] md:text-xs uppercase tracking-[0.3em] flex items-center gap-2">
              <Sparkles size={14} className="text-firefox-orange" /> Knowledge Base
            </span>
            <h1 className="text-3xl sm:text-4xl md:text-6xl font-display font-black mt-4 tracking-tighter text-white">
              Latest <span className="text-gradient">Insights</span>
            </h1>
          </header>

          <div className="flex flex-col lg:flex-row gap-12 lg:gap-16">
            
            {/* Left Column: Main Feed */}
            <div className="flex-1 max-w-3xl">
              
              {/* Mobile-only Top Insights (Trending) horizontal list */}
              {trendingBlogs.length > 0 && (
                <div className="lg:hidden mb-10 pb-6 border-b border-zinc-800">
                  <h3 className="text-sm font-black text-white uppercase tracking-widest mb-4 flex items-center gap-2">
                    <TrendingUp size={16} className="text-firefox-orange" /> Trending
                  </h3>
                  <div className="flex overflow-x-auto gap-4 snap-x snap-mandatory scrollbar-hide -mx-4 px-4">
                    {trendingBlogs.map((blog, i) => (
                      <div 
                        key={blog.id} 
                        onClick={() => navigate(`/blog/${blog.id}`)}
                        className="w-[75vw] sm:w-[50vw] shrink-0 snap-center bg-zinc-900 border border-zinc-800 rounded-2xl p-4 cursor-pointer"
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-5 h-5 rounded-full bg-zinc-800 flex items-center justify-center text-[8px] font-black text-white border border-zinc-700">
                            {blog.authorName.split(' ').map(n=>n[0]).join('').substring(0, 2)}
                          </div>
                          <span className="text-[10px] font-bold text-zinc-300 uppercase line-clamp-1">{blog.authorName}</span>
                        </div>
                        <h4 className="text-sm font-black text-white line-clamp-2 mb-1">{blog.title}</h4>
                        <span className="text-[10px] text-zinc-500">{blog.date}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Mobile-only Category Tabs */}
              {!loading && allCategories.length > 1 && (
                <div className="lg:hidden flex overflow-x-auto gap-2 mb-8 pb-2 snap-x scrollbar-hide -mx-4 px-4">
                  {allCategories.map(category => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={`snap-start shrink-0 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-colors border ${
                        selectedCategory === category 
                          ? 'bg-zinc-800 text-white border-zinc-700' 
                          : 'bg-transparent text-zinc-500 border-transparent hover:text-white'
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              )}

              {loading ? (
                <div className="flex justify-center p-20">
                  <PageLoader fullScreen={false} />
                </div>
              ) : filteredBlogs.length === 0 ? (
                <div className="text-center py-20 text-zinc-500">
                  <p className="mb-4">No insights found.</p>
                </div>
              ) : (
                <div className="flex flex-col">
                  {filteredBlogs.map((blog, i) => (
                    <motion.article
                      key={blog.id}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: "-50px" }}
                      className="group py-8 md:py-10 border-b border-zinc-800/50 last:border-0 cursor-pointer flex gap-6 md:gap-10 items-start justify-between hover:bg-zinc-900/20 transition-colors -mx-4 px-4 md:mx-0 md:px-0 rounded-2xl md:rounded-none"
                      onClick={() => navigate(`/blog/${blog.id}`)}
                    >
                      {/* Left Side: Content */}
                      <div className="flex-1 min-w-0 flex flex-col justify-center h-full">
                        {/* Author Info */}
                        <div className="flex items-center gap-2 mb-3 md:mb-4">
                          <div className="w-6 h-6 rounded-full bg-zinc-800 flex items-center justify-center text-[8px] font-black text-white border border-zinc-700 overflow-hidden">
                            {blog.authorName.split(' ').map(n=>n[0]).join('').substring(0, 2)}
                          </div>
                          <span className="text-xs font-bold text-zinc-300 line-clamp-1">{blog.authorName}</span>
                          <span className="text-xs text-zinc-600 hidden sm:inline">•</span>
                          <span className="text-xs text-zinc-500 hidden sm:inline">{blog.date}</span>
                          {blog.isExternal && (
                            <>
                              <span className="text-xs text-zinc-600 hidden sm:inline">•</span>
                              <span className="flex items-center gap-1 text-[10px] font-black uppercase text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-sm">
                                <ExternalLink size={10} /> External
                              </span>
                            </>
                          )}
                        </div>
                        
                        {/* Title & Excerpt */}
                        <h2 className="text-xl md:text-2xl font-black text-white mb-2 tracking-tight group-hover:text-firefox-orange transition-colors line-clamp-2 md:line-clamp-3 leading-snug">
                          {blog.title}
                        </h2>
                        <p className="hidden md:block text-zinc-400 text-sm leading-relaxed mb-4 line-clamp-2 font-serif text-lg">
                          {blog.excerpt}
                        </p>
                        
                        {/* Meta & Actions */}
                        <div className="flex items-center justify-between mt-auto pt-2">
                          <div className="flex items-center gap-4">
                            <span className="px-2 py-1 bg-zinc-900 rounded-full text-[10px] font-bold text-zinc-400 uppercase tracking-wider hidden sm:inline-block border border-zinc-800">
                              {blog.tags[0] || 'General'}
                            </span>
                            <span className="text-[11px] text-zinc-500 flex items-center gap-1 font-medium">
                              {blog.readTime}
                            </span>
                          </div>
                          
                          {/* Edit Action */}
                          {user && user.uid === blog.authorId && (
                            <button
                              onClick={(e) => { e.stopPropagation(); navigate(`/edit-blog/${blog.id}`); }}
                              className="text-zinc-500 hover:text-white transition-colors"
                              title="Edit Blog"
                            >
                              <Edit3 size={16} />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Right Side: Thumbnail Image */}
                      {blog.img && (
                        <div className="w-[80px] h-[80px] md:w-[140px] md:h-[140px] shrink-0 overflow-hidden rounded-xl bg-zinc-900 border border-zinc-800">
                          <img 
                            loading="lazy" 
                            src={blog.img} 
                            alt={blog.title} 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                          />
                        </div>
                      )}
                    </motion.article>
                  ))}
                </div>
              )}
            </div>

            {/* Right Column: Sticky Sidebar (Desktop Only) */}
            <aside className="hidden lg:block w-[320px] shrink-0 relative">
              <div className="sticky top-32 space-y-10">
                
                {/* Write CTA Block */}
                {user ? (
                  <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-2xl sm:rounded-[2rem] text-center">
                    <h3 className="text-xl font-black text-white mb-2">Got something to say?</h3>
                    <p className="text-zinc-400 text-sm mb-6">Share your knowledge with the community and earn points.</p>
                    <button 
                      onClick={() => navigate('/write-blog')}
                      className="w-full group flex items-center justify-center gap-3 px-6 py-4 bg-white text-black rounded-full text-xs font-black uppercase tracking-widest hover:scale-105 transition-all"
                    >
                      <PenTool size={14} /> Write Insight
                    </button>
                  </div>
                ) : (
                  <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-2xl sm:rounded-[2rem] text-center">
                    <h3 className="text-xl font-black text-white mb-2">Join the Discussion</h3>
                    <p className="text-zinc-400 text-sm mb-6">Sign in to read, earn points, and publish your own insights.</p>
                    <button 
                      onClick={() => navigate('/#login')}
                      className="w-full px-6 py-4 bg-firefox-orange text-white rounded-full text-xs font-black uppercase tracking-widest hover:scale-105 transition-all"
                    >
                      Sign In
                    </button>
                  </div>
                )}

                {/* Categories */}
                {!loading && allCategories.length > 1 && (
                  <div>
                    <h3 className="text-sm font-black text-white uppercase tracking-widest mb-4">Recommended Topics</h3>
                    <div className="flex flex-wrap gap-2">
                      {allCategories.map(category => (
                        <button
                          key={category}
                          onClick={() => setSelectedCategory(category)}
                          className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-colors border ${
                            selectedCategory === category 
                              ? 'bg-zinc-800 text-white border-zinc-700' 
                              : 'bg-transparent text-zinc-500 border-zinc-800 hover:border-zinc-600 hover:text-zinc-300'
                          }`}
                        >
                          {category}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Trending (Staff Picks equivalent) */}
                {trendingBlogs.length > 0 && (
                  <div>
                    <h3 className="text-sm font-black text-white uppercase tracking-widest mb-4 flex items-center gap-2">
                      <TrendingUp size={16} className="text-firefox-orange" /> Top Insights
                    </h3>
                    <div className="space-y-6">
                      {trendingBlogs.map((blog, i) => (
                        <div key={blog.id} className="cursor-pointer group flex gap-4" onClick={() => navigate(`/blog/${blog.id}`)}>
                          <div className="text-2xl font-black text-zinc-800 group-hover:text-firefox-orange transition-colors w-6">0{i+1}</div>
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <div className="w-4 h-4 rounded-full bg-zinc-800 flex items-center justify-center text-[6px] font-black text-white">
                                {blog.authorName.split(' ').map(n=>n[0]).join('').substring(0, 2)}
                              </div>
                              <span className="text-[10px] font-bold text-zinc-400">{blog.authorName}</span>
                            </div>
                            <h4 className="text-sm font-bold text-zinc-200 group-hover:text-white leading-snug line-clamp-2">{blog.title}</h4>
                            <span className="text-[10px] text-zinc-500 mt-1 block">{blog.date}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* AdSense Sidebar Block */}
                <AdSenseBlock adSlot="blogs_sidebar" className="mt-8" />
                
                {/* Footer Links */}
                <div className="flex flex-wrap gap-x-4 gap-y-2 text-[10px] text-zinc-600 uppercase font-bold tracking-wider pt-6 border-t border-zinc-800">
                  <a href="#" className="hover:text-zinc-400 transition-colors">Help</a>
                  <a href="#" className="hover:text-zinc-400 transition-colors">Privacy</a>
                  <a href="#" className="hover:text-zinc-400 transition-colors">Terms</a>
                  <a href="#" className="hover:text-zinc-400 transition-colors">About</a>
                </div>

              </div>
            </aside>
          </div>

          {/* AdSense Placeholder: Bottom Banner (Mobile Only) */}
          <div className="lg:hidden">
            <AdSenseBlock adSlot="blogs_bottom_banner" className="mt-12" />
          </div>
        </div>
      </main>

      {/* Mobile Floating Action Button (FAB) for Writing */}
      {user && (
        <button
          onClick={() => navigate('/write-blog')}
          className="lg:hidden fixed bottom-24 right-6 w-14 h-14 bg-white text-black rounded-full shadow-[0_8px_30px_rgba(255,255,255,0.2)] flex items-center justify-center z-50 hover:scale-105 active:scale-95 transition-all"
        >
          <PenTool size={20} />
        </button>
      )}

      {/* Global Style for scrollbar-hide */}
      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </>
  );
};

export default BlogsPage;
