import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Calendar, MapPin, Trophy, ArrowLeft, CheckCircle2, Clock, Download, XCircle, Ticket, Loader2, Star } from 'lucide-react';
import { useParams, Link } from 'react-router-dom';
import { doc, getDoc, setDoc, updateDoc, increment, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../lib/AuthContext';
import { QRCodeSVG } from 'qrcode.react';
import { toPng } from 'html-to-image';

const EventDetails = () => {
  const { id } = useParams<{ id: string }>();
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [registeredCount, setRegisteredCount] = useState(0);
  const [isVerified, setIsVerified] = useState(false);
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [attending, setAttending] = useState(false);
  const [ticketId, setTicketId] = useState<string | null>(null);
  const [customCertificate, setCustomCertificate] = useState("");
  const [userFullName, setUserFullName] = useState("");
  const [showCancelForm, setShowCancelForm] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [isCancelling, setIsCancelling] = useState(false);
  
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [feedbackText, setFeedbackText] = useState("");
  const [feedbackRating, setFeedbackRating] = useState(0);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  
  const [showRegistrationForm, setShowRegistrationForm] = useState(false);
  const [registrationData, setRegistrationData] = useState({
    zprn: '',
    department: '',
    division: '',
    rollNo: ''
  });

  const [userTier, setUserTier] = useState('free');
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [couponError, setCouponError] = useState('');
  const [validatingCoupon, setValidatingCoupon] = useState(false);
  const [transactionId, setTransactionId] = useState('');

  const { user } = useAuth();

  useEffect(() => {
    const fetchEvent = async () => {
      if (!id) return;
      
      // Fallback for hardcoded preview event
      if (id === 'hackathon-2026') {
        setEvent({
          id: 'hackathon-2026',
          title: "Open Source Hackathon 2026",
          type: "Upcoming Event",
          desc: "Join the brightest minds at ZCOER for a 48-hour coding marathon. Build innovative open-source tools, collaborate with peers, and win exciting prizes. Whether you are a beginner or a pro, there's a place for you here.",
          date: "2026-05-25T09:00:00",
          location: "Innovation Hub, ZCOER Pune",
          prizes: "₹50,000 Pool + Exclusive Swags"
        });
        setLoading(false);
        return;
      }

      try {
        const docRef = doc(db, 'events', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setEvent({ id: docSnap.id, ...docSnap.data() });
        } else {
          console.error("Event not found");
        }
      } catch (err) {
        console.error("Error fetching event details:", err);
      }
      
      // Check if user already has a ticket
      if (user && id && id !== 'hackathon-2026') {
        try {
          const tktRef = doc(db, 'tickets', `${user.uid}_${id}`);
          const tktSnap = await getDoc(tktRef);
          if (tktSnap.exists() && !tktSnap.data().cancelled) {
            setAttending(true);
            setTicketId(tktSnap.id);
            setCustomCertificate(tktSnap.data().customCertificate || "");
            if (tktSnap.data().verified) {
              setIsVerified(true);
            }
            if (tktSnap.data().feedback) {
              setFeedbackSubmitted(true);
            }
          }
          
          // Fetch user full name for certificate
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
             setUserFullName(userDoc.data().fullName || user.displayName || 'Participant');
             setUserTier(userDoc.data().membershipTier || 'free');
          } else {
             setUserFullName(user.displayName || 'Participant');
             setUserTier('free');
          }
        } catch (err) {
          console.error("Error fetching ticket/user:", err);
        }
      }
      
      try {
        const q = query(collection(db, 'tickets'), where('eventId', '==', id), where('cancelled', '==', false));
        const snap = await getDocs(q);
        setRegisteredCount(snap.size);
      } catch (err) {
        console.error(err);
      }

      setLoading(false);
    };
    fetchEvent();
  }, [id, user]);

  useEffect(() => {
    if (!event || !event.date) return;

    const eventDate = new Date(event.date).getTime();

    const calculateTime = () => {
      const now = new Date().getTime();
      const distance = eventDate - now;

      if (distance < 0) {
        clearInterval(timer);
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      setTimeLeft({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000)
      });
    };

    calculateTime();
    var timer = setInterval(calculateTime, 1000);

    return () => clearInterval(timer);
  }, [event]);

  if (loading) {
    return (
      <div className="pt-32 pb-20 px-4 min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-firefox-orange border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="pt-32 pb-20 px-4 min-h-screen text-center flex flex-col items-center justify-center">
        <h1 className="text-4xl font-display font-black uppercase text-white mb-4">Event Not Found</h1>
        <p className="text-zinc-400 mb-8">The event you are looking for does not exist or has been removed.</p>
        <Link to="/" className="px-8 py-3 bg-firefox-orange text-white rounded-full font-display font-black text-[10px] uppercase tracking-widest">
          Return Home
        </Link>
      </div>
    );
  }

  const getFinalAmount = () => {
    if (!event || !event.price) return 0;
    let baseAmount = Number(event.price);
    
    if (userTier === 'platinum') return 0;
    if (userTier === 'silver') baseAmount = baseAmount * 0.5;
    
    if (appliedCoupon) {
      if (appliedCoupon.type === 'percentage') {
        baseAmount = baseAmount - (baseAmount * (appliedCoupon.value / 100));
      } else {
        baseAmount = Math.max(0, baseAmount - appliedCoupon.value);
      }
    }
    return Math.floor(baseAmount);
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setValidatingCoupon(true);
    setCouponError('');
    setAppliedCoupon(null);

    try {
      const q = query(
        collection(db, 'coupons'), 
        where('code', '==', couponCode.toUpperCase().trim()),
        where('isActive', '==', true)
      );
      const snap = await getDocs(q);
      
      if (snap.empty) {
        setCouponError('Invalid or expired coupon.');
        return;
      }

      const coupon = snap.docs[0].data();
      
      if (coupon.usageLimit > 0 && coupon.usageCount >= coupon.usageLimit) {
        setCouponError('Coupon usage limit reached.');
        return;
      }
      
      if (coupon.expiryDate && new Date(coupon.expiryDate).getTime() < Date.now()) {
        setCouponError('Coupon has expired.');
        return;
      }

      setAppliedCoupon({ id: snap.docs[0].id, ...coupon });
    } catch (err) {
      console.error(err);
      setCouponError('Error validating coupon.');
    } finally {
      setValidatingCoupon(false);
    }
  };

  const submitRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      alert("Please log in to register for events.");
      return;
    }
    
    if (id === 'hackathon-2026') {
      setAttending(true);
      setShowRegistrationForm(false);
      return;
    }
    
    const finalAmount = getFinalAmount();
    if (finalAmount > 0 && !transactionId.trim()) {
      alert("Please enter a valid Transaction ID.");
      return;
    }

    const newTicketId = `${user.uid}_${id}`;
    try {
      await setDoc(doc(db, 'tickets', newTicketId), {
        userId: user.uid,
        eventId: id,
        verified: false,
        cancelled: false,
        timestamp: new Date().toISOString(),
        amount: finalAmount,
        transactionId: finalAmount > 0 ? transactionId.trim() : 'FREE_OR_WAIVED',
        couponUsed: appliedCoupon ? appliedCoupon.code : null,
        ...registrationData
      }, { merge: true });
      setAttending(true);
      setTicketId(newTicketId);
      setShowRegistrationForm(false);
    } catch (e) {
      console.error("Failed to register for event", e);
      alert("Failed to register. Please try again.");
    }
  };

  const submitCancelTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketId || !cancelReason.trim()) return;
    
    setIsCancelling(true);
    try {
      await setDoc(doc(db, 'tickets', ticketId), {
        cancelled: true,
        cancelReason: cancelReason.trim(),
        cancelledAt: new Date().toISOString()
      }, { merge: true });
      
      setAttending(false);
      setTicketId(null);
      setShowCancelForm(false);
      setCancelReason("");
    } catch (err) {
      console.error("Error cancelling ticket:", err);
      alert("Failed to cancel ticket. Please try again.");
    } finally {
      setIsCancelling(false);
    }
  };

  const submitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketId || !feedbackText.trim() || !user || feedbackRating === 0) {
      alert("Please provide a rating and your thoughts.");
      return;
    }
    
    try {
      await updateDoc(doc(db, 'tickets', ticketId), {
        feedbackRating: feedbackRating,
        feedback: feedbackText.trim(),
        feedbackSubmittedAt: new Date().toISOString()
      });
      
      await updateDoc(doc(db, 'users', user.uid), {
         points: increment(5)
      });
      
      setFeedbackSubmitted(true);
      setShowFeedbackForm(false);
    } catch (err) {
      console.error(err);
      alert("Failed to submit feedback.");
    }
  };

  const handleDownloadTicket = async () => {
    const ticketElement = document.getElementById('ticket-card');
    if (!ticketElement) return;

    try {
      const dataUrl = await toPng(ticketElement, { cacheBust: true, backgroundColor: '#09090b' });
      const link = document.createElement('a');
      link.download = `ticket-${id}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Failed to download ticket image', err);
    }
  };

  const handleDownloadCertificate = async () => {
    const certElement = document.getElementById('certificate-card');
    if (!certElement) return;
    try {
      certElement.style.display = 'flex'; // show temporarily
      const dataUrl = await toPng(certElement, { cacheBust: true, backgroundColor: '#050505', width: 1200, height: 900, pixelRatio: 2 });
      certElement.style.display = 'none'; // hide again
      const { jsPDF } = await import('jspdf');
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'px',
        format: [1200, 900]
      });
      pdf.addImage(dataUrl, 'PNG', 0, 0, 1200, 900);
      pdf.save(`Certificate-${event.title.replace(/\s+/g, '_')}.pdf`);
    } catch (err) {
      console.error('Failed to download certificate', err);
    }
  };

  const isPast = new Date(event.date).getTime() < new Date().getTime();
  const seatsLeft = (event.totalSeats || 30) - registeredCount;

  let displayCertType = event.certificateType || 'Participation';
  let subText = "has successfully participated in the event";
  
  if (customCertificate) {
    if (["1st Position", "2nd Position", "3rd Position", "Winner"].includes(customCertificate)) {
      displayCertType = "Excellence";
      subText = `has secured ${customCertificate} in the event`;
    } else {
      displayCertType = customCertificate;
      subText = "has successfully completed the event";
    }
  } else if (displayCertType === 'Completion') {
    subText = "has successfully completed the event";
  } else if (displayCertType === 'Excellence') {
    subText = "has demonstrated excellence in the event";
  }

  return (
    <div className="pt-32 pb-20 px-4 min-h-screen relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-firefox-orange/10 blur-[150px] rounded-full pointer-events-none" />
      
      <div className="max-w-6xl mx-auto relative z-10">
        <Link to="/" className="inline-flex items-center gap-2 text-zinc-500 hover:text-white transition-colors mb-12 group">
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          <span className="text-[10px] font-black uppercase tracking-widest">Back to Home</span>
        </Link>

        <div className="grid lg:grid-cols-2 gap-16 items-start">
          <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }}>
            <span className="inline-block px-4 py-2 bg-firefox-orange/20 text-firefox-orange rounded-full text-[10px] font-black uppercase tracking-widest mb-6 border border-firefox-orange/20">
              {event.type || 'Event'}
            </span>
            <h1 className="text-5xl md:text-7xl font-display font-black uppercase tracking-tight mb-8 leading-[0.9]">
              {event.title?.split(' ').slice(0, 2).join(' ')} <br />
              <span className="text-firefox-orange">{event.title?.split(' ').slice(2).join(' ')}</span>
            </h1>
            
            <p className="text-zinc-400 text-lg mb-12 leading-relaxed">
              {event.desc}
            </p>

            <div className="space-y-8 mb-12">
              <div className="flex items-center gap-6">
                <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-zinc-400">
                  <Calendar size={24} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Date & Time</p>
                  <p className="font-bold text-lg">
                    {new Date(event.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} • {new Date(event.date).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-zinc-400">
                  <MapPin size={24} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Location</p>
                  <p className="font-bold text-lg">{event.location || 'TBA'}</p>
                </div>
              </div>
              {event.prizes && (
                <div className="flex items-center gap-6">
                  <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-zinc-400">
                    <Trophy size={24} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Prizes</p>
                    <p className="font-bold text-lg">{event.prizes}</p>
                  </div>
                </div>
              )}
            </div>

            {event.why && (
              <div className="mb-12">
                <h2 className="text-2xl font-display font-black text-white uppercase tracking-wider mb-4 border-l-4 border-firefox-orange pl-4">Why Attend?</h2>
                <p className="text-zinc-400 text-lg leading-relaxed bg-white/5 border border-white/10 p-6 rounded-2xl">
                  {event.why}
                </p>
              </div>
            )}

            {event.outcomes && (
              <div className="mb-12">
                <h2 className="text-2xl font-display font-black text-white uppercase tracking-wider mb-4 border-l-4 border-firefox-orange pl-4">Key Outcomes</h2>
                <div className="bg-firefox-orange/5 border border-firefox-orange/20 p-6 rounded-2xl">
                  <p className="text-firefox-orange/90 text-lg leading-relaxed">
                    {event.outcomes}
                  </p>
                </div>
              </div>
            )}
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} className="flex flex-col lg:items-end justify-center w-full sticky top-32">
            <div className="bg-zinc-900/50 border border-white/10 rounded-[3rem] p-8 md:p-12 backdrop-blur-xl w-full text-center relative overflow-hidden group hover:border-firefox-orange/30 transition-all duration-500">
              <div className="absolute inset-0 bg-gradient-to-b from-firefox-orange/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <div className="relative z-10">
                <h3 className="text-xs font-black uppercase tracking-[0.3em] text-zinc-400 mb-10">
                  {isPast ? 'Event Concluded' : 'Event Starts In'}
                </h3>
                
                {!isPast ? (
                  <div className="grid grid-cols-4 gap-3 md:gap-6 mb-12">
                    {Object.entries(timeLeft).map(([unit, value]) => (
                      <div key={unit} className="flex flex-col items-center">
                        <div className="w-full aspect-square bg-zinc-950 rounded-3xl flex items-center justify-center border border-white/5 mb-4 shadow-inner">
                          <span className="text-3xl md:text-5xl font-display font-black text-white">{value.toString().padStart(2, '0')}</span>
                        </div>
                        <span className="text-[9px] md:text-[11px] uppercase tracking-[0.2em] text-zinc-500 font-bold">{unit}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex justify-center mb-12">
                    <div className="w-32 h-32 bg-white/5 border border-white/10 rounded-full flex items-center justify-center text-zinc-500 shadow-inner">
                      <Clock size={48} />
                    </div>
                  </div>
                )}
                
                {!isPast && (
                  <div className="mb-6">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Available Seats</span>
                      <span className="text-[10px] font-black uppercase tracking-widest text-firefox-orange">{Math.max(0, seatsLeft)} / {event.totalSeats || 30}</span>
                    </div>
                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-firefox-orange rounded-full transition-all duration-1000" 
                        style={{ width: `${Math.min(100, (Math.max(0, seatsLeft) / (event.totalSeats || 30)) * 100)}%` }}
                      />
                    </div>
                  </div>
                )}

                {isPast ? (
                  attending ? (
                    <div className="space-y-4">
                      {isVerified && event.certificateType !== 'None' && (
                        <button 
                          onClick={handleDownloadCertificate}
                          className="w-full py-4 bg-white/10 border border-white/20 text-white rounded-2xl font-display font-black text-[10px] uppercase tracking-widest hover:bg-white/20 transition-all flex items-center justify-center gap-2"
                        >
                          <Download size={16} /> Download {displayCertType} Certificate
                        </button>
                      )}
                      
                      {feedbackSubmitted ? (
                        <div className="w-full py-6 bg-green-500/10 border border-green-500/20 text-green-400 rounded-2xl font-display font-black text-sm uppercase tracking-[0.2em] flex items-center justify-center gap-2">
                          <CheckCircle2 size={18} /> Feedback Submitted (+5 Pts)
                        </div>
                      ) : !showFeedbackForm ? (
                      <motion.button 
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setShowFeedbackForm(true)}
                        className="w-full py-6 bg-firefox-orange text-white rounded-2xl font-display font-black text-sm uppercase tracking-[0.2em] shadow-[0_0_40px_rgba(255,92,0,0.4)] hover:bg-white hover:text-black transition-all"
                      >
                        Leave Feedback (+5 Points)
                      </motion.button>
                    ) : (
                      <form onSubmit={submitFeedback} className="w-full bg-white/5 border border-white/10 rounded-3xl p-6 flex flex-col gap-4 text-left">
                        <h3 className="text-white font-display font-black uppercase text-xl mb-2 text-center">Event Feedback</h3>
                        
                        <div className="flex justify-center gap-2 mb-2">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button 
                              key={star}
                              type="button"
                              onClick={() => setFeedbackRating(star)}
                              className={`transition-colors ${star <= feedbackRating ? 'text-yellow-400' : 'text-zinc-600'}`}
                            >
                              <Star size={28} fill={star <= feedbackRating ? "currentColor" : "none"} />
                            </button>
                          ))}
                        </div>

                        <textarea 
                          required
                          value={feedbackText}
                          onChange={(e) => setFeedbackText(e.target.value)}
                          placeholder="What did you think of the event?"
                          className="w-full bg-black/50 border border-white/10 rounded-xl p-4 text-white text-sm focus:outline-none focus:border-firefox-orange transition-colors resize-none"
                          rows={3}
                        />
                        <div className="flex gap-2">
                          <button type="button" onClick={() => setShowFeedbackForm(false)} className="flex-1 py-3 bg-white/5 text-zinc-400 rounded-lg font-display font-black text-[10px] uppercase tracking-widest hover:bg-white/10 transition-all">Cancel</button>
                          <button type="submit" className="flex-1 py-3 bg-firefox-orange text-white rounded-lg font-display font-black text-[10px] uppercase tracking-widest hover:bg-orange-600 transition-all">Submit (+5 PTS)</button>
                        </div>
                      </form>
                    )}
                    </div>
                  ) : (
                    <div className="w-full py-6 bg-white/5 border border-white/10 text-zinc-500 rounded-2xl font-display font-black text-sm uppercase tracking-[0.2em]">
                      Event Concluded
                    </div>
                  )
                ) : !attending ? (
                  !showRegistrationForm ? (
                    <motion.button 
                      whileHover={seatsLeft > 0 ? { scale: 1.02 } : {}}
                      whileTap={seatsLeft > 0 ? { scale: 0.98 } : {}}
                      onClick={() => {
                        if (seatsLeft <= 0) return;
                        if (!user) { alert("Please log in to register for events."); return; }
                        setShowRegistrationForm(true);
                      }}
                      className={`w-full py-6 rounded-2xl font-display font-black text-sm uppercase tracking-[0.2em] transition-all ${
                        seatsLeft > 0 
                          ? 'bg-firefox-orange text-white shadow-[0_0_40px_rgba(255,92,0,0.4)] hover:bg-white hover:text-black hover:shadow-[0_0_40px_rgba(255,255,255,0.4)]'
                          : 'bg-white/5 text-zinc-500 cursor-not-allowed border border-white/10'
                      }`}
                    >
                      {seatsLeft > 0 ? 'Attend Event' : 'Sold Out'}
                    </motion.button>
                  ) : (
                    <motion.div 
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="w-full bg-white/5 border border-white/10 rounded-3xl p-6 flex flex-col gap-4 text-left"
                    >
                      <h3 className="text-white font-display font-black uppercase text-xl mb-2 text-center">Complete Registration</h3>
                      <form onSubmit={submitRegistration} className="space-y-4">
                        <div>
                          <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1 block">ZPRN No.</label>
                          <input type="text" required value={registrationData.zprn} onChange={e => setRegistrationData({...registrationData, zprn: e.target.value})} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-firefox-orange transition-colors" placeholder="e.g. ZCOER/2026/001" />
                        </div>
                        <div>
                          <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1 block">Department</label>
                          <input type="text" required value={registrationData.department} onChange={e => setRegistrationData({...registrationData, department: e.target.value})} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-firefox-orange transition-colors" placeholder="e.g. Computer Engineering" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1 block">Division</label>
                            <input type="text" required value={registrationData.division} onChange={e => setRegistrationData({...registrationData, division: e.target.value})} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-firefox-orange transition-colors" placeholder="e.g. A" />
                          </div>
                          <div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1 block">Roll No.</label>
                            <input type="text" required value={registrationData.rollNo} onChange={e => setRegistrationData({...registrationData, rollNo: e.target.value})} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-firefox-orange transition-colors" placeholder="e.g. 42" />
                          </div>
                        </div>

                        {(event.price > 0) && (
                          <div className="bg-black/50 p-4 rounded-xl border border-white/5 space-y-4 mt-2">
                             <div className="flex justify-between items-center text-sm">
                                <span className="text-zinc-400">Base Price:</span>
                                <span className="text-white font-bold">₹{event.price}</span>
                             </div>
                             {userTier !== 'free' && (
                                <div className="flex justify-between items-center text-sm text-firefox-orange">
                                  <span>{userTier.charAt(0).toUpperCase() + userTier.slice(1)} Discount:</span>
                                  <span>-{userTier === 'platinum' ? '100%' : '50%'}</span>
                                </div>
                             )}
                             {appliedCoupon && (
                                <div className="flex justify-between items-center text-sm text-green-400">
                                  <span>Coupon ({appliedCoupon.code}):</span>
                                  <span>-{appliedCoupon.type === 'percentage' ? `${appliedCoupon.value}%` : `₹${appliedCoupon.value}`}</span>
                                </div>
                             )}
                             <div className="flex justify-between items-center text-lg border-t border-white/10 pt-2">
                                <span className="text-zinc-300 font-bold">Total:</span>
                                <span className="text-white font-black">₹{getFinalAmount()}</span>
                             </div>
                             
                             {getFinalAmount() > 0 && (
                               <>
                                 <div className="space-y-1">
                                    <div className="flex gap-2">
                                      <input 
                                         type="text"
                                         value={couponCode}
                                         onChange={e => setCouponCode(e.target.value)}
                                         disabled={!!appliedCoupon || validatingCoupon}
                                         placeholder="Coupon Code"
                                         className="flex-1 bg-zinc-900 border border-white/10 rounded-lg px-3 py-2 text-white uppercase text-xs focus:border-firefox-orange outline-none disabled:opacity-50"
                                      />
                                      {appliedCoupon ? (
                                         <button type="button" onClick={() => { setAppliedCoupon(null); setCouponCode(''); }} className="px-3 py-2 bg-red-500/20 text-red-400 rounded-lg font-bold text-[10px] uppercase tracking-widest hover:bg-red-500/30">Remove</button>
                                      ) : (
                                         <button type="button" onClick={handleApplyCoupon} disabled={!couponCode || validatingCoupon} className="px-3 py-2 bg-white/5 text-white rounded-lg font-bold text-[10px] uppercase tracking-widest hover:bg-white/10 disabled:opacity-50 flex items-center gap-1">
                                            {validatingCoupon ? <Loader2 size={12} className="animate-spin" /> : <Ticket size={12} />} Apply
                                         </button>
                                      )}
                                    </div>
                                    {couponError && <p className="text-red-400 text-[10px]">{couponError}</p>}
                                 </div>
                                 <div className="pt-2">
                                   <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1 block">Transaction ID / UTR</label>
                                   <input type="text" required value={transactionId} onChange={e => setTransactionId(e.target.value)} className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-firefox-orange transition-colors" placeholder="Enter UPI Transaction ID" />
                                   <p className="text-[9px] text-zinc-500 mt-1">Pay exact amount to: mfc.zcoer@upi</p>
                                 </div>
                               </>
                             )}
                          </div>
                        )}

                        <div className="flex gap-2 pt-4">
                          <button type="button" onClick={() => setShowRegistrationForm(false)} className="flex-1 py-3 bg-white/5 text-zinc-400 rounded-lg font-display font-black text-[10px] uppercase tracking-widest hover:bg-white/10 transition-all">Cancel</button>
                          <button type="submit" className="flex-1 py-3 bg-firefox-orange text-white rounded-lg font-display font-black text-[10px] uppercase tracking-widest hover:bg-orange-600 transition-all">Get Ticket</button>
                        </div>
                      </form>
                    </motion.div>
                  )
                ) : (
                  <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="w-full bg-white/5 border border-white/10 rounded-3xl p-6 flex flex-col items-center gap-4"
                  >
                    <div id="ticket-card" className="w-full flex flex-col items-center bg-[#09090b] p-6 rounded-2xl border border-white/10">
                      <div className="w-full flex items-center justify-center gap-2 text-green-400 font-display font-black text-sm uppercase tracking-widest mb-4">
                        <CheckCircle2 size={20} />
                        Ticket Confirmed
                      </div>
                      <h3 className="text-white font-bold text-center mb-2">{event.title}</h3>
                      <div className="flex items-center gap-2 text-zinc-400 text-xs font-bold uppercase tracking-widest mb-6">
                        <Calendar size={14} />
                        {new Date(event.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })} • {new Date(event.date).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                      </div>
                      {ticketId ? (
                        <>
                          <div className="bg-white p-4 rounded-2xl mb-4">
                            <QRCodeSVG value={`${window.location.origin}/verify/${ticketId}`} size={150} />
                          </div>
                          <p className="text-zinc-500 text-[10px] font-mono uppercase tracking-widest text-center">ID: {ticketId.substring(0, 15)}...</p>
                        </>
                      ) : (
                        <p className="text-zinc-400 text-xs text-center my-8">You are registered for this preview event!</p>
                      )}
                    </div>
                    {ticketId && (
                      <>
                        <p className="text-zinc-400 text-xs text-center mt-2">Show this QR code at the entrance to verify your attendance.</p>
                        <button 
                          onClick={handleDownloadTicket}
                          className="w-full py-4 mt-2 bg-firefox-orange/20 text-firefox-orange rounded-xl font-display font-black text-[10px] uppercase tracking-widest hover:bg-firefox-orange hover:text-white transition-all flex items-center justify-center gap-2"
                        >
                          <Download size={14} /> Download Ticket
                        </button>

                        {!showCancelForm ? (
                          <button 
                            onClick={() => setShowCancelForm(true)}
                            className="w-full py-4 mt-2 bg-white/5 text-zinc-400 rounded-xl font-display font-black text-[10px] uppercase tracking-widest hover:bg-red-500/20 hover:text-red-400 transition-all flex items-center justify-center gap-2"
                          >
                            <XCircle size={14} /> Cancel Ticket
                          </button>
                        ) : (
                          <form onSubmit={submitCancelTicket} className="w-full mt-4 p-4 bg-black/50 border border-white/10 rounded-xl flex flex-col gap-3">
                            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 text-left block">Reason for Cancellation</label>
                            <textarea 
                              required
                              value={cancelReason}
                              onChange={(e) => setCancelReason(e.target.value)}
                              placeholder="Why are you unable to attend?"
                              className="w-full bg-zinc-900 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-red-500 transition-colors resize-none"
                              rows={2}
                            />
                            <div className="flex gap-2 mt-2">
                              <button 
                                type="button"
                                onClick={() => setShowCancelForm(false)}
                                className="flex-1 py-3 bg-white/5 text-zinc-400 rounded-lg font-display font-black text-[10px] uppercase tracking-widest hover:bg-white/10 transition-all"
                              >
                                Keep Ticket
                              </button>
                              <button 
                                type="submit"
                                disabled={isCancelling}
                                className="flex-1 py-3 bg-red-500/20 text-red-400 rounded-lg font-display font-black text-[10px] uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all disabled:opacity-50"
                              >
                                {isCancelling ? 'Cancelling...' : 'Confirm'}
                              </button>
                            </div>
                          </form>
                        )}
                      </>
                    )}
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Hidden Certificate Element */}
      <div id="certificate-card" style={{ display: 'none', width: '1200px', height: '900px' }} className="flex-col items-center bg-[#050505] p-[20px] relative overflow-hidden text-center z-[-100] font-sans">
        {/* Outer Border */}
        <div className="w-full h-full border-[12px] border-firefox-orange/20 p-[10px] relative">
          <div className="w-full h-full border-[4px] border-firefox-orange/50 relative overflow-hidden bg-gradient-to-br from-[#09090b] via-[#151010] to-[#201005] flex flex-col items-center py-16 px-24">
            
            {/* Background Graphics */}
            <div className="absolute top-[-200px] left-[-200px] w-[600px] h-[600px] bg-firefox-orange/10 blur-[120px] rounded-full pointer-events-none" />
            <div className="absolute bottom-[-200px] right-[-200px] w-[600px] h-[600px] bg-orange-600/10 blur-[120px] rounded-full pointer-events-none" />
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03]" />

            {/* Logo / Header */}
            <div className="flex items-center gap-6 mb-12 relative z-10 w-full justify-center">
               <img loading="lazy" src="https://res.cloudinary.com/diyulegc1/image/upload/v1778406665/logo-removebg-preview_b9u9z8.png" className="w-32 h-32 drop-shadow-[0_0_25px_rgba(255,106,0,0.4)]" crossOrigin="anonymous" alt="Logo" />
               <div className="text-left border-l-2 border-white/10 pl-6">
                 <h2 className="text-4xl font-display font-black text-white tracking-widest uppercase mb-1">Mozilla Firefox Club</h2>
                 <p className="text-firefox-orange tracking-[0.4em] uppercase text-lg font-bold">ZCOER Chapter</p>
               </div>
            </div>

            {/* Certificate Title */}
            <div className="relative z-10 mb-10 w-full">
              <p className="text-zinc-400 text-xl uppercase tracking-[0.5em] mb-4">This acknowledges that</p>
              <h1 className="text-[5.5rem] font-serif italic text-white px-20 py-6 border-b border-firefox-orange/30 inline-block drop-shadow-2xl leading-none">
                {userFullName || 'Participant'}
              </h1>
            </div>

            {/* Body */}
            <p className="text-[1.75rem] text-zinc-300 max-w-4xl leading-relaxed relative z-10 font-light mb-auto mt-4">
              {subText}
              <br />
              <span className="font-display font-bold text-white text-5xl uppercase mt-8 block text-firefox-orange drop-shadow-[0_0_15px_rgba(255,92,0,0.3)] tracking-wide">{event.title}</span>
            </p>

            {/* Footer Signatures */}
            <div className="flex justify-between items-end w-full relative z-10 px-8 pb-4 mt-12">
               <div className="flex flex-col items-center w-64">
                 <span className="text-white text-3xl font-serif italic mb-3">{new Date(event.date).toLocaleDateString()}</span>
                 <div className="w-full border-b-2 border-zinc-600 mb-4"></div>
                 <p className="text-zinc-500 uppercase tracking-[0.3em] text-sm font-bold">Date of Issue</p>
               </div>

               {/* Seal */}
               <div className="relative flex items-center justify-center -translate-y-4">
                 <div className="absolute inset-0 bg-firefox-orange blur-[30px] opacity-20 rounded-full" />
                 <div className="w-40 h-40 border-[6px] border-firefox-orange/50 bg-[#09090b] rounded-full flex flex-col items-center justify-center text-firefox-orange -rotate-[15deg] backdrop-blur-xl shadow-2xl relative">
                   <div className="absolute inset-2 border-2 border-dashed border-firefox-orange/30 rounded-full" />
                   <span className="font-display font-black uppercase text-2xl tracking-[0.2em] relative z-10">Verified</span>
                   <span className="text-[9px] font-bold tracking-[0.3em] opacity-80 mt-2 bg-firefox-orange text-black px-2 py-0.5 rounded-full relative z-10">MFC ZCOER</span>
                 </div>
               </div>

               <div className="flex flex-col items-center w-64">
                 <div className="h-12 w-full flex justify-center mb-3">
                   <img loading="lazy" src="https://upload.wikimedia.org/wikipedia/commons/f/fa/Signature_of_John_Hancock.svg" className="w-40 opacity-40 filter invert" alt="Signature" crossOrigin="anonymous" style={{ objectFit: 'contain' }} />
                 </div>
                 <div className="w-full border-b-2 border-zinc-600 mb-4"></div>
                 <p className="text-zinc-500 uppercase tracking-[0.3em] text-sm font-bold">Club President</p>
               </div>
            </div>

          </div>
        </div>
      </div>

    </div>
  );
};

export default EventDetails;
