import React, { useState } from 'react';
import { motion } from 'motion/react';
import { User, AtSign, FileText, Camera, Link as LinkIcon, GraduationCap, Github, Linkedin, Instagram, Twitter, Save, Sparkles } from 'lucide-react';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import confetti from 'canvas-confetti';

interface ProfileFormProps {
  user: any;
  initialData?: any;
  onSave: (data: any) => void;
}

const ProfileForm: React.FC<ProfileFormProps> = ({ user, initialData, onSave }) => {
  const [loading, setLoading] = useState(false);
  const data = initialData || {};
  const [formData, setFormData] = useState({
    fullName: data.fullName || user.displayName || '',
    username: data.username || '',
    bio: data.bio || '',
    photoURL: data.photoURL || user.photoURL || '',
    skills: data.skills?.join(', ') || '',
    domains: data.domains?.join(', ') || '',
    college: data.college || 'Zeal College of Engineering and Research',
    department: data.department || '',
    year: data.year || 'First',
    portfolio: data.portfolio || '',
    favMozTech: data.favMozTech || '',
    socialLinks: {
      github: data.socialLinks?.github || '',
      linkedin: data.socialLinks?.linkedin || '',
      instagram: data.socialLinks?.instagram || '',
      twitter: data.socialLinks?.twitter || '',
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Auto-generate member ID if not present
      const memberId = data.memberId || `MFCZ-${Math.floor(1000 + Math.random() * 9000)}`;
      
      const cleanData = {
        ...formData,
        memberId,
        skills: formData.skills.split(',').map((s: string) => s.trim()).filter((s: string) => s !== ''),
        domains: formData.domains.split(',').map((s: string) => s.trim()).filter((s: string) => s !== ''),
        updatedAt: new Date().toISOString()
      };

      await setDoc(doc(db, 'users', user.uid), cleanData, { merge: true });
      
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#FF5C00', '#FFBD00', '#8A2BE2']
      });

      onSave(cleanData);
    } catch (err) {
      console.error("Save failed:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-12">
      {/* Profile Photo Section */}
      <div className="flex flex-col items-center gap-6">
        <div className="relative group">
          <div className="absolute inset-0 bg-firefox-orange blur-3xl opacity-20 group-hover:opacity-40 transition-opacity" />
          <div className="relative w-32 h-32 rounded-full border-4 border-zinc-800 overflow-hidden bg-zinc-900 flex items-center justify-center">
            {formData.photoURL ? (
              <img src={formData.photoURL} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <User size={48} className="text-zinc-700" />
            )}
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
              <Camera size={24} className="text-white" />
            </div>
          </div>
        </div>
        <div className="w-full max-w-sm">
          <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-2">Photo URL (Cloudinary/Firebase Link)</label>
          <input 
            type="url"
            value={formData.photoURL}
            onChange={(e) => setFormData({...formData, photoURL: e.target.value})}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-firefox-orange outline-none transition-colors"
            placeholder="https://..."
          />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Basic Info */}
        <div className="space-y-6">
          <h3 className="text-xl font-display font-black uppercase flex items-center gap-3">
            <Sparkles className="text-firefox-orange" size={20} />
            Identity
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-2">Full Name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={16} />
                <input 
                  required
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-sm focus:border-firefox-orange outline-none transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-2">Username</label>
              <div className="relative">
                <AtSign className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={16} />
                <input 
                  required
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({...formData, username: e.target.value.toLowerCase().replace(/\s/g, '')})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-sm focus:border-firefox-orange outline-none transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-2">Bio / About Me</label>
              <div className="relative">
                <FileText className="absolute left-4 top-3 text-zinc-600" size={16} />
                <textarea 
                  value={formData.bio}
                  onChange={(e) => setFormData({...formData, bio: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-sm focus:border-firefox-orange outline-none transition-colors min-h-[100px]"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Academic Info */}
        <div className="space-y-6">
          <h3 className="text-xl font-display font-black uppercase flex items-center gap-3">
            <GraduationCap className="text-firefox-orange" size={20} />
            Academia
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-2">Department</label>
              <input 
                type="text"
                placeholder="e.g. IT, Computer Science, AI&DS"
                value={formData.department}
                onChange={(e) => setFormData({...formData, department: e.target.value})}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-firefox-orange outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-2">Current Year</label>
              <select 
                value={formData.year}
                onChange={(e) => setFormData({...formData, year: e.target.value})}
                className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-firefox-orange outline-none transition-colors selection:bg-firefox-orange"
              >
                <option value="First">First</option>
                <option value="Second">Second</option>
                <option value="Third">Third</option>
                <option value="Final">Final</option>
              </select>
            </div>

            <div>
               <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-2">Favorite Mozilla Tech</label>
               <input 
                 type="text"
                 placeholder="e.g. Rust, WebVM, Firefox Nightly, MDN"
                 value={formData.favMozTech}
                 onChange={(e) => setFormData({...formData, favMozTech: e.target.value})}
                 className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-firefox-orange outline-none transition-colors"
               />
            </div>
          </div>
        </div>
      </div>

      {/* Skills & Links */}
      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-6">
           <h3 className="text-xl font-display font-black uppercase">Professional</h3>
           <div className="space-y-4">
             <div>
               <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-2">Skills (comma separated)</label>
               <input 
                 type="text"
                 placeholder="React, CSS, Python, Figma"
                 value={formData.skills}
                 onChange={(e) => setFormData({...formData, skills: e.target.value})}
                 className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-firefox-orange outline-none transition-colors"
               />
             </div>
             <div>
               <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-2">Portfolio / Website Link</label>
               <div className="relative">
                 <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={16} />
                 <input 
                   type="url"
                   value={formData.portfolio}
                   onChange={(e) => setFormData({...formData, portfolio: e.target.value})}
                   className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-sm focus:border-firefox-orange outline-none transition-colors"
                 />
               </div>
             </div>
           </div>
        </div>

        <div className="space-y-6">
          <h3 className="text-xl font-display font-black uppercase">Social Connect</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-2">GitHub</label>
              <div className="relative">
                <Github className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={16} />
                <input 
                  type="text"
                  placeholder="username"
                  value={formData.socialLinks.github}
                  onChange={(e) => setFormData({...formData, socialLinks: {...formData.socialLinks, github: e.target.value}})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-sm focus:border-firefox-orange outline-none transition-colors"
                />
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-2">LinkedIn</label>
              <div className="relative">
                <Linkedin className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={16} />
                <input 
                  type="text"
                  placeholder="profile-url"
                  value={formData.socialLinks.linkedin}
                  onChange={(e) => setFormData({...formData, socialLinks: {...formData.socialLinks, linkedin: e.target.value}})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-sm focus:border-firefox-orange outline-none transition-colors"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-center pt-8">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          disabled={loading}
          type="submit"
          className="group relative px-12 py-4 bg-firefox-orange text-white rounded-full font-display font-black text-sm uppercase tracking-widest overflow-hidden disabled:opacity-50"
        >
          <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
          <span className="relative flex items-center gap-2">
            {loading ? "Saving..." : "Save Profile Magic"}
            <Save size={18} />
          </span>
        </motion.button>
      </div>
    </form>
  );
};

export default ProfileForm;
