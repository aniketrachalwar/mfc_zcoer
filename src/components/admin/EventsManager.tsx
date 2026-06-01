import React, { useState, useEffect } from 'react';
import { Calendar, Plus, Edit2, Trash2, X, Image as ImageIcon, Download, User, CheckCircle2 } from 'lucide-react';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, where } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { motion, AnimatePresence } from 'motion/react';
import MDEditor from '@uiw/react-md-editor';

const EventsManager = () => {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [managingEventId, setManagingEventId] = useState<string | null>(null);
  const [attendees, setAttendees] = useState<any[]>([]);
  const [loadingAttendees, setLoadingAttendees] = useState(false);
  const [formStep, setFormStep] = useState(1);
  const [activeTab, setActiveTab] = useState<'live' | 'pending'>('live');

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    type: 'Hackathon',
    desc: '',
    img: '',
    date: '',
    location: '',
    organizer: '',
    agenda: '',
    speakerInfo: '',
    prizes: '',
    totalSeats: 30,
    certificateType: 'Participation',
    price: 0,
    why: '',
    outcomes: ''
  });

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, 'events'));
      const list = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setEvents(list);
    } catch (err) {
      console.error("Error fetching events:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const openForm = (event: any = null) => {
    if (event) {
      setFormData({
        title: event.title || '',
        type: event.type || 'Hackathon',
        desc: event.desc || '',
        img: event.img || '',
        date: event.date || '',
        location: event.location || '',
        organizer: event.organizer || '',
        agenda: event.agenda || '',
        speakerInfo: event.speakerInfo || '',
        prizes: event.prizes || '',
        totalSeats: event.totalSeats || 30,
        certificateType: event.certificateType || 'Participation',
        price: event.price || 0,
        why: event.why || '',
        outcomes: event.outcomes || ''
      });
      setEditingId(event.id);
    } else {
      setFormData({ title: '', type: 'Hackathon', desc: '', img: '', date: '', location: '', organizer: '', agenda: '', speakerInfo: '', prizes: '', totalSeats: 30, certificateType: 'Participation', price: 0, why: '', outcomes: '' });
      setEditingId(null);
    }
    setFormStep(1);
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingId(null);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const saveEvent = async (e?: React.FormEvent | React.MouseEvent) => {
    if (e) e.preventDefault();
    try {
      if (editingId) {
        await updateDoc(doc(db, 'events', editingId), formData);
      } else {
        await addDoc(collection(db, 'events'), { ...formData, status: 'approved' });
      }
      closeForm();
      fetchEvents();
    } catch (err) {
      console.error("Error saving event:", err);
    }
  };

  const approveEvent = async (id: string) => {
    try {
      await updateDoc(doc(db, 'events', id), { status: 'approved' });
      fetchEvents();
    } catch (err) {
      console.error("Error approving event:", err);
    }
  };

  const triggerSave = (e: React.MouseEvent) => {
    e.preventDefault();
    const form = document.getElementById('event-form') as HTMLFormElement;
    if (form.checkValidity()) {
      saveEvent();
    } else {
      form.reportValidity();
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this event?")) {
      try {
        await deleteDoc(doc(db, 'events', id));
        fetchEvents();
      } catch (err) {
        console.error("Error deleting event:", err);
      }
    }
  };

  const downloadAttendees = async (eventId: string, eventTitle: string) => {
    try {
      const q = query(collection(db, 'tickets'), where('eventId', '==', eventId), where('verified', '==', true));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        alert("No attendees marked present for this event yet.");
        return;
      }

      let csvContent = "data:text/csv;charset=utf-8,";
      csvContent += "Name,Username,Email,ZPRN,Department,Division,Roll No,Verified At\n";

      for (const tktDoc of querySnapshot.docs) {
        const data = tktDoc.data();
        
        // Fetch user info for name/email
        let name = "Unknown";
        let username = "unknown";
        let email = "";
        try {
          const userSnap = await getDocs(query(collection(db, 'users'), where('uid', '==', data.userId)));
          if (!userSnap.empty) {
            const userData = userSnap.docs[0].data();
            name = userData.fullName || "Unknown";
            username = userData.username || "unknown";
            email = userData.email || "";
          } else {
             // Try fetching by doc id
             const uDoc = await getDocs(query(collection(db, 'users'), where('__name__', '==', data.userId)));
             if (!uDoc.empty) {
                const userData = uDoc.docs[0].data();
                name = userData.fullName || "Unknown";
                username = userData.username || "unknown";
                email = userData.email || "";
             }
          }
        } catch (e) {
          console.error(e);
        }

        const row = [
          `"${name}"`,
          `"${username}"`,
          `"${email}"`,
          `"${data.zprn || ''}"`,
          `"${data.department || ''}"`,
          `"${data.division || ''}"`,
          `"${data.rollNo || ''}"`,
          `"${data.verifiedAt || ''}"`
        ];
        csvContent += row.join(",") + "\n";
      }

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `${eventTitle.replace(/\\s+/g, '_')}_Attendees.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

    } catch (err) {
      console.error("Error downloading attendees:", err);
      alert("Failed to download attendees.");
    }
  };

  const openAttendeesManager = async (eventId: string) => {
    setManagingEventId(eventId);
    setLoadingAttendees(true);
    try {
      const q = query(collection(db, 'tickets'), where('eventId', '==', eventId), where('verified', '==', true));
      const querySnapshot = await getDocs(q);
      const list = [];
      for (const tktDoc of querySnapshot.docs) {
        const data = tktDoc.data();
        let name = "Unknown";
        try {
          const userSnap = await getDocs(query(collection(db, 'users'), where('uid', '==', data.userId)));
          if (!userSnap.empty) {
            name = userSnap.docs[0].data().fullName || "Unknown";
          } else {
             const uDoc = await getDocs(query(collection(db, 'users'), where('__name__', '==', data.userId)));
             if (!uDoc.empty) {
                name = uDoc.docs[0].data().fullName || "Unknown";
             }
          }
        } catch (e) {
          console.error(e);
        }
        list.push({ id: tktDoc.id, name, customCertificate: data.customCertificate || '', ...data });
      }
      setAttendees(list);
    } catch (err) {
      console.error(err);
      alert("Failed to load attendees.");
    } finally {
      setLoadingAttendees(false);
    }
  };

  const updateCustomCertificate = async (ticketId: string, customCert: string) => {
    try {
      await updateDoc(doc(db, 'tickets', ticketId), { customCertificate: customCert });
      setAttendees(prev => prev.map(a => a.id === ticketId ? { ...a, customCertificate: customCert } : a));
    } catch (err) {
      console.error("Failed to update certificate", err);
    }
  };

  const downloadCancelled = async (eventId: string, eventTitle: string) => {
    try {
      const q = query(collection(db, 'tickets'), where('eventId', '==', eventId), where('cancelled', '==', true));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        alert("No cancelled tickets for this event.");
        return;
      }

      let csvContent = "data:text/csv;charset=utf-8,";
      csvContent += "Name,Username,Email,ZPRN,Department,Division,Roll No,Cancel Reason,Cancelled At\n";

      for (const tktDoc of querySnapshot.docs) {
        const data = tktDoc.data();
        
        let name = "Unknown";
        let username = "unknown";
        let email = "";
        try {
          const userSnap = await getDocs(query(collection(db, 'users'), where('uid', '==', data.userId)));
          if (!userSnap.empty) {
            const userData = userSnap.docs[0].data();
            name = userData.fullName || "Unknown";
            username = userData.username || "unknown";
            email = userData.email || "";
          } else {
             const uDoc = await getDocs(query(collection(db, 'users'), where('__name__', '==', data.userId)));
             if (!uDoc.empty) {
                const userData = uDoc.docs[0].data();
                name = userData.fullName || "Unknown";
                username = userData.username || "unknown";
                email = userData.email || "";
             }
          }
        } catch (e) {
          console.error(e);
        }

        const row = [
          `"${name}"`,
          `"${username}"`,
          `"${email}"`,
          `"${data.zprn || ''}"`,
          `"${data.department || ''}"`,
          `"${data.division || ''}"`,
          `"${data.rollNo || ''}"`,
          `"${data.cancelReason || ''}"`,
          `"${data.cancelledAt || ''}"`
        ];
        csvContent += row.join(",") + "\n";
      }

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `${eventTitle.replace(/\\s+/g, '_')}_Cancelled.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

    } catch (err) {
      console.error("Error downloading cancelled tickets:", err);
      alert("Failed to download cancelled tickets.");
    }
  };

  const displayedEvents = events.filter(e => activeTab === 'pending' ? e.status === 'pending' : (e.status === 'approved' || !e.status));

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-display font-black text-white uppercase tracking-wider mb-2">Events Management</h2>
          <p className="text-zinc-400 text-sm">Create, schedule, and approve upcoming ecosystem events.</p>
        </div>
        <button 
          onClick={() => openForm()}
          className="flex items-center gap-2 px-6 py-3 bg-firefox-orange text-white rounded-full font-bold uppercase tracking-widest text-xs hover:bg-white hover:text-black transition-all shadow-[0_0_20px_rgba(255,106,0,0.3)] shrink-0"
        >
          <Plus size={16} /> Create Event
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-white/10 pb-4">
        <button 
          onClick={() => setActiveTab('live')}
          className={`px-6 py-2 rounded-full font-bold text-[10px] uppercase tracking-widest transition-all ${activeTab === 'live' ? 'bg-firefox-orange text-white' : 'bg-white/5 text-zinc-400 hover:text-white'}`}
        >
          Live Events ({events.filter(e => e.status === 'approved' || !e.status).length})
        </button>
        <button 
          onClick={() => setActiveTab('pending')}
          className={`px-6 py-2 rounded-full font-bold text-[10px] uppercase tracking-widest transition-all ${activeTab === 'pending' ? 'bg-firefox-orange text-white' : 'bg-white/5 text-zinc-400 hover:text-white'}`}
        >
          Pending Approvals ({events.filter(e => e.status === 'pending').length})
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-firefox-orange border-t-transparent rounded-full animate-spin" />
        </div>
      ) : events.length === 0 ? (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-12 text-center flex flex-col items-center justify-center">
          <div className="w-16 h-16 bg-white/5 border border-white/10 rounded-full flex items-center justify-center mb-4 text-zinc-500">
            <Calendar size={24} />
          </div>
          <h3 className="text-xl font-display font-bold text-white mb-2">No Events Found</h3>
          <p className="text-zinc-400 text-sm max-w-md">You haven't created any events yet. Click the create button above to add a new event.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-1 lg:grid-cols-3 gap-6">
          {displayedEvents.map(event => (
            <motion.div 
              key={event.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden group flex flex-col"
            >
              <div className="h-40 bg-zinc-900 relative">
                {event.img ? (
                  <img loading="lazy" src={event.img} alt={event.title} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-zinc-700">
                    <ImageIcon size={32} />
                  </div>
                )}
                <div className="absolute top-4 right-4 flex gap-2 z-10">
                  {activeTab === 'pending' && (
                    <button 
                      onClick={() => approveEvent(event.id)}
                      title="Approve Event"
                      className="w-8 h-8 rounded-full bg-green-500/20 backdrop-blur text-green-400 flex items-center justify-center hover:bg-green-500 hover:text-white transition-colors border border-green-500/50"
                    >
                      <CheckCircle2 size={14} />
                    </button>
                  )}
                  {activeTab === 'live' && (
                    <>
                      <button 
                        onClick={() => openAttendeesManager(event.id)}
                        title="Manage Attendees"
                        className="w-8 h-8 rounded-full bg-black/50 backdrop-blur text-blue-400 flex items-center justify-center hover:bg-blue-500 hover:text-white transition-colors"
                      >
                        <User size={14} />
                      </button>
                      <button 
                        onClick={() => downloadCancelled(event.id, event.title)}
                        title="Download Cancelled CSV"
                        className="w-8 h-8 rounded-full bg-black/50 backdrop-blur text-red-400 flex items-center justify-center hover:bg-red-500 hover:text-white transition-colors"
                      >
                        <X size={14} />
                      </button>
                      <button 
                        onClick={() => downloadAttendees(event.id, event.title)}
                        title="Download Attendees CSV"
                        className="w-8 h-8 rounded-full bg-black/50 backdrop-blur text-green-400 flex items-center justify-center hover:bg-green-500 hover:text-white transition-colors"
                      >
                        <Download size={14} />
                      </button>
                    </>
                  )}
                  <button 
                    onClick={() => openForm(event)}
                    title="Edit Event"
                    className="w-8 h-8 rounded-full bg-black/50 backdrop-blur text-white flex items-center justify-center hover:bg-firefox-orange transition-colors"
                  >
                    <Edit2 size={14} />
                  </button>
                  <button 
                    onClick={() => handleDelete(event.id)}
                    className="w-8 h-8 rounded-full bg-black/50 backdrop-blur text-red-400 flex items-center justify-center hover:bg-red-500 hover:text-white transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
                <div className="absolute bottom-4 left-4">
                  <span className="px-3 py-1 bg-black/50 backdrop-blur rounded-full text-[10px] font-black uppercase tracking-widest text-firefox-orange">
                    {event.type}
                  </span>
                </div>
              </div>
              <div className="p-6 flex-1 flex flex-col">
                <h3 className="text-xl font-display font-bold text-white mb-2">{event.title}</h3>
                <p className="text-zinc-400 text-sm line-clamp-2 mb-4 flex-1">{event.desc}</p>
                <div className="flex items-center gap-2 text-xs text-zinc-500 font-bold tracking-wider mb-2">
                  <Calendar size={14} className="text-firefox-orange" />
                  {event.date ? new Date(event.date).toLocaleDateString() : 'TBA'}
                </div>
                {activeTab === 'pending' && event.hostName && (
                  <div className="mt-4 pt-4 border-t border-white/5 space-y-1">
                    <p className="text-[10px] uppercase font-black tracking-widest text-firefox-orange">Host Details</p>
                    <p className="text-xs text-zinc-400">Name: {event.hostName}</p>
                    <p className="text-xs text-zinc-400">Contact: {event.hostPhone || event.hostEmail}</p>
                    {event.expectedBudget && <p className="text-xs text-zinc-400">Budget/Needs: {event.expectedBudget}</p>}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Form Modal */}
      <AnimatePresence>
        {isFormOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={closeForm} />
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="bg-zinc-950 border border-white/10 rounded-t-3xl md:rounded-3xl w-full max-w-2xl h-[90vh] md:h-auto md:max-h-[90vh] flex flex-col relative z-10 shadow-2xl mt-auto md:mt-0"
              >
                <div className="flex items-center justify-between p-4 sm:p-6 border-b border-white/5 shrink-0">
                  <h2 className="text-lg sm:text-2xl font-display font-black uppercase text-white">
                    {editingId ? 'Edit Event' : 'Create New Event'}
                  </h2>
                  <button 
                    onClick={closeForm}
                    className="text-zinc-500 hover:text-white transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>
                
                {/* Stepper Progress */}
                <div className="flex gap-2 p-4 sm:px-6 bg-white/5 shrink-0">
                  {[1, 2, 3, 4].map(step => (
                    <div key={step} className={`h-1 flex-1 rounded-full ${formStep >= step ? 'bg-firefox-orange' : 'bg-white/10'}`} />
                  ))}
                </div>

                <div className="flex-1 overflow-y-auto p-4 sm:p-6">
                  <form 
                    id="event-form" 
                    onSubmit={(e) => e.preventDefault()}
                    className="space-y-6"
                  >
                    {formStep === 1 && (
                      <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Event Title</label>
                          <input 
                            type="text" 
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-firefox-orange transition-colors"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Event Type</label>
                          <select 
                            name="type"
                            value={formData.type}
                            onChange={handleChange}
                            className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-firefox-orange transition-colors"
                          >
                            <option value="Hackathon">Hackathon</option>
                            <option value="Workshop">Workshop</option>
                            <option value="Open Source Sprint">Open Source Sprint</option>
                            <option value="Meetup">Meetup</option>
                            <option value="Competition">Competition</option>
                            <option value="Guest Lecture">Guest Lecture</option>
                          </select>
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Organizer</label>
                          <input 
                            type="text" 
                            name="organizer"
                            value={formData.organizer}
                            onChange={handleChange}
                            placeholder="e.g. MFC Core Team"
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-firefox-orange transition-colors"
                          />
                        </div>
                        <div className="space-y-2" data-color-mode="dark">
                          <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Description (Markdown)</label>
                          <MDEditor
                            value={formData.desc}
                            onChange={(val) => setFormData(prev => ({ ...prev, desc: val || '' }))}
                            preview="edit"
                            height={200}
                            className="border border-white/10 rounded-xl overflow-hidden"
                          />
                        </div>
                      </motion.div>
                    )}

                    {formStep === 2 && (
                      <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                        <div className="grid grid-cols-1 gap-6">
                          <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Event Date & Time</label>
                            <input 
                              type="datetime-local" 
                              name="date"
                              value={formData.date}
                              onChange={handleChange}
                              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-firefox-orange transition-colors"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Venue / Location</label>
                          <input 
                            type="text" 
                            name="location"
                            value={formData.location}
                            onChange={handleChange}
                            placeholder="e.g. Auditorium, ZCOER"
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-firefox-orange transition-colors"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Cover Image URL</label>
                          <input 
                            type="url" 
                            name="img"
                            value={formData.img}
                            onChange={handleChange}
                            placeholder="https://..."
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-firefox-orange transition-colors"
                          />
                        </div>
                      </motion.div>
                    )}

                    {formStep === 3 && (
                      <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                        <div className="space-y-2" data-color-mode="dark">
                          <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Agenda (Markdown)</label>
                          <MDEditor
                            value={formData.agenda}
                            onChange={(val) => setFormData(prev => ({ ...prev, agenda: val || '' }))}
                            preview="edit"
                            height={150}
                            className="border border-white/10 rounded-xl overflow-hidden"
                          />
                        </div>
                        <div className="space-y-2" data-color-mode="dark">
                          <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Speaker Info (Markdown)</label>
                          <MDEditor
                            value={formData.speakerInfo}
                            onChange={(val) => setFormData(prev => ({ ...prev, speakerInfo: val || '' }))}
                            preview="edit"
                            height={150}
                            className="border border-white/10 rounded-xl overflow-hidden"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Prizes / Perks (Optional)</label>
                          <input 
                            type="text" 
                            name="prizes"
                            value={formData.prizes}
                            onChange={handleChange}
                            placeholder="e.g. ₹50,000 Pool + Exclusive Swags"
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-firefox-orange transition-colors"
                          />
                        </div>
                      </motion.div>
                    )}

                    {formStep === 4 && (
                      <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Total Capacity (Seats)</label>
                            <input 
                              type="number" 
                              name="totalSeats"
                              value={formData.totalSeats}
                              onChange={handleChange}
                              min="1"
                              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-firefox-orange transition-colors"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Base Price (₹) - Enter 0 for Free</label>
                            <input 
                              type="number" 
                              name="price"
                              value={formData.price}
                              onChange={handleChange}
                              min="0"
                              required
                              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-firefox-orange transition-colors"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Certificate Type</label>
                          <select 
                            name="certificateType"
                            value={formData.certificateType}
                            onChange={handleChange}
                            className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-firefox-orange transition-colors"
                          >
                            <option value="None">None</option>
                            <option value="Participation">Participation</option>
                            <option value="Completion">Completion</option>
                            <option value="Excellence">Excellence</option>
                          </select>
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Why Attend? (Reason for hosting)</label>
                          <textarea 
                            name="why"
                            value={formData.why}
                            onChange={handleChange}
                            required
                            rows={2}
                            placeholder="Why should students attend this event?"
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-firefox-orange transition-colors resize-none"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Key Outcomes</label>
                          <textarea 
                            name="outcomes"
                            value={formData.outcomes}
                            onChange={handleChange}
                            required
                            rows={2}
                            placeholder="Certificates, knowledge, swags..."
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-firefox-orange transition-colors resize-none"
                          />
                        </div>
                      </motion.div>
                    )}
                  </form>
                </div>

                {/* Sticky Bottom Actions */}
                <div className="p-4 sm:p-6 border-t border-white/5 bg-zinc-950/80 backdrop-blur-xl shrink-0 flex items-center justify-between gap-4">
                  {formStep > 1 ? (
                    <button 
                      type="button"
                      onClick={() => setFormStep(prev => prev - 1)}
                      className="px-6 py-3 bg-white/5 text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-white/10 transition-colors"
                    >
                      Back
                    </button>
                  ) : (
                    <button 
                      type="button"
                      onClick={closeForm}
                      className="px-6 py-3 text-zinc-500 hover:text-white rounded-xl font-bold text-xs uppercase tracking-widest transition-colors"
                    >
                      Cancel
                    </button>
                  )}

                  {formStep < 4 ? (
                    <button 
                      type="button"
                      onClick={() => {
                        const form = document.getElementById('event-form') as HTMLFormElement;
                        if (form.checkValidity()) {
                          setFormStep(prev => prev + 1);
                        } else {
                          form.reportValidity();
                        }
                      }}
                      className="flex-1 sm:flex-none px-8 py-3 bg-white text-black rounded-xl font-black text-xs uppercase tracking-widest hover:bg-zinc-200 transition-colors"
                    >
                      Next Step
                    </button>
                  ) : (
                    <button 
                      type="button"
                      onClick={triggerSave}
                      className="flex-1 sm:flex-none px-8 py-3 bg-firefox-orange text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-orange-600 transition-colors shadow-[0_0_20px_rgba(255,92,0,0.3)]"
                    >
                      {editingId ? 'Update Event' : 'Create Event'}
                    </button>
                  )}
                </div>
              </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Attendees Manager Modal */}
      <AnimatePresence>
        {managingEventId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setManagingEventId(null)} />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-zinc-950 border border-white/10 rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col relative z-10 shadow-2xl"
            >
              <div className="p-6 border-b border-white/10 flex justify-between items-center">
                <h2 className="text-xl font-display font-black uppercase text-white">Manage Attendees</h2>
                <button onClick={() => setManagingEventId(null)} className="text-zinc-500 hover:text-white transition-colors">
                  <X size={20} />
                </button>
              </div>
              
              <div className="p-6 overflow-y-auto flex-1">
                {loadingAttendees ? (
                  <div className="flex justify-center py-12">
                    <div className="w-8 h-8 border-4 border-firefox-orange border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : attendees.length === 0 ? (
                  <p className="text-center text-zinc-500 py-12">No verified attendees yet.</p>
                ) : (
                  <div className="space-y-4">
                    {attendees.map(attendee => (
                      <div key={attendee.id} className="flex items-center justify-between bg-white/5 border border-white/10 p-4 rounded-xl">
                        <div>
                          <p className="text-white font-bold">{attendee.name}</p>
                          <p className="text-zinc-500 text-xs">{attendee.userId}</p>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="flex flex-col">
                            <label className="text-[9px] uppercase tracking-widest text-zinc-500 mb-1">Custom Certificate</label>
                            <select 
                              value={attendee.customCertificate || ''}
                              onChange={(e) => updateCustomCertificate(attendee.id, e.target.value)}
                              className="bg-zinc-900 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-firefox-orange outline-none"
                            >
                              <option value="">Default (Event Type)</option>
                              <option value="1st Position">1st Position</option>
                              <option value="2nd Position">2nd Position</option>
                              <option value="3rd Position">3rd Position</option>
                              <option value="Winner">Winner</option>
                              <option value="Excellence">Excellence</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default EventsManager;
