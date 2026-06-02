import PageLoader from '../PageLoader';
import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { CheckSquare, CheckCircle, XCircle, Loader2, Search, Zap, Hand } from 'lucide-react';
import { collection, getDocs, doc, updateDoc, query, orderBy } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../lib/AuthContext';

export default function ApplicationsManager() {
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const { setSuccessMessage, setError } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'payments'), orderBy('timestamp', 'desc'));
      const snap = await getDocs(q);
      const apps = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setApplications(apps);
    } catch (err) {
      console.error("Error fetching applications:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (app: any) => {
    if (!window.confirm(`Approve membership for ${app.userName}?`)) return;
    setProcessingId(app.id);
    try {
      await updateDoc(doc(db, 'payments', app.id), { status: 'verified', paymentStatus: 'verified' });
      
      const userUpdate: any = { membershipStatus: 'verified' };
      if (app.requestedTier) {
         userUpdate.membershipTier = app.requestedTier;
      }
      
      await updateDoc(doc(db, 'users', app.userId), userUpdate);
      setSuccessMessage('Membership approved!');
      fetchApplications();
    } catch (err) {
      console.error(err);
      setError('Approval failed.');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (app: any) => {
    if (!window.confirm(`Reject membership for ${app.userName}?`)) return;
    setProcessingId(app.id);
    try {
      await updateDoc(doc(db, 'payments', app.id), { status: 'failed', paymentStatus: 'failed' });
      await updateDoc(doc(db, 'users', app.userId), { membershipStatus: 'public' });
      setSuccessMessage('Membership rejected.');
      fetchApplications();
    } catch (err) {
      console.error(err);
      setError('Rejection failed.');
    } finally {
      setProcessingId(null);
    }
  };

  const filteredApps = applications.filter(app => 
    app.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.transactionId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.razorpayPaymentId?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-firefox-orange/10 rounded-xl flex items-center justify-center text-firefox-orange">
            <CheckSquare size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-display font-black uppercase text-white tracking-tight">Membership <span className="text-firefox-orange">Applications</span></h2>
            <p className="text-zinc-400 text-sm">Verify manual payments and monitor automated Razorpay transactions.</p>
          </div>
        </div>
        
        <div className="relative w-full md:w-64">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
          <input 
            type="text" 
            placeholder="Search applications..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-sm focus:border-firefox-orange outline-none transition-colors"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <PageLoader fullScreen={false} />
        </div>
      ) : (
        <div className="space-y-4">
          {filteredApps.length === 0 ? (
            <div className="p-8 text-center bg-white/5 border border-white/10 rounded-2xl text-zinc-500">
              No applications found.
            </div>
          ) : (
            filteredApps.map((app) => (
              <motion.div 
                key={app.id} 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-zinc-900 border border-white/10 hover:border-white/20 rounded-2xl p-4 md:p-6 transition-all"
              >
                <div className="flex flex-col md:flex-row gap-4 md:items-center justify-between mb-4">
                  <div>
                    <h3 className="font-bold text-white text-lg">{app.userName}</h3>
                    <p className="text-xs text-zinc-500">{app.userEmail}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${
                      app.status === 'verified' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                      app.status === 'failed' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                      'bg-yellow-500/20 text-yellow-500 border border-yellow-500/30'
                    }`}>
                      {app.status}
                    </span>
                    {app.gateway === 'razorpay' ? (
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-md text-[10px] font-bold uppercase tracking-wider">
                        <Zap size={12} /> Auto
                      </div>
                    ) : (
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-zinc-800 text-zinc-300 border border-white/10 rounded-md text-[10px] font-bold uppercase tracking-wider">
                        <Hand size={12} /> Manual
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 p-4 bg-black/50 rounded-xl border border-white/5">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1">Amount</p>
                    <p className="font-mono text-firefox-orange font-bold">₹{app.amount}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1">Requested Tier</p>
                    <p className="text-sm font-bold capitalize text-white">{app.requestedTier || 'Default'}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1">Transaction ID</p>
                    <div className="font-mono text-zinc-300 text-xs truncate" title={app.gateway === 'razorpay' ? app.razorpayPaymentId : app.transactionId}>
                      {app.gateway === 'razorpay' ? app.razorpayPaymentId : app.transactionId}
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-4 border-t border-white/5">
                  <div className="w-full md:w-auto">
                    {app.gateway === 'manual' && app.paymentScreenshotUrl && (
                       <a href={app.paymentScreenshotUrl} target="_blank" rel="noreferrer" className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-[10px] text-zinc-300 hover:text-white font-bold uppercase tracking-widest transition-colors inline-block text-center w-full md:w-auto">
                         View Screenshot
                       </a>
                    )}
                  </div>
                  <div className="flex w-full md:w-auto items-center justify-end gap-2">
                    {app.status === 'pending' && app.gateway === 'manual' ? (
                      <>
                        <button
                          onClick={() => handleReject(app)}
                          disabled={processingId === app.id}
                          className="flex-1 md:flex-none px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg text-xs font-bold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                          <XCircle size={14} /> Reject
                        </button>
                        <button
                          onClick={() => handleApprove(app)}
                          disabled={processingId === app.id}
                          className="flex-1 md:flex-none px-4 py-2 bg-green-500/10 hover:bg-green-500/20 text-green-500 rounded-lg text-xs font-bold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                          <CheckCircle size={14} /> Approve
                        </button>
                      </>
                    ) : (
                       <span className="text-zinc-600 text-xs italic px-2">
                         {app.gateway === 'razorpay' ? 'Automated via Razorpay' : 'Already Resolved'}
                       </span>
                    )}
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
