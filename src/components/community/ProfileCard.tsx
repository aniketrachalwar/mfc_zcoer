import React, { useRef, useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'motion/react';
import { Download, Share2, Globe, Award, Trophy, Sparkles, Edit2, Shield, Fingerprint } from 'lucide-react';
import { toPng } from 'html-to-image';
import { QRCodeSVG } from 'qrcode.react';
import { useOutletContext } from 'react-router-dom';
import CustomizeCardModal from './CustomizeCardModal';

interface ProfileCardProps {
  profile?: any;
  isPublic?: boolean;
}

const ProfileCard: React.FC<ProfileCardProps> = ({ profile: propProfile, isPublic = false }) => {
  const context = useOutletContext<{ profile: any }>();
  const [localTitle, setLocalTitle] = useState('');
  const profile = context?.profile || propProfile;
  const cardRef = useRef<HTMLDivElement>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 3D Tilt Effect State
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  
  const mouseXSpring = useSpring(x, { stiffness: 300, damping: 30 });
  const mouseYSpring = useSpring(y, { stiffness: 300, damping: 30 });
  
  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["15deg", "-15deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-15deg", "15deg"]);
  
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };
  
  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  if (!profile) {
    return (
      <div className="flex items-center justify-center h-64 bg-zinc-900/50 rounded-[2.5rem] border border-white/5">
        <p className="text-zinc-500 text-sm font-bold uppercase tracking-widest">Profile not found</p>
      </div>
    );
  }

  const professionalTitle = localTitle || profile?.professionalTitle || 'Member';
  const showMemberId = profile?.membershipStatus !== 'expired';

  const downloadCard = async () => {
    if (cardRef.current === null) return;
    try {
      const dataUrl = await toPng(cardRef.current, {
        cacheBust: true,
        backgroundColor: '#000000',
        style: { transform: 'scale(1)', borderRadius: '1.5rem', margin: '0' },
        pixelRatio: 3 // Ultra high quality
      });
      const link = document.createElement('a');
      link.download = `${profile.username}-mfc-card.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Download error:', err);
    }
  };

  const shareCard = async () => {
    if (cardRef.current === null) return;
    try {
      const dataUrl = await toPng(cardRef.current, {
        cacheBust: true,
        backgroundColor: '#000000',
        style: { transform: 'scale(1)', borderRadius: '1.5rem', margin: '0' },
        pixelRatio: 3
      });
      const blob = await (await fetch(dataUrl)).blob();
      const file = new File([blob], `${profile.username}-mfc-card.png`, { type: 'image/png' });
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: `MFC Open Web Member Card - ${profile.fullName}`,
          text: `Check out my official MFC Open Web member card!`,
        });
      } else {
        const link = document.createElement('a');
        link.download = `${profile.username}-mfc-card.png`;
        link.href = dataUrl;
        link.click();
      }
    } catch (err) {
      console.error('Error sharing card:', err);
    }
  };

  return (
    <div className="flex flex-col items-center gap-10 w-full max-w-3xl mx-auto py-8">
      
      {/* 3D Perspective Container */}
      <div 
        style={{ perspective: 1200 }} 
        className="w-full relative group"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <motion.div
          ref={cardRef}
          style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
          className="relative w-full aspect-[1.58] max-w-[600px] mx-auto rounded-3xl p-6 sm:p-8 flex flex-col justify-between overflow-hidden cursor-crosshair shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/10"
        >
          {/* Card Background - Premium Dark Gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 via-[#111] to-black z-0" />
          
          {/* Dynamic Glow Overlay based on mouse position */}
          <motion.div 
            className="absolute inset-0 z-0 opacity-40 pointer-events-none mix-blend-overlay"
            style={{
              background: useTransform(
                [x, y], 
                ([latestX, latestY]) => `radial-gradient(circle at ${(latestX as number + 0.5) * 100}% ${(latestY as number + 0.5) * 100}%, rgba(255,255,255,0.4) 0%, transparent 50%)`
              )
            }}
          />

          {/* Accent Glows */}
          <div className="absolute -top-32 -right-32 w-64 h-64 bg-firefox-orange/20 blur-[100px] rounded-full pointer-events-none z-0" />
          <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-blue-500/20 blur-[100px] rounded-full pointer-events-none z-0" />

          {/* Carbon Fiber / Grid Texture */}
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.05] z-0 pointer-events-none" />

          {/* Holographic Shine (animated) */}
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent -translate-x-[150%] group-hover:translate-x-[150%] transition-transform duration-[2000ms] ease-in-out z-0 pointer-events-none" />

          {/* ----- CARD CONTENT (Elevated in 3D) ----- */}
          <div className="relative z-10 w-full h-full flex flex-col justify-between" style={{ transform: 'translateZ(30px)' }}>
            
            {/* HEADER */}
            <div className="flex justify-between items-start w-full">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/5 backdrop-blur-md rounded-xl p-2 border border-white/10 shadow-lg">
                   <img loading="lazy" src="https://res.cloudinary.com/diyulegc1/image/upload/v1778406665/logo-removebg-preview_b9u9z8.png" alt="MFC" className="w-full h-full object-contain filter drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]" />
                </div>
                <div>
                  <h2 className="text-white font-display font-black tracking-[0.2em] uppercase text-sm sm:text-base leading-none">Mozilla Firefox Club</h2>
                  <p className="text-firefox-orange text-[8px] sm:text-[10px] font-bold tracking-widest uppercase">ZCOER Chapter</p>
                </div>
              </div>
              
              {/* Smart Card Chip */}
              <div className="w-10 h-8 sm:w-12 sm:h-10 rounded-md border border-[#c0b283] bg-gradient-to-br from-[#d4af37] via-[#aa8222] to-[#8a631c] opacity-90 flex flex-wrap shadow-inner overflow-hidden">
                <div className="w-1/2 h-1/2 border-r border-b border-black/20" />
                <div className="w-1/2 h-1/2 border-b border-black/20" />
                <div className="w-1/2 h-1/2 border-r border-black/20" />
                <div className="w-1/2 h-1/2" />
              </div>
            </div>

            {/* MIDDLE SECTION - Identity */}
            <div className="flex gap-4 sm:gap-6 items-end mt-auto mb-6">
              <div className="relative w-20 h-20 sm:w-28 sm:h-28 shrink-0">
                <div className="absolute inset-0 bg-firefox-orange rounded-2xl blur-lg opacity-30 animate-pulse" />
                <div className="w-full h-full rounded-2xl border-2 border-white/20 p-1 relative z-10 overflow-hidden bg-black/50 backdrop-blur-md">
                  <img loading="lazy" src={profile.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.fullName || profile.username || 'User')}&background=FF5C00&color=fff&bold=true`} alt={profile.fullName} className="w-full h-full rounded-xl object-cover" />
                </div>
              </div>

              <div className="flex-1 pb-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 rounded-md bg-white/10 text-white text-[8px] sm:text-[10px] font-black uppercase tracking-widest border border-white/10 shadow-sm flex items-center gap-1 backdrop-blur-sm">
                    <Shield size={10} className="text-firefox-orange" />
                    Verified
                  </span>
                  {profile.isFoundingMember && (
                    <span className="px-2 py-0.5 rounded-md bg-yellow-500/20 text-yellow-500 text-[8px] sm:text-[10px] font-black uppercase tracking-widest border border-yellow-500/20 shadow-sm flex items-center gap-1 backdrop-blur-sm">
                      <Sparkles size={10} /> Founding
                    </span>
                  )}
                </div>
                
                <h3 className="text-2xl sm:text-4xl font-display font-black text-white uppercase tracking-tight leading-none mb-1 drop-shadow-md break-words">
                  {profile.fullName || 'Unknown User'}
                </h3>
                <p className="text-firefox-orange text-[10px] sm:text-sm font-bold uppercase tracking-[0.15em] drop-shadow-sm line-clamp-1">
                  {professionalTitle}
                </p>
                <div className="flex items-center gap-3 mt-2">
                  <p className="text-zinc-400 text-[8px] sm:text-[10px] font-mono">
                    @{profile.username || 'unknown'}
                  </p>
                  <div className="w-1 h-1 rounded-full bg-white/20" />
                  <p className="text-zinc-400 text-[8px] sm:text-[10px] font-mono">
                    {profile.department || 'N/A'}
                  </p>
                </div>
              </div>
            </div>

            {/* FOOTER */}
            <div className="flex justify-between items-end border-t border-white/10 pt-4">
              <div className="space-y-1">
                <p className="text-[6px] sm:text-[8px] font-black tracking-widest text-zinc-500 uppercase">Membership ID</p>
                <p className="text-white font-mono font-black text-[10px] sm:text-xs tracking-[0.2em]">
                  {showMemberId && profile?.memberId ? profile.memberId : 'PENDING'}
                </p>
                {!profile?.isLeadership && (
                   <div className="flex items-center gap-1.5 mt-2">
                     <Trophy size={10} className="text-firefox-orange" />
                     <span className="text-[10px] font-bold text-white tracking-wider">{profile?.points || 0} PTS</span>
                   </div>
                )}
              </div>
              
              <div className="flex items-center gap-4">
                <div className="hidden sm:flex flex-col items-end mr-2">
                  <p className="text-[6px] font-black tracking-widest text-zinc-500 uppercase">Scan to Verify</p>
                  <div className="flex items-center gap-1 mt-1 opacity-50">
                    <Fingerprint size={12} className="text-white" />
                  </div>
                </div>
                <div className="bg-white p-1.5 rounded-xl shadow-[0_0_15px_rgba(255,255,255,0.2)]">
                  <QRCodeSVG value={`${window.location.origin}/verify/${profile.username}`} size={48} fgColor="#000" bgColor="transparent" />
                </div>
              </div>
            </div>

          </div>
        </motion.div>
      </div>

      {/* Action Buttons */}
      {!isPublic && (
        <div className="flex flex-wrap justify-center gap-4 w-full">
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsModalOpen(true)}
            className="flex items-center justify-center gap-2 px-6 py-4 rounded-2xl bg-white/5 border border-white/10 text-white font-display font-black text-xs uppercase tracking-widest hover:bg-white/10 transition-colors flex-1 sm:flex-none backdrop-blur-md"
          >
            <Edit2 size={16} /> Customize
          </motion.button>
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={downloadCard}
            className="flex items-center justify-center gap-2 px-6 py-4 rounded-2xl bg-white/5 border border-white/10 text-white font-display font-black text-xs uppercase tracking-widest hover:bg-white/10 transition-colors flex-1 sm:flex-none backdrop-blur-md"
          >
            <Download size={16} /> Download
          </motion.button>
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={shareCard}
            className="flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-firefox-orange text-white font-display font-black text-xs uppercase tracking-widest shadow-[0_0_30px_rgba(255,92,0,0.4)] hover:bg-white hover:text-black hover:shadow-[0_0_40px_rgba(255,255,255,0.6)] transition-all flex-1 sm:flex-none w-full sm:w-auto"
          >
            <Share2 size={16} />
            Share Member Card
          </motion.button>
        </div>
      )}

      <CustomizeCardModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        profile={profile} 
        onSave={(newTitle) => setLocalTitle(newTitle)} 
      />
    </div>
  );
};

export default ProfileCard;
