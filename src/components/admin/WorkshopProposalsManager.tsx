import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { CheckSquare, CheckCircle, XCircle, Loader2, Search, Lightbulb, Users } from 'lucide-react';
import { collection, getDocs, doc, updateDoc, query, orderBy } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../lib/AuthContext';
import PageLoader from '../PageLoader';

export default function WorkshopProposalsManager() {
  const [proposals, setProposals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const { setSuccessMessage, setError } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchProposals();
  }, []);

  const fetchProposals = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'workshopProposals'), orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      const props = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setProposals(props);
    } catch (err) {
      console.error("Error fetching proposals:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id: string, newStatus: string) => {
    if (!window.confirm(`Mark this proposal as ${newStatus}?`)) return;
    setProcessingId(id);
    try {
      await updateDoc(doc(db, 'workshopProposals', id), { status: newStatus });
      setSuccessMessage(`Proposal marked as ${newStatus}.`);
      fetchProposals();
    } catch (err) {
      console.error(err);
      setError('Update failed.');
    } finally {
      setProcessingId(null);
    }
  };

  const filteredProposals = proposals.filter(p => 
    p.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-firefox-orange/10 rounded-xl flex items-center justify-center text-firefox-orange">
            <Lightbulb size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-display font-black uppercase text-white tracking-tight">Workshop <span className="text-firefox-orange">Proposals</span></h2>
            <p className="text-zinc-400 text-sm">Review workshop and event ideas proposed by community members.</p>
          </div>
        </div>
        
        <div className="relative w-full md:w-64">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
          <input 
            type="text" 
            placeholder="Search proposals..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-sm focus:border-firefox-orange outline-none transition-colors text-white"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <PageLoader fullScreen={false} />
        </div>
      ) : (
        <div className="space-y-4">
          {filteredProposals.length === 0 ? (
            <div className="p-8 text-center bg-white/5 border border-white/10 rounded-2xl text-zinc-500">
              No proposals found.
            </div>
          ) : (
            filteredProposals.map((proposal) => (
              <motion.div 
                key={proposal.id} 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-zinc-900 border border-white/10 hover:border-white/20 rounded-2xl p-4 md:p-6 transition-all"
              >
                <div className="flex flex-col md:flex-row gap-4 md:items-center justify-between mb-4 pb-4 border-b border-white/5">
                  <div>
                    <h3 className="font-bold text-white text-lg">{proposal.title}</h3>
                    <p className="text-xs text-zinc-500 mt-1">Proposed by <span className="text-firefox-orange font-bold">{proposal.userName}</span> (@{proposal.userUsername})</p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${
                      proposal.status === 'approved' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                      proposal.status === 'rejected' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                      proposal.status === 'discussed' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                      'bg-yellow-500/20 text-yellow-500 border border-yellow-500/30'
                    }`}>
                      {proposal.status || 'pending'}
                    </span>
                    <span className="text-xs text-zinc-500">{new Date(proposal.createdAt?.toDate?.() || Date.now()).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6 mb-4">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">Scope & Details</p>
                    <p className="text-sm text-zinc-300 whitespace-pre-wrap bg-black/30 p-3 rounded-lg border border-white/5 min-h-[80px]">{proposal.scope}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">Expected Profit / Outcomes</p>
                    <p className="text-sm text-zinc-300 whitespace-pre-wrap bg-black/30 p-3 rounded-lg border border-white/5 min-h-[80px]">{proposal.profit}</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-6 mb-6 px-4 py-3 bg-black/50 rounded-xl border border-white/5">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1">Contact</p>
                    <p className="text-xs text-white">{proposal.phone}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1 flex items-center gap-1"><Users size={12}/> Team</p>
                    {proposal.isSolo ? (
                      <span className="text-xs text-zinc-400 bg-white/5 px-2 py-0.5 rounded">Solo Host</span>
                    ) : (
                      <div className="flex flex-wrap gap-1">
                        {proposal.cohosts?.map((c: any) => (
                          <span key={c.uid} className="text-[10px] bg-firefox-orange/10 text-firefox-orange px-2 py-0.5 rounded border border-firefox-orange/20">
                            {c.fullName}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex flex-wrap items-center justify-end gap-2 pt-4 border-t border-white/5">
                  <button
                    onClick={() => handleStatusUpdate(proposal.id, 'rejected')}
                    disabled={processingId === proposal.id}
                    className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg text-xs font-bold transition-colors disabled:opacity-50"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => handleStatusUpdate(proposal.id, 'discussed')}
                    disabled={processingId === proposal.id}
                    className="px-4 py-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-500 rounded-lg text-xs font-bold transition-colors disabled:opacity-50"
                  >
                    Mark Discussed
                  </button>
                  <button
                    onClick={() => handleStatusUpdate(proposal.id, 'approved')}
                    disabled={processingId === proposal.id}
                    className="px-4 py-2 bg-green-500/10 hover:bg-green-500/20 text-green-500 rounded-lg text-xs font-bold transition-colors disabled:opacity-50"
                  >
                    Approve
                  </button>
                </div>
              </motion.div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
