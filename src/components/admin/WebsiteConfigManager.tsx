import { useState, useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Save, Layout, Settings } from 'lucide-react';
import { useAuth } from '../../lib/AuthContext';

interface SiteConfig {
  heroTitle: string;
  heroSubtitle: string;
  showUpcomingEvent: boolean;
  membershipPrice: number;
}

const WebsiteConfigManager = () => {
  const [config, setConfig] = useState<SiteConfig>({
    heroTitle: 'Mozilla Firefox Club',
    heroSubtitle: 'A student startup ecosystem, technical community, and builder network.',
    showUpcomingEvent: true,
    membershipPrice: 99
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { setSuccess, setError } = useAuth();

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const docRef = doc(db, 'config', 'siteSettings');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setConfig({ ...config, ...docSnap.data() });
        }
      } catch (err) {
        console.error('Error fetching site config:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchConfig();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await setDoc(doc(db, 'config', 'siteSettings'), config);
      setSuccess?.('Website configuration saved successfully.');
    } catch (err) {
      console.error(err);
      setError?.('Failed to save website configuration. Check permissions.');
    } finally {
      setSaving(false);
    }
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
          <h2 className="text-2xl font-display font-black uppercase text-white">Website Configuration</h2>
          <p className="text-zinc-400 text-sm">Manage public website content and features.</p>
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

      <div className="bg-white/5 border border-white/10 rounded-[2rem] p-8">
        <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
          <Layout size={20} className="text-firefox-orange" />
          Homepage Content
        </h3>
        
        <div className="space-y-6">
          <div>
            <label className="block text-xs font-black uppercase tracking-widest text-zinc-500 mb-2">Hero Title</label>
            <input
              type="text"
              value={config.heroTitle}
              onChange={(e) => setConfig({ ...config, heroTitle: e.target.value })}
              className="w-full bg-zinc-900/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-firefox-orange/50 transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs font-black uppercase tracking-widest text-zinc-500 mb-2">Hero Subtitle</label>
            <textarea
              value={config.heroSubtitle}
              onChange={(e) => setConfig({ ...config, heroSubtitle: e.target.value })}
              className="w-full bg-zinc-900/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-firefox-orange/50 transition-colors h-24 resize-none"
            />
          </div>
          <div className="flex items-center justify-between p-4 bg-zinc-900/50 rounded-xl border border-white/5">
            <span className="text-sm font-bold text-zinc-300">Show Upcoming Event Section</span>
            <button
              onClick={() => setConfig({ ...config, showUpcomingEvent: !config.showUpcomingEvent })}
              className={`w-12 h-6 rounded-full transition-colors relative ${config.showUpcomingEvent ? 'bg-firefox-orange' : 'bg-zinc-700'}`}
            >
              <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${config.showUpcomingEvent ? 'translate-x-6' : 'translate-x-0'}`} />
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-[2rem] p-8">
        <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
          <Settings size={20} className="text-firefox-orange" />
          Membership Configuration
        </h3>
        
        <div>
          <label className="block text-xs font-black uppercase tracking-widest text-zinc-500 mb-2">Membership Price (₹)</label>
          <input
            type="number"
            value={config.membershipPrice}
            onChange={(e) => setConfig({ ...config, membershipPrice: Number(e.target.value) })}
            className="w-full max-w-xs bg-zinc-900/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-firefox-orange/50 transition-colors"
          />
        </div>
      </div>
    </div>
  );
};

export default WebsiteConfigManager;
