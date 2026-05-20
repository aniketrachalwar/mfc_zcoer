import React, { useState, useEffect } from 'react';
import { Calendar, Plus, Edit2, Trash2, X, Image as ImageIcon, Download, User } from 'lucide-react';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, where } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { motion, AnimatePresence } from 'motion/react';

const EventsManager = () => {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [managingEventId, setManagingEventId] = useState<string | null>(null);
  const [attendees, setAttendees] = useState<any[]>([]);
  const [loadingAttendees, setLoadingAttendees] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    type: 'Hackathon',
    desc: '',
    img: '',
    date: '',
    location: '',
    prizes: '',
    totalSeats: 30,
    certificateType: 'Participation'
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
        prizes: event.prizes || '',
        totalSeats: event.totalSeats || 30,
        certificateType: event.certificateType || 'Participation'
      });
      setEditingId(event.id);
    } else {
      setFormData({ title: '', type: 'Hackathon', desc: '', img: '', date: '', location: '', prizes: '', totalSeats: 30, certificateType: 'Participation' });
      setEditingId(null);
    }
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingId(null);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const saveEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateDoc(doc(db, 'events', editingId), formData);
      } else {
        await addDoc(collection(db, 'events'), formData);
      }
      closeForm();
      fetchEvents();
    } catch (err) {
      console.error("Error saving event:", err);
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

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-display font-black uppercase text-white mb-2">
            Event <span className="text-firefox-orange">Management</span>
          </h1>
          <p className="text-zinc-400 text-sm">Create and manage upcoming events.</p>
        </div>
        <button 
          onClick={() => openForm()}
          className="flex items-center gap-2 px-6 py-3 bg-firefox-orange text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-orange-600 transition-colors"
        >
          <Plus size={16} />
          Create Event
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
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
                <div className="absolute top-4 right-4 flex gap-2">
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
                <div className="flex items-center gap-2 text-xs text-zinc-500 font-bold tracking-wider">
                  <Calendar size={14} className="text-firefox-orange" />
                  {event.date ? new Date(event.date).toLocaleDateString() : 'TBA'}
                </div>
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
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-zinc-950 border border-white/10 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto relative z-10 p-8 shadow-2xl"
            >
              <button 
                onClick={closeForm}
                className="absolute top-6 right-6 text-zinc-500 hover:text-white transition-colors"
              >
                <X size={24} />
              </button>
              
              <h2 className="text-2xl font-display font-black uppercase text-white mb-8">
                {editingId ? 'Edit Event' : 'Create New Event'}
              </h2>
              
              <form onSubmit={saveEvent} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Event Title</label>
                    <input 
                      type="text" 
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      required
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-firefox-orange transition-colors"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Event Type</label>
                    <select 
                      name="type"
                      value={formData.type}
                      onChange={handleChange}
                      className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-firefox-orange transition-colors"
                    >
                      <option value="Hackathon">Hackathon</option>
                      <option value="Workshop">Workshop</option>
                      <option value="Open Source Sprint">Open Source Sprint</option>
                      <option value="Meetup">Meetup</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Description</label>
                  <textarea 
                    name="desc"
                    value={formData.desc}
                    onChange={handleChange}
                    required
                    rows={3}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-firefox-orange transition-colors resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Date & Time</label>
                    <input 
                      type="datetime-local" 
                      name="date"
                      value={formData.date}
                      onChange={handleChange}
                      required
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-firefox-orange transition-colors"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Location</label>
                    <input 
                      type="text" 
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      required
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-firefox-orange transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Cover Image URL</label>
                    <input 
                      type="url" 
                      name="img"
                      value={formData.img}
                      onChange={handleChange}
                      placeholder="https://..."
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-firefox-orange transition-colors"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Certificate Type</label>
                    <select 
                      name="certificateType"
                      value={formData.certificateType}
                      onChange={handleChange}
                      className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-firefox-orange transition-colors"
                    >
                      <option value="None">None</option>
                      <option value="Participation">Participation</option>
                      <option value="Completion">Completion</option>
                      <option value="Excellence">Excellence</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Prizes (Optional)</label>
                    <input 
                      type="text" 
                      name="prizes"
                      value={formData.prizes}
                      onChange={handleChange}
                      placeholder="e.g. ₹50,000 Pool + Exclusive Swags"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-firefox-orange transition-colors"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Total Seats</label>
                    <input 
                      type="number" 
                      name="totalSeats"
                      value={formData.totalSeats}
                      onChange={handleChange}
                      min="1"
                      required
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-firefox-orange transition-colors"
                    />
                  </div>
                </div>

                <button 
                  type="submit"
                  className="w-full py-4 bg-firefox-orange text-white rounded-xl font-display font-black text-[10px] uppercase tracking-widest hover:bg-orange-600 transition-colors shadow-[0_0_20px_rgba(255,92,0,0.2)]"
                >
                  {editingId ? 'Save Changes' : 'Create Event'}
                </button>
              </form>
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
