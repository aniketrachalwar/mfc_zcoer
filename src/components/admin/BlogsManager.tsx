import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { db } from '../../lib/firebase';
import { collection, query, getDocs, updateDoc, doc, deleteDoc, orderBy } from 'firebase/firestore';
import { Check, X, FileText, ExternalLink } from 'lucide-react';
import { Blog } from '../../types/blog';
import { useAuth } from '../../lib/AuthContext';

const BlogsManager = () => {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const { setError, setSuccess } = useAuth();

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    try {
      const q = query(collection(db, 'blogs'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      setBlogs(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Blog)));
    } catch (err: any) {
      setError('Failed to fetch blogs');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      await updateDoc(doc(db, 'blogs', id), { status: 'approved' });
      setSuccess('Blog approved successfully');
      fetchBlogs();
    } catch (err) {
      setError('Failed to approve blog');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this blog?')) return;
    try {
      await deleteDoc(doc(db, 'blogs', id));
      setSuccess('Blog deleted successfully');
      fetchBlogs();
    } catch (err) {
      setError('Failed to delete blog');
    }
  };

  if (loading) {
    return <div className="p-8 text-zinc-400">Loading blogs...</div>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-display font-black text-white tracking-tight">Blogs Manager</h2>
        <p className="text-zinc-400 text-sm mt-1">Approve or manage community blog posts</p>
      </div>

      <div className="grid gap-4">
        {blogs.length === 0 ? (
          <p className="text-zinc-500">No blogs submitted yet.</p>
        ) : (
          blogs.map(blog => (
            <motion.div 
              key={blog.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-6 bg-zinc-900 border border-zinc-800 rounded-2xl flex flex-col md:flex-row gap-6 items-start md:items-center justify-between"
            >
              <div className="flex items-center gap-6 flex-1">
                <div className="w-24 h-16 rounded-lg overflow-hidden shrink-0 border border-zinc-800">
                  <img src={blog.img} alt="Cover" className="w-full h-full object-cover" />
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="text-white font-bold">{blog.title}</h3>
                    {blog.status === 'pending' ? (
                      <span className="px-2 py-0.5 rounded-full bg-yellow-500/10 text-yellow-500 text-[10px] font-black uppercase tracking-widest border border-yellow-500/20">Pending</span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full bg-green-500/10 text-green-500 text-[10px] font-black uppercase tracking-widest border border-green-500/20">Approved</span>
                    )}
                  </div>
                  <p className="text-zinc-400 text-xs mb-2">{blog.excerpt}</p>
                  <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                    By {blog.authorName} • {blog.date}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 w-full md:w-auto shrink-0">
                {blog.status === 'pending' && (
                  <button
                    onClick={() => handleApprove(blog.id)}
                    className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-green-500/10 hover:bg-green-500/20 text-green-500 rounded-xl transition-colors text-[10px] font-black uppercase tracking-widest"
                  >
                    <Check size={14} /> Approve
                  </button>
                )}
                <button
                  onClick={() => handleDelete(blog.id)}
                  className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-xl transition-colors text-[10px] font-black uppercase tracking-widest"
                >
                  <X size={14} /> Delete
                </button>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};

export default BlogsManager;
