import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { useNavigate, useParams } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { ArrowLeft, Clock, Edit3 } from 'lucide-react';
import { db } from '../../lib/firebase';
import { useAuth } from '../../lib/AuthContext';
import { Blog } from '../../types/blog';

const BlogDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBlog = async () => {
      if (!id) {
        setLoading(false);
        return;
      }

      try {
        const blogSnap = await getDoc(doc(db, 'blogs', id));
        if (blogSnap.exists()) {
          const data = { id: blogSnap.id, ...blogSnap.data() } as Blog;
          if (data.status === 'approved' || data.authorId === user?.uid) {
            setBlog(data);
          }
        }
      } catch (err) {
        console.error('Failed to load blog:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBlog();
  }, [id, user?.uid]);

  if (loading) {
    return (
      <div className="min-h-screen pt-32 pb-20 flex justify-center bg-zinc-950">
        <div className="w-12 h-12 border-4 border-firefox-orange border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="min-h-screen pt-32 pb-20 px-4 bg-zinc-950 flex flex-col items-center justify-center text-center">
        <h1 className="text-4xl font-display font-black text-white tracking-tight mb-4">Insight not found</h1>
        <p className="text-zinc-400 mb-8">This insight may be pending approval or no longer available.</p>
        <button
          onClick={() => navigate('/blogs')}
          className="px-6 py-3 bg-firefox-orange text-white rounded-full text-[10px] font-black uppercase tracking-widest"
        >
          Back to Insights
        </button>
      </div>
    );
  }

  return (
    <article className="min-h-screen pt-32 pb-20 px-4 bg-zinc-950">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors mb-8 text-[10px] font-black uppercase tracking-widest"
        >
          <ArrowLeft size={14} /> Back
        </button>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex flex-wrap gap-2 mb-6">
            {blog.tags.map(tag => (
              <span key={tag} className="px-3 py-1 rounded-full bg-white/10 border border-white/10 text-[10px] font-bold text-zinc-300 uppercase tracking-widest">
                {tag}
              </span>
            ))}
          </div>

          <h1 className="text-4xl md:text-6xl font-display font-black tracking-tighter text-white mb-6">
            {blog.title}
          </h1>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-y border-white/10 py-5 mb-10">
            <div>
              <p className="text-xs font-black text-white uppercase tracking-widest">{blog.authorName}</p>
              <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-1">{blog.date}</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                <Clock size={12} /> {blog.readTime}
              </div>
              {user?.uid === blog.authorId && (
                <button
                  onClick={() => navigate(`/edit-blog/${blog.id}`)}
                  className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-firefox-orange text-white rounded-full transition-colors text-[10px] font-black uppercase tracking-widest"
                >
                  <Edit3 size={14} /> Edit
                </button>
              )}
            </div>
          </div>

          <div className="aspect-[16/9] overflow-hidden rounded-[2rem] border border-white/10 mb-10 bg-zinc-900">
            <img loading="lazy" src={blog.img} alt={blog.title} className="w-full h-full object-cover" />
          </div>

          <p className="text-xl text-zinc-300 font-medium leading-relaxed mb-10">{blog.excerpt}</p>

          <div className="prose prose-invert prose-zinc max-w-none">
            <p className="whitespace-pre-wrap text-zinc-300 leading-8">{blog.content}</p>
          </div>
        </motion.div>
      </div>
    </article>
  );
};

export default BlogDetails;
