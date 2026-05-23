import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Loader2, Briefcase } from 'lucide-react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../lib/AuthContext';

export default function CustomizeCardModal({ isOpen, onClose, profile, onSave }: { isOpen: boolean, onClose: () => void, profile: any, onSave: (title: string) => void }) {
  const [title, setTitle] = useState(profile?.professionalTitle || '');
  const [saving, setSaving] = useState(false);
  const { user, setSuccessMessage, setError } = useAuth();

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Please enter a professional title.');
      return;
    }
    
    setSaving(true);
    try {
      const targetUid = user?.uid || profile?.uid || profile?.id;
      if (!targetUid) throw new Error("User ID missing");
      
      await updateDoc(doc(db, 'users', targetUid), {
        professionalTitle: title
      });
      setSuccessMessage('Business card updated successfully!');
      onSave(title);
      onClose();
    } catch (err) {
      console.error(err);
      setError('Failed to update business card.');
    } finally {
      setSaving(false);
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
          className="relative bg-zinc-900 border border-white/10 rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-firefox-orange/10 blur-[80px] rounded-full pointer-events-none" />
          
          <button 
            onClick={onClose}
            className="absolute top-6 right-6 w-8 h-8 bg-white/5 hover:bg-white/10 rounded-full flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
          >
            <X size={16} />
          </button>

          <div className="mb-8 relative z-10">
            <h2 className="text-2xl font-display font-black uppercase text-white mb-2">Customize <span className="text-firefox-orange">Card</span></h2>
            <p className="text-zinc-400 text-sm">Update the professional title displayed on your premium business card.</p>
          </div>

          <form onSubmit={handleSave} className="space-y-6 relative z-10">
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2 flex items-center gap-2"><Briefcase size={12} /> Professional Title</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Full-Stack Developer, Project Manager"
                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-[15px] text-white focus:outline-none focus:border-firefox-orange transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full py-4 bg-firefox-orange text-white rounded-xl font-display font-black uppercase tracking-widest text-xs hover:shadow-[0_0_20px_rgba(255,92,0,0.4)] transition-all flex justify-center items-center gap-2"
            >
              {saving ? <Loader2 className="animate-spin" size={16} /> : 'Save and Generate Card'}
            </button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
