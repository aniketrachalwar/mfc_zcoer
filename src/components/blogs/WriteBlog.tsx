import { useState, useEffect, type FormEvent } from 'react';
import { motion } from 'motion/react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useAuth } from '../../lib/AuthContext';
import { db } from '../../lib/firebase';
import { collection, addDoc, doc, getDoc, updateDoc } from 'firebase/firestore';
import { ArrowLeft, Image as ImageIcon, Send, Link as LinkIcon, Sparkles } from 'lucide-react';
import { Blog } from '../../types/blog';
import MDEditor from '@uiw/react-md-editor';
import PageLoader from '../PageLoader';

const WriteBlog = () => {
  const { id } = useParams<{ id: string }>();
  const { user, userProfile, setError, setSuccess } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(!!id);
  const [blogData, setBlogData] = useState<Blog | null>(null);
  const [isExternal, setIsExternal] = useState(true);
  const [formData, setFormData] = useState({
    title: '',
    excerpt: '',
    content: '',
    tags: '',
    img: '',
    externalUrl: '',
    mcq: {
      question: '',
      options: ['', '', '', ''],
      correctOptionIndex: 0
    }
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
          setIsExternal(data.isExternal || false);
          setFormData({
            title: data.title,
            excerpt: data.excerpt,
            content: data.content,
            tags: data.tags.join(', '),
            img: data.img,
            externalUrl: data.externalUrl || '',
            mcq: data.mcq || { question: '', options: ['', '', '', ''], correctOptionIndex: 0 }
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
        <Link to="/" className="px-6 py-2 bg-firefox-orange text-white rounded-full font-bold uppercase tracking-widest text-[10px]">
          Return Home
        </Link>
      </div>
    );
  }

  if (fetching) {
    return (
      <div className="min-h-screen pt-32 pb-20 flex justify-center bg-zinc-950">
        <PageLoader fullScreen={false} />
      </div>
    );
  }

  const handleMcqOptionChange = (index: number, value: string) => {
    const newOptions = [...formData.mcq.options];
    newOptions[index] = value;
    setFormData(prev => ({ ...prev, mcq: { ...prev.mcq, options: newOptions } }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!formData.title) {
      setError('Title is required');
      return;
    }
    if (isExternal && !formData.externalUrl) {
      setError('External URL is required');
      return;
    }
    if (!isExternal && !formData.content) {
      setError('Content is required');
      return;
    }
    
    // MCQ validation
    if (formData.mcq.question) {
      if (formData.mcq.options.some(o => !o.trim())) {
        setError("All 4 MCQ options must be filled.");
        return;
      }
    }

    setLoading(true);
    try {
      const tagsArray = formData.tags.split(',').map(t => t.trim()).filter(t => t);
      const isCoreTeamOrAdmin = userProfile?.role === 'admin' || userProfile?.role === 'core_team' || userProfile?.role === 'president';
      
      let mcqData = null;
      if (formData.mcq.question && formData.mcq.options.every(o => o.trim())) {
        mcqData = formData.mcq;
      }

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
          isExternal,
          externalUrl: isExternal ? formData.externalUrl : '',
          mcq: mcqData
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
          republishCount: 0,
          isExternal,
          externalUrl: isExternal ? formData.externalUrl : '',
          mcq: mcqData,
          engagementScore: 0
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

        <div className="mb-12 flex flex-col sm:flex-row sm:items-end justify-between gap-6">
          <div>
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
          
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Toggle for External vs Native Blog */}
          <div className="flex p-1 bg-zinc-900 border border-zinc-800 rounded-xl w-full max-w-sm mb-8">
            <button
              type="button"
              onClick={() => setIsExternal(true)}
              className={`flex-1 py-2 text-xs font-black uppercase tracking-widest rounded-lg transition-all ${isExternal ? 'bg-firefox-orange text-white' : 'text-zinc-500 hover:text-white'}`}
            >
              External Link
            </button>
            <button
              type="button"
              onClick={() => setIsExternal(false)}
              className={`flex-1 py-2 text-xs font-black uppercase tracking-widest rounded-lg transition-all ${!isExternal ? 'bg-firefox-orange text-white' : 'text-zinc-500 hover:text-white'}`}
            >
              Write on Site
            </button>
          </div>

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

          {isExternal && (
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-4">External URL (LinkedIn, Medium, etc.)</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                  <LinkIcon size={18} className="text-zinc-500" />
                </div>
                <input 
                  type="url" 
                  required={isExternal}
                  placeholder="https://medium.com/..."
                  value={formData.externalUrl}
                  onChange={e => setFormData({...formData, externalUrl: e.target.value})}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl pl-14 pr-6 py-4 text-white focus:outline-none focus:border-firefox-orange focus:ring-1 focus:ring-firefox-orange transition-all"
                />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-4">Short Excerpt (Summary)</label>
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
                <img loading="lazy" src={formData.img} alt="Preview" className="w-full h-full object-cover" />
              </div>
            )}
          </div>

          {!isExternal && (
            <div className="space-y-2" data-color-mode="dark">
              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-4">Content</label>
              <MDEditor
                value={formData.content}
                onChange={(val) => setFormData({...formData, content: val || ''})}
                preview="edit"
                height={400}
                className="!bg-zinc-900 !border-zinc-800 rounded-2xl overflow-hidden"
              />
            </div>
          )}

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

          {/* Gamification MCQ Section */}
          <div className="p-6 border border-zinc-800 rounded-2xl bg-zinc-900/50 space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-white font-bold mb-1">Read-to-Earn Question</h3>
                <p className="text-zinc-400 text-sm">Add a multiple choice question to let readers earn points!</p>
              </div>
            </div>

            <div className="space-y-4">
              <input 
                type="text" 
                placeholder="E.g. What is the main topic of this blog?"
                value={formData.mcq.question}
                onChange={e => setFormData(prev => ({ ...prev, mcq: { ...prev.mcq, question: e.target.value } }))}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-firefox-orange focus:ring-1 focus:ring-firefox-orange transition-all"
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[0, 1, 2, 3].map(i => (
                  <div key={i} className="flex items-center gap-3">
                    <input 
                      type="radio" 
                      name="correctOption" 
                      checked={formData.mcq.correctOptionIndex === i}
                      onChange={() => setFormData(prev => ({ ...prev, mcq: { ...prev.mcq, correctOptionIndex: i } }))}
                      className="text-firefox-orange focus:ring-firefox-orange bg-zinc-950 border-zinc-800"
                    />
                    <input 
                      type="text" 
                      placeholder={`Option ${String.fromCharCode(65 + i)}`}
                      value={formData.mcq.options[i]}
                      onChange={e => handleMcqOptionChange(i, e.target.value)}
                      className={`flex-1 bg-zinc-950 border ${formData.mcq.correctOptionIndex === i ? 'border-firefox-orange/50' : 'border-zinc-800'} rounded-xl px-4 py-3 text-white focus:outline-none focus:border-firefox-orange focus:ring-1 focus:ring-firefox-orange transition-all`}
                    />
                  </div>
                ))}
              </div>
            </div>
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
