import React, { useRef, useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'motion/react';
import { Download, Share2, Globe, Award, Trophy, Sparkles, Edit2, Shield, Fingerprint } from 'lucide-react';
import { toPng, toCanvas } from 'html-to-image';
import { QRCodeSVG } from 'qrcode.react';
import { useOutletContext } from 'react-router-dom';
// @ts-ignore
import GIF from 'gif.js.optimized';
// @ts-ignore
import gifWorkerUrl from 'gif.js.optimized/dist/gif.worker.js?url';
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
  const [exportingAction, setExportingAction] = useState<'download' | 'share' | null>(null);

  // 3D Tilt Effect State
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  
  const mouseXSpring = useSpring(x, { stiffness: 300, damping: 30 });
  const mouseYSpring = useSpring(y, { stiffness: 300, damping: 30 });
  
  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["15deg", "-15deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-15deg", "15deg"]);
  
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    
    let clientX, clientY;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const mouseX = clientX - rect.left;
    const mouseY = clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };
  
  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  const hoverGlow = useTransform(
    [x, y], 
    ([latestX, latestY]) => `radial-gradient(circle at ${(latestX as number + 0.5) * 100}% ${(latestY as number + 0.5) * 100}%, rgba(255,255,255,0.4) 0%, transparent 60%)`
  );

  const hoverFoil = useTransform(
    [x, y], 
    ([latestX, latestY]) => `linear-gradient(${((latestX as number) + 0.5) * 360}deg, transparent, rgba(255,92,0,0.6), rgba(0,120,255,0.6), rgba(255,0,128,0.6), transparent)`
  );

  if (!profile) {
    return (
      <div className="flex items-center justify-center h-64 bg-zinc-900/50 rounded-[2.5rem] border border-white/5 w-full max-w-sm mx-auto">
        <p className="text-zinc-500 text-sm font-bold uppercase tracking-widest">Profile not found</p>
      </div>
    );
  }

  const professionalTitle = localTitle || profile?.professionalTitle || 'Member';
  const showMemberId = profile?.membershipStatus !== 'expired';

  const generateGif = async (actionType: 'download' | 'share'): Promise<Blob | null> => {
    if (!cardRef.current) return null;
    setExportingAction(actionType);
    
    try {
      const frames: { canvas: HTMLCanvasElement, delay: number }[] = [];
      const numFrames = 12; // Reduced frames to speed up export time significantly
      
      let previousTime = performance.now();

      // Capture frames
      for (let i = 0; i < numFrames; i++) {
        await new Promise(r => requestAnimationFrame(r));
        await new Promise(r => setTimeout(r, 60)); // allow DOM updates, larger step for longer loop

        const canvas = await toCanvas(cardRef.current, {
          cacheBust: true,
          backgroundColor: '#000000',
          style: { transform: 'scale(1)', borderRadius: '2rem', margin: '0' },
          pixelRatio: 1 // Lower resolution is MUCH faster to capture and encode
        });

        const currentTime = performance.now();
        // Calculate the exact real-world milliseconds elapsed since last frame
        // This ensures the GIF playback speed matches the exact website speed!
        const delay = Math.max(50, Math.round(currentTime - previousTime));
        previousTime = currentTime;

        frames.push({ canvas, delay });
      }

      // Use statically imported GIF
      
      return new Promise<Blob>((resolve, reject) => {
        const gif = new GIF({
          workers: 4, // Increase workers to max out CPU
          quality: 20, // Fast encoding
          width: frames[0].canvas.width,
          height: frames[0].canvas.height,
          workerScript: gifWorkerUrl
        });

        frames.forEach(frame => {
          gif.addFrame(frame.canvas, { delay: frame.delay });
        });

        gif.on('finished', (blob: Blob) => {
          resolve(blob);
        });
        
        gif.on('abort', () => {
          reject(new Error("GIF generation aborted"));
        });

        gif.render();
      });
    } catch (err) {
      console.error(err);
      return null;
    } finally {
      setExportingAction(null);
    }
  };

  const downloadCard = async () => {
    if (exportingAction) return;
    try {
      const blob = await generateGif('download');
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.download = `${profile.username}-mfc-card.gif`;
      link.href = url;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download error:', err);
    }
  };

  const shareCard = async () => {
    if (exportingAction) return;
    try {
      const blob = await generateGif('share');
      if (!blob) return;
      const file = new File([blob], `${profile.username}-mfc-card.gif`, { type: 'image/gif' });
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: `MFC Open Web Member Card - ${profile.fullName}`,
          text: `Check out my official MFC Open Web animated member card!`,
        });
      } else {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.download = `${profile.username}-mfc-card.gif`;
        link.href = url;
        link.click();
        URL.revokeObjectURL(url);
      }
    } catch (err) {
      console.error('Error sharing card:', err);
    }
  };

  return (
    <div className="flex flex-col items-center gap-10 w-full py-8">
      
      {/* 3D Perspective Container */}
      <div 
        style={{ perspective: 1500 }} 
        className="w-full relative group"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onTouchMove={handleMouseMove}
        onTouchEnd={handleMouseLeave}
      >
        <motion.div
          ref={cardRef}
          style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
          className="relative w-full aspect-[0.63] max-w-[380px] mx-auto rounded-[2rem] sm:rounded-[2.5rem] p-4 sm:p-8 flex flex-col justify-between overflow-hidden cursor-crosshair shadow-[0_30px_60px_rgba(0,0,0,0.6)] border border-white/10 bg-zinc-950"
        >
          {/* Card Background - Premium Dark Gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 via-[#111] to-[#050505] z-0" />
          
          {/* Dynamic Glow Overlay based on mouse position */}
          <motion.div 
            className="absolute inset-0 z-0 opacity-40 pointer-events-none mix-blend-overlay"
            style={{
              background: exportingAction
                ? 'radial-gradient(circle at 100% 0%, rgba(255,255,255,0.4) 0%, transparent 60%)'
                : hoverGlow
            }}
          />

          {/* Holographic Foil Layer */}
          <motion.div 
            className={`absolute inset-0 z-0 pointer-events-none mix-blend-color-dodge transition-opacity duration-700 ${exportingAction ? 'opacity-50' : 'opacity-40 sm:opacity-0 sm:group-hover:opacity-40'}`}
            style={{
              background: exportingAction
                ? 'linear-gradient(360deg, transparent, rgba(255,92,0,0.6), rgba(0,120,255,0.6), rgba(255,0,128,0.6), transparent)'
                : hoverFoil
            }}
          />

          {/* Accent Glows */}
          <div className="absolute -top-32 -right-32 w-72 h-72 bg-firefox-orange/20 blur-[120px] rounded-full pointer-events-none z-0" />
          <div className="absolute -bottom-32 -left-32 w-72 h-72 bg-blue-500/15 blur-[120px] rounded-full pointer-events-none z-0" />

          {/* Hexagon Pattern Texture */}
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/hexellence.png')] opacity-[0.03] z-0 pointer-events-none" />

          {/* Vertical Large Background Text */}
          <div className="absolute right-[-40px] top-1/2 -translate-y-1/2 flex items-center justify-center opacity-[0.03] pointer-events-none z-0 overflow-hidden">
            <p className="text-white font-display font-black text-9xl tracking-[0.2em] uppercase rotate-90 mix-blend-overlay">
              MEMBER
            </p>
          </div>
          <div className="absolute left-2 top-0 bottom-0 w-8 flex flex-col items-center justify-center pointer-events-none z-0">
            <p className="text-firefox-orange font-display font-black text-xl sm:text-2xl tracking-[0.3em] uppercase [writing-mode:vertical-rl] rotate-180 opacity-20 mix-blend-screen whitespace-nowrap">
              OPEN WEB ECOSYSTEM
            </p>
          </div>

          {/* Animated Scanning Line */}
          <motion.div 
            animate={{ top: ['-10%', '110%'] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
            className="absolute left-0 right-0 h-[2px] bg-firefox-orange/50 blur-[1px] shadow-[0_0_20px_rgba(255,92,0,0.8)] z-20 pointer-events-none"
          />

          {/* Holographic Shine (animated loop) */}
          <motion.div 
            animate={{ x: ['-150%', '150%'] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut', repeatDelay: 0.5 }}
            className={`absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent z-0 pointer-events-none mix-blend-overlay ${exportingAction ? 'hidden' : ''}`} 
          />

          {/* ----- CARD CONTENT (Elevated in 3D) ----- */}
          <div className="relative z-10 w-full h-full flex flex-col justify-between" style={{ transform: 'translateZ(40px)' }}>
            
            {/* HEADER */}
            <div className="flex justify-between items-start w-full relative z-10 px-4">
              <div className="flex flex-col items-start gap-1">
                <div className="w-10 h-10 flex items-center justify-center">
                   <img loading="lazy" src="https://res.cloudinary.com/diyulegc1/image/upload/v1778406665/logo-removebg-preview_b9u9z8.png" alt="MFC" className="w-full h-full object-contain filter drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]" />
                </div>
                <h2 className="text-white font-display font-black tracking-[0.1em] uppercase text-[10px] leading-tight drop-shadow-md">
                  Mozilla<br/>Firefox Club
                </h2>
              </div>
            </div>

            {/* MIDDLE - Profile Pic & Info */}
            <div className="flex flex-col items-center justify-center flex-1 relative z-10 mt-6 sm:mt-8 mb-4 px-2 sm:px-4">
              <div className="relative w-28 h-28 sm:w-36 sm:h-36 shrink-0 mb-6 sm:mb-8" style={{ transform: 'translateZ(50px)' }}>
                
                {/* Rotating Tech Rings */}
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
                  className="absolute -inset-4 border border-white/10 rounded-full border-t-firefox-orange/60 border-b-blue-500/60"
                />
                <motion.div 
                  animate={{ rotate: -360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                  className="absolute -inset-2 border border-white/5 rounded-full border-l-firefox-orange/40 border-r-transparent"
                />
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
                  className="absolute -inset-6 border border-dashed border-white/5 rounded-full"
                />

                <div className="w-full h-full rounded-full border-2 border-white/30 p-1 relative z-10 overflow-hidden bg-zinc-900/50">
                  <img loading="lazy" src={profile.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.fullName || profile.username || 'User')}&background=FF5C00&color=fff&bold=true`} alt={profile.fullName} className="w-full h-full rounded-full object-cover shadow-inner" />
                </div>
              </div>
              
              <div className="text-center w-full" style={{ transform: 'translateZ(30px)' }}>
                <div className="flex justify-center items-center gap-2 mb-4">
                  <span className="px-2.5 py-1 rounded-md bg-white/10 text-white text-[9px] font-black uppercase tracking-widest border border-white/10 shadow-sm flex items-center gap-1 backdrop-blur-md">
                    <Shield size={10} className="text-firefox-orange" />
                    Verified
                  </span>
                  {profile.isFoundingMember && (
                    <span className="px-2.5 py-1 rounded-md bg-yellow-500/20 text-yellow-500 text-[9px] font-black uppercase tracking-widest border border-yellow-500/20 shadow-sm flex items-center gap-1 backdrop-blur-md">
                      <Sparkles size={10} /> Founding
                    </span>
                  )}
                </div>
                
                <h3 className="text-xl sm:text-3xl font-display font-black text-white uppercase tracking-tight leading-none mb-1 sm:mb-2 drop-shadow-lg break-words px-2">
                  {profile.fullName || 'Unknown User'}
                </h3>
                <p className="text-firefox-orange text-[9px] sm:text-[11px] font-bold uppercase tracking-[0.25em] drop-shadow-sm mb-2 sm:mb-3 line-clamp-2 px-1">
                  {professionalTitle}
                </p>
                <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm">
                  <p className="text-zinc-400 text-[9px] sm:text-[10px] font-mono tracking-widest">
                    @{profile.username || 'unknown'}
                  </p>
                  <div className="w-1 h-1 rounded-full bg-white/20" />
                  <p className="text-zinc-400 text-[9px] sm:text-[10px] font-mono tracking-widest uppercase">
                    {profile.department || 'N/A'}
                  </p>
                </div>
              </div>
            </div>

            {/* FOOTER */}
            <div className="flex justify-between items-end border-t border-white/10 pt-5 relative z-10 w-full px-4" style={{ transform: 'translateZ(40px)' }}>
              <div className="flex flex-col justify-end gap-3">
                <div className="space-y-1">
                  <p className="text-[7px] sm:text-[8px] font-black tracking-widest text-zinc-500 uppercase flex items-center gap-1">
                    <Fingerprint size={10} className="opacity-50" />
                    Membership ID
                  </p>
                  <p className="text-white font-mono font-black text-xs sm:text-sm tracking-[0.2em] bg-white/5 px-2 py-1 rounded-md border border-white/5 inline-block">
                    {showMemberId && profile?.memberId ? profile.memberId : 'PENDING'}
                  </p>
                </div>
                
                {!profile?.isLeadership && (
                  <div className="flex flex-col items-start space-y-1">
                    <p className="text-[7px] sm:text-[8px] font-black tracking-widest text-zinc-500 uppercase">Points</p>
                    <div className="flex items-center gap-1.5 bg-firefox-orange/10 px-2 py-1 rounded-md border border-firefox-orange/20">
                      <Trophy size={12} className="text-firefox-orange" />
                      <span className="text-xs sm:text-sm font-black text-firefox-orange tracking-wider">{profile?.points || 0}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* QR CODE - Themed */}
              <div className="bg-white/5 backdrop-blur-md p-1.5 sm:p-2 rounded-xl border border-white/10 shadow-[0_0_20px_rgba(255,255,255,0.05)] flex-shrink-0 flex items-center justify-center w-14 h-14 sm:w-20 sm:h-20">
                <QRCodeSVG value={`${window.location.origin}/verify/${profile.username}`} style={{ width: '100%', height: '100%' }} fgColor="#ffffff" bgColor="transparent" />
              </div>
            </div>

          </div>
        </motion.div>
      </div>

      {/* Action Buttons */}
      {!isPublic && (
        <div className="flex flex-wrap justify-center gap-4 w-full max-w-sm">
          <div className="flex w-full gap-4">
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsModalOpen(true)}
              className="flex items-center justify-center gap-2 px-4 py-4 rounded-2xl bg-white/5 border border-white/10 text-white font-display font-black text-xs uppercase tracking-widest hover:bg-white/10 transition-colors flex-1 backdrop-blur-md"
            >
              <Edit2 size={16} /> Edit
            </motion.button>
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={downloadCard}
              disabled={!!exportingAction}
              className={`flex items-center justify-center gap-2 px-4 py-4 rounded-2xl border text-white font-display font-black text-xs uppercase tracking-widest transition-colors flex-1 backdrop-blur-md ${exportingAction === 'download' ? 'bg-white/10 border-white/20 opacity-50 cursor-wait' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}
            >
              {exportingAction === 'download' ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Download size={16} />} 
              {exportingAction === 'download' ? 'Exporting...' : 'Save GIF'}
            </motion.button>
          </div>
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={shareCard}
            disabled={!!exportingAction}
            className={`flex items-center justify-center gap-2 px-8 py-4 rounded-2xl font-display font-black text-xs uppercase tracking-widest transition-all w-full ${exportingAction === 'share' ? 'bg-orange-600/50 text-white/50 cursor-wait' : 'bg-firefox-orange text-white shadow-[0_0_30px_rgba(255,92,0,0.4)] hover:bg-white hover:text-black hover:shadow-[0_0_40px_rgba(255,255,255,0.6)]'}`}
          >
            {exportingAction === 'share' ? <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" /> : <Share2 size={16} />}
            {exportingAction === 'share' ? 'Generating GIF...' : 'Share Member Card GIF'}
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
