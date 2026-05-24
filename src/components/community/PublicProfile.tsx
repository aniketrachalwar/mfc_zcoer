import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'motion/react';
import { collection, query, where, getDocs, limit, doc, getDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import ProfileCard from './ProfileCard';
import AdSenseBlock from '../AdSenseBlock';
import { Share2, ArrowLeft, Loader2, Twitter, Linkedin, MessageCircle, Send, Instagram, Facebook, Github, ExternalLink, Calendar, CheckCircle2, Award } from 'lucide-react';
import { 
  TwitterShareButton, 
  LinkedinShareButton, 
  WhatsappShareButton, 
  TelegramShareButton,
  FacebookShareButton,
} from 'react-share';

const PublicProfile = () => {
  const { username } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const fromTeamPage = location.state?.fromTeamPage;
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [attendedEvents, setAttendedEvents] = useState<any[]>([]);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const q = query(collection(db, 'users'), where('username', '==', username), limit(1));
        const querySnapshot = await getDocs(q);
        if (querySnapshot.empty) {
          setError("Profile not found.");
        } else {
          const userDoc = querySnapshot.docs[0];
          const userData = { id: userDoc.id, ...userDoc.data() } as any;

          const teamQ = query(collection(db, 'team'), where('userId', '==', userDoc.id));
          const teamSnap = await getDocs(teamQ);
          
          if (!teamSnap.empty) {
            const teamDocs = teamSnap.docs.map(d => d.data());
            // Sort by cohort descending so we get the most recent role
            teamDocs.sort((a, b) => (b.cohort || '').localeCompare(a.cohort || ''));
            const latestTeam = teamDocs[0];
            
            userData.professionalTitle = latestTeam.role;
            userData.department = latestTeam.category;
            
            if (latestTeam.category === 'Core Leadership' || latestTeam.category === 'Department Leads') {
              userData.isLeadership = true;
            }
          }

          setProfile(userData);
          
          // Fetch attended events
          try {
            const ticketsQuery = query(collection(db, 'tickets'), where('userId', '==', userData.uid), where('verified', '==', true));
            const ticketsSnap = await getDocs(ticketsQuery);
            const eventsList = [];
            for (const docSnap of ticketsSnap.docs) {
              const tData = docSnap.data();
              if (!tData.cancelled) {
                const evRef = doc(db, 'events', tData.eventId);
                const evSnap = await getDoc(evRef);
                if (evSnap.exists()) {
                  eventsList.push({ id: evSnap.id, ...evSnap.data(), verifiedAt: tData.verifiedAt });
                }
              }
            }
            eventsList.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
            setAttendedEvents(eventsList);
          } catch (e) {
            console.error("Failed to fetch attended events", e);
          }
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
        <button 
          onClick={() => {
            window.scrollTo(0, 0);
            if (fromTeamPage) {
              navigate('/team');
            } else {
              navigate('/community');
            }
          }}
          className="relative z-50 self-start inline-flex items-center gap-2 text-zinc-500 hover:text-white transition-colors mb-12 group cursor-pointer"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          <span className="text-[10px] font-black uppercase tracking-widest">{fromTeamPage ? 'Back to Team' : 'Back to Hub'}</span>
        </button>

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
                {profile.isFoundingMember ? 'Founding Member of' : 'Member of'} <br />
                <span className="text-firefox-orange">MFC Open Web</span>
              </h1>
              <p className="text-zinc-400 font-medium">
                {profile.bio || "Building the open web and spreading the Mozilla magic at Zeal College."}
              </p>
            </div>

            {/* User's Social Links */}
            {(profile.socialLinks?.github || profile.socialLinks?.linkedin || profile.socialLinks?.twitter || profile.socialLinks?.instagram) && (
              <div className="space-y-6">
                <h3 className="text-xs font-black uppercase tracking-[0.4em] text-zinc-500 flex items-center gap-3">
                  <ExternalLink size={14} className="text-firefox-orange" />
                  Connect with {profile.fullName?.split(' ')[0] || 'User'}
                </h3>
                
                <div className="flex flex-wrap gap-4">
                  {profile.socialLinks?.github && (
                    <a href={profile.socialLinks.github.startsWith('http') ? profile.socialLinks.github : `https://github.com/${profile.socialLinks.github.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white hover:text-black transition-all text-zinc-400">
                      <Github size={20} />
                    </a>
                  )}
                  {profile.socialLinks?.linkedin && (
                    <a href={profile.socialLinks.linkedin.startsWith('http') ? profile.socialLinks.linkedin : `https://linkedin.com/in/${profile.socialLinks.linkedin.replace(/^\//, '')}`} target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-[#0077b5] hover:text-white transition-all text-zinc-400">
                      <Linkedin size={20} />
                    </a>
                  )}
                  {profile.socialLinks?.twitter && (
                    <a href={profile.socialLinks.twitter.startsWith('http') ? profile.socialLinks.twitter : `https://twitter.com/${profile.socialLinks.twitter.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-[#1DA1F2] hover:text-white transition-all text-zinc-400">
                      <Twitter size={20} />
                    </a>
                  )}
                  {profile.socialLinks?.instagram && (
                    <a href={profile.socialLinks.instagram.startsWith('http') ? profile.socialLinks.instagram : `https://instagram.com/${profile.socialLinks.instagram.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-[#E1306C] hover:text-white transition-all text-zinc-400">
                      <Instagram size={20} />
                    </a>
                  )}
                </div>
              </div>
            )}

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

                <FacebookShareButton url={shareUrl}>
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
                   <p className="text-xs text-zinc-500 uppercase tracking-wider font-bold">
                     {profile.isFoundingMember ? 'Founding Member' : 'Official Member'} • MFCZ Verified
                   </p>
                </div>
              </div>
            </div>

            {/* Attended Events History & Badges */}
            {attendedEvents.length > 0 && (
              <div className="space-y-6">
                <h3 className="text-xs font-black uppercase tracking-[0.4em] text-zinc-500 flex items-center gap-3">
                  <Award size={14} className="text-firefox-orange" />
                  Event Badges & History
                </h3>
                <div className="space-y-4">
                  {attendedEvents.map(event => (
                    <Link to={`/event/${event.id}`} key={event.id} className="block w-full bg-white/5 hover:bg-white/10 border border-white/10 p-5 rounded-2xl transition-colors group relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-firefox-orange/5 blur-2xl group-hover:bg-firefox-orange/10 transition-colors" />
                      <div className="flex justify-between items-center relative z-10">
                        <div>
                           <p className="text-white font-bold text-sm uppercase tracking-wider group-hover:text-firefox-orange transition-colors">{event.title}</p>
                           <p className="text-zinc-500 text-[10px] font-black tracking-widest uppercase mt-1">
                             {new Date(event.date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                           </p>
                        </div>
                        <div className="flex flex-col items-center gap-1">
                           <div className="w-10 h-10 rounded-full bg-firefox-orange/10 border border-firefox-orange/30 text-firefox-orange flex items-center justify-center shadow-[0_0_15px_rgba(255,92,0,0.2)]">
                             <Award size={20} />
                           </div>
                           <span className="text-[8px] font-black uppercase text-firefox-orange tracking-widest">Attended</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </div>

        {/* AdSense Placeholder */}
        <AdSenseBlock adSlot="public_profile_bottom" className="mt-16" />
      </div>
    </div>
  );
};

export default PublicProfile;
