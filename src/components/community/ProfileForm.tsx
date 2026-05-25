import React, { useState } from 'react';
import { motion } from 'motion/react';
import { User, AtSign, FileText, Camera, Link as LinkIcon, GraduationCap, Github, Linkedin, Instagram, Twitter, Save, Sparkles } from 'lucide-react';
import { doc, setDoc, collection, query, where, getDocs, updateDoc, increment, deleteDoc } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../lib/firebase';
import { useAuth } from '../../lib/AuthContext';
import { useOutletContext } from 'react-router-dom';
import confetti from 'canvas-confetti';

const ProfileForm: React.FC = () => {
  const { profile, refreshProfile: onSave } = useOutletContext<{ profile: any, refreshProfile: () => void }>();
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const data = profile || {};
  const isNewUser = data.points === undefined;
  
  const { deleteAccount, refetchProfile } = useAuth();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);  
  const isGoogleAuth = user?.providerData?.some((p: any) => p.providerId === 'google.com');
  const creationTime = user?.metadata?.creationTime ? new Date(user.metadata.creationTime).getTime() : 0;
  const isWithinOneMinute = (Date.now() - creationTime) <= 60000;
  const showReferralBox = isNewUser && isGoogleAuth && isWithinOneMinute;

  const [referralInput, setReferralInput] = useState('');
  const [formData, setFormData] = useState({
    fullName: data.fullName || user.displayName || '',
    username: data.username || '',
    bio: data.bio || '',
    photoURL: data.photoURL || user.photoURL || '',
    skills: Array.isArray(data.skills) ? data.skills.join(', ') : (data.skills || ''),
    domains: Array.isArray(data.domains) ? data.domains.join(', ') : (data.domains || ''),
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
      
      // Points and Gamification
      let awardedPoints = data.points || 0;
      let newReferralCode = data.referralCode;

      if (!newReferralCode) {
        const baseName = formData.username || 'MFCZ';
        const prefix = baseName.length >= 4 ? baseName.substring(0, 4).toUpperCase() : baseName.padEnd(4, 'X').toUpperCase();
        newReferralCode = `${prefix}${Math.floor(1000 + Math.random() * 9000)}`;
      }

      if (isNewUser) {
        awardedPoints += 25; // new user bonus
        
        // Handle Referral
        const codeToUse = referralInput.trim() || sessionStorage.getItem('pendingReferral');
        if (codeToUse) {
           const refQuery = query(collection(db, 'users'), where('referralCode', '==', codeToUse));
           const refSnap = await getDocs(refQuery);
           if (!refSnap.empty) {
              const referrerDoc = refSnap.docs[0];
              await updateDoc(doc(db, 'users', referrerDoc.id), {
                 points: increment(20)
              });
              awardedPoints += 10;
           }
           sessionStorage.removeItem('pendingReferral');
        }
      }

      // Check Profile Completion (100% complete)
      const isComplete = Boolean(
         formData.fullName && formData.username && formData.bio && formData.photoURL && 
         formData.skills && formData.domains && formData.department && formData.year && formData.favMozTech
      );

      let completedRewarded = data.profileCompletedRewarded || false;
      if (isComplete && !completedRewarded) {
         awardedPoints += 20;
         completedRewarded = true;
      }

      const cleanData: any = {
        ...formData,
        memberId: memberId || '',
        skills: typeof formData.skills === 'string' ? formData.skills.split(',').map((s: string) => s.trim()).filter((s: string) => s !== '') : (Array.isArray(formData.skills) ? formData.skills : []),
        domains: typeof formData.domains === 'string' ? formData.domains.split(',').map((s: string) => s.trim()).filter((s: string) => s !== '') : (Array.isArray(formData.domains) ? formData.domains : []),
        updatedAt: new Date().toISOString(),
        points: awardedPoints || 0,
        referralCode: newReferralCode || '',
        profileCompletedRewarded: completedRewarded || false
      };

      if (isNewUser) {
        cleanData.membershipStatus = 'public';
        cleanData.isFoundingMember = false;
      }

      // Strip any undefined values to prevent Firebase errors
      Object.keys(cleanData).forEach(key => {
        if (cleanData[key as keyof typeof cleanData] === undefined) {
          delete cleanData[key as keyof typeof cleanData];
        }
      });

      await setDoc(doc(db, 'users', user.uid), cleanData, { merge: true });
      
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#FF5C00', '#FFBD00', '#8A2BE2']
      });

      await refetchProfile();
      onSave();
    } catch (err) {
      console.error("Save failed:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-12">
      {showReferralBox && (
        <div className="bg-firefox-orange/10 border border-firefox-orange/20 rounded-[2rem] p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-firefox-orange/20 blur-[100px] rounded-full mix-blend-screen pointer-events-none" />
          <h3 className="text-xl font-display font-black uppercase text-firefox-orange mb-2">Got a Referral Code?</h3>
          <p className="text-zinc-400 text-sm mb-6">Enter a friend's referral code to get a head start with +10 bonus points! (They'll get +20 too!)</p>
          <input 
            type="text"
            placeholder="e.g. JOHN1234"
            value={referralInput}
            onChange={(e) => setReferralInput(e.target.value.toUpperCase())}
            className="w-full max-w-sm bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-[16px] focus:border-firefox-orange outline-none transition-colors font-mono tracking-widest text-white uppercase"
          />
        </div>
      )}
      
      {!isNewUser && !data.isLeadership && (
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center">
             <h4 className="text-zinc-500 font-black uppercase text-[10px] tracking-widest mb-2">Your Referral Code</h4>
             <div className="bg-black/50 py-3 px-6 rounded-xl border border-white/5 font-mono text-xl text-firefox-orange tracking-widest font-black inline-block">
                {data.referralCode ? data.referralCode : (
                  <span className="text-sm text-zinc-500">Save profile to generate</span>
                )}
             </div>
             <p className="text-[10px] text-zinc-500 mt-3 font-medium">Share this code with friends! When they join, they get +10 pts and you get +20 pts.</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center flex flex-col items-center justify-center">
             <h4 className="text-zinc-500 font-black uppercase text-[10px] tracking-widest mb-2">Profile Completion</h4>
             {data.profileCompletedRewarded ? (
                <div className="bg-green-500/10 text-green-400 px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest border border-green-500/20">
                  100% Complete (+20 PTS Earned)
                </div>
             ) : (
                <div className="text-firefox-orange text-xs font-black uppercase tracking-widest">
                  Incomplete - Finish all fields for +20 PTS!
                </div>
             )}
          </div>
        </div>
      )}
      
      {!isNewUser && data.isLeadership && (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center">
          <h4 className="text-firefox-orange font-black uppercase text-[10px] tracking-widest mb-2">Leadership Account</h4>
          <p className="text-sm text-zinc-400">As a member of the Core Leadership or Department Leads, you are excluded from the global leaderboard.</p>
        </div>
      )}

      {/* Profile Photo Section */}
      <div className="flex flex-col items-center gap-6">
        <div className="relative group">
          <div className="absolute inset-0 bg-firefox-orange blur-3xl opacity-20 group-hover:opacity-40 transition-opacity" />
          <div className="relative w-32 h-32 rounded-full border-4 border-zinc-800 overflow-hidden bg-zinc-900 flex items-center justify-center">
            {formData.photoURL ? (
              <img loading="lazy" src={formData.photoURL} alt="Profile" className="w-full h-full object-cover" onError={(e) => { e.currentTarget.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${formData.username || 'error'}`; }} />
            ) : (
              <User size={48} className="text-zinc-700" />
            )}
          </div>
        </div>
        <div className="w-full max-w-sm mt-4">
          <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-2">Photo URL</label>
          <input 
            type="url"
            value={formData.photoURL}
            onChange={(e) => setFormData({...formData, photoURL: e.target.value})}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-[16px] focus:border-firefox-orange outline-none transition-colors"
            placeholder="Direct Image URL (e.g. https://.../.jpg)"
          />
          <p className="text-[10px] text-zinc-500 mt-2 text-center">Must be a direct link ending in .jpg or .png</p>
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
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-[16px] focus:border-firefox-orange outline-none transition-colors"
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
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-[16px] focus:border-firefox-orange outline-none transition-colors"
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
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-[16px] focus:border-firefox-orange outline-none transition-colors min-h-[100px]"
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
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-[16px] focus:border-firefox-orange outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-2">Current Year</label>
              <select 
                value={formData.year}
                onChange={(e) => setFormData({...formData, year: e.target.value})}
                className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 text-[16px] focus:border-firefox-orange outline-none transition-colors selection:bg-firefox-orange"
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
                 className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-[16px] focus:border-firefox-orange outline-none transition-colors"
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
                 className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-[16px] focus:border-firefox-orange outline-none transition-colors"
               />
             </div>
             <div>
               <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-2">Domains of Interest (comma separated)</label>
               <input 
                 type="text"
                 placeholder="Web Dev, AI, Open Source"
                 value={formData.domains}
                 onChange={(e) => setFormData({...formData, domains: e.target.value})}
                 className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-[16px] focus:border-firefox-orange outline-none transition-colors"
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
                   className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-[16px] focus:border-firefox-orange outline-none transition-colors"
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
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-[16px] focus:border-firefox-orange outline-none transition-colors"
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
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-[16px] focus:border-firefox-orange outline-none transition-colors"
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

      <div className="mt-16 pt-8 flex flex-col items-center">
        {!showDeleteConfirm ? (
          <button
            type="button"
            onClick={() => setShowDeleteConfirm(true)}
            className="text-[10px] text-zinc-600 hover:text-red-500 transition-colors uppercase tracking-widest font-bold"
          >
            Delete Account
          </button>
        ) : (
          <div className="flex flex-col items-center bg-red-500/10 border border-red-500/20 p-4 rounded-xl max-w-sm w-full text-center">
            <p className="text-red-400 text-[10px] font-bold mb-3 uppercase tracking-wider">Are you sure? This action cannot be undone.</p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-bold transition-colors uppercase tracking-wider"
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={async () => {
                  setIsDeleting(true);
                  try {
                    await deleteDoc(doc(db, 'users', user.uid));
                    await deleteAccount();
                  } catch (err) {
                    console.error(err);
                    setIsDeleting(false);
                    setShowDeleteConfirm(false);
                  }
                }}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-2 uppercase tracking-wider"
                disabled={isDeleting}
              >
                {isDeleting ? "Deleting..." : "Confirm Delete"}
              </button>
            </div>
          </div>
        )}
      </div>
    </form>
  );
};

export default ProfileForm;
