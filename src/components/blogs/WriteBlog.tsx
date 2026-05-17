import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../lib/AuthContext';
import { db } from '../../lib/firebase';
import { collection, addDoc, doc, getDoc, updateDoc } from 'firebase/firestore';
import { ArrowLeft, Image as ImageIcon, Send } from 'lucide-react';
import { Blog } from '../../types/blog';

const WriteBlog = () => {
  const { id } = useParams<{ id: string }>();
  const { user, userProfile, setError, setSuccess } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(!!id);
  const [blogData, setBlogData] = useState<Blog | null>(null);
  
  const [formData, setFormData] = useState({
    title: '',
    excerpt: '',
    content: '',
    tags: '',
    img: ''
  });

  useEffect(() => {
    if (!id) return;
    
    const fetchBlog = async () => {
      try {
        const docRef = doc(db, 'blogs', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data() as Blog;
          if (data.authorId !== user?.uid) {
            setError("You can only edit your own blogs.");
            navigate('/blogs');
            return;
          }
          setBlogData(data);
          setFormData({
            title: data.title,
            excerpt: data.excerpt,
            content: data.content,
            tags: data.tags.join(', '),
            img: data.img
          });
        } else {
          setError("Blog not found.");
          navigate('/blogs');
        }
      } catch (err) {
        setError("Failed to load blog.");
      } finally {
        setFetching(false);
      }
    };
    
    if (user) {
      fetchBlog();
    }
  }, [id, user, navigate, setError]);

  if (!user) {
    return (
      <div className="min-h-screen pt-32 pb-20 px-4 bg-zinc-950 flex flex-col items-center justify-center">
        <p className="text-zinc-400 mb-4">You need to log in to write or edit a blog.</p>
        <button onClick={() => navigate('/')} className="px-6 py-2 bg-firefox-orange text-white rounded-full font-bold uppercase tracking-widest text-[10px]">
          Go Home
        </button>
      </div>
    );
  }

  if (fetching) {
    return (
      <div className="min-h-screen pt-32 pb-20 flex justify-center bg-zinc-950">
        <div className="w-12 h-12 border-4 border-firefox-orange border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.content) {
      setError('Title and content are required');
      return;
    }
    
    setLoading(true);
    try {
      const tagsArray = formData.tags.split(',').map(t => t.trim()).filter(t => t);
      const isCoreTeamOrAdmin = userProfile?.role === 'admin' || userProfile?.role === 'core_team' || userProfile?.role === 'president';
      
      if (id && blogData) {
        // Edit Mode
        const currentRepublishCount = blogData.republishCount || 0;
        if (currentRepublishCount >= 2) {
          setError('This blog has already been republished the maximum number of times (2).');
          setLoading(false);
          return;
        }

        const updatedBlog = {
          title: formData.title,
          excerpt: formData.excerpt,
          content: formData.content,
          tags: tagsArray.length > 0 ? tagsArray : ['General'],
          img: formData.img || 'https://images.unsplash.com/photo-1558486012-817176f44ec0?auto=format&fit=crop&q=80&w=800',
          republishCount: currentRepublishCount + 1,
          status: isCoreTeamOrAdmin ? 'approved' : 'pending',
          date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        };

        await updateDoc(doc(db, 'blogs', id), updatedBlog);
        setSuccess(isCoreTeamOrAdmin ? 'Blog republished successfully!' : 'Blog submitted for republish approval!');
      } else {
        // Create Mode
        const newBlog = {
          title: formData.title,
          excerpt: formData.excerpt,
          content: formData.content,
          tags: tagsArray.length > 0 ? tagsArray : ['General'],
          img: formData.img || 'https://images.unsplash.com/photo-1558486012-817176f44ec0?auto=format&fit=crop&q=80&w=800',
          authorId: user.uid,
          authorName: user.displayName || 'Anonymous',
          date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          readTime: `${Math.max(1, Math.ceil(formData.content.length / 1000))} min read`,
          status: isCoreTeamOrAdmin ? 'approved' : 'pending',
          createdAt: Date.now(),
          republishCount: 0
        };

        await addDoc(collection(db, 'blogs'), newBlog);
        setSuccess(isCoreTeamOrAdmin ? 'Blog published successfully!' : 'Blog submitted for approval!');
      }
      
      navigate('/blogs');
    } catch (err: any) {
      setError(err.message || 'Failed to submit blog');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-32 pb-20 px-4 bg-zinc-950">
      <div className="max-w-4xl mx-auto">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors mb-8 text-[10px] font-black uppercase tracking-widest"
        >
          <ArrowLeft size={14} /> Back
        </button>

        <div className="mb-12">
          <span className="text-zinc-500 font-bold text-xs uppercase tracking-[0.3em]">{id ? 'Edit Your Insight' : 'Share Your Knowledge'}</span>
          <h1 className="text-4xl md:text-6xl font-display font-black mt-4 tracking-tighter text-white">
            {id ? 'Republish' : 'Write an'} <span className="text-gradient">Insight</span>
          </h1>
          <p className="text-zinc-400 mt-4 max-w-xl">
            {userProfile?.role === 'admin' || userProfile?.role === 'core_team' || userProfile?.role === 'president' 
              ? "As an admin/core member, your blogs will be published immediately." 
              : "Submit your blog for review. It will be published once approved by an admin or core team member."}
          </p>
          {id && blogData && (
            <div className="mt-4 inline-block px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
              Republished: {blogData.republishCount || 0} / 2 times
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-4">Blog Title</label>
            <input 
              type="text" 
              required
              placeholder="e.g. The Future of React in 2026"
              value={formData.title}
              onChange={e => setFormData({...formData, title: e.target.value})}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-firefox-orange focus:ring-1 focus:ring-firefox-orange transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-4">Short Excerpt</label>
            <textarea 
              required
              rows={2}
              placeholder="A brief summary of your blog post..."
              value={formData.excerpt}
              onChange={e => setFormData({...formData, excerpt: e.target.value})}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-firefox-orange focus:ring-1 focus:ring-firefox-orange transition-all resize-none"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-4">Cover Image URL</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                <ImageIcon size={18} className="text-zinc-500" />
              </div>
              <input 
                type="url" 
                placeholder="https://example.com/image.jpg"
                value={formData.img}
                onChange={e => setFormData({...formData, img: e.target.value})}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl pl-14 pr-6 py-4 text-white focus:outline-none focus:border-firefox-orange focus:ring-1 focus:ring-firefox-orange transition-all"
              />
            </div>
            {formData.img && (
              <div className="mt-4 aspect-video rounded-2xl overflow-hidden border border-zinc-800 relative max-w-sm">
                <img src={formData.img} alt="Preview" className="w-full h-full object-cover" />
              </div>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-4">Content (Markdown Supported)</label>
            <textarea 
              required
              rows={15}
              placeholder="Write your amazing content here... You can use markdown for links, images, headings, etc."
              value={formData.content}
              onChange={e => setFormData({...formData, content: e.target.value})}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-firefox-orange focus:ring-1 focus:ring-firefox-orange transition-all font-mono text-sm"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-4">Tags (comma separated)</label>
            <input 
              type="text" 
              placeholder="React, Frontend, Web Dev"
              value={formData.tags}
              onChange={e => setFormData({...formData, tags: e.target.value})}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-firefox-orange focus:ring-1 focus:ring-firefox-orange transition-all"
            />
          </div>

          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading || (id !== undefined && (blogData?.republishCount || 0) >= 2)}
            className="w-full py-5 bg-gradient-to-r from-firefox-orange to-firefox-yellow text-white rounded-2xl font-black uppercase tracking-[0.2em] shadow-xl shadow-firefox-orange/20 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Submitting...' : (
              <>
                <Send size={18} />
                {id ? 'Republish Insight' : 'Submit Insight'}
              </>
            )}
          </motion.button>
        </form>
      </div>
    </div>
  );
};

export default WriteBlog;
