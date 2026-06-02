import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, setDoc, updateDoc, deleteDoc, query, where, writeBatch } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Image as ImageIcon, Save, Plus, Trash2, CheckCircle2, Ticket, Settings2, FileText, ArrowLeft, Eye } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import PageLoader from '../PageLoader';

export default function CertificateManager() {
  const [activeTab, setActiveTab] = useState<'templates' | 'issuance'>('issuance');
  const [loading, setLoading] = useState(true);

  // Data
  const [events, setEvents] = useState<any[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [selectedEventId, setSelectedEventId] = useState('');
  const [selectedEventTickets, setSelectedEventTickets] = useState<any[]>([]);

  // Template Builder State
  const [isEditingTemplate, setIsEditingTemplate] = useState(false);
  const [currentTemplate, setCurrentTemplate] = useState<any>({
    id: '',
    name: 'New Template',
    bgUrl: '',
    config: {
      name: { x: 50, y: 50, size: 60, color: '#ffffff' },
      event: { x: 50, y: 70, size: 30, color: '#ff5c00' },
      date: { x: 20, y: 85, size: 20, color: '#a1a1aa' },
      position: { x: 80, y: 85, size: 20, color: '#a1a1aa' },
    }
  });

  const [saving, setSaving] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch separately so one failure doesn't block the other
      try {
        const eventsSnap = await getDocs(collection(db, 'events'));
        const evList = eventsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
        // Safe sort
        evList.sort((a: any, b: any) => {
          const timeA = a.date ? new Date(a.date).getTime() : 0;
          const timeB = b.date ? new Date(b.date).getTime() : 0;
          return timeB - timeA;
        });
        setEvents(evList);
      } catch (err) {
        console.error("Error fetching events:", err);
      }

      try {
        const templatesSnap = await getDocs(collection(db, 'certificateTemplates'));
        setTemplates(templatesSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (err) {
        console.error("Error fetching templates:", err);
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchTickets = async (eventId: string) => {
    setSelectedEventId(eventId);
    if (!eventId) {
      setSelectedEventTickets([]);
      return;
    }
    try {
      const q = query(collection(db, 'tickets'), where('eventId', '==', eventId), where('verified', '==', true));
      const snap = await getDocs(q);
      
      // Also fetch users to get full names
      const usersSnap = await getDocs(collection(db, 'users'));
      const usersMap = new Map(usersSnap.docs.map(d => [d.id, d.data()]));

      const tkts = snap.docs.map(d => {
        const tData = d.data() as any;
        const uData = usersMap.get(tData.userId) as any;
        return {
          id: d.id,
          ...tData,
          userName: uData?.fullName || uData?.username || 'Unknown User'
        };
      });
      setSelectedEventTickets(tkts);
    } catch (err) {
      console.error(err);
    }
  };

  const saveTemplate = async () => {
    if (!currentTemplate.bgUrl || !currentTemplate.name) {
      alert("Please provide a name and background image URL.");
      return;
    }
    setSaving(true);
    try {
      const id = currentTemplate.id || `template_${Date.now()}`;
      await setDoc(doc(db, 'certificateTemplates', id), {
        name: currentTemplate.name,
        bgUrl: currentTemplate.bgUrl,
        config: currentTemplate.config,
        updatedAt: new Date().toISOString()
      });
      alert("Template saved!");
      setIsEditingTemplate(false);
      fetchData();
    } catch (err) {
      console.error(err);
      alert("Failed to save template.");
    } finally {
      setSaving(false);
    }
  };

  const deleteTemplate = async (id: string) => {
    if (!confirm("Delete this template?")) return;
    try {
      await deleteDoc(doc(db, 'certificateTemplates', id));
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const updateTicketPosition = async (ticketId: string, position: string) => {
    try {
      await updateDoc(doc(db, 'tickets', ticketId), {
        customCertificate: position
      });
      setSelectedEventTickets(prev => prev.map(t => t.id === ticketId ? { ...t, customCertificate: position } : t));
    } catch (err) {
      console.error(err);
    }
  };

  const assignTemplateToEvent = async () => {
    if (!selectedEventId || !selectedTemplateId) {
      alert("Please select an event and a template.");
      return;
    }
    setSaving(true);
    try {
      await updateDoc(doc(db, 'events', selectedEventId), {
        assignedTemplateId: selectedTemplateId
      });
      alert("Template assigned successfully!");
      fetchData();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[400px]">
        <PageLoader fullScreen={false} />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-4xl font-display font-black uppercase text-white mb-2">Certificate Manager</h1>
        <p className="text-zinc-400">Design custom templates and issue certificates to verified attendees.</p>
      </div>

      <div className="flex gap-4 border-b border-white/10 pb-4">
        <button 
          onClick={() => setActiveTab('issuance')}
          className={`px-6 py-2 rounded-full font-bold text-sm uppercase tracking-widest transition-all ${activeTab === 'issuance' ? 'bg-firefox-orange text-white' : 'bg-white/5 text-zinc-400 hover:text-white'}`}
        >
          Issuance & Assignment
        </button>
        <button 
          onClick={() => setActiveTab('templates')}
          className={`px-6 py-2 rounded-full font-bold text-sm uppercase tracking-widest transition-all ${activeTab === 'templates' ? 'bg-firefox-orange text-white' : 'bg-white/5 text-zinc-400 hover:text-white'}`}
        >
          Template Builder
        </button>
      </div>

      {activeTab === 'issuance' && (
        <div className="grid md:grid-cols-12 gap-8">
          <div className="md:col-span-4 space-y-6">
            <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
              <h3 className="font-display font-black text-xl text-white uppercase tracking-wider mb-4">1. Select Event</h3>
              <select 
                value={selectedEventId}
                onChange={(e) => fetchTickets(e.target.value)}
                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-firefox-orange focus:outline-none mb-6"
              >
                <option value="">-- Choose Event --</option>
                {events.map(ev => (
                  <option key={ev.id} value={ev.id}>{ev.title}</option>
                ))}
              </select>

              {selectedEventId && (
                <>
                  <h3 className="font-display font-black text-xl text-white uppercase tracking-wider mb-4">2. Assign Template</h3>
                  <div className="space-y-4">
                    <select 
                      value={selectedTemplateId}
                      onChange={(e) => setSelectedTemplateId(e.target.value)}
                      className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-firefox-orange focus:outline-none"
                    >
                      <option value="">-- Built-in Default --</option>
                      {templates.map(t => (
                        <option key={t.id} value={t.id}>{t.name}</option>
                      ))}
                    </select>
                    <button 
                      onClick={assignTemplateToEvent}
                      disabled={saving}
                      className="w-full py-3 bg-firefox-orange/20 text-firefox-orange border border-firefox-orange/50 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-firefox-orange hover:text-white transition-all disabled:opacity-50"
                    >
                      {saving ? 'Saving...' : 'Apply Template to Event'}
                    </button>
                    {events.find(e => e.id === selectedEventId)?.assignedTemplateId && (
                      <p className="text-green-400 text-xs text-center flex items-center justify-center gap-2">
                        <CheckCircle2 size={12} /> Custom template is active
                      </p>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="md:col-span-8">
            <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
              <h3 className="font-display font-black text-xl text-white uppercase tracking-wider mb-2">3. Issue Certificates</h3>
              <p className="text-zinc-400 text-sm mb-6">Assign specific titles (1st Position, Excellence, etc.) to verified attendees. They can instantly download their certificate from the Event page.</p>
              
              {!selectedEventId ? (
                <div className="text-center py-12">
                  <Ticket size={48} className="mx-auto text-zinc-600 mb-4" />
                  <p className="text-zinc-500">Select an event to view attendees.</p>
                </div>
              ) : selectedEventTickets.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-zinc-500">No verified tickets found for this event.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-zinc-300">
                    <thead className="text-xs uppercase bg-black/50 text-zinc-500 font-bold tracking-widest">
                      <tr>
                        <th className="px-4 py-4 rounded-tl-xl">Participant</th>
                        <th className="px-4 py-4">Certificate Type / Position</th>
                        <th className="px-4 py-4 rounded-tr-xl">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {selectedEventTickets.map(tkt => (
                        <tr key={tkt.id} className="hover:bg-white/5 transition-colors">
                          <td className="px-4 py-4 font-medium text-white">{tkt.userName}</td>
                          <td className="px-4 py-4">
                            <select 
                              value={tkt.customCertificate || ''}
                              onChange={(e) => updateTicketPosition(tkt.id, e.target.value)}
                              className="bg-black border border-white/10 rounded-lg px-3 py-2 text-white focus:border-firefox-orange focus:outline-none"
                            >
                              <option value="">Participation (Default)</option>
                              <option value="Completion">Completion</option>
                              <option value="Excellence">Excellence</option>
                              <option value="Winner">Winner</option>
                              <option value="1st Position">1st Position</option>
                              <option value="2nd Position">2nd Position</option>
                              <option value="3rd Position">3rd Position</option>
                            </select>
                          </td>
                          <td className="px-4 py-4">
                            <span className="text-green-400 text-xs font-bold flex items-center gap-1">
                              <CheckCircle2 size={12} /> Issued
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'templates' && (
        <AnimatePresence mode="wait">
          {!isEditingTemplate ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
              <div className="flex justify-between items-center bg-white/5 border border-white/10 p-6 rounded-3xl">
                <div>
                  <h3 className="text-xl font-display font-black text-white uppercase tracking-wider mb-1">Your Templates</h3>
                  <p className="text-sm text-zinc-400">Create coordinate-based overlays for your custom certificate designs.</p>
                </div>
                <button 
                  onClick={() => {
                    setCurrentTemplate({
                      id: '', name: 'New Template', bgUrl: '',
                      config: {
                        name: { x: 50, y: 50, size: 60, color: '#ffffff' },
                        event: { x: 50, y: 70, size: 30, color: '#ff5c00' },
                        date: { x: 20, y: 85, size: 20, color: '#a1a1aa' },
                        position: { x: 80, y: 85, size: 20, color: '#a1a1aa' },
                      }
                    });
                    setIsEditingTemplate(true);
                  }}
                  className="px-6 py-3 bg-firefox-orange text-white rounded-full font-bold text-xs uppercase tracking-widest hover:bg-white hover:text-black transition-all flex items-center gap-2"
                >
                  <Plus size={16} /> Create Template
                </button>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {templates.map(t => (
                  <div key={t.id} className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden group">
                    <div className="aspect-[4/3] bg-zinc-900 relative">
                      {t.bgUrl ? (
                        <img src={t.bgUrl} alt={t.name} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ImageIcon size={32} className="text-zinc-700" />
                        </div>
                      )}
                    </div>
                    <div className="p-4 flex justify-between items-center">
                      <h4 className="font-bold text-white uppercase tracking-wider text-sm">{t.name}</h4>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => {
                            setCurrentTemplate(t);
                            setIsEditingTemplate(true);
                          }}
                          className="p-2 text-zinc-400 hover:text-white bg-white/5 rounded-lg transition-colors"
                        >
                          <Settings2 size={16} />
                        </button>
                        <button 
                          onClick={() => deleteTemplate(t.id)}
                          className="p-2 text-zinc-400 hover:text-red-500 bg-white/5 rounded-lg transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                {templates.length === 0 && (
                  <div className="col-span-full text-center py-12 text-zinc-500 border border-dashed border-white/10 rounded-3xl">
                    No custom templates found.
                  </div>
                )}
              </div>
            </motion.div>
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-8">
              <div className="flex items-center justify-between">
                <button 
                  onClick={() => setIsEditingTemplate(false)}
                  className="inline-flex items-center gap-2 text-zinc-400 hover:text-white transition-colors uppercase tracking-widest text-xs font-bold"
                >
                  <ArrowLeft size={16} /> Back to Templates
                </button>
                <button 
                  onClick={saveTemplate}
                  disabled={saving}
                  className="px-8 py-3 bg-firefox-orange text-white rounded-full font-bold text-xs uppercase tracking-widest hover:bg-white hover:text-black transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  <Save size={16} /> {saving ? 'Saving...' : 'Save Template'}
                </button>
              </div>

              <div className="grid lg:grid-cols-12 gap-8">
                <div className="lg:col-span-4 space-y-6">
                  <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
                    <h3 className="font-display font-black text-xl text-white uppercase tracking-wider mb-6">Template Info</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="text-xs uppercase tracking-widest text-zinc-500 font-bold block mb-2">Template Name</label>
                        <input 
                          type="text"
                          value={currentTemplate.name}
                          onChange={(e) => setCurrentTemplate({...currentTemplate, name: e.target.value})}
                          className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:border-firefox-orange focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-xs uppercase tracking-widest text-zinc-500 font-bold block mb-2">Background Image URL (1200x900 recommended)</label>
                        <input 
                          type="text"
                          value={currentTemplate.bgUrl}
                          onChange={(e) => setCurrentTemplate({...currentTemplate, bgUrl: e.target.value})}
                          placeholder="https://..."
                          className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:border-firefox-orange focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="bg-white/5 border border-white/10 rounded-3xl p-6 h-[500px] overflow-y-auto no-scrollbar">
                    <h3 className="font-display font-black text-xl text-white uppercase tracking-wider mb-6">Field Mappings</h3>
                    <p className="text-xs text-zinc-400 mb-6">Adjust the X (horizontal), Y (vertical), Font Size, and Color for each placeholder.</p>
                    
                    {['name', 'event', 'date', 'position'].map((field) => (
                      <div key={field} className="mb-6 bg-black/30 p-4 rounded-2xl border border-white/5">
                        <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4 capitalize">{field}</h4>
                        <div className="space-y-3">
                          <div className="flex items-center gap-4">
                            <label className="text-xs text-zinc-500 w-8">X %</label>
                            <input 
                              type="range" min="0" max="100" 
                              value={currentTemplate.config[field].x}
                              onChange={(e) => setCurrentTemplate({
                                ...currentTemplate, 
                                config: { ...currentTemplate.config, [field]: { ...currentTemplate.config[field], x: Number(e.target.value) } }
                              })}
                              className="flex-1 accent-firefox-orange"
                            />
                            <span className="text-xs text-zinc-300 w-8 text-right">{currentTemplate.config[field].x}%</span>
                          </div>
                          <div className="flex items-center gap-4">
                            <label className="text-xs text-zinc-500 w-8">Y %</label>
                            <input 
                              type="range" min="0" max="100" 
                              value={currentTemplate.config[field].y}
                              onChange={(e) => setCurrentTemplate({
                                ...currentTemplate, 
                                config: { ...currentTemplate.config, [field]: { ...currentTemplate.config[field], y: Number(e.target.value) } }
                              })}
                              className="flex-1 accent-firefox-orange"
                            />
                            <span className="text-xs text-zinc-300 w-8 text-right">{currentTemplate.config[field].y}%</span>
                          </div>
                          <div className="flex items-center gap-4">
                            <label className="text-xs text-zinc-500 w-8">Size</label>
                            <input 
                              type="number" min="10" max="120" 
                              value={currentTemplate.config[field].size}
                              onChange={(e) => setCurrentTemplate({
                                ...currentTemplate, 
                                config: { ...currentTemplate.config, [field]: { ...currentTemplate.config[field], size: Number(e.target.value) } }
                              })}
                              className="flex-1 bg-black border border-white/10 rounded-lg px-3 py-1 text-white text-sm"
                            />
                          </div>
                          <div className="flex items-center gap-4">
                            <label className="text-xs text-zinc-500 w-8">Color</label>
                            <input 
                              type="color" 
                              value={currentTemplate.config[field].color}
                              onChange={(e) => setCurrentTemplate({
                                ...currentTemplate, 
                                config: { ...currentTemplate.config, [field]: { ...currentTemplate.config[field], color: e.target.value } }
                              })}
                              className="w-full h-8 rounded cursor-pointer bg-transparent"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="lg:col-span-8">
                  <div className="bg-zinc-900 border border-white/10 rounded-3xl p-6 sticky top-24">
                    <h3 className="font-display font-black text-xl text-white uppercase tracking-wider mb-6 flex items-center gap-2">
                      <Eye size={20} className="text-firefox-orange" /> Live Preview
                    </h3>
                    
                    <div className="relative w-full aspect-[4/3] bg-black border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
                      {currentTemplate.bgUrl ? (
                        <img src={currentTemplate.bgUrl} alt="Background" className="absolute inset-0 w-full h-full object-cover opacity-60" />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-zinc-600">
                          <ImageIcon size={48} />
                        </div>
                      )}
                      
                      {/* Mapping Overlays */}
                      <div 
                        className="absolute whitespace-nowrap transform -translate-x-1/2 -translate-y-1/2 font-serif font-black italic drop-shadow-lg"
                        style={{
                          left: `${currentTemplate.config.name.x}%`,
                          top: `${currentTemplate.config.name.y}%`,
                          fontSize: `${currentTemplate.config.name.size}px`,
                          color: currentTemplate.config.name.color
                        }}
                      >
                        John Doe
                      </div>
                      
                      <div 
                        className="absolute whitespace-nowrap transform -translate-x-1/2 -translate-y-1/2 font-display font-black uppercase drop-shadow-md"
                        style={{
                          left: `${currentTemplate.config.event.x}%`,
                          top: `${currentTemplate.config.event.y}%`,
                          fontSize: `${currentTemplate.config.event.size}px`,
                          color: currentTemplate.config.event.color
                        }}
                      >
                        Sample Event 2026
                      </div>
                      
                      <div 
                        className="absolute whitespace-nowrap transform -translate-x-1/2 -translate-y-1/2 font-serif italic drop-shadow-md"
                        style={{
                          left: `${currentTemplate.config.date.x}%`,
                          top: `${currentTemplate.config.date.y}%`,
                          fontSize: `${currentTemplate.config.date.size}px`,
                          color: currentTemplate.config.date.color
                        }}
                      >
                        10/24/2026
                      </div>

                      <div 
                        className="absolute whitespace-nowrap transform -translate-x-1/2 -translate-y-1/2 font-display font-black uppercase drop-shadow-md"
                        style={{
                          left: `${currentTemplate.config.position.x}%`,
                          top: `${currentTemplate.config.position.y}%`,
                          fontSize: `${currentTemplate.config.position.size}px`,
                          color: currentTemplate.config.position.color
                        }}
                      >
                        1st Position
                      </div>

                      {/* Helper grids */}
                      <div className="absolute inset-0 pointer-events-none opacity-10" style={{ backgroundImage: 'linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)', backgroundSize: '10% 10%' }} />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </div>
  );
}
