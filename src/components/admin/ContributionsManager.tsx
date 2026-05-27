import React, { useState, useEffect } from 'react';
import { collection, getDocs, getDoc, addDoc, updateDoc, doc, arrayUnion } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { motion, AnimatePresence } from 'motion/react';
import { Award, Plus, X, Users, CheckCircle2, Shield, Loader2 } from 'lucide-react';

const ContributionsManager = () => {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    maxContributors: 1,
    pointsReward: 0,
    status: 'open'
  });

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, 'tasks'));
      const list = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setTasks(list.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    } catch (err) {
      console.error("Error fetching tasks:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'tasks'), {
        ...formData,
        contributors: [],
        createdAt: new Date().toISOString()
      });
      setIsFormOpen(false);
      setFormData({ title: '', description: '', maxContributors: 1, pointsReward: 0, status: 'open' });
      fetchTasks();
    } catch (err) {
      console.error("Error creating task:", err);
      alert("Failed to create task");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMarkCompleted = async (task: any) => {
    if (!window.confirm("Mark this task as completed for all current contributors?")) return;
    
    try {
      // 1. Mark task as completed
      await updateDoc(doc(db, 'tasks', task.id), { status: 'completed' });

      // 2. Add points and the task to each contributor's profile internally
      if (task.contributors && task.contributors.length > 0) {
        for (const contributor of task.contributors) {
          const userRef = doc(db, 'users', contributor.userId);
          const userDoc = await getDoc(userRef);
          const currentPoints = userDoc.exists() ? (userDoc.data().points || 0) : 0;
          
          await updateDoc(userRef, {
            points: currentPoints + (task.pointsReward || 50),
            completedTasks: arrayUnion({
              taskId: task.id,
              title: task.title,
              pointsEarned: task.pointsReward || 50,
              completedAt: new Date().toISOString()
            })
          });
        }
      }

      fetchTasks();
    } catch (err) {
      console.error("Error marking task completed:", err);
      alert("Failed to complete task.");
    }
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-display font-black uppercase text-white mb-2">
            Tasks & <span className="text-firefox-orange">Bounties</span>
          </h1>
          <p className="text-zinc-400 text-sm">Assign responsibilities to team members and track contributions.</p>
        </div>
        <button 
          onClick={() => setIsFormOpen(true)}
          className="flex items-center gap-2 px-6 py-3 bg-firefox-orange text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-orange-600 transition-colors"
        >
          <Plus size={16} />
          Create Task
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-firefox-orange border-t-transparent rounded-full animate-spin" />
        </div>
      ) : tasks.length === 0 ? (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-12 text-center flex flex-col items-center justify-center">
          <div className="w-16 h-16 bg-white/5 border border-white/10 rounded-full flex items-center justify-center mb-4 text-zinc-500">
            <Award size={24} />
          </div>
          <h3 className="text-xl font-display font-bold text-white mb-2">No Tasks Found</h3>
          <p className="text-zinc-400 text-sm max-w-md">You haven't created any tasks or responsibilities for the team yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {tasks.map(task => (
            <div key={task.id} className="bg-zinc-900/50 border border-white/10 rounded-2xl p-6 flex flex-col relative overflow-hidden">
              {task.status === 'completed' && (
                <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 blur-3xl pointer-events-none" />
              )}
              
              <div className="flex justify-between items-start mb-4 relative z-10">
                <div className="flex-1 pr-4">
                  <h3 className="text-lg font-bold text-white mb-1">{task.title}</h3>
                  <p className="text-xs font-black uppercase tracking-widest text-firefox-orange">Reward: {task.pointsReward || 50} Points</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                  task.status === 'completed' ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 
                  task.status === 'in-progress' ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20' : 
                  'bg-firefox-orange/10 text-firefox-orange border border-firefox-orange/20'
                }`}>
                  {task.status}
                </span>
              </div>
              
              <p className="text-zinc-400 text-sm mb-6 flex-1 relative z-10">{task.description}</p>
              
              <div className="border-t border-white/10 pt-4 mt-auto relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2 text-zinc-400 text-xs font-bold uppercase tracking-widest">
                    <Users size={14} />
                    <span>Contributors ({task.contributors?.length || 0}/{task.maxContributors})</span>
                  </div>
                </div>
                
                {task.contributors && task.contributors.length > 0 ? (
                  <div className="space-y-2 mb-4">
                    {task.contributors.map((c: any, i: number) => (
                      <div key={i} className="flex items-center gap-2 bg-black/50 px-3 py-2 rounded-lg border border-white/5">
                        <div className="w-6 h-6 rounded-full bg-firefox-orange/20 flex items-center justify-center text-firefox-orange text-xs font-bold">
                          {c.name.charAt(0)}
                        </div>
                        <span className="text-sm text-zinc-300">{c.name}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-zinc-500 text-sm mb-4">No team members have claimed this task yet.</p>
                )}
                
                {task.status !== 'completed' && (
                  <button 
                    onClick={() => handleMarkCompleted(task)}
                    className="w-full py-3 bg-white/5 hover:bg-green-500/10 hover:text-green-500 hover:border-green-500/30 border border-white/10 text-white rounded-xl font-bold uppercase tracking-widest text-[10px] transition-colors flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 size={16} />
                    Mark Completed & Award Credit
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Form Modal */}
      <AnimatePresence>
        {isFormOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsFormOpen(false)} />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-zinc-950 border border-white/10 rounded-3xl w-full max-w-lg relative z-10 shadow-2xl flex flex-col"
            >
              <div className="p-6 border-b border-white/10 flex justify-between items-center">
                <h2 className="text-xl font-display font-black uppercase text-white">Create New Task</h2>
                <button onClick={() => setIsFormOpen(false)} className="text-zinc-500 hover:text-white transition-colors">
                  <X size={20} />
                </button>
              </div>
              
              <div className="p-6">
                <form id="task-form" onSubmit={handleCreateTask} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Task Title</label>
                    <input 
                      type="text" 
                      required 
                      value={formData.title}
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-firefox-orange outline-none" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Description / Instructions</label>
                    <textarea 
                      required 
                      rows={4} 
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-firefox-orange outline-none resize-none" 
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Max Contributors</label>
                      <input 
                        type="number" 
                        min="1" 
                        max="10" 
                        required 
                        value={formData.maxContributors}
                        onChange={(e) => setFormData({...formData, maxContributors: parseInt(e.target.value)})}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-firefox-orange outline-none" 
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Points Reward</label>
                      <input 
                        type="number" 
                        min="0" 
                        required 
                        value={formData.pointsReward}
                        onChange={(e) => setFormData({...formData, pointsReward: parseInt(e.target.value)})}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-firefox-orange outline-none" 
                      />
                    </div>
                  </div>
                </form>
              </div>

              <div className="p-6 border-t border-white/10 flex gap-4">
                <button onClick={() => setIsFormOpen(false)} className="flex-1 px-4 py-3 bg-white/5 text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-white/10 transition-colors">
                  Cancel
                </button>
                <button 
                  onClick={(e) => {
                    const form = document.getElementById('task-form') as HTMLFormElement;
                    if (form.checkValidity()) handleCreateTask(e as any);
                    else form.reportValidity();
                  }} 
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-3 bg-firefox-orange text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-orange-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Shield size={16} />}
                  Publish Task
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ContributionsManager;
