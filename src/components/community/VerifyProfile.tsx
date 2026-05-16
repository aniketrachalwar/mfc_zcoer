import { useState, useEffect, FormEvent } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { collection, query, where, getDocs, limit, doc, getDoc, updateDoc, increment } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { ShieldCheck, XCircle, Loader2, ArrowLeft, Search, ScanLine, TicketCheck, Lock, Camera } from 'lucide-react';
import { useAuth } from '../../lib/AuthContext';
import { Html5Qrcode } from 'html5-qrcode';

const VerifyProfile = () => {
  const { username } = useParams<{ username?: string }>(); // acts as ID param
  const { user } = useAuth();
  
  const [accessGranted, setAccessGranted] = useState(false);
  const [checkingAccess, setCheckingAccess] = useState(true);

  const [profile, setProfile] = useState<any>(null);
  const [ticket, setTicket] = useState<any>(null);
  const [eventData, setEventData] = useState<any>(null);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);
  const [isScanning, setIsScanning] = useState(false);

  const [showAttendanceForm, setShowAttendanceForm] = useState(false);
  const [attendanceData, setAttendanceData] = useState({
    zprn: '',
    department: '',
    division: '',
    rollNo: ''
  });
  const [pendingTicketRef, setPendingTicketRef] = useState<any>(null);
  const [pendingTicketData, setPendingTicketData] = useState<any>(null);

  useEffect(() => {
    let html5QrCode: Html5Qrcode | null = null;

    if (isScanning) {
      // Need a slight delay to ensure the DOM element is rendered
      setTimeout(() => {
        html5QrCode = new Html5Qrcode("qr-reader");
        html5QrCode.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: { width: 250, height: 250 } },
          (decodedText) => {
            if (html5QrCode && html5QrCode.isScanning) {
              html5QrCode.stop().then(() => {
                setIsScanning(false);
                setSearchInput(decodedText);
                performVerification(decodedText);
              }).catch(console.error);
            }
          },
          (errorMessage) => {
            // ignore continuous scanning errors
          }
        ).catch((err) => {
          console.error("Camera error:", err);
          setIsScanning(false);
          setError("Camera access denied or unavailable.");
        });
      }, 100);
    }

    return () => {
      if (html5QrCode && html5QrCode.isScanning) {
        html5QrCode.stop().catch(console.error);
      }
    };
  }, [isScanning]);

  // 1. Check Access
  useEffect(() => {
    const checkAccess = async () => {
      if (!user) {
        setCheckingAccess(false);
        return;
      }
      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        const role = userDoc.data()?.role;
        if (['admin', 'president', 'core_team', 'volunteer'].includes(role)) {
          setAccessGranted(true);
        }
      } catch (err) {
        console.error("Failed to check access role", err);
      } finally {
        setCheckingAccess(false);
      }
    };
    checkAccess();
  }, [user]);

  // 2. Handle Search / Verification
  const performVerification = async (queryStr: string) => {
    setSearchLoading(true);
    setError(null);
    setProfile(null);
    setTicket(null);
    setEventData(null);
    
    try {
      // Extract ID if a full URL is scanned
      let processedQuery = queryStr.trim();
      try {
        const url = new URL(processedQuery);
        const pathParts = url.pathname.split('/').filter(Boolean);
        if (pathParts.includes('verify')) {
          processedQuery = pathParts[pathParts.indexOf('verify') + 1] || processedQuery;
        }
      } catch (e) {
        if (processedQuery.includes('/verify/')) {
          const parts = processedQuery.split('/verify/');
          const lastPart = parts.pop() || '';
          processedQuery = lastPart.endsWith('/') ? lastPart.slice(0, -1) : lastPart;
          processedQuery = processedQuery || queryStr;
        }
      }

      // Is it an Event Ticket ID? (format: userId_eventId)
      if (processedQuery.includes('_')) {
        const ticketRef = doc(db, 'tickets', processedQuery);
        const ticketSnap = await getDoc(ticketRef);
        
        if (ticketSnap.exists()) {
          const ticketData = ticketSnap.data();

          if (ticketData.cancelled) {
             setError(`This ticket was cancelled by the attendee. Reason: ${ticketData.cancelReason || 'None given'}`);
             setSearchLoading(false);
             return;
          }

          const isNewlyVerified = !ticketData.verified;

          const userSnap = await getDoc(doc(db, 'users', ticketData.userId));
          const eventSnap = await getDoc(doc(db, 'events', ticketData.eventId));

          if (isNewlyVerified) {
            setPendingTicketRef(ticketRef);
            setPendingTicketData({ id: ticketSnap.id, ...ticketData });
            setAttendanceData({
              zprn: ticketData.zprn || '',
              department: ticketData.department || '',
              division: ticketData.division || '',
              rollNo: ticketData.rollNo || ''
            });
            setProfile(userSnap.data());
            setEventData(eventSnap.data());
            setShowAttendanceForm(true);
            setSearchLoading(false);
            return;
          }
          
          setTicket({ id: ticketSnap.id, ...ticketData, isNewlyVerified });
          setProfile(userSnap.data());
          setEventData(eventSnap.data());
          setSearchLoading(false);
          return;
        }
      }

      // Otherwise, it's a Member ID or Username search
      let q = query(collection(db, 'users'), where('username', '==', processedQuery), limit(1));
      let querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        q = query(collection(db, 'users'), where('memberId', '==', processedQuery), limit(1));
        querySnapshot = await getDocs(q);
      }
      
      if (querySnapshot.empty) {
        setError("Profile or Ticket not found.");
      } else {
        setProfile(querySnapshot.docs[0].data());
      }
    } catch (err) {
      console.error("Error verifying:", err);
      setError("Failed to process verification.");
    } finally {
      setSearchLoading(false);
      setLoading(false);
    }
  };

  // 3. Process URL param if present
  useEffect(() => {
    if (accessGranted && username) {
      setLoading(true);
      performVerification(username);
    }
  }, [username, accessGranted]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      performVerification(searchInput.trim());
    }
  };

  const submitAttendance = async (e: FormEvent) => {
    e.preventDefault();
    if (!pendingTicketRef) return;
    
    setLoading(true);
    try {
      await updateDoc(pendingTicketRef, {
        verified: true,
        verifiedAt: new Date().toISOString(),
        verifiedBy: user?.uid,
        ...attendanceData
      });
      
      if (pendingTicketData.userId) {
        const userRef = doc(db, 'users', pendingTicketData.userId);
        await updateDoc(userRef, { points: increment(15) });
      }
      
      setTicket({ ...pendingTicketData, verified: true, isNewlyVerified: true, ...attendanceData });
      setShowAttendanceForm(false);
    } catch (err) {
      console.error(err);
      setError("Failed to mark attendance.");
      setShowAttendanceForm(false);
    } finally {
      setLoading(false);
    }
  };

  if (checkingAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20 bg-[#09090b]">
        <Loader2 className="text-firefox-orange animate-spin" size={48} />
      </div>
    );
  }

  if (!accessGranted) {
    return (
      <div className="min-h-screen bg-[#09090b] pt-32 pb-20 px-4 flex flex-col items-center justify-center text-center">
        <Lock className="text-zinc-600 mb-6" size={64} />
        <h1 className="text-3xl font-display font-black uppercase text-white mb-4">Scanner Locked</h1>
        <p className="text-zinc-400 mb-8 max-w-md">You do not have permission to access the verification scanner. This feature is restricted to Volunteers and Core Team members.</p>
        <Link to="/" className="px-8 py-3 bg-firefox-orange text-white rounded-full font-display font-black text-[10px] uppercase tracking-widest hover:bg-white hover:text-black transition-all">
          Return Home
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20 bg-[#09090b]">
        <Loader2 className="text-firefox-orange animate-spin" size={48} />
      </div>
    );
  }

  if (error || (!profile && !ticket && username && !searchLoading)) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center pt-20 bg-[#09090b] text-center px-4 relative">
        <XCircle className="text-red-500 mb-6" size={80} />
        <h2 className="text-4xl font-display font-black uppercase text-white mb-4">Verification Failed</h2>
        <p className="text-zinc-500 mb-8 max-w-md">{error || "The provided identifier is invalid."}</p>
        
        <div className="flex gap-4">
          <button onClick={() => { setError(null); setSearchInput(''); setIsScanning(false); setShowAttendanceForm(false); window.history.replaceState(null, '', '/verify'); }} className="px-8 py-3 bg-white/5 border border-white/10 rounded-full text-white font-display text-[10px] uppercase tracking-widest hover:bg-white/10 transition-all">
            Scan Another
          </button>
        </div>
      </div>
    );
  }

  // --- ATTENDANCE FORM VIEW ---
  if (showAttendanceForm && profile && eventData) {
    return (
      <div className="min-h-screen bg-[#09090b] pt-32 pb-20 px-4 flex flex-col items-center justify-center">
        <button onClick={() => { setShowAttendanceForm(false); setProfile(null); window.history.replaceState(null, '', '/verify'); }} className="absolute top-24 left-4 md:left-12 z-20 cursor-pointer inline-flex items-center gap-2 text-zinc-500 hover:text-white transition-colors group">
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          <span className="text-[10px] font-black uppercase tracking-widest">Cancel</span>
        </button>

        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="max-w-md w-full bg-zinc-900 border border-firefox-orange/30 rounded-[2rem] p-8 shadow-[0_0_50px_rgba(255,92,0,0.1)] relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-b from-firefox-orange/10 to-transparent pointer-events-none" />
          
          <div className="relative z-10 flex flex-col items-center mb-6">
            <h1 className="text-2xl font-display font-black uppercase text-white mb-2">Mark Attendance</h1>
            <p className="text-zinc-400 text-xs text-center">Collecting details for <span className="text-firefox-orange font-bold">{profile.fullName}</span> at <span className="text-white font-bold">{eventData.title}</span>.</p>
          </div>

          <form onSubmit={submitAttendance} className="relative z-10 space-y-4">
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1 block">ZPRN No.</label>
              <input
                type="text"
                required
                value={attendanceData.zprn}
                onChange={(e) => setAttendanceData({...attendanceData, zprn: e.target.value})}
                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-firefox-orange transition-colors"
                placeholder="e.g. ZCOER/2026/001"
              />
            </div>
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1 block">Department</label>
              <input
                type="text"
                required
                value={attendanceData.department}
                onChange={(e) => setAttendanceData({...attendanceData, department: e.target.value})}
                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-firefox-orange transition-colors"
                placeholder="e.g. Computer Engineering"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1 block">Division</label>
                <input
                  type="text"
                  required
                  value={attendanceData.division}
                  onChange={(e) => setAttendanceData({...attendanceData, division: e.target.value})}
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-firefox-orange transition-colors"
                  placeholder="e.g. A"
                />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1 block">Roll No.</label>
                <input
                  type="text"
                  required
                  value={attendanceData.rollNo}
                  onChange={(e) => setAttendanceData({...attendanceData, rollNo: e.target.value})}
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-firefox-orange transition-colors"
                  placeholder="e.g. 42"
                />
              </div>
            </div>
            <button
              type="submit"
              className="w-full mt-6 py-4 bg-firefox-orange text-white rounded-xl font-display font-black uppercase tracking-widest text-xs hover:shadow-[0_0_20px_rgba(255,92,0,0.4)] transition-all"
            >
              Confirm Attendance
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  // --- TICKET VERIFIED VIEW ---
  if (ticket && profile && eventData) {
    return (
      <div className="min-h-screen bg-[#09090b] pt-32 pb-20 px-4 flex flex-col items-center justify-center">
        <button onClick={() => { setTicket(null); setProfile(null); window.history.replaceState(null, '', '/verify'); }} className="absolute top-24 left-4 md:left-12 z-20 cursor-pointer inline-flex items-center gap-2 text-zinc-500 hover:text-white transition-colors group">
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          <span className="text-[10px] font-black uppercase tracking-widest">Back to Scanner</span>
        </button>

        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="max-w-md w-full bg-zinc-900 border border-blue-500/30 rounded-[2rem] p-8 shadow-[0_0_50px_rgba(59,130,246,0.1)] relative overflow-hidden text-center"
        >
          <div className="absolute inset-0 bg-gradient-to-b from-blue-500/10 to-transparent pointer-events-none" />
          
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-24 h-24 bg-blue-500/20 rounded-full flex items-center justify-center mb-6">
              <TicketCheck className="text-blue-500" size={48} />
            </div>
            
            <h1 className="text-3xl font-display font-black uppercase text-blue-500 mb-2">Event Ticket</h1>
            
            {ticket.isNewlyVerified ? (
              <div className="bg-green-500/20 border border-green-500/50 text-green-400 text-xs font-black uppercase tracking-widest px-4 py-2 rounded-full mb-6 flex items-center gap-2">
                <ShieldCheck size={16} /> Verified Just Now
              </div>
            ) : (
              <div className="bg-orange-500/20 border border-orange-500/50 text-orange-400 text-xs font-black uppercase tracking-widest px-4 py-2 rounded-full mb-6 flex items-center gap-2">
                <ShieldCheck size={16} /> Already Verified
              </div>
            )}

            <div className="w-20 h-20 rounded-full border-2 border-white/10 p-1 mb-4 overflow-hidden bg-black">
              <img 
                src={profile.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.username}`} 
                alt={profile.fullName}
                className="w-full h-full rounded-full object-cover" 
              />
            </div>

            <h2 className="text-2xl font-display font-black uppercase text-white mb-1">{profile.fullName}</h2>
            <p className="text-zinc-500 text-xs font-black uppercase tracking-[0.2em] mb-6">@{profile.username}</p>

            <div className="w-full space-y-3 bg-black/40 rounded-xl p-4 border border-white/5">
              <div className="flex justify-between items-center py-2 border-b border-white/5">
                <span className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">Event</span>
                <span className="text-white text-xs font-bold uppercase">{eventData.title}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-white/5">
                <span className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">Ticket ID</span>
                <span className="text-white text-[10px] font-mono opacity-50 truncate w-32 text-right">{ticket.id}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">Admit</span>
                <span className="text-white text-xs font-bold uppercase">1 Person</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  // --- PROFILE VERIFIED VIEW ---
  if (profile && !ticket) {
    return (
      <div className="min-h-screen bg-[#09090b] pt-32 pb-20 px-4 flex flex-col items-center justify-center">
        <button onClick={() => { setProfile(null); window.history.replaceState(null, '', '/verify'); }} className="absolute top-24 left-4 md:left-12 z-20 cursor-pointer inline-flex items-center gap-2 text-zinc-500 hover:text-white transition-colors group">
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          <span className="text-[10px] font-black uppercase tracking-widest">Back to Scanner</span>
        </button>

        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="max-w-md w-full bg-zinc-900 border border-[#22c55e]/30 rounded-[2rem] p-8 shadow-[0_0_50px_rgba(34,197,94,0.1)] relative overflow-hidden text-center"
        >
          <div className="absolute inset-0 bg-gradient-to-b from-[#22c55e]/10 to-transparent pointer-events-none" />
          
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-24 h-24 bg-[#22c55e]/20 rounded-full flex items-center justify-center mb-6">
              <ShieldCheck className="text-[#22c55e]" size={48} />
            </div>
            
            <h1 className="text-3xl font-display font-black uppercase text-[#22c55e] mb-2">Verified Member</h1>
            <p className="text-zinc-400 text-sm font-medium mb-8">This is an authentic MFC ZCOER member card.</p>

            <div className="w-24 h-24 rounded-full border-2 border-white/10 p-1 mb-4 overflow-hidden">
              <img 
                src={profile.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.username}`} 
                alt={profile.fullName}
                className="w-full h-full rounded-full object-cover" 
              />
            </div>

            <h2 className="text-2xl font-display font-black uppercase text-white mb-1">
              {profile.fullName}
            </h2>
            <p className="text-firefox-orange text-xs font-black uppercase tracking-[0.2em] mb-6">
              @{profile.username}
            </p>

            <div className="w-full space-y-3">
              <div className="flex justify-between items-center py-3 border-t border-white/10">
                <span className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">Member ID</span>
                <span className="text-white font-mono font-bold">{profile.memberId}</span>
              </div>
              {profile.department && (
                <div className="flex justify-between items-center py-3 border-t border-white/10">
                  <span className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">Department</span>
                  <span className="text-white text-xs font-bold uppercase">{profile.department}</span>
                </div>
              )}
              {profile.year && (
                <div className="flex justify-between items-center py-3 border-t border-white/10">
                  <span className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">Year</span>
                  <span className="text-white text-xs font-bold uppercase">{profile.year}</span>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  // --- SCANNER INPUT VIEW ---
  return (
    <div className="min-h-screen bg-[#09090b] pt-32 pb-20 px-4 flex flex-col items-center justify-center">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="max-w-md w-full bg-zinc-900 border border-white/10 rounded-[2rem] p-8 shadow-2xl relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-firefox-orange/10 blur-[80px] rounded-full pointer-events-none" />
        
        <div className="relative z-10 flex flex-col items-center text-center mb-8">
          <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-6 text-firefox-orange border border-white/10">
            <ScanLine size={32} />
          </div>
          <h1 className="text-3xl font-display font-black uppercase text-white mb-2">Scanner Console</h1>
          <p className="text-zinc-400 text-sm font-medium">Scan an Event Ticket QR code or Member ID. Scanner app will automatically submit the code.</p>
        </div>

        {isScanning ? (
          <div className="relative z-10 flex flex-col items-center w-full">
            <div id="qr-reader" className="w-full rounded-xl overflow-hidden border-2 border-firefox-orange mb-4 bg-black/50"></div>
            <button
              onClick={() => setIsScanning(false)}
              className="w-full py-4 bg-white/5 border border-white/10 text-white rounded-xl font-display font-black uppercase tracking-widest text-xs hover:bg-white/10 transition-all flex justify-center items-center"
            >
              Cancel Scan
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="relative z-10 flex flex-col gap-4">
            <button
              type="button"
              onClick={() => setIsScanning(true)}
              className="w-full py-4 bg-white/5 border border-firefox-orange/30 text-firefox-orange rounded-xl font-display font-black uppercase tracking-widest text-xs hover:bg-firefox-orange/10 hover:border-firefox-orange transition-all flex justify-center items-center gap-2"
            >
              <Camera size={18} />
              Open Camera to Scan
            </button>
            
            <div className="flex items-center gap-4 my-2">
              <div className="flex-1 h-px bg-white/10"></div>
              <span className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">Or enter manually</span>
              <div className="flex-1 h-px bg-white/10"></div>
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                <Search size={18} className="text-zinc-500" />
              </div>
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Type ID..."
                className="w-full bg-black/50 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white placeholder:text-zinc-600 focus:outline-none focus:border-firefox-orange transition-colors"
                autoFocus
              />
            </div>
            <button
              type="submit"
              disabled={searchLoading || !searchInput.trim()}
              className="w-full py-4 bg-firefox-orange text-white rounded-xl font-display font-black uppercase tracking-widest text-xs hover:shadow-[0_0_20px_rgba(255,92,0,0.4)] disabled:opacity-50 disabled:hover:shadow-none transition-all flex justify-center items-center h-[52px]"
            >
              {searchLoading ? <Loader2 className="animate-spin" size={20} /> : "Verify Code"}
            </button>
          </form>
        )}
      </motion.div>
    </div>
  );
};

export default VerifyProfile;
