import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { useNavigate, useParams } from 'react-router-dom';
import { doc, getDoc, updateDoc, increment, arrayUnion } from 'firebase/firestore';
import { ArrowLeft, Clock, Edit3, ExternalLink, CheckCircle2, XCircle } from 'lucide-react';
import { db } from '../../lib/firebase';
import { useAuth } from '../../lib/AuthContext';

import { Blog } from '../../types/blog';
import { Helmet } from 'react-helmet-async';
import MDEditor from '@uiw/react-md-editor';
import PageLoader from '../PageLoader';

const BlogDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, userProfile } = useAuth();
  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);

  // Gamification state
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [answerResult, setAnswerResult] = useState<'correct' | 'incorrect' | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [earnedPoints, setEarnedPoints] = useState(0);

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

  // Check if user already answered this MCQ
  useEffect(() => {
    if (userProfile && id && blog?.mcq) {
      if (userProfile.answeredBlogs?.includes(id)) {
        setHasAnswered(true);
      }
    }
  }, [userProfile, id, blog?.mcq]);

  if (loading) {
    return (
      <div className="min-h-screen pt-32 pb-20 flex justify-center bg-zinc-950">
        <PageLoader fullScreen={false} />
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

  const handleMCQSubmit = async () => {
    if (!user || selectedOption === null || !blog.mcq || hasAnswered || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const isCorrect = selectedOption === blog.mcq.correctOptionIndex;
      const userRef = doc(db, 'users', user.uid);
      
      if (isCorrect) {
        setAnswerResult('correct');
        const readerPoints = blog.isExternal ? 3 : 5;
        const authorPoints = blog.isExternal ? 0 : 1;
        setEarnedPoints(readerPoints);

        // Update Reader's points and add blog ID to answered list
        await updateDoc(userRef, {
          points: increment(readerPoints),
          answeredBlogs: arrayUnion(blog.id)
        });

        // Update Author's points (if it's not external)
        if (!blog.isExternal && blog.authorId) {
          const authorRef = doc(db, 'users', blog.authorId);
          await updateDoc(authorRef, {
            points: increment(authorPoints)
          }).catch(err => console.error("Could not award author points:", err));
        }
      } else {
        setAnswerResult('incorrect');
        setEarnedPoints(0);
        // Still mark as answered so they can't try again
        await updateDoc(userRef, {
          answeredBlogs: arrayUnion(blog.id)
        });
      }
      
      // Update Blog Engagement Score (5 for correct, 1 for attempt)
      const blogRef = doc(db, 'blogs', blog.id);
      await updateDoc(blogRef, {
        engagementScore: increment(isCorrect ? 5 : 1)
      }).catch(err => console.error("Could not update engagement score:", err));

      setHasAnswered(true);
    } catch (err) {
      console.error("Failed to submit MCQ:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>{blog.title} | MFC Open Web</title>
        <meta name="description" content={blog.excerpt} />
        <meta property="og:title" content={blog.title} />
        <meta property="og:description" content={blog.excerpt} />
        <meta property="og:image" content={blog.img} />
        <meta property="og:type" content="article" />
      </Helmet>
      
      <article className="min-h-screen pt-32 pb-20 px-4 bg-zinc-950">
        <div className="max-w-3xl mx-auto">
          <button
            onClick={() => {
              if (window.history.length > 2) {
                navigate(-1);
              } else {
                navigate('/blogs');
              }
            }}
            className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors mb-12 text-[10px] font-black uppercase tracking-widest min-h-[44px] bg-transparent border-none outline-none cursor-pointer"
          >
            <ArrowLeft size={14} /> Back
          </button>

          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
            <header className="mb-12">
              <div className="flex flex-wrap gap-2 mb-6">
                {blog.tags.map(tag => (
                  <span key={tag} className="px-3 py-1 rounded-full bg-white/10 border border-white/10 text-[10px] font-bold text-zinc-300 uppercase tracking-widest">
                    {tag}
                  </span>
                ))}
                {blog.isExternal && (
                  <span className="px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-[10px] font-bold text-blue-400 uppercase tracking-widest flex items-center gap-1">
                    <ExternalLink size={10} /> External
                  </span>
                )}
              </div>

              <h1 className="text-4xl md:text-5xl font-display font-black tracking-tight text-white mb-6 leading-[1.1]">
                {blog.title}
              </h1>
              
              <p className="text-xl text-zinc-400 font-medium leading-relaxed mb-8">{blog.excerpt}</p>

              <div className="flex items-center gap-4 py-6 border-t border-b border-zinc-800">
                <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-black text-white border border-zinc-700">
                  {blog.authorName.split(' ').map(n=>n[0]).join('').substring(0, 2)}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-white uppercase tracking-wider">{blog.authorName}</p>
                  <div className="flex items-center gap-3 mt-1 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                    <span>{blog.date}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1"><Clock size={10} /> {blog.readTime}</span>
                  </div>
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
            </header>

            {blog.img && (
              <div className="aspect-[16/9] overflow-hidden rounded-[2rem] border border-zinc-800 mb-12 bg-zinc-900">
                <img loading="lazy" src={blog.img} alt={blog.title} className="w-full h-full object-cover" />
              </div>
            )}

            {/* AdSense Placeholder: Top Banner */}


            <div className="prose prose-invert prose-zinc max-w-none text-lg leading-relaxed text-zinc-300 font-serif" data-color-mode="dark">
              {blog.isExternal && blog.externalUrl ? (
                <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-2xl text-center mb-10">
                  <p className="mb-6 font-sans">This is an external insight published on another platform. Read the full text there and return here to test your knowledge!</p>
                  <a 
                    href={blog.externalUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-8 py-4 bg-firefox-orange text-white rounded-full font-bold uppercase tracking-widest text-xs shadow-lg shadow-firefox-orange/20 hover:scale-105 transition-transform font-sans"
                  >
                    Read Full Article <ExternalLink size={14} />
                  </a>
                </div>
              ) : null}
              
              <div className="markdown-body !bg-transparent !text-zinc-300">
                <MDEditor.Markdown source={blog.content} style={{ backgroundColor: 'transparent', fontSize: '1.125rem' }} />
              </div>
            </div>

            {/* AdSense Placeholder: Bottom Banner */}


            {/* Gamification MCQ Section */}
            {blog.mcq && (
              <div className="bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-800 p-8 rounded-3xl mt-16 mb-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-firefox-orange/5 rounded-full blur-3xl pointer-events-none" />
                
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="px-3 py-1 bg-firefox-orange/10 text-firefox-orange rounded-full text-[10px] font-black uppercase tracking-widest">
                      Read To Earn
                    </span>
                    {hasAnswered && (
                      <span className="px-3 py-1 bg-green-500/10 text-green-400 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1">
                        <CheckCircle2 size={12} /> Completed
                      </span>
                    )}
                  </div>
                  <h3 className="text-2xl font-black text-white mb-6">Test your knowledge</h3>
                  <p className="text-zinc-300 mb-8 text-lg">{blog.mcq.question}</p>

                  <div className="space-y-3 mb-8">
                    {blog.mcq.options.map((option, index) => (
                      <button
                        key={index}
                        onClick={() => !hasAnswered && setSelectedOption(index)}
                        disabled={hasAnswered || isSubmitting}
                        className={`w-full text-left px-6 py-4 rounded-xl border transition-all ${
                          hasAnswered && index === blog.mcq?.correctOptionIndex
                            ? 'bg-green-500/10 border-green-500/50 text-white'
                            : hasAnswered && selectedOption === index
                              ? 'bg-red-500/10 border-red-500/50 text-white'
                              : selectedOption === index
                                ? 'bg-firefox-orange/10 border-firefox-orange text-white'
                                : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-600 hover:text-white'
                        }`}
                      >
                        <span className="font-bold mr-4 opacity-50">{String.fromCharCode(65 + index)}.</span>
                        {option}
                      </button>
                    ))}
                  </div>

                  {!hasAnswered && (
                    <div className="flex items-center justify-end">
                      <button
                        onClick={handleMCQSubmit}
                        disabled={selectedOption === null || isSubmitting}
                        className="px-8 py-3 bg-firefox-orange text-white rounded-full font-bold uppercase tracking-widest text-xs disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-firefox-orange/20"
                      >
                        {isSubmitting ? 'Checking...' : 'Submit Answer'}
                      </button>
                    </div>
                  )}

                  {hasAnswered && (
                    <div className={`p-4 rounded-xl flex items-center gap-3 border ${
                      answerResult === 'incorrect' 
                        ? 'bg-red-500/10 border-red-500/20' 
                        : answerResult === 'correct' 
                          ? 'bg-green-500/10 border-green-500/20' 
                          : 'bg-zinc-800/50 border-zinc-700'
                    }`}>
                      {answerResult === 'incorrect' ? (
                        <XCircle className="text-red-500" size={24} />
                      ) : answerResult === 'correct' ? (
                        <CheckCircle2 className="text-green-500" size={24} />
                      ) : (
                        <CheckCircle2 className="text-zinc-500" size={24} />
                      )}
                      <div>
                        {answerResult === 'incorrect' ? (
                          <>
                            <p className="text-red-500 font-bold">Incorrect</p>
                            <p className="text-red-500/80 text-sm">You didn't earn points for this insight. Better luck next time!</p>
                          </>
                        ) : answerResult === 'correct' ? (
                          <>
                            <p className="text-green-500 font-bold">Great job!</p>
                            <p className="text-green-500/80 text-sm">You earned {earnedPoints} points for reading this insight.</p>
                          </>
                        ) : (
                          <>
                            <p className="text-zinc-300 font-bold">Completed</p>
                            <p className="text-zinc-400 text-sm">You have already answered this question.</p>
                          </>
                        )}
                      </div>
                    </div>
                  )}

                  {!user && (
                    <div className="absolute inset-0 bg-zinc-950/80 backdrop-blur-sm rounded-3xl flex flex-col items-center justify-center p-8 text-center border border-zinc-800">
                      <h4 className="text-2xl font-black text-white mb-2">Want to earn points?</h4>
                      <p className="text-zinc-400 mb-6">Log in to test your knowledge and climb the leaderboard.</p>
                      <button
                        onClick={() => navigate('/#login')}
                        className="px-8 py-3 bg-white text-black rounded-full font-bold uppercase tracking-widest text-xs hover:scale-105 transition-transform"
                      >
                        Log In Now
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </article>
    </>
  );
};

export default BlogDetails;
