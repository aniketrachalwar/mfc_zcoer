import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Search, Loader2, Users, Lightbulb, TrendingUp, Send } from 'lucide-react';
import { collection, query, where, getDocs, addDoc, serverTimestamp, limit } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../lib/AuthContext';

export default function ProposeWorkshopModal({ isOpen, onClose, profile }: { isOpen: boolean, onClose: () => void, profile: any }) {
  const { setSuccessMessage, setError } = useAuth();
  
  const [formData, setFormData] = useState({
    title: '',
    scope: '',
    profit: '',
    phone: '',
    isSolo: true,
  });
  
  const [searchQuery, setSearchQuery] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedCohosts, setSelectedCohosts] = useState<any[]>([]);
  
  const [submitting, setSubmitting] = useState(false);

  const handleSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const q = e.target.value;
    setSearchQuery(q);
    
    if (q.length < 3) {
      setSearchResults([]);
      return;
    }
    
    setSearchLoading(true);
    try {
      // Basic prefix search using fullName
      const usersRef = collection(db, 'users');
      const qClean = q.trim();
      const qUpper = qClean.toUpperCase();
      const qLower = qClean.toLowerCase();

      let qSnap = await getDocs(query(usersRef, where('memberId', '==', qUpper), limit(1)));
      
      if (qSnap.empty) {
        qSnap = await getDocs(query(usersRef, where('username', '==', qLower), limit(1)));
      }

      if (qSnap.empty) {
        qSnap = await getDocs(query(usersRef, limit(300)));
      }

      const results = qSnap.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter((u: any) => {
          if (u.uid === profile.uid) return false;
          const memberIdMatch = u.memberId ? u.memberId.toUpperCase().includes(qUpper) : false;
          const usernameMatch = u.username ? u.username.toLowerCase().includes(qLower) : false;
          const fullNameMatch = u.fullName ? u.fullName.toLowerCase().includes(qLower) : false;
          return memberIdMatch || usernameMatch || fullNameMatch;
        })
        .slice(0, 5);

      setSearchResults(results);
    } catch (err) {
      console.error(err);
    } finally {
      setSearchLoading(false);
    }
  };

  const addCohost = (user: any) => {
    if (!selectedCohosts.find(c => c.uid === user.uid)) {
      setSelectedCohosts([...selectedCohosts, { uid: user.uid, fullName: user.fullName, username: user.username }]);
    }
    setSearchQuery('');
    setSearchResults([]);
  };

  const removeCohost = (uid: string) => {
    setSelectedCohosts(selectedCohosts.filter(c => c.uid !== uid));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.scope || !formData.profit || !formData.phone) {
      setError("Please fill all required fields.");
      return;
    }

    setSubmitting(true);
    try {
      await addDoc(collection(db, 'workshopProposals'), {
        userId: profile.uid,
        userName: profile.fullName,
        userUsername: profile.username,
        title: formData.title,
        scope: formData.scope,
        profit: formData.profit,
        phone: formData.phone,
        isSolo: formData.isSolo,
        cohosts: formData.isSolo ? [] : selectedCohosts,
        status: 'pending',
        createdAt: serverTimestamp()
      });
      setSuccessMessage("Workshop proposal submitted! Our team will review it.");
      onClose();
    } catch (err) {
      console.error(err);
      setError("Failed to submit proposal.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/80 backdrop-blur-sm" 
          onClick={onClose} 
        />
        
        <motion.div 
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          className="relative bg-zinc-900 border border-white/10 rounded-3xl p-6 md:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-firefox-orange/10 blur-[80px] rounded-full pointer-events-none" />
          
          <button 
            onClick={onClose}
            className="absolute top-6 right-6 w-8 h-8 bg-white/5 hover:bg-white/10 rounded-full flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
          >
            <X size={16} />
          </button>

          <div className="mb-8 relative z-10">
            <h2 className="text-2xl md:text-3xl font-display font-black uppercase text-white mb-2 tracking-tight">Propose a <span className="text-firefox-orange">Workshop</span></h2>
            <p className="text-zinc-400 text-sm">Share your expertise with the community. Propose an event or workshop and we'll help you host it.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2 block flex items-center gap-2"><Lightbulb size={12} /> Workshop Title</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                placeholder="e.g. Masterclass on React & Firebase"
                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-[15px] text-white focus:outline-none focus:border-firefox-orange transition-colors"
              />
            </div>

            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2 block">Event Scope & Details</label>
              <textarea
                required
                value={formData.scope}
                onChange={(e) => setFormData({...formData, scope: e.target.value})}
                placeholder="What will you cover? Who is the target audience? How long will it take?"
                rows={3}
                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-[15px] text-white focus:outline-none focus:border-firefox-orange transition-colors resize-none"
              />
            </div>

            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2 block flex items-center gap-2"><TrendingUp size={12} /> Expected Outcomes / Profit</label>
              <textarea
                required
                value={formData.profit}
                onChange={(e) => setFormData({...formData, profit: e.target.value})}
                placeholder="What will students gain from this? (e.g. hands-on project, new skills, networking)"
                rows={2}
                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-[15px] text-white focus:outline-none focus:border-firefox-orange transition-colors resize-none"
              />
            </div>

            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2 block">Contact Mobile Number</label>
              <input
                type="tel"
                required
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                placeholder="+91"
                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-[15px] text-white focus:outline-none focus:border-firefox-orange transition-colors"
              />
            </div>

            <div className="pt-4 border-t border-white/5">
              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-4 block flex items-center gap-2"><Users size={12} /> Hosting Team</label>
              
              <div className="flex gap-4 mb-4">
                <button
                  type="button"
                  onClick={() => setFormData({...formData, isSolo: true})}
                  className={`flex-1 py-3 px-4 rounded-xl font-bold text-xs uppercase tracking-wider transition-all border ${formData.isSolo ? 'bg-firefox-orange/20 border-firefox-orange text-firefox-orange' : 'bg-white/5 border-white/10 text-zinc-500 hover:text-white'}`}
                >
                  I'm Hosting Alone
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({...formData, isSolo: false})}
                  className={`flex-1 py-3 px-4 rounded-xl font-bold text-xs uppercase tracking-wider transition-all border ${!formData.isSolo ? 'bg-firefox-orange/20 border-firefox-orange text-firefox-orange' : 'bg-white/5 border-white/10 text-zinc-500 hover:text-white'}`}
                >
                  I have Co-hosts
                </button>
              </div>

              {!formData.isSolo && (
                <div className="space-y-4 bg-black/30 p-4 rounded-xl border border-white/5">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={handleSearch}
                      placeholder="Search community by name or serial no. (MFCZ-)..."
                      className="w-full bg-black/50 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-firefox-orange transition-colors"
                    />
                    {searchLoading && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-zinc-500" size={14} />}
                  </div>

                  {searchResults.length > 0 && (
                    <div className="bg-zinc-800 rounded-xl border border-white/10 overflow-hidden shadow-xl max-h-40 overflow-y-auto">
                      {searchResults.map(user => (
                        <div key={user.uid} className="flex justify-between items-center p-3 hover:bg-white/5 border-b border-white/5 last:border-0">
                          <div>
                            <p className="text-sm font-bold text-white">{user.fullName}</p>
                            <p className="text-[10px] text-zinc-500 font-mono">@{user.username}</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => addCohost(user)}
                            className="px-3 py-1 bg-firefox-orange/20 text-firefox-orange text-[10px] font-black uppercase tracking-widest rounded-lg hover:bg-firefox-orange hover:text-white transition-colors"
                          >
                            Add
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {selectedCohosts.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-2">
                      {selectedCohosts.map(cohost => (
                        <div key={cohost.uid} className="flex items-center gap-2 bg-white/10 border border-white/10 rounded-full pl-3 pr-1 py-1">
                          <span className="text-xs text-white font-bold">{cohost.fullName}</span>
                          <button
                            type="button"
                            onClick={() => removeCohost(cohost.uid)}
                            className="w-5 h-5 bg-black/50 hover:bg-red-500/20 hover:text-red-500 rounded-full flex items-center justify-center text-zinc-400 transition-colors"
                          >
                            <X size={10} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-4 bg-firefox-orange text-white rounded-xl font-display font-black uppercase tracking-widest text-xs hover:shadow-[0_0_20px_rgba(255,92,0,0.4)] transition-all flex justify-center items-center gap-2 mt-4"
            >
              {submitting ? <Loader2 className="animate-spin" size={16} /> : <><Send size={14} /> Submit Proposal</>}
            </button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
