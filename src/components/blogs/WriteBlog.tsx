import { useState, useEffect, type FormEvent } from 'react';
import { motion } from 'motion/react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useAuth } from '../../lib/AuthContext';
import { db } from '../../lib/firebase';
import { collection, addDoc, doc, getDoc, updateDoc } from 'firebase/firestore';
import { ArrowLeft, Image as ImageIcon, Send, Link as LinkIcon, Sparkles } from 'lucide-react';
import { Blog } from '../../types/blog';
import MDEditor from '@uiw/react-md-editor';
import { GoogleGenAI } from '@google/genai';

const WriteBlog = () => {
  const { id } = useParams<{ id: string }>();
  const { user, userProfile, setError, setSuccess } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(!!id);
  const [blogData, setBlogData] = useState<Blog | null>(null);
  const [generatingMcq, setGeneratingMcq] = useState(false);
  const [trendingTopics, setTrendingTopics] = useState<string>('');
  const [fetchingTrends, setFetchingTrends] = useState(false);
  
  const [isExternal, setIsExternal] = useState(false);
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
        <div className="w-12 h-12 border-4 border-firefox-orange border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const handleGenerateMCQ = async () => {
    if (!formData.content || formData.content.length < 50) {
      setError("Please write some content first so the AI can generate a question.");
      return;
    }
    setGeneratingMcq(true);
    try {
      const ai = new GoogleGenAI({ apiKey: 'AIzaSyCJ6kN-OCeb65dRwMqK4hJQPh55DBYXhoI' });
      const prompt = `Based on the following blog content, generate one multiple choice question with exactly 4 options. Return ONLY a JSON object in this exact format, nothing else:
{
  "question": "The question text here?",
  "options": ["Option A", "Option B", "Option C", "Option D"],
  "correctOptionIndex": 0
}

Blog Content:
${formData.content.substring(0, 5000)}
`;
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt
      });
      const text = response.text || '';
      // Extract json if wrapped in markdown
      const jsonMatch = text.match(/```(?:json)?\n?([\s\S]*?)```/);
      const jsonStr = jsonMatch ? jsonMatch[1] : text;
      
      const parsed = JSON.parse(jsonStr);
      if (parsed.question && parsed.options && parsed.options.length === 4) {
        setFormData(prev => ({ ...prev, mcq: parsed }));
        setSuccess("MCQ generated successfully!");
      } else {
        throw new Error("Invalid format from AI");
      }
    } catch (err: any) {
      console.error(err);
      setError("Failed to generate MCQ. Please try again or write manually.");
    } finally {
      setGeneratingMcq(false);
    }
  };

  const handleGetTrendingTopics = async () => {
    setFetchingTrends(true);
    try {
      const ai = new GoogleGenAI({ apiKey: 'AIzaSyCJ6kN-OCeb65dRwMqK4hJQPh55DBYXhoI' });
      const prompt = `Give me a list of 5 currently trending topics in Technology and Software Engineering that would make great blog posts. For each topic, provide a short 1-sentence idea for what the blog could cover. Format the output as a simple Markdown list. Do not include any conversational text.`;
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt
      });
      setTrendingTopics(response.text || 'Failed to generate topics.');
    } catch (err: any) {
      console.error(err);
      setError("Failed to fetch trending topics. Please try again.");
    } finally {
      setFetchingTrends(false);
    }
  };

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
          onClick={() => navigate('/blogs')}
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
          
          {/* Toggle Type */}
          {!id && (
            <div className="flex bg-zinc-900 p-1 rounded-full border border-zinc-800 self-start">
              <button 
                type="button"
                onClick={() => setIsExternal(false)}
                className={`px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all ${!isExternal ? 'bg-firefox-orange text-white' : 'text-zinc-500 hover:text-white'}`}
              >
                Write Post
              </button>
              <button 
                type="button"
                onClick={() => setIsExternal(true)}
                className={`px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all ${isExternal ? 'bg-firefox-orange text-white' : 'text-zinc-500 hover:text-white'}`}
              >
                External Link
              </button>
            </div>
          )}
        </div>

        {/* Trending Topics Inspiration Block */}
        {!id && (
          <div className="mb-10 p-6 bg-zinc-900/50 border border-zinc-800 rounded-3xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-white font-black text-xl flex items-center gap-2 mb-1">
                  <Sparkles size={20} className="text-firefox-orange" /> Need Inspiration?
                </h3>
                <p className="text-zinc-400 text-sm">Get AI-generated trending topics in Tech to write about.</p>
              </div>
              <button
                type="button"
                onClick={handleGetTrendingTopics}
                disabled={fetchingTrends}
                className="px-6 py-3 bg-white/5 hover:bg-firefox-orange text-white rounded-full text-xs font-black uppercase tracking-widest transition-colors disabled:opacity-50 shrink-0"
              >
                {fetchingTrends ? 'Fetching...' : 'Show Trends'}
              </button>
            </div>
            
            {trendingTopics && (
              <div className="mt-6 pt-6 border-t border-zinc-800">
                <div className="prose prose-invert prose-zinc max-w-none text-sm leading-relaxed" data-color-mode="dark">
                  <MDEditor.Markdown source={trendingTopics} style={{ backgroundColor: 'transparent' }} />
                </div>
              </div>
            )}
          </div>
        )}

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
              <button
                type="button"
                onClick={handleGenerateMCQ}
                disabled={generatingMcq || !formData.content}
                className="flex items-center gap-2 px-4 py-2 bg-firefox-orange/10 hover:bg-firefox-orange/20 text-firefox-orange rounded-full text-xs font-bold uppercase tracking-widest transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Sparkles size={14} />
                {generatingMcq ? 'Generating...' : 'Auto-Generate'}
              </button>
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
