import React, { useState, useEffect } from 'react';
import { collection, getDocs, updateDoc, doc, arrayUnion } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../lib/AuthContext';
import { Navigate, useOutletContext } from 'react-router-dom';
import { Award, CheckCircle2, Shield, Users, Target, ShieldAlert } from 'lucide-react';
import { motion } from 'motion/react';
import PageLoader from '../PageLoader';

const TasksBoard = () => {
  const { user } = useAuth();
  const { profile, isTeamMember } = useOutletContext<{ profile: any, isTeamMember: boolean }>();
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'open' | 'mine'>('open');

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, 'tasks'));
      const list = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setTasks(list);
    } catch (err) {
      console.error("Error fetching tasks:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isTeamMember) {
      fetchTasks();
    } else {
      setLoading(false);
    }
  }, [isTeamMember]);

  if (!loading && !isTeamMember) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <ShieldAlert size={48} className="text-red-500 mb-4" />
        <h2 className="text-2xl font-display font-black uppercase text-white mb-2">Access Restricted</h2>
        <p className="text-zinc-400">Only Core Team Members and Active Contributors can view and claim tasks.</p>
      </div>
    );
  }

  const handleClaimTask = async (task: any) => {
    if (!user || !profile) return;
    
    // Check if task is full
    if (task.contributors && task.contributors.length >= task.maxContributors) {
      alert("This task has reached its maximum contributors limit.");
      return;
    }

    try {
      await updateDoc(doc(db, 'tasks', task.id), {
        status: 'in-progress',
        contributors: arrayUnion({
          userId: user.uid,
          name: profile.fullName || user.displayName,
          joinedAt: new Date().toISOString(),
          status: 'active'
        })
      });
      fetchTasks();
    } catch (err) {
      console.error("Error claiming task:", err);
      alert("Failed to claim task.");
    }
  };

  const openTasks = tasks.filter(t => 
    t.status !== 'completed' && 
    (!t.contributors || !t.contributors.some((c: any) => c.userId === user?.uid))
  );

  const myTasks = tasks.filter(t => 
    t.contributors && t.contributors.some((c: any) => c.userId === user?.uid)
  );

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-display font-black uppercase text-white mb-2">
          Tasks & <span className="text-firefox-orange">Bounties</span>
        </h1>
        <p className="text-zinc-400 text-sm">Claim responsibilities, contribute to the club, and build your portfolio.</p>
      </div>

      <div className="flex gap-4 mb-8 border-b border-white/10 overflow-x-auto hide-scrollbar">
        <button
          onClick={() => setActiveTab('open')}
          className={`pb-4 px-4 text-sm font-bold uppercase tracking-wider whitespace-nowrap transition-colors border-b-2 ${activeTab === 'open' ? 'border-firefox-orange text-firefox-orange' : 'border-transparent text-zinc-500 hover:text-zinc-300'}`}
        >
          <Target className="inline-block mr-2" size={16} />
          Open Tasks ({openTasks.length})
        </button>
        <button
          onClick={() => setActiveTab('mine')}
          className={`pb-4 px-4 text-sm font-bold uppercase tracking-wider whitespace-nowrap transition-colors border-b-2 ${activeTab === 'mine' ? 'border-firefox-orange text-firefox-orange' : 'border-transparent text-zinc-500 hover:text-zinc-300'}`}
        >
          <Shield className="inline-block mr-2" size={16} />
          My Active Tasks ({myTasks.length})
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <PageLoader fullScreen={false} />
        </div>
      ) : activeTab === 'open' ? (
        openTasks.length === 0 ? (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-12 text-center flex flex-col items-center justify-center">
            <div className="w-16 h-16 bg-white/5 border border-white/10 rounded-full flex items-center justify-center mb-4 text-zinc-500">
              <Target size={24} />
            </div>
            <h3 className="text-xl font-display font-bold text-white mb-2">No Open Tasks</h3>
            <p className="text-zinc-400 text-sm max-w-md">There are currently no open tasks or bounties available. Check back later!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {openTasks.map(task => (
              <motion.div 
                key={task.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-zinc-900/50 border border-white/10 hover:border-firefox-orange/30 rounded-2xl p-6 flex flex-col transition-all group"
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-bold text-white">{task.title}</h3>
                </div>
                <p className="text-zinc-400 text-sm mb-6 flex-1">{task.description}</p>
                <div className="border-t border-white/10 pt-4 mt-auto">
                  <div className="flex items-center justify-between mb-4 text-zinc-400 text-xs font-bold uppercase tracking-widest">
                    <div className="flex items-center gap-1">
                      <Users size={14} />
                      <span>{task.contributors?.length || 0}/{task.maxContributors} Filled</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleClaimTask(task)}
                    disabled={task.contributors?.length >= task.maxContributors}
                    className="w-full py-3 bg-white/5 hover:bg-firefox-orange/10 border border-white/10 hover:border-firefox-orange/30 text-white rounded-xl font-bold uppercase tracking-widest text-[10px] transition-colors disabled:opacity-50 disabled:cursor-not-allowed group-hover:text-firefox-orange"
                  >
                    {task.contributors?.length >= task.maxContributors ? 'Task Full' : 'Claim Responsibility'}
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )
      ) : (
        myTasks.length === 0 ? (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-12 text-center flex flex-col items-center justify-center">
            <div className="w-16 h-16 bg-white/5 border border-white/10 rounded-full flex items-center justify-center mb-4 text-zinc-500">
              <Shield size={24} />
            </div>
            <h3 className="text-xl font-display font-bold text-white mb-2">No Active Tasks</h3>
            <p className="text-zinc-400 text-sm max-w-md">You haven't claimed any tasks yet. Head over to the Open Tasks tab to find something to work on!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {myTasks.map(task => (
              <motion.div 
                key={task.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-zinc-900/50 border border-white/10 rounded-2xl p-6 flex flex-col relative overflow-hidden"
              >
                {task.status === 'completed' && (
                  <div className="absolute inset-0 bg-green-500/5 backdrop-blur-sm z-20 flex flex-col items-center justify-center text-center p-6 border border-green-500/20">
                    <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mb-4">
                      <CheckCircle2 size={32} className="text-green-500" />
                    </div>
                    <h4 className="text-lg font-bold text-white mb-1">Task Completed!</h4>
                    <p className="text-zinc-400 text-sm">This contribution has been added to your public profile.</p>
                  </div>
                )}
                
                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-bold text-white">{task.title}</h3>
                    <span className="px-3 py-1 bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 rounded-full text-[10px] font-black uppercase tracking-widest">
                      Active
                    </span>
                  </div>
                  <p className="text-zinc-400 text-sm mb-6">{task.description}</p>
                  <div className="bg-black/50 p-4 rounded-xl border border-white/5 flex items-start gap-3">
                    <Award size={16} className="text-firefox-orange shrink-0 mt-0.5" />
                    <p className="text-zinc-300 text-xs leading-relaxed">
                      You have claimed this task. Complete the work and notify an admin. Once verified, it will be added to your profile.
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )
      )}
    </div>
  );
};

export default TasksBoard;
