import React, { useRef } from 'react';
import { motion } from 'motion/react';
import { Download, Share2, Github, Linkedin, Instagram, Twitter, Globe, Award, Trophy } from 'lucide-react';
import { toPng } from 'html-to-image';
import { QRCodeSVG } from 'qrcode.react';

interface ProfileCardProps {
  profile: {
    fullName: string;
    username: string;
    memberId: string;
    photoURL?: string;
    bio?: string;
    department?: string;
    year?: string;
    skills?: string[];
    socialLinks?: any;
    favMozTech?: string;
    points?: number;
  };
  isPublic?: boolean;
}

const ProfileCard: React.FC<ProfileCardProps> = ({ profile, isPublic = false }) => {
  const cardRef = useRef<HTMLDivElement>(null);

  const downloadCard = async () => {
    if (cardRef.current === null) return;
    
    try {
      const dataUrl = await toPng(cardRef.current, {
        cacheBust: true,
        backgroundColor: '#09090b',
        style: {
          transform: 'scale(1)',
          borderRadius: '0'
        }
      });
      const link = document.createElement('a');
      link.download = `${profile.username}-mfc-card.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('oops, something went wrong!', err);
    }
  };

  const shareCard = async () => {
    if (cardRef.current === null) return;
    
    try {
      const dataUrl = await toPng(cardRef.current, {
        cacheBust: true,
        backgroundColor: '#09090b',
        style: {
          transform: 'scale(1)',
          borderRadius: '0'
        }
      });
      
      const blob = await (await fetch(dataUrl)).blob();
      const file = new File([blob], `${profile.username}-mfc-card.png`, { type: 'image/png' });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: `MFC ZCOER Member Card - ${profile.fullName}`,
          text: `Check out my official MFC ZCOER member card!`,
        });
      } else {
        // Fallback to download
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
    <div className="flex flex-col items-center gap-8">
      {/* The Actual Card */}
      <div className="relative group perspective-1000">
        <motion.div
          ref={cardRef}
          className="relative w-[340px] h-[500px] bg-zinc-950 rounded-[2.5rem] p-8 border border-white/10 overflow-hidden shadow-2xl"
          whileHover={{ rotateY: 5, rotateX: -5 }}
        >
          {/* Card Overlays */}
          <div className="absolute inset-0 bg-gradient-to-br from-firefox-orange/20 via-transparent to-purple-500/10 pointer-events-none" />
          <div className="absolute top-0 right-0 w-32 h-32 bg-firefox-orange/20 blur-[80px] rounded-full pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-500/20 blur-[80px] rounded-full pointer-events-none" />
          
          {/* QR Code Watermark */}
          <div className="absolute bottom-10 right-8 opacity-20 group-hover:opacity-100 transition-opacity duration-700">
            <QRCodeSVG 
              value={`${window.location.origin}/verify/${profile.username}`} 
              size={60} 
              fgColor="#ffffff" 
              bgColor="transparent" 
            />
          </div>

          {/* Card Content */}
          <div className="relative z-10 h-full flex flex-col">
            {/* Header */}
            <div className="flex justify-between items-start mb-8">
              <div className="w-12 h-12">
                <img crossOrigin="anonymous" src="https://res.cloudinary.com/diyulegc1/image/upload/v1778406665/logo-removebg-preview_b9u9z8.png" alt="MFC" className="w-full h-full object-contain" />
              </div>
              <div className="text-right">
                <p className="text-[10px] font-black tracking-widest text-zinc-500 uppercase">Serial No.</p>
                <p className="text-firefox-orange font-display font-black text-lg leading-tight">{profile.memberId}</p>
              </div>
            </div>

            {/* Avatar Section */}
            <div className="relative w-28 h-28 mx-auto mb-6">
              <div className="absolute inset-0 bg-firefox-orange rounded-full blur-2xl opacity-30" />
              <div className="w-full h-full rounded-full border-2 border-white/20 p-1 relative z-10 overflow-hidden">
                <img 
                  crossOrigin="anonymous"
                  src={profile.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.username}`} 
                  alt={profile.fullName}
                  className="w-full h-full rounded-full object-cover" 
                />
              </div>
            </div>

            <div className="text-center mb-6">
              <h3 className="text-2xl font-display font-black uppercase text-white tracking-tight mb-1">
                {profile.fullName}
              </h3>
              <p className="text-firefox-orange/80 text-[10px] font-black uppercase tracking-[0.3em]">
                @{profile.username}
              </p>
              <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 bg-firefox-orange/10 border border-firefox-orange/20 rounded-full">
                <Trophy size={12} className="text-firefox-orange" />
                <span className="text-firefox-orange font-black text-xs uppercase tracking-widest">{profile.points || 0} PTS</span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex flex-wrap justify-center gap-2">
                {profile.department && (
                  <span className="text-[9px] font-black uppercase tracking-wider px-3 py-1 bg-white/5 border border-white/5 rounded-full text-zinc-400">
                    {profile.department}
                  </span>
                )}
                {profile.year && (
                  <span className="text-[9px] font-black uppercase tracking-wider px-3 py-1 bg-white/5 border border-white/5 rounded-full text-zinc-400">
                    {profile.year} Year
                  </span>
                )}
              </div>

              <div className="h-px bg-white/5 w-full" />

              <div className="space-y-2">
                 <div className="flex items-center gap-2 text-zinc-500">
                   <Globe size={12} className="text-firefox-orange" />
                   <span className="text-[9px] font-black uppercase tracking-widest">Favorite Tech</span>
                 </div>
                 <p className="text-[11px] font-bold text-white uppercase">{profile.favMozTech || "Open Web Tools"}</p>
              </div>

              <div className="space-y-2">
                 <div className="flex items-center gap-2 text-zinc-500">
                   <Award size={12} className="text-firefox-orange" />
                   <span className="text-[9px] font-black uppercase tracking-widest">Top Skills</span>
                 </div>
                 <div className="flex flex-wrap gap-1.5">
                   {profile.skills?.slice(0, 3).map((skill, i) => (
                     <span key={i} className="text-[8px] font-bold text-white/60 bg-white/5 px-2 py-0.5 rounded uppercase">
                       {skill}
                     </span>
                   ))}
                   {!profile.skills?.length && <span className="text-[8px] font-bold text-white/30 uppercase">Learner</span>}
                 </div>
              </div>
            </div>

            {/* Footer Branding */}
            <div className="mt-auto pt-4 flex items-center justify-center gap-2 opacity-40">
              <p className="text-[8px] font-black uppercase tracking-[0.4em] text-zinc-500">Proud Member of MFC ZCOER</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Action Buttons */}
      {!isPublic && (
        <div className="flex flex-col sm:flex-row gap-4">
          <button 
            onClick={downloadCard}
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-white/5 border border-white/10 text-white font-display font-black text-[11px] uppercase tracking-widest hover:bg-white/10 transition-all"
          >
            <Download size={16} />
            Download
          </button>
          <button 
            onClick={shareCard}
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-firefox-orange text-white font-display font-black text-[11px] uppercase tracking-widest hover:shadow-[0_0_20px_rgba(255,92,0,0.4)] transition-all"
          >
            <Share2 size={16} />
            Share Rank Card
          </button>
        </div>
      )}
    </div>
  );
};

export default ProfileCard;
