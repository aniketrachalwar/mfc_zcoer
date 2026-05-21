import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Calendar, MapPin, ArrowRight, Download } from 'lucide-react';
import { Link } from 'react-router-dom';
import { collection, getDocs, query, where, doc, getDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../lib/AuthContext';
import { jsPDF } from 'jspdf';
import { toPng } from 'html-to-image';
import AdSenseBlock from '../AdSenseBlock';

const EventsPage = () => {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const { user } = useAuth();
  const [userTickets, setUserTickets] = useState<any[]>([]);
  const [userFullName, setUserFullName] = useState("");
  const [certData, setCertData] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const snap = await getDocs(collection(db, 'events'));
        const list = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        list.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        setEvents(list);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  useEffect(() => {
    if (user) {
      const fetchUserData = async () => {
         const q = query(collection(db, 'tickets'), where('userId', '==', user.uid), where('verified', '==', true));
         const snap = await getDocs(q);
         const tickets = snap.docs.map(d => ({ id: d.id, ...d.data() }));
         setUserTickets(tickets);

         const userDoc = await getDoc(doc(db, 'users', user.uid));
         if (userDoc.exists() && userDoc.data().fullName) {
           setUserFullName(userDoc.data().fullName);
         } else {
           setUserFullName(user.displayName || 'Participant');
         }
      };
      fetchUserData();
    }
  }, [user]);

  const handleDownloadPDF = async (event: any, ticket: any) => {
    if (isGenerating) return;
    setIsGenerating(true);
    setCertData({ event, ticket });
    
    setTimeout(async () => {
      const certElement = document.getElementById('events-certificate-card');
      if (!certElement) {
         setIsGenerating(false);
         return;
      }
      try {
        certElement.style.display = 'flex';
        const dataUrl = await toPng(certElement, { cacheBust: true, backgroundColor: '#050505', width: 1200, height: 900, pixelRatio: 2 });
        certElement.style.display = 'none';
        
        const pdf = new jsPDF({
          orientation: 'landscape',
          unit: 'px',
          format: [1200, 900]
        });
        
        pdf.addImage(dataUrl, 'PNG', 0, 0, 1200, 900);
        pdf.save(`Certificate-${event.title.replace(/\s+/g, '_')}.pdf`);
      } catch (err) {
        console.error('Failed to download certificate', err);
      } finally {
        setIsGenerating(false);
        setCertData(null);
      }
    }, 100);
  };

  if (loading) {
    return (
      <div className="pt-32 pb-20 px-4 min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-firefox-orange border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const now = new Date().getTime();
  const upcomingEvents = events.filter(e => new Date(e.date).getTime() >= now);
  const pastEvents = events.filter(e => new Date(e.date).getTime() < now)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const EventCard = ({ event }: { event: any }) => {
    const isPast = new Date(event.date).getTime() < now;
    const ticket = userTickets.find(t => t.eventId === event.id);
    const hasCertificate = isPast && ticket && event.certificateType && event.certificateType !== 'None';
    
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden group flex flex-col"
      >
        <div className="h-48 bg-zinc-900 relative overflow-hidden">
          {event.img ? (
            <img loading="lazy" src={event.img} alt={event.title} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-zinc-900 to-black">
              <Calendar size={32} className="text-zinc-800" />
            </div>
          )}
          <div className="absolute top-4 left-4">
            <span className="px-3 py-1 bg-black/50 backdrop-blur border border-white/10 rounded-full text-[10px] font-black uppercase tracking-widest text-firefox-orange">
              {event.type}
            </span>
          </div>
        </div>
        <div className="p-6 flex-1 flex flex-col">
          <h3 className="text-xl font-display font-bold text-white mb-2">{event.title}</h3>
          <p className="text-zinc-400 text-sm line-clamp-2 mb-6 flex-1">{event.desc}</p>
          <div className="space-y-2 mb-6">
            <div className="flex items-center gap-2 text-xs text-zinc-500 font-bold tracking-wider">
              <Calendar size={14} className="text-firefox-orange" />
              {new Date(event.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </div>
            {event.location && (
              <div className="flex items-center gap-2 text-xs text-zinc-500 font-bold tracking-wider">
                <MapPin size={14} className="text-firefox-orange" />
                {event.location}
              </div>
            )}
          </div>
          <Link 
            to={`/event/${event.id}`}
            className="flex items-center gap-2 text-white font-bold text-sm hover:text-firefox-orange transition-colors mt-auto"
          >
            View Details <ArrowRight size={16} />
          </Link>
          
          {hasCertificate && (
             <button 
               onClick={() => handleDownloadPDF(event, ticket)}
               disabled={isGenerating}
               className="w-full mt-4 py-3 min-h-[44px] bg-firefox-orange/20 border border-firefox-orange/50 text-firefox-orange rounded-xl font-display font-black text-[10px] uppercase tracking-widest hover:bg-firefox-orange hover:text-white transition-all flex items-center justify-center gap-2 disabled:opacity-50"
             >
               {isGenerating && certData?.event.id === event.id ? (
                 <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
               ) : (
                 <Download size={14} />
               )}
               Download Certificate
             </button>
          )}
        </div>
      </motion.div>
    );
  };

  // Resolve Certificate Variables for hidden element
  let displayCertType = 'Participation';
  let subText = "has successfully participated in the event";
  if (certData) {
    displayCertType = certData.event.certificateType || 'Participation';
    const customCertificate = certData.ticket.customCertificate;
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
  }

  return (
    <div className="pt-32 pb-20 px-4 min-h-screen relative">
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="mb-16">
          <span className="text-firefox-orange font-bold uppercase tracking-widest text-xs">Sessions</span>
          <h1 className="text-fluid-h1 font-display font-black uppercase tracking-tight mt-2 mb-4">
            All <span className="text-firefox-orange">Events</span>
          </h1>
          <p className="text-zinc-400 max-w-2xl text-lg">
            Join our upcoming hackathons, workshops, and open-source sprints. Or browse our past events to see what we've been up to.
          </p>
        </div>

        {upcomingEvents.length > 0 && (
          <div className="mb-20">
            <h2 className="text-2xl font-display font-black uppercase text-white mb-8 flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              Upcoming Sessions
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {upcomingEvents.map(event => <EventCard key={event.id} event={event} />)}
            </div>
            
            <AdSenseBlock adSlot="events_upcoming_bottom" className="mt-16" />
          </div>
        )}

        {pastEvents.length > 0 && (
          <div>
            <h2 className="text-2xl font-display font-black uppercase text-zinc-500 mb-8">
              Completed Sessions
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 opacity-75 hover:opacity-100 transition-opacity">
              {pastEvents.map(event => <EventCard key={event.id} event={event} />)}
            </div>
            
            <AdSenseBlock adSlot="events_past_bottom" className="mt-16" />
          </div>
        )}
        
        {events.length === 0 && (
          <div className="text-center py-20 bg-white/5 border border-white/10 rounded-3xl">
            <Calendar size={48} className="mx-auto text-zinc-600 mb-4" />
            <h3 className="text-xl font-display font-bold text-white mb-2">No Events Found</h3>
            <p className="text-zinc-400">We are planning some exciting sessions. Check back soon!</p>
          </div>
        )}
      </div>

      {/* Hidden Certificate Element for PDF Generation */}
      {/* Hidden Certificate Element for PDF Generation */}
      {certData && (
        <div id="events-certificate-card" style={{ display: 'none', width: '1200px', height: '900px' }} className="flex-col items-center bg-[#050505] p-[20px] relative overflow-hidden text-center z-[-100] font-sans">
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
                <span className="font-display font-bold text-white text-5xl uppercase mt-8 block text-firefox-orange drop-shadow-[0_0_15px_rgba(255,92,0,0.3)] tracking-wide">{certData.event.title}</span>
              </p>

              {/* Footer Signatures */}
              <div className="flex justify-between items-end w-full relative z-10 px-8 pb-4 mt-12">
                 <div className="flex flex-col items-center w-64">
                   <span className="text-white text-3xl font-serif italic mb-3">{new Date(certData.event.date).toLocaleDateString()}</span>
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
      )}
    </div>
  );
};

export default EventsPage;
