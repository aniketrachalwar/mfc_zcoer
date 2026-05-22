import React, { useState, useEffect } from 'react';
import { Shield, Save, Settings, Users, Code, ShoppingBag } from 'lucide-react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { motion } from 'motion/react';

export default function StudentPortalManager() {
  const [config, setConfig] = useState<any>({
    enableProjectsTab: true,
    enablePurchasesTab: true,
    enableMembershipHistory: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const docRef = doc(db, 'config', 'studentPortal');
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setConfig(docSnap.data());
      }
    } catch (error) {
      console.error("Error fetching student portal config:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await setDoc(doc(db, 'config', 'studentPortal'), config);
      // Optional: Add a toast notification here
    } catch (error) {
      console.error("Error saving config:", error);
    } finally {
      setSaving(false);
    }
  };

  const toggleFeature = (feature: string) => {
    setConfig((prev: any) => ({ ...prev, [feature]: !prev[feature] }));
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-4 border-firefox-orange border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-display font-black text-white uppercase tracking-tight">Student Portal <span className="text-firefox-orange">Manager</span></h2>
          <p className="text-zinc-400 text-sm">Configure the features available in the Student Portal.</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-3 bg-firefox-orange text-white rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-orange-600 transition-colors disabled:opacity-50"
        >
          {saving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Save size={16} />}
          Save Changes
        </button>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
        <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2"><Settings size={20} className="text-firefox-orange" /> Feature Toggles</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-black/40 border border-white/10 p-6 rounded-2xl flex flex-col justify-between">
            <div className="flex items-start justify-between mb-4">
              <div className="w-10 h-10 bg-firefox-orange/10 rounded-xl flex items-center justify-center text-firefox-orange">
                <Code size={20} />
              </div>
              <button 
                onClick={() => toggleFeature('enableProjectsTab')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${config.enableProjectsTab ? 'bg-firefox-orange' : 'bg-white/10'}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${config.enableProjectsTab ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>
            <div>
              <h4 className="font-bold text-white">Running Projects Tab</h4>
              <p className="text-xs text-zinc-500 mt-1">Allow students to view and track their running project contributions.</p>
            </div>
          </div>

          <div className="bg-black/40 border border-white/10 p-6 rounded-2xl flex flex-col justify-between">
            <div className="flex items-start justify-between mb-4">
              <div className="w-10 h-10 bg-firefox-orange/10 rounded-xl flex items-center justify-center text-firefox-orange">
                <ShoppingBag size={20} />
              </div>
              <button 
                onClick={() => toggleFeature('enablePurchasesTab')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${config.enablePurchasesTab ? 'bg-firefox-orange' : 'bg-white/10'}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${config.enablePurchasesTab ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>
            <div>
              <h4 className="font-bold text-white">Purchased Items Tab</h4>
              <p className="text-xs text-zinc-500 mt-1">Show students their purchased merchandise and event tickets.</p>
            </div>
          </div>

          <div className="bg-black/40 border border-white/10 p-6 rounded-2xl flex flex-col justify-between">
            <div className="flex items-start justify-between mb-4">
              <div className="w-10 h-10 bg-firefox-orange/10 rounded-xl flex items-center justify-center text-firefox-orange">
                <Shield size={20} />
              </div>
              <button 
                onClick={() => toggleFeature('enableMembershipHistory')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${config.enableMembershipHistory ? 'bg-firefox-orange' : 'bg-white/10'}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${config.enableMembershipHistory ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>
            <div>
              <h4 className="font-bold text-white">Membership History Tab</h4>
              <p className="text-xs text-zinc-500 mt-1">Allow students to view their membership timeline and current tier perks.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
