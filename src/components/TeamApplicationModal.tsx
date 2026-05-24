import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Send, Loader2, Link as LinkIcon, User, Code } from 'lucide-react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../lib/AuthContext';

interface TeamApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ROLES = [
  "Video & Photo Producer",
  "Graphic & UI Designer",
  "Motion Graphics Artist",
  "Social Media & Copywriter",
  "Newsletter Editor",
  "Events & Logistics Coordinator",
  "Outreach & PR Specialist",
  "Sponsorship Executive",
  "Promotions Distributor",
  "Discord & Community Moderator",
  "Workshop Facilitator",
  "Web & Tech Developer",
  "Analytics & Data Tracker",
  "Merchandise Coordinator",
  "Audio & Visual Technician",
  "Other"
];

const TeamApplicationModal = ({ isOpen, onClose }: TeamApplicationModalProps) => {
  const { user } = useAuth();
  
  const [formData, setFormData] = useState({
    fullName: user?.displayName || '',
    email: user?.email || '',
    role: '',
    proficiency: 3,
    customRole: '',
    pitch: '',
    github: '',
    linkedin: '',
    portfolio: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      alert("Please log in to submit an application.");
      return;
    }
    
    setLoading(true);
    try {
      await addDoc(collection(db, 'team_applications'), {
        userId: user.uid,
        fullName: formData.fullName,
        email: formData.email,
        role: formData.role === 'Other' ? formData.customRole : formData.role,
        proficiency: formData.proficiency,
        pitch: formData.pitch,
        github: formData.github,
        linkedin: formData.linkedin,
        portfolio: formData.portfolio,
        status: 'pending',
        appliedAt: serverTimestamp(),
      });
      setSuccess(true);
      setTimeout(() => {
        onClose();
        setSuccess(false);
        setFormData({ ...formData, role: '', proficiency: 3, customRole: '', pitch: '', github: '', linkedin: '', portfolio: '' });
      }, 3000);
    } catch (err) {
      console.error("Application failed:", err);
      alert("Failed to submit application. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
            onClick={onClose} 
          />
          <motion.div 
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="bg-zinc-950 border border-white/10 rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col relative z-10 shadow-2xl"
          >
            <div className="flex items-center justify-between p-6 border-b border-white/5 shrink-0">
              <div>
                <h2 className="text-2xl font-display font-black uppercase text-white tracking-tight">Apply to <span className="text-firefox-orange">Join Team</span></h2>
                <p className="text-zinc-400 text-sm">Tell us how you can contribute to the ecosystem.</p>
              </div>
              <button onClick={onClose} className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 text-zinc-400 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="overflow-y-auto p-6 scrollbar-hide">
              {success ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-16 h-16 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mb-6">
                    <Send size={32} />
                  </div>
                  <h3 className="text-2xl font-display font-black uppercase text-white mb-2">Application Received!</h3>
                  <p className="text-zinc-400 max-w-sm">We've got your details. Our core team will review your profile and reach out soon.</p>
                </div>
              ) : (
                <form id="application-form" onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-black text-zinc-500 uppercase tracking-widest mb-2">Full Name</label>
                      <input 
                        type="text" required
                        value={formData.fullName}
                        onChange={e => setFormData({...formData, fullName: e.target.value})}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-firefox-orange outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-black text-zinc-500 uppercase tracking-widest mb-2">Email Address</label>
                      <input 
                        type="email" required
                        value={formData.email}
                        onChange={e => setFormData({...formData, email: e.target.value})}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-zinc-400 focus:border-firefox-orange outline-none"
                        readOnly
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-black text-zinc-500 uppercase tracking-widest mb-2">Primary Role</label>
                    <select 
                      required
                      value={formData.role}
                      onChange={e => setFormData({...formData, role: e.target.value})}
                      className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-firefox-orange outline-none"
                    >
                      <option value="" disabled>Select a role...</option>
                      {ROLES.map(r => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </select>
                  </div>

                  {formData.role && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                      <label className="block text-xs font-black text-zinc-500 uppercase tracking-widest mb-2">Proficiency Level ({formData.proficiency}/5)</label>
                      <input 
                        type="range" min="1" max="5" step="1"
                        value={formData.proficiency}
                        onChange={e => setFormData({...formData, proficiency: parseInt(e.target.value)})}
                        className="w-full accent-firefox-orange mt-2"
                      />
                      <div className="flex justify-between text-[10px] text-zinc-500 font-bold uppercase mt-2 mb-4">
                        <span>Beginner</span>
                        <span>Intermediate</span>
                        <span>Expert</span>
                      </div>
                    </motion.div>
                  )}

                  {formData.role === 'Other' && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                      <label className="block text-xs font-black text-zinc-500 uppercase tracking-widest mb-2">Specify Role</label>
                      <input 
                        type="text" required
                        placeholder="e.g. Video Editor, DevOps..."
                        value={formData.customRole}
                        onChange={e => setFormData({...formData, customRole: e.target.value})}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-firefox-orange outline-none"
                      />
                    </motion.div>
                  )}

                  <div>
                    <label className="block text-xs font-black text-zinc-500 uppercase tracking-widest mb-2">Why do you want to join? (Pitch)</label>
                    <textarea 
                      required rows={4}
                      placeholder="Tell us about your skills, past experience, and why you'd be a great fit..."
                      value={formData.pitch}
                      onChange={e => setFormData({...formData, pitch: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-firefox-orange outline-none resize-none"
                    />
                  </div>

                  <div className="pt-6 border-t border-white/5">
                    <h4 className="text-sm font-bold text-white mb-4">Portfolio / Links (Optional)</h4>
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-zinc-500 shrink-0">
                          <Code size={18} />
                        </div>
                        <input 
                          type="url" placeholder="GitHub Profile URL"
                          value={formData.github}
                          onChange={e => setFormData({...formData, github: e.target.value})}
                          className="w-full bg-transparent border-b border-white/10 px-2 py-2 text-white focus:border-firefox-orange outline-none"
                        />
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500 shrink-0">
                          <User size={18} />
                        </div>
                        <input 
                          type="url" placeholder="LinkedIn Profile URL"
                          value={formData.linkedin}
                          onChange={e => setFormData({...formData, linkedin: e.target.value})}
                          className="w-full bg-transparent border-b border-white/10 px-2 py-2 text-white focus:border-firefox-orange outline-none"
                        />
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-500 shrink-0">
                          <LinkIcon size={18} />
                        </div>
                        <input 
                          type="url" placeholder="Personal Portfolio URL"
                          value={formData.portfolio}
                          onChange={e => setFormData({...formData, portfolio: e.target.value})}
                          className="w-full bg-transparent border-b border-white/10 px-2 py-2 text-white focus:border-firefox-orange outline-none"
                        />
                      </div>
                    </div>
                  </div>
                </form>
              )}
            </div>

            {!success && (
              <div className="p-6 border-t border-white/5 shrink-0">
                <button
                  type="submit"
                  form="application-form"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 py-4 bg-firefox-orange hover:bg-orange-600 text-white rounded-xl font-display font-black text-xs uppercase tracking-widest transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? <Loader2 size={18} className="animate-spin" /> : <><Send size={18} /> Submit Application</>}
                </button>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default TeamApplicationModal;
