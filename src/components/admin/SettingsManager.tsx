import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Settings as SettingsIcon, Save, Loader2, Sparkles, Plus, X } from 'lucide-react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../lib/AuthContext';

export default function SettingsManager() {
  const [config, setConfig] = useState({ 
    silverFee: 99, 
    platinumFee: 199, 
    upiId: 'mfc.zcoer@upi',
    freeBenefits: ['Basic Ecosystem Access', 'Public Profile Creation', 'Limited Event Registration'],
    silverBenefits: ['Official Member ID Card', 'Access to Member Directory', 'Standard Event Discounts', 'Access to Roadmaps & Resources'],
    platinumBenefits: ['Everything in Silver', 'Free Access to Premium Events', 'Eligible for Core Team/Leadership', 'Project Incubation & Mentorship']
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { setSuccessMessage, setError } = useAuth();
  
  // Temp states for new items
  const [newFree, setNewFree] = useState('');
  const [newSilver, setNewSilver] = useState('');
  const [newPlatinum, setNewPlatinum] = useState('');

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const docRef = doc(db, 'settings', 'membership');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setConfig(prev => ({
            silverFee: data.silverFee || prev.silverFee,
            platinumFee: data.platinumFee || prev.platinumFee,
            upiId: data.upiId || prev.upiId,
            freeBenefits: data.freeBenefits || prev.freeBenefits,
            silverBenefits: data.silverBenefits || prev.silverBenefits,
            platinumBenefits: data.platinumBenefits || prev.platinumBenefits
          }));
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
        freeBenefits: config.freeBenefits,
        silverBenefits: config.silverBenefits,
        platinumBenefits: config.platinumBenefits,
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

  const addBenefit = (tier: 'free' | 'silver' | 'platinum', value: string, setter: any) => {
    if (!value.trim()) return;
    setConfig(prev => ({
      ...prev,
      [`${tier}Benefits`]: [...prev[`${tier}Benefits` as keyof typeof prev] as string[], value.trim()]
    }));
    setter('');
  };

  const removeBenefit = (tier: 'free' | 'silver' | 'platinum', index: number) => {
    setConfig(prev => {
      const arr = [...prev[`${tier}Benefits` as keyof typeof prev] as string[]];
      arr.splice(index, 1);
      return { ...prev, [`${tier}Benefits`]: arr };
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="animate-spin text-firefox-orange" size={48} />
      </div>
    );
  }

  const renderBenefitsList = (tier: 'free' | 'silver' | 'platinum', label: string, newValue: string, setter: any) => (
    <div className="mb-6">
      <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-2">
        {label} Benefits
      </label>
      <div className="space-y-2 mb-2">
        {(config[`${tier}Benefits` as keyof typeof config] as string[]).map((benefit, i) => (
          <div key={i} className="flex items-center justify-between bg-black/30 border border-white/5 rounded-lg px-3 py-2">
            <span className="text-sm text-zinc-300">{benefit}</span>
            <button type="button" onClick={() => removeBenefit(tier, i)} className="text-zinc-600 hover:text-red-400 transition-colors">
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <input 
          type="text" 
          value={newValue}
          onChange={(e) => setter(e.target.value)}
          onKeyDown={(e) => { if(e.key === 'Enter') { e.preventDefault(); addBenefit(tier, newValue, setter); }}}
          placeholder="Add a new benefit..."
          className="flex-1 bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-sm focus:border-firefox-orange outline-none transition-colors text-white"
        />
        <button 
          type="button" 
          onClick={() => addBenefit(tier, newValue, setter)}
          className="bg-white/10 hover:bg-white/20 text-white p-2 rounded-xl transition-colors"
        >
          <Plus size={18} />
        </button>
      </div>
    </div>
  );

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

      <div className="grid lg:grid-cols-2 gap-8">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 h-fit">
          <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
            <Sparkles className="text-firefox-orange" size={18} />
            Pricing Configuration
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
              Save your changes to update both Pricing and Benefits lists globally.
            </p>

            <button
              type="submit"
              disabled={saving}
              className="w-full px-6 py-4 bg-firefox-orange hover:bg-orange-600 text-white rounded-xl font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-2 text-sm uppercase tracking-wider shadow-[0_0_20px_rgba(255,106,0,0.3)]"
            >
              {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
              {saving ? 'Saving Changes...' : 'Save All Settings'}
            </button>
          </form>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
            <Sparkles className="text-firefox-orange" size={18} />
            Tier Benefits Configuration
          </h3>
          <div className="space-y-2">
            {renderBenefitsList('free', 'Free', newFree, setNewFree)}
            {renderBenefitsList('silver', 'Silver', newSilver, setNewSilver)}
            {renderBenefitsList('platinum', 'Platinum', newPlatinum, setNewPlatinum)}
          </div>
        </div>
      </div>
    </div>
  );
}
