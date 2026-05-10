import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import ProfileCard from './ProfileCard';
import { Share2, ArrowLeft, Loader2, Twitter, Linkedin, MessageCircle, Send, Instagram, Facebook } from 'lucide-react';
import { 
  TwitterShareButton, 
  LinkedinShareButton, 
  WhatsappShareButton, 
  TelegramShareButton,
  FacebookShareButton,
} from 'react-share';

const PublicProfile = () => {
  const { username } = useParams();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const q = query(collection(db, 'users'), where('username', '==', username), limit(1));
        const querySnapshot = await getDocs(q);
        if (querySnapshot.empty) {
          setError("Profile not found.");
        } else {
          setProfile(querySnapshot.docs[0].data());
        }
      } catch (err) {
        console.error("Error fetching public profile:", err);
        setError("Failed to load profile.");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [username]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20">
        <Loader2 className="text-firefox-orange animate-spin" size={48} />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center pt-20 text-center px-4">
        <h2 className="text-4xl font-display font-black uppercase text-white mb-4">404 Magic Not Found</h2>
        <p className="text-zinc-500 mb-8">{error || "This user hasn't joined the magic yet."}</p>
        <Link to="/community" className="px-8 py-3 bg-white/5 border border-white/10 rounded-full text-white font-display text-[10px] uppercase tracking-widest hover:bg-firefox-orange transition-all">
          Explore Community
        </Link>
      </div>
    );
  }

  const shareUrl = window.location.href;
  const title = `Check out my Mozilla ZCOER Member Card! ${profile.fullName}`;

  return (
    <div className="pt-32 pb-20 px-4 min-h-screen">
      <div className="max-w-4xl mx-auto flex flex-col items-center">
        <Link 
          to="/community"
          className="self-start inline-flex items-center gap-2 text-zinc-500 hover:text-white transition-colors mb-12 group"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          <span className="text-[10px] font-black uppercase tracking-widest">Back to Hub</span>
        </Link>

        <div className="grid lg:grid-cols-2 gap-16 items-center w-full">
          {/* Visual Card */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <ProfileCard profile={profile} isPublic={true} />
          </motion.div>

          {/* Share & Stats */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-12"
          >
            <div className="space-y-4">
              <h1 className="text-4xl md:text-6xl font-display font-black uppercase tracking-tight leading-none">
                Member of <br />
                <span className="text-firefox-orange">MFC ZCOER</span>
              </h1>
              <p className="text-zinc-400 font-medium">
                {profile.bio || "Building the open web and spreading the Mozilla magic at Zeal College."}
              </p>
            </div>

            <div className="space-y-6">
              <h3 className="text-xs font-black uppercase tracking-[0.4em] text-zinc-500 flex items-center gap-3">
                <Share2 size={14} className="text-firefox-orange" />
                Share The Magic
              </h3>
              
              <div className="flex flex-wrap gap-4">
                <WhatsappShareButton url={shareUrl} title={title}>
                  <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-[#25D366] hover:text-white transition-all text-zinc-500">
                    <MessageCircle size={20} />
                  </div>
                </WhatsappShareButton>
                
                <TwitterShareButton url={shareUrl} title={title}>
                  <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-black hover:text-white transition-all text-zinc-500">
                    <Twitter size={20} />
                  </div>
                </TwitterShareButton>

                <LinkedinShareButton url={shareUrl} title={title}>
                  <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-[#0077b5] hover:text-white transition-all text-zinc-500">
                    <Linkedin size={20} />
                  </div>
                </LinkedinShareButton>

                <TelegramShareButton url={shareUrl} title={title}>
                  <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-[#0088cc] hover:text-white transition-all text-zinc-500">
                    <Send size={20} />
                  </div>
                </TelegramShareButton>

                <FacebookShareButton url={shareUrl} quote={title}>
                  <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-[#4267B2] hover:text-white transition-all text-zinc-500">
                    <Facebook size={20} />
                  </div>
                </FacebookShareButton>
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 p-8 rounded-[2rem] backdrop-blur-xl relative group">
              <div className="absolute inset-0 bg-firefox-orange/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-[2rem]" />
              <div className="relative z-10 flex items-center gap-6">
                <div className="w-12 h-12 rounded-xl bg-firefox-orange/20 flex items-center justify-center text-firefox-orange">
                   <Twitter size={24} />
                </div>
                <div>
                   <h4 className="text-sm font-black uppercase tracking-widest text-white mb-1">Verify Authenticity</h4>
                   <p className="text-xs text-zinc-500 uppercase tracking-wider font-bold">Member Since May 2024 • MFCZ Verified</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default PublicProfile;
