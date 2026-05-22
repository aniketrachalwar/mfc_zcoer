import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Settings as SettingsIcon, Save, Loader2, Sparkles } from 'lucide-react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../lib/AuthContext';

export default function SettingsManager() {
  const [config, setConfig] = useState({ silverFee: 99, platinumFee: 199, upiId: 'mfc.zcoer@upi' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { setSuccessMessage, setError } = useAuth();

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const docRef = doc(db, 'settings', 'membership');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setConfig({
            silverFee: data.silverFee || 99,
            platinumFee: data.platinumFee || 199,
            upiId: data.upiId || 'mfc.zcoer@upi'
          });
        }
      } catch (err) {
        console.error("Error fetching settings", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await setDoc(doc(db, 'settings', 'membership'), {
        silverFee: Number(config.silverFee),
        platinumFee: Number(config.platinumFee),
        upiId: config.upiId,
        updatedAt: new Date().toISOString()
      }, { merge: true });
      setSuccessMessage('Settings updated successfully!');
    } catch (err: any) {
      console.error(err);
      setError('Failed to update settings.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="animate-spin text-firefox-orange" size={48} />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 bg-firefox-orange/10 rounded-xl flex items-center justify-center text-firefox-orange">
          <SettingsIcon size={24} />
        </div>
        <div>
          <h2 className="text-2xl font-display font-black uppercase text-white tracking-tight">Platform <span className="text-firefox-orange">Settings</span></h2>
          <p className="text-zinc-400 text-sm">Manage global configurations.</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
            <Sparkles className="text-firefox-orange" size={18} />
            Membership Configuration
          </h3>
          <form onSubmit={handleSave} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-2">
                  Silver Tier Fee (₹)
                </label>
                <input 
                  type="number" 
                  min="0"
                  value={config.silverFee}
                  onChange={(e) => setConfig(prev => ({...prev, silverFee: Number(e.target.value)}))}
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-[16px] focus:border-firefox-orange outline-none transition-colors text-white font-mono"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-2">
                  Platinum Tier Fee (₹)
                </label>
                <input 
                  type="number" 
                  min="0"
                  value={config.platinumFee}
                  onChange={(e) => setConfig(prev => ({...prev, platinumFee: Number(e.target.value)}))}
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-[16px] focus:border-firefox-orange outline-none transition-colors text-white font-mono"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-2">
                Official UPI ID
              </label>
              <input 
                type="text" 
                value={config.upiId}
                onChange={(e) => setConfig(prev => ({...prev, upiId: e.target.value}))}
                placeholder="e.g. mfc.zcoer@upi"
                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-[16px] focus:border-firefox-orange outline-none transition-colors text-white font-mono tracking-widest"
              />
            </div>

            <p className="text-xs text-zinc-500 mt-2">
              These settings control global membership pricing and manual payment processing details.
            </p>

            <button
              type="submit"
              disabled={saving}
              className="px-6 py-3 bg-firefox-orange hover:bg-orange-600 text-white rounded-xl font-bold transition-all disabled:opacity-50 flex items-center gap-2 text-sm uppercase tracking-wider"
            >
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              {saving ? 'Saving...' : 'Save Settings'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
