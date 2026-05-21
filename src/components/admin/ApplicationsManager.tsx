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
      await updateDoc(doc(db, 'users', app.userId), { membershipStatus: 'verified' });
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
          <Loader2 className="animate-spin text-firefox-orange" size={48} />
        </div>
      ) : (
        <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-black/40 border-b border-white/5 text-[10px] uppercase tracking-widest text-zinc-500">
                  <th className="p-4 font-bold">User Info</th>
                  <th className="p-4 font-bold">Gateway</th>
                  <th className="p-4 font-bold">Amount</th>
                  <th className="p-4 font-bold">Transaction ID</th>
                  <th className="p-4 font-bold">Status</th>
                  <th className="p-4 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {filteredApps.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-zinc-500">No applications found.</td>
                  </tr>
                ) : (
                  filteredApps.map((app) => (
                    <tr key={app.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="p-4">
                        <div className="font-bold text-white">{app.userName}</div>
                        <div className="text-xs text-zinc-500">{app.userEmail}</div>
                      </td>
                      <td className="p-4">
                        {app.gateway === 'razorpay' ? (
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-md text-[10px] font-bold uppercase tracking-wider">
                            <Zap size={12} /> Auto
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-zinc-800 text-zinc-300 border border-white/10 rounded-md text-[10px] font-bold uppercase tracking-wider">
                            <Hand size={12} /> Manual
                          </div>
                        )}
                      </td>
                      <td className="p-4 font-mono text-firefox-orange">₹{app.amount}</td>
                      <td className="p-4">
                        <div className="font-mono text-zinc-300 text-xs">
                          {app.gateway === 'razorpay' ? app.razorpayPaymentId : app.transactionId}
                        </div>
                        {app.gateway === 'manual' && app.paymentScreenshotUrl && (
                           <a href={app.paymentScreenshotUrl} target="_blank" rel="noreferrer" className="text-[10px] text-firefox-orange hover:underline font-bold uppercase tracking-widest mt-1 inline-block">
                             View Screenshot
                           </a>
                        )}
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider flex w-max ${
                          app.status === 'verified' ? 'bg-green-500/20 text-green-400' :
                          app.status === 'failed' ? 'bg-red-500/20 text-red-400' :
                          'bg-yellow-500/20 text-yellow-500'
                        }`}>
                          {app.status}
                        </span>
                        {app.gateway === 'razorpay' && app.webhookVerified && (
                          <div className="text-[9px] text-zinc-500 uppercase tracking-widest mt-1">
                            Webhook Sync ✓
                          </div>
                        )}
                      </td>
                      <td className="p-4 text-right space-x-2">
                        {app.status === 'pending' && app.gateway === 'manual' ? (
                          <>
                            <button
                              onClick={() => handleApprove(app)}
                              disabled={processingId === app.id}
                              className="px-3 py-1.5 bg-green-500/10 hover:bg-green-500/20 text-green-500 rounded text-xs font-bold transition-colors disabled:opacity-50 inline-flex items-center gap-1"
                            >
                              <CheckCircle size={14} /> Approve
                            </button>
                            <button
                              onClick={() => handleReject(app)}
                              disabled={processingId === app.id}
                              className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded text-xs font-bold transition-colors disabled:opacity-50 inline-flex items-center gap-1"
                            >
                              <XCircle size={14} /> Reject
                            </button>
                          </>
                        ) : (
                           <span className="text-zinc-600 text-xs italic">
                             {app.gateway === 'razorpay' ? 'Automated' : 'Resolved'}
                           </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
