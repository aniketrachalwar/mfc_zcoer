import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, updateDoc, setDoc, query, orderBy } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { CheckCircle, XCircle, Loader2, ExternalLink } from 'lucide-react';
import { motion } from 'motion/react';

const TeamApplicationsList = () => {
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Record<string, { role: string, cohort: string }>>({});

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'team_applications'), orderBy('appliedAt', 'desc'));
      const snap = await getDocs(q);
      const apps = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
      setApplications(apps);
      
      // Initialize edit data for pending applications
      const initialEditData: Record<string, { role: string, cohort: string }> = {};
      apps.forEach(app => {
        if (app.status === 'pending') {
          initialEditData[app.id] = { role: app.role, cohort: '25-26' };
        }
      });
      setEditData(initialEditData);
    } catch (err) {
      console.error("Error fetching applications:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const handleUpdateStatus = async (app: any, status: 'approved' | 'rejected', finalRole: string = '', finalCohort: string = '') => {
    if (!window.confirm(`Are you sure you want to mark this application as ${status}?`)) return;
    setProcessingId(app.id);
    try {
      await updateDoc(doc(db, 'team_applications', app.id), { status });
      
      if (status === 'approved') {
        const docId = `${app.userId}_${finalCohort}`;
        await setDoc(doc(db, 'team', docId), {
          userId: app.userId,
          role: finalRole,
          category: 'Active Contributors',
          cohort: finalCohort,
          addedAt: new Date().toISOString()
        });
      }
      
      fetchApplications();
    } catch (err) {
      console.error(err);
      alert('Failed to update status.');
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <Loader2 className="w-8 h-8 text-firefox-orange animate-spin mx-auto" />
      </div>
    );
  }

  if (applications.length === 0) {
    return (
      <div className="text-center py-12 bg-white/5 border border-white/10 rounded-3xl">
        <p className="text-zinc-500">No applications received yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {applications.map((app) => (
        <motion.div 
          key={app.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-zinc-900 border border-white/10 rounded-2xl p-6"
        >
          <div className="flex flex-col md:flex-row justify-between gap-6">
            <div className="space-y-4 flex-1">
              <div className="flex items-center gap-3">
                <h3 className="text-xl font-display font-black text-white">{app.fullName}</h3>
                <span className={`px-2 py-1 rounded text-[10px] font-black uppercase tracking-widest ${
                  app.status === 'pending' ? 'bg-yellow-500/20 text-yellow-500' :
                  app.status === 'approved' ? 'bg-green-500/20 text-green-500' :
                  'bg-red-500/20 text-red-500'
                }`}>
                  {app.status}
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-zinc-500 block text-[10px] uppercase tracking-widest">Email</span>
                  <span className="text-white">{app.email}</span>
                </div>
                <div>
                  <span className="text-zinc-500 block text-[10px] uppercase tracking-widest">Role</span>
                  <span className="text-firefox-orange font-bold">{app.role}</span>
                </div>
              </div>

              <div>
                <span className="text-zinc-500 block text-[10px] uppercase tracking-widest mb-1">Pitch</span>
                <p className="text-zinc-300 text-sm whitespace-pre-wrap bg-black/50 p-4 rounded-xl border border-white/5">
                  {app.pitch}
                </p>
              </div>

              {(app.github || app.linkedin || app.portfolio) && (
                <div className="flex gap-4 pt-2">
                  {app.github && (
                    <a href={app.github} target="_blank" rel="noreferrer" className="text-xs text-zinc-400 hover:text-white flex items-center gap-1">
                      <ExternalLink size={12} /> GitHub
                    </a>
                  )}
                  {app.linkedin && (
                    <a href={app.linkedin} target="_blank" rel="noreferrer" className="text-xs text-zinc-400 hover:text-white flex items-center gap-1">
                      <ExternalLink size={12} /> LinkedIn
                    </a>
                  )}
                  {app.portfolio && (
                    <a href={app.portfolio} target="_blank" rel="noreferrer" className="text-xs text-zinc-400 hover:text-white flex items-center gap-1">
                      <ExternalLink size={12} /> Portfolio
                    </a>
                  )}
                </div>
              )}
            </div>

            {app.status === 'pending' && (
              <div className="flex flex-col gap-3 shrink-0 bg-white/5 p-4 rounded-xl border border-white/10 w-full md:w-64">
                <div>
                  <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold block mb-1">Assign Role</label>
                  <input 
                    type="text" 
                    value={editData[app.id]?.role ?? app.role}
                    onChange={(e) => setEditData({...editData, [app.id]: { ...editData[app.id], role: e.target.value }})}
                    className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-firefox-orange transition-colors"
                  />
                </div>
                
                <div>
                  <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold block mb-1">Academic Year</label>
                  <select 
                    value={editData[app.id]?.cohort ?? '25-26'}
                    onChange={(e) => setEditData({...editData, [app.id]: { ...editData[app.id], cohort: e.target.value }})}
                    className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-firefox-orange transition-colors"
                  >
                    <option value="25-26">25-26</option>
                    <option value="26-27">26-27</option>
                    <option value="27-28">27-28</option>
                  </select>
                </div>

                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => handleUpdateStatus(app, 'approved', editData[app.id]?.role || app.role, editData[app.id]?.cohort || '25-26')}
                    disabled={processingId === app.id}
                    className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-green-500/10 text-green-500 hover:bg-green-500 hover:text-white rounded-lg transition-colors font-bold text-xs"
                  >
                    <CheckCircle size={14} /> Approve
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(app, 'rejected')}
                    disabled={processingId === app.id}
                    className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-lg transition-colors font-bold text-xs"
                  >
                    <XCircle size={14} /> Reject
                  </button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default TeamApplicationsList;
