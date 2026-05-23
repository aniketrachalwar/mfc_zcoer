import React, { useRef, useState } from 'react';
import { motion } from 'motion/react';
import { Download, Share2, Globe, Award, Trophy, Sparkles, Edit2, Shield } from 'lucide-react';
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

  const tier = (profile?.membershipTier || 'free').toLowerCase();
  const isPremium = tier === 'silver' || tier === 'platinum';
  const isExpired = profile?.membershipStatus === 'expired';
  const showMemberId = !isExpired;
  
  const professionalTitle = localTitle || profile?.professionalTitle || (tier === 'platinum' ? 'Platinum Member' : tier === 'silver' ? 'Silver Member' : 'Member');

  const getTierStyles = () => {
    switch (tier) {
      case 'platinum':
        return {
          cardBg: 'bg-zinc-950',
          gradient: 'from-slate-100/30 via-slate-300/20 to-white/20',
          glow1: 'bg-slate-100/30',
          glow2: 'bg-white/30',
          textColor: 'text-white',
          badgeBg: 'bg-gradient-to-r from-slate-100 via-white to-slate-200 shadow-[0_0_15px_rgba(255,255,255,0.5)]',
          badgeText: 'text-zinc-900 font-serif italic tracking-wide font-bold capitalize',
          border: 'border-white/50 hover:border-white/80 shadow-[0_0_30px_rgba(255,255,255,0.15)]'
        };
      case 'silver':
        return {
          cardBg: 'bg-zinc-950',
          gradient: 'from-zinc-400/10 via-zinc-500/5 to-zinc-600/10',
          glow1: 'bg-zinc-500/20',
          glow2: 'bg-zinc-400/20',
          textColor: 'text-zinc-400',
          badgeBg: 'bg-gradient-to-r from-zinc-400 to-zinc-600',
          badgeText: 'text-white font-black uppercase tracking-widest',
          border: 'border-zinc-600/30 hover:border-zinc-500/50'
        };
      default: // Free
        return {
          cardBg: 'bg-zinc-900/80 backdrop-blur-xl',
          gradient: 'from-white/10 to-transparent',
          glow1: 'bg-firefox-orange/20',
          glow2: 'bg-blue-500/20',
          textColor: 'text-zinc-400',
          badgeBg: 'bg-white/10 border-white/20',
          badgeText: 'text-white font-black uppercase tracking-widest',
          border: 'border-white/20'
        };
    }
  };

  const theme = getTierStyles();

  const downloadCard = async () => {
    if (cardRef.current === null) return;
    try {
      const dataUrl = await toPng(cardRef.current, {
        cacheBust: true,
        backgroundColor: '#09090b',
        style: { transform: 'scale(1)', borderRadius: '0' },
        pixelRatio: 2 // Higher quality for horizontal cards
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
        backgroundColor: '#09090b',
        style: { transform: 'scale(1)', borderRadius: '0' },
        pixelRatio: 2
      });
      const blob = await (await fetch(dataUrl)).blob();
      const file = new File([blob], `${profile.username}-mfc-card.png`, { type: 'image/png' });
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: `MFC ZCOER Business Card - ${profile.fullName}`,
          text: `Check out my official MFC ZCOER business card!`,
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

  // ----------------------------------------------------
  // FREE TIER VERTICAL LAYOUT
  // ----------------------------------------------------
  if (!isPremium) {
    return (
      <div className="flex flex-col items-center gap-8">
        <div className="relative group perspective-1000">
          <motion.div
            ref={cardRef}
            className={`relative w-full max-w-[340px] min-h-[480px] sm:h-[500px] ${theme.cardBg} rounded-[2.5rem] p-6 sm:p-8 ${theme.border} overflow-hidden shadow-2xl transition-colors`}
            whileHover={{ rotateY: 5, rotateX: -5 }}
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${theme.gradient} pointer-events-none`} />
            <div className={`absolute top-0 right-0 w-64 h-64 ${theme.glow1} blur-[80px] rounded-full pointer-events-none`} />
            <div className={`absolute bottom-0 left-0 w-64 h-64 ${theme.glow2} blur-[80px] rounded-full pointer-events-none`} />
            
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
            
            <div className="absolute bottom-10 right-8 opacity-20 group-hover:opacity-100 transition-opacity duration-700">
              <QRCodeSVG value={`${window.location.origin}/verify/${profile.username}`} size={60} fgColor="#ffffff" bgColor="transparent" />
            </div>

            <div className="relative z-10 h-full flex flex-col">
              <div className="flex justify-between items-start mb-8 min-h-[48px]">
                <div className="w-12 h-12">
                  <img loading="lazy" src="https://res.cloudinary.com/diyulegc1/image/upload/v1778406665/logo-removebg-preview_b9u9z8.png" alt="MFC" className="w-full h-full object-contain" />
                </div>
                {showMemberId && profile?.memberId && (
                  <div className="text-right">
                    <p className="text-[10px] font-black tracking-widest text-zinc-500 uppercase">Serial No.</p>
                    <p className={`${theme.textColor} font-display font-black text-lg leading-tight`}>{profile.memberId}</p>
                  </div>
                )}
              </div>

              <div className="relative w-28 h-28 mx-auto mb-6">
                <div className="absolute inset-0 bg-firefox-orange rounded-full blur-2xl opacity-30" />
                <div className="w-full h-full rounded-full border-2 border-white/20 p-1 relative z-10 overflow-hidden">
                  <img loading="lazy" src={profile.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.username || 'unknown'}`} alt={profile.fullName || 'Unknown User'} className="w-full h-full rounded-full object-cover aspect-square" />
                </div>
              </div>

              <div className="text-center mb-6">
                <h3 className="text-2xl font-display font-black uppercase text-white tracking-tight mb-1 line-clamp-1">{profile.fullName || 'Unknown User'}</h3>
                <p className="text-firefox-orange/80 text-[10px] font-black uppercase tracking-[0.3em] line-clamp-1">@{profile.username || 'unknown'}</p>
                <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-firefox-orange/10 border border-firefox-orange/20 rounded-full">
                    <Trophy size={12} className="text-firefox-orange" />
                    <span className="text-firefox-orange font-black text-xs uppercase tracking-widest">{profile.points || 0} PTS</span>
                  </div>
                </div>
                <div className="mt-3">
                  <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full ${theme.badgeBg} shadow-lg`}>
                    <Award size={14} className={tier === 'platinum' ? 'text-black' : 'text-white'} />
                    <span className={`${theme.badgeText} text-[10px]`}>{tier} Member</span>
                  </div>
                </div>
              </div>

              <div className="mt-auto pt-4 flex items-center justify-center gap-2 opacity-40">
                <p className="text-[8px] font-black uppercase tracking-[0.4em] text-zinc-500">Proud Member of MFC ZCOER</p>
              </div>
            </div>
          </motion.div>
        </div>
        
        {!isPublic && (
          <div className="flex flex-col sm:flex-row gap-4">
            <button onClick={downloadCard} className="flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-white/5 border border-white/10 text-white font-display font-black text-[11px] uppercase tracking-widest hover:bg-white/10 transition-all">
              <Download size={16} /> Download
            </button>
            <button onClick={shareCard} className="flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-firefox-orange text-white font-display font-black text-[11px] uppercase tracking-widest hover:shadow-[0_0_20px_rgba(255,92,0,0.4)] transition-all">
              <Share2 size={16} /> Share Card
            </button>
          </div>
        )}
      </div>
    );
  }

  // ----------------------------------------------------
  // PREMIUM TIER HORIZONTAL BUSINESS CARD LAYOUT
  // ----------------------------------------------------
  return (
    <div className="flex flex-col items-center gap-8 w-full max-w-2xl mx-auto">
      <div className="relative group perspective-1000 w-full">
        <motion.div
          ref={cardRef}
          className={`relative w-full min-h-[220px] sm:aspect-[1.75] ${theme.cardBg} rounded-[2rem] sm:rounded-3xl p-4 sm:p-6 ${theme.border} overflow-hidden shadow-2xl transition-colors flex flex-row items-stretch`}
          whileHover={{ scale: 1.02 }}
        >
          {/* Card Overlays */}
          <div className={`absolute inset-0 bg-gradient-to-br ${theme.gradient} pointer-events-none`} />
          <div className={`absolute top-0 right-0 w-48 h-48 ${theme.glow1} blur-[100px] rounded-full pointer-events-none`} />
          <div className={`absolute bottom-0 left-0 w-48 h-48 ${theme.glow2} blur-[100px] rounded-full pointer-events-none`} />
          
          {/* Subtle grid background for tech feel */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:14px_24px] pointer-events-none" />

          {/* Left Column: Avatar & Branding */}
          <div className="w-[35%] sm:w-1/3 flex flex-col items-center justify-center border-r border-white/10 pr-4 sm:pr-5 relative z-10">
            <div className="relative w-16 h-16 sm:w-20 sm:h-20 mb-3 sm:mb-4">
              <div className="absolute inset-0 bg-firefox-orange rounded-full blur-xl opacity-20" />
              <div className="w-full h-full rounded-full border border-white/20 p-0.5 sm:p-1 relative z-10 overflow-hidden bg-black/50 backdrop-blur-sm">
                <img loading="lazy" src={profile.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.username || 'unknown'}`} alt={profile.fullName} className="w-full h-full rounded-full object-cover aspect-square" />
              </div>
            </div>
            
            <div className="w-8 h-8 sm:w-10 sm:h-10 opacity-80 mix-blend-screen">
              <img loading="lazy" src="https://res.cloudinary.com/diyulegc1/image/upload/v1778406665/logo-removebg-preview_b9u9z8.png" alt="MFC" className="w-full h-full object-contain" />
            </div>
            <p className="mt-2 text-[8px] sm:text-[10px] font-black tracking-widest text-zinc-500 uppercase text-center">MFC ZCOER</p>
          </div>

          {/* Right Column: Information */}
          <div className="w-[65%] sm:w-2/3 flex flex-col justify-between pl-4 sm:pl-5 relative z-10 py-1 sm:py-0">
            {/* Top Right: Status & ID */}
            <div className="flex flex-col sm:flex-row sm:justify-between items-start gap-1 sm:gap-2 w-full">
              <div className={`inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full ${theme.badgeBg} shadow-lg shrink-0`}>
                <Shield size={8} className={`sm:w-[10px] sm:h-[10px] ${tier === 'platinum' ? 'text-black' : 'text-white'}`} />
                <span className={`${theme.badgeText} text-[8px] sm:text-[10px]`}>{tier} Member</span>
              </div>
              {showMemberId && profile?.memberId && (
                <div className="text-left sm:text-right shrink-0">
                  <p className="text-[6px] sm:text-[8px] font-black tracking-widest text-zinc-500 uppercase">Serial No.</p>
                  <p className={`${theme.textColor} font-mono font-black text-[10px] sm:text-sm leading-tight tracking-wider truncate max-w-[120px] sm:max-w-full`}>{profile.memberId}</p>
                </div>
              )}
            </div>

            {/* Middle Right: Identity */}
            <div className="my-auto py-2 sm:py-0 w-full">
              <h3 className="text-sm sm:text-xl md:text-2xl font-display font-black uppercase text-white tracking-tight leading-none mb-0.5 sm:mb-1 line-clamp-2 break-words">
                {profile.fullName || 'Unknown User'}
              </h3>
              <p className="text-firefox-orange text-[9px] sm:text-xs font-bold uppercase tracking-wider mb-1 sm:mb-2 line-clamp-1">
                {professionalTitle}
              </p>
              <p className="text-zinc-500 text-[8px] sm:text-[10px] font-mono line-clamp-1">
                @{profile.username || 'unknown'} • {profile.department}
              </p>
            </div>

            {/* Bottom Right: QR & Footer details */}
            <div className="flex justify-between items-end gap-2">
              <div className="space-y-0.5 sm:space-y-1">
                <div className="flex items-center gap-1 sm:gap-2">
                  <Trophy size={8} className="sm:w-[10px] sm:h-[10px] text-firefox-orange" />
                  <span className="text-[8px] sm:text-[10px] font-bold text-white">{profile.points || 0} Points</span>
                </div>
                {profile.isFoundingMember && (
                  <div className="flex items-center gap-1 sm:gap-2">
                    <Sparkles size={8} className="sm:w-[10px] sm:h-[10px] text-yellow-500" />
                    <span className="text-[8px] sm:text-[10px] font-bold text-yellow-500">Founding Member</span>
                  </div>
                )}
              </div>
              <div className="shrink-0 bg-white p-1 sm:p-1.5 rounded-lg sm:rounded-xl shadow-lg">
                <QRCodeSVG value={`${window.location.origin}/verify/${profile.username}`} size={window.innerWidth < 640 ? 32 : 40} fgColor="#000000" bgColor="transparent" />
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Action Buttons */}
      {!isPublic && (
        <div className="flex flex-wrap justify-center gap-4 w-full">
          {tier === 'platinum' && (
            <button 
              onClick={() => setIsModalOpen(true)}
              className="flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-white/5 border border-white/10 text-white font-display font-black text-[11px] uppercase tracking-widest hover:bg-white/10 transition-all flex-1 sm:flex-none"
            >
              <Edit2 size={16} /> Customize Card
            </button>
          )}
          <button 
            onClick={downloadCard}
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-white/5 border border-white/10 text-white font-display font-black text-[11px] uppercase tracking-widest hover:bg-white/10 transition-all flex-1 sm:flex-none"
          >
            <Download size={16} /> Download
          </button>
          <button 
            onClick={shareCard}
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-firefox-orange text-white font-display font-black text-[11px] uppercase tracking-widest hover:shadow-[0_0_20px_rgba(255,92,0,0.4)] transition-all flex-1 sm:flex-none w-full sm:w-auto"
          >
            <Share2 size={16} /> Share Business Card
          </button>
        </div>
      )}

      {/* Customization Modal */}
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
