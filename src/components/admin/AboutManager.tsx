import React, { useState, useEffect } from 'react';
import { db } from '../../lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { Save, Plus, Trash2, Image as ImageIcon, Users, Target, Award, ImageIcon as GalleryIcon, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';

interface AboutData {
  identityText: string;
  identityDescription: string;
  stats: { label: string; val: string }[];
  missionItems: string[];
  leadershipMessages: { id: string; name: string; role: string; message: string; imageUrl: string }[];
  achievements: { id: string; title: string; description: string; date: string; imageUrl: string }[];
  gallery: string[];
}

const defaultData: AboutData = {
  identityText: "MFC Open Web",
  identityDescription: "MFC Open Web is a community of makers, builders, and learners. We bridge the gap between academic theory and industry reality through relentless open-source contribution and collaborative product building.",
  stats: [
    { label: "Active Members", val: "450+" },
    { label: "Projects Launched", val: "24" },
    { label: "Years Innovating", val: "3" }
  ],
  missionItems: [
    "Democratizing technology for everyone",
    "Building tools for a healthy, open web",
    "Merit-based growth through tangible output",
    "Fostering a culture of accountability"
  ],
  leadershipMessages: [],
  achievements: [],
  gallery: []
};

const AboutManager = () => {
  const [data, setData] = useState<AboutData>(defaultData);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState<'identity' | 'mission' | 'leadership' | 'achievements' | 'gallery'>('identity');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const docRef = doc(db, 'settings', 'about');
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setData({ ...defaultData, ...docSnap.data() } as AboutData);
      }
    } catch (err: any) {
      console.error(err);
      setError('Failed to load about page configuration.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      await setDoc(doc(db, 'settings', 'about'), data);
      setSuccess('About page configuration saved successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      console.error(err);
      setError('Failed to save configuration. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="flex justify-center p-20">
      <div className="w-12 h-12 border-4 border-firefox-orange border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-zinc-900/50 p-6 rounded-[2rem] border border-zinc-800">
        <div>
          <h1 className="text-3xl font-display font-black uppercase text-white mb-2 tracking-tight">About Page CMS</h1>
          <p className="text-zinc-400 text-sm">Manage the content, achievements, and leadership messages displayed on the public About page.</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={saving}
          className="flex items-center justify-center gap-2 px-8 py-4 bg-firefox-orange text-white rounded-full font-black uppercase tracking-widest text-xs hover:scale-105 active:scale-95 transition-all disabled:opacity-50 shrink-0 shadow-lg shadow-firefox-orange/20"
        >
          <Save size={16} />
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl flex items-center gap-3">
          <AlertCircle size={20} />
          <p className="font-bold text-sm">{error}</p>
        </div>
      )}
      
      {success && (
        <div className="p-4 bg-green-500/10 border border-green-500/20 text-green-500 rounded-xl flex items-center gap-3">
          <AlertCircle size={20} />
          <p className="font-bold text-sm">{success}</p>
        </div>
      )}

      {/* Tabs */}
      <div className="flex overflow-x-auto gap-2 p-2 bg-zinc-900/30 rounded-2xl border border-zinc-800 scrollbar-hide">
        {[
          { id: 'identity', label: 'Identity & Stats', icon: Users },
          { id: 'mission', label: 'The Mission', icon: Target },
          { id: 'leadership', label: 'Leadership', icon: Users },
          { id: 'achievements', label: 'Achievements', icon: Award },
          { id: 'gallery', label: 'Gallery', icon: GalleryIcon },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap shrink-0 ${
              activeTab === tab.id 
                ? 'bg-zinc-800 text-white shadow-lg' 
                : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50'
            }`}
          >
            <tab.icon size={16} /> {tab.label}
          </button>
        ))}
      </div>

      <div className="bg-zinc-900/50 border border-zinc-800 rounded-[2rem] p-6 sm:p-8">
        
        {/* IDENTITY TAB */}
        {activeTab === 'identity' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
            <div>
              <h2 className="text-xl font-black text-white mb-6 uppercase tracking-wider">Identity Details</h2>
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2 block ml-4">Title</label>
                  <input
                    type="text"
                    value={data.identityText}
                    onChange={(e) => setData({ ...data, identityText: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-firefox-orange"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2 block ml-4">Description</label>
                  <textarea
                    rows={4}
                    value={data.identityDescription}
                    onChange={(e) => setData({ ...data, identityDescription: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-firefox-orange resize-none"
                  />
                </div>
              </div>
            </div>

            <div className="pt-8 border-t border-zinc-800">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-black text-white uppercase tracking-wider">Key Stats</h2>
                <button
                  onClick={() => setData({ ...data, stats: [...data.stats, { label: '', val: '' }] })}
                  className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest transition-colors"
                >
                  <Plus size={14} /> Add Stat
                </button>
              </div>
              
              <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
                {data.stats.map((stat, i) => (
                  <div key={i} className="bg-zinc-950 p-4 rounded-2xl border border-zinc-800 relative group">
                    <button
                      onClick={() => {
                        const newStats = [...data.stats];
                        newStats.splice(i, 1);
                        setData({ ...data, stats: newStats });
                      }}
                      className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                    >
                      <Trash2 size={14} />
                    </button>
                    <input
                      type="text"
                      placeholder="Value (e.g. 450+)"
                      value={stat.val}
                      onChange={(e) => {
                        const newStats = [...data.stats];
                        newStats[i].val = e.target.value;
                        setData({ ...data, stats: newStats });
                      }}
                      className="w-full bg-transparent text-2xl font-black text-white focus:outline-none mb-2 placeholder:text-zinc-700"
                    />
                    <input
                      type="text"
                      placeholder="Label (e.g. Members)"
                      value={stat.label}
                      onChange={(e) => {
                        const newStats = [...data.stats];
                        newStats[i].label = e.target.value;
                        setData({ ...data, stats: newStats });
                      }}
                      className="w-full bg-transparent text-[10px] font-bold uppercase tracking-widest text-zinc-500 focus:outline-none focus:text-firefox-orange placeholder:text-zinc-700"
                    />
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* MISSION TAB */}
        {activeTab === 'mission' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-black text-white uppercase tracking-wider">Mission Points</h2>
              <button
                onClick={() => setData({ ...data, missionItems: [...data.missionItems, ''] })}
                className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest transition-colors"
              >
                <Plus size={14} /> Add Point
              </button>
            </div>
            <div className="space-y-3">
              {data.missionItems.map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-10 h-10 shrink-0 bg-firefox-orange/10 text-firefox-orange font-black flex items-center justify-center rounded-xl border border-firefox-orange/20">
                    0{i+1}
                  </div>
                  <input
                    type="text"
                    value={item}
                    onChange={(e) => {
                      const newItems = [...data.missionItems];
                      newItems[i] = e.target.value;
                      setData({ ...data, missionItems: newItems });
                    }}
                    className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-firefox-orange text-sm"
                  />
                  <button
                    onClick={() => {
                      const newItems = [...data.missionItems];
                      newItems.splice(i, 1);
                      setData({ ...data, missionItems: newItems });
                    }}
                    className="w-12 h-12 shrink-0 flex items-center justify-center text-red-500 hover:bg-red-500/10 rounded-xl transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* LEADERSHIP TAB */}
        {activeTab === 'leadership' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-black text-white uppercase tracking-wider">Leadership Messages</h2>
                <p className="text-sm text-zinc-500">Messages from Principal, HOD, Presidents.</p>
              </div>
              <button
                onClick={() => setData({ 
                  ...data, 
                  leadershipMessages: [...data.leadershipMessages, { id: Date.now().toString(), name: '', role: '', message: '', imageUrl: '' }] 
                })}
                className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest transition-colors"
              >
                <Plus size={14} /> Add Message
              </button>
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
              {data.leadershipMessages.map((msg, i) => (
                <div key={msg.id} className="bg-zinc-950 border border-zinc-800 p-6 rounded-[2rem] relative space-y-4 group">
                  <button
                    onClick={() => {
                      const newMsgs = [...data.leadershipMessages];
                      newMsgs.splice(i, 1);
                      setData({ ...data, leadershipMessages: newMsgs });
                    }}
                    className="absolute top-4 right-4 w-8 h-8 bg-zinc-900 hover:bg-red-500 text-zinc-500 hover:text-white rounded-full flex items-center justify-center transition-colors border border-zinc-800 z-10"
                  >
                    <Trash2 size={14} />
                  </button>

                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="w-24 h-24 shrink-0 rounded-full bg-zinc-900 border border-zinc-800 overflow-hidden relative group/img">
                      {msg.imageUrl ? (
                        <img src={msg.imageUrl} alt={msg.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-zinc-600">
                          <ImageIcon size={24} />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 space-y-2">
                      <input
                        type="text"
                        placeholder="Image URL"
                        value={msg.imageUrl}
                        onChange={(e) => {
                          const newMsgs = [...data.leadershipMessages];
                          newMsgs[i].imageUrl = e.target.value;
                          setData({ ...data, leadershipMessages: newMsgs });
                        }}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-firefox-orange"
                      />
                      <input
                        type="text"
                        placeholder="Name (e.g. Dr. John Doe)"
                        value={msg.name}
                        onChange={(e) => {
                          const newMsgs = [...data.leadershipMessages];
                          newMsgs[i].name = e.target.value;
                          setData({ ...data, leadershipMessages: newMsgs });
                        }}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2 text-sm font-bold text-white focus:outline-none focus:border-firefox-orange"
                      />
                      <input
                        type="text"
                        placeholder="Role (e.g. Principal, ZCOER)"
                        value={msg.role}
                        onChange={(e) => {
                          const newMsgs = [...data.leadershipMessages];
                          newMsgs[i].role = e.target.value;
                          setData({ ...data, leadershipMessages: newMsgs });
                        }}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2 text-xs font-bold uppercase tracking-widest text-firefox-orange focus:outline-none focus:border-firefox-orange"
                      />
                    </div>
                  </div>
                  <textarea
                    placeholder="Message content..."
                    rows={4}
                    value={msg.message}
                    onChange={(e) => {
                      const newMsgs = [...data.leadershipMessages];
                      newMsgs[i].message = e.target.value;
                      setData({ ...data, leadershipMessages: newMsgs });
                    }}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-zinc-300 focus:outline-none focus:border-firefox-orange resize-none"
                  />
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* ACHIEVEMENTS TAB */}
        {activeTab === 'achievements' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-black text-white uppercase tracking-wider">Achievements & Timeline</h2>
                <p className="text-sm text-zinc-500">Major milestones of the club.</p>
              </div>
              <button
                onClick={() => setData({ 
                  ...data, 
                  achievements: [...data.achievements, { id: Date.now().toString(), title: '', description: '', date: '', imageUrl: '' }] 
                })}
                className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest transition-colors"
              >
                <Plus size={14} /> Add Achievement
              </button>
            </div>

            <div className="space-y-6">
              {data.achievements.map((ach, i) => (
                <div key={ach.id} className="bg-zinc-950 border border-zinc-800 p-6 rounded-[2rem] relative flex flex-col md:flex-row gap-6 group">
                  <button
                    onClick={() => {
                      const newAchs = [...data.achievements];
                      newAchs.splice(i, 1);
                      setData({ ...data, achievements: newAchs });
                    }}
                    className="absolute top-4 right-4 w-8 h-8 bg-zinc-900 hover:bg-red-500 text-zinc-500 hover:text-white rounded-full flex items-center justify-center transition-colors border border-zinc-800 z-10"
                  >
                    <Trash2 size={14} />
                  </button>

                  <div className="w-full md:w-64 h-40 shrink-0 rounded-2xl bg-zinc-900 border border-zinc-800 overflow-hidden relative">
                    {ach.imageUrl ? (
                      <img src={ach.imageUrl} alt={ach.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-zinc-600">
                        <ImageIcon size={32} />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 space-y-3">
                    <input
                      type="text"
                      placeholder="Image URL"
                      value={ach.imageUrl}
                      onChange={(e) => {
                        const newAchs = [...data.achievements];
                        newAchs[i].imageUrl = e.target.value;
                        setData({ ...data, achievements: newAchs });
                      }}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-firefox-orange"
                    />
                    <div className="flex gap-3">
                      <input
                        type="text"
                        placeholder="Title (e.g. Best Club Award)"
                        value={ach.title}
                        onChange={(e) => {
                          const newAchs = [...data.achievements];
                          newAchs[i].title = e.target.value;
                          setData({ ...data, achievements: newAchs });
                        }}
                        className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2 text-sm font-bold text-white focus:outline-none focus:border-firefox-orange"
                      />
                      <input
                        type="text"
                        placeholder="Date (e.g. 2024)"
                        value={ach.date}
                        onChange={(e) => {
                          const newAchs = [...data.achievements];
                          newAchs[i].date = e.target.value;
                          setData({ ...data, achievements: newAchs });
                        }}
                        className="w-32 bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2 text-xs font-bold text-firefox-orange text-center focus:outline-none focus:border-firefox-orange"
                      />
                    </div>
                    <textarea
                      placeholder="Description of the achievement..."
                      rows={3}
                      value={ach.description}
                      onChange={(e) => {
                        const newAchs = [...data.achievements];
                        newAchs[i].description = e.target.value;
                        setData({ ...data, achievements: newAchs });
                      }}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-zinc-400 focus:outline-none focus:border-firefox-orange resize-none"
                    />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* GALLERY TAB */}
        {activeTab === 'gallery' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-black text-white uppercase tracking-wider">Photo Gallery</h2>
                <p className="text-sm text-zinc-500">Event photos and memories.</p>
              </div>
              <button
                onClick={() => setData({ ...data, gallery: [...data.gallery, ''] })}
                className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest transition-colors"
              >
                <Plus size={14} /> Add Photo
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {data.gallery.map((url, i) => (
                <div key={i} className="bg-zinc-950 border border-zinc-800 p-2 rounded-2xl relative group flex flex-col gap-2">
                  <div className="aspect-square rounded-xl bg-zinc-900 overflow-hidden relative">
                    {url ? (
                      <img src={url} alt={`Gallery ${i}`} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-zinc-700">
                        <GalleryIcon size={32} />
                      </div>
                    )}
                    <button
                      onClick={() => {
                        const newGallery = [...data.gallery];
                        newGallery.splice(i, 1);
                        setData({ ...data, gallery: newGallery });
                      }}
                      className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                  <input
                    type="text"
                    placeholder="Image URL"
                    value={url}
                    onChange={(e) => {
                      const newGallery = [...data.gallery];
                      newGallery[i] = e.target.value;
                      setData({ ...data, gallery: newGallery });
                    }}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-[10px] text-zinc-400 focus:outline-none focus:border-firefox-orange focus:text-white"
                  />
                </div>
              ))}
            </div>
          </motion.div>
        )}

      </div>
    </div>
  );
};

export default AboutManager;
