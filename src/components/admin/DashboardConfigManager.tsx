import { useState, useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { motion } from 'motion/react';
import { LayoutDashboard, Save, Plus, X, GripVertical } from 'lucide-react';
import { useAuth } from '../../lib/AuthContext';

interface Widget {
  id: string;
  title: string;
  enabled: boolean;
  order: number;
}

interface DashboardConfig {
  widgets: Widget[];
  announcements: { id: string; text: string; active: boolean }[];
  highlightOpps: { id: string; title: string; link: string; active: boolean }[];
}

const defaultWidgets = [
  { id: 'stats', title: 'User Statistics', enabled: true, order: 1 },
  { id: 'recent_events', title: 'Recent Events', enabled: true, order: 2 },
  { id: 'leaderboard_preview', title: 'Leaderboard Preview', enabled: true, order: 3 },
  { id: 'quick_actions', title: 'Quick Actions', enabled: true, order: 4 }
];

const DashboardConfigManager = () => {
  const [config, setConfig] = useState<DashboardConfig>({
    widgets: defaultWidgets,
    announcements: [],
    highlightOpps: []
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newAnnouncement, setNewAnnouncement] = useState('');
  const { setSuccess, setError } = useAuth();

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const docRef = doc(db, 'config', 'dashboardSettings');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data() as DashboardConfig;
          setConfig({
            widgets: data.widgets || defaultWidgets,
            announcements: data.announcements || [],
            highlightOpps: data.highlightOpps || []
          });
        }
      } catch (err) {
        console.error('Error fetching dashboard config:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchConfig();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await setDoc(doc(db, 'config', 'dashboardSettings'), config);
      setSuccess?.('Dashboard configuration saved successfully.');
    } catch (err) {
      console.error(err);
      setError?.('Failed to save dashboard configuration. Check permissions.');
    } finally {
      setSaving(false);
    }
  };

  const toggleWidget = (id: string) => {
    setConfig(prev => ({
      ...prev,
      widgets: prev.widgets.map(w => w.id === id ? { ...w, enabled: !w.enabled } : w)
    }));
  };

  const addAnnouncement = () => {
    if (!newAnnouncement.trim()) return;
    setConfig(prev => ({
      ...prev,
      announcements: [
        ...prev.announcements,
        { id: Date.now().toString(), text: newAnnouncement, active: true }
      ]
    }));
    setNewAnnouncement('');
  };

  const removeAnnouncement = (id: string) => {
    setConfig(prev => ({
      ...prev,
      announcements: prev.announcements.filter(a => a.id !== id)
    }));
  };

  const toggleAnnouncement = (id: string) => {
    setConfig(prev => ({
      ...prev,
      announcements: prev.announcements.map(a => a.id === id ? { ...a, active: !a.active } : a)
    }));
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-8 h-8 border-2 border-firefox-orange border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-display font-black uppercase text-white">Dashboard Configuration</h2>
          <p className="text-zinc-400 text-sm">Control what students see on their member dashboard.</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-3 bg-firefox-orange text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-orange-600 transition-colors disabled:opacity-50"
        >
          {saving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Save size={16} />}
          Save Changes
        </button>
      </div>

      {/* Widgets Configuration */}
      <div className="bg-white/5 border border-white/10 rounded-[2rem] p-8">
        <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
          <LayoutDashboard size={20} className="text-firefox-orange" />
          Dashboard Widgets
        </h3>
        <div className="space-y-3">
          {config.widgets.map((widget, index) => (
            <div key={widget.id} className="flex items-center justify-between p-4 bg-zinc-900/50 rounded-xl border border-white/5">
              <div className="flex items-center gap-4">
                <GripVertical size={16} className="text-zinc-600 cursor-move" />
                <span className="text-sm font-bold text-zinc-300">{widget.title}</span>
              </div>
              <button
                onClick={() => toggleWidget(widget.id)}
                className={`w-12 h-6 rounded-full transition-colors relative ${widget.enabled ? 'bg-firefox-orange' : 'bg-zinc-700'}`}
              >
                <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${widget.enabled ? 'translate-x-6' : 'translate-x-0'}`} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Announcements */}
      <div className="bg-white/5 border border-white/10 rounded-[2rem] p-8">
        <h3 className="text-lg font-bold text-white mb-6">Global Dashboard Announcements</h3>
        
        <div className="flex gap-4 mb-6">
          <input
            type="text"
            value={newAnnouncement}
            onChange={(e) => setNewAnnouncement(e.target.value)}
            placeholder="Type announcement here..."
            className="flex-1 bg-zinc-900/50 border border-white/10 rounded-xl px-4 text-sm text-white focus:outline-none focus:border-firefox-orange/50 transition-colors"
          />
          <button
            onClick={addAnnouncement}
            className="flex items-center gap-2 px-6 py-3 bg-white/10 text-white rounded-xl font-bold text-xs hover:bg-white/20 transition-colors"
          >
            <Plus size={16} /> Add
          </button>
        </div>

        <div className="space-y-3">
          {config.announcements.map((ann) => (
            <div key={ann.id} className="flex items-center justify-between p-4 bg-zinc-900/50 rounded-xl border border-white/5">
              <span className={`text-sm ${ann.active ? 'text-zinc-300' : 'text-zinc-600 line-through'}`}>{ann.text}</span>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => toggleAnnouncement(ann.id)}
                  className={`text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full ${ann.active ? 'bg-green-500/20 text-green-400' : 'bg-zinc-800 text-zinc-500'}`}
                >
                  {ann.active ? 'Active' : 'Hidden'}
                </button>
                <button onClick={() => removeAnnouncement(ann.id)} className="text-red-400 hover:text-red-300 p-1">
                  <X size={16} />
                </button>
              </div>
            </div>
          ))}
          {config.announcements.length === 0 && (
             <p className="text-zinc-500 text-sm text-center py-4">No active announcements.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardConfigManager;
