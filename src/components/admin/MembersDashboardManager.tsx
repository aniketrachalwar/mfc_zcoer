import PageLoader from '../PageLoader';
import React, { useState, useEffect } from 'react';
import { Shield, Save, Settings, Users, Code, ShoppingBag, Plus, Trash2, Link as LinkIcon, Edit2, CheckCircle2 } from 'lucide-react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { motion } from 'motion/react';

export default function MembersDashboardManager() {
  const [config, setConfig] = useState<any>({
    enableProjectsTab: true,
    enablePurchasesTab: true,
    enableMembershipHistory: true,
    nextActions: [
      { id: '1', title: 'Browse Events', link: '/events', enabled: true },
      { id: '2', title: 'Explore Projects', link: '/projects', enabled: true },
    ]
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const docRef = doc(db, 'config', 'membersDashboard');
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setConfig({
          ...data,
          nextActions: data.nextActions || [
            { id: '1', title: 'Browse Events', link: '/events', enabled: true },
            { id: '2', title: 'Explore Projects', link: '/projects', enabled: true }
          ]
        });
      }
    } catch (error) {
      console.error("Error fetching members dashboard config:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await setDoc(doc(db, 'config', 'membersDashboard'), config);
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

  const addNextAction = () => {
    setConfig((prev: any) => ({
      ...prev,
      nextActions: [
        ...prev.nextActions,
        { id: Date.now().toString(), title: 'New Action', link: '/', enabled: true }
      ]
    }));
  };

  const updateNextAction = (id: string, field: string, value: any) => {
    setConfig((prev: any) => ({
      ...prev,
      nextActions: prev.nextActions.map((action: any) => 
        action.id === id ? { ...action, [field]: value } : action
      )
    }));
  };

  const deleteNextAction = (id: string) => {
    setConfig((prev: any) => ({
      ...prev,
      nextActions: prev.nextActions.filter((action: any) => action.id !== id)
    }));
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <PageLoader fullScreen={false} />
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-display font-black text-white uppercase tracking-tight">Members <span className="text-firefox-orange">Dashboard</span></h2>
          <p className="text-zinc-400 text-sm">Configure the features available in the Members Dashboard.</p>
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
              <p className="text-xs text-zinc-500 mt-1">Allow members to view and track their running project contributions.</p>
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
              <p className="text-xs text-zinc-500 mt-1">Show members their purchased merchandise and event tickets.</p>
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
              <p className="text-xs text-zinc-500 mt-1">Allow members to view their membership timeline and current tier perks.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-white flex items-center gap-2"><LinkIcon size={20} className="text-firefox-orange" /> Manage Next Actions</h3>
          <button 
            onClick={addNextAction}
            className="flex items-center gap-2 px-4 py-2 bg-white/10 text-white rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-white/20 transition-colors"
          >
            <Plus size={14} /> Add Action
          </button>
        </div>
        
        <div className="space-y-4">
          {config.nextActions?.map((action: any) => (
            <div key={action.id} className={`bg-black/40 border ${action.enabled ? 'border-firefox-orange/30' : 'border-white/10 opacity-70'} p-4 sm:p-5 rounded-2xl flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between transition-all`}>
              <div className="flex-1 w-full space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500 w-12">Title</span>
                  <input
                    type="text"
                    value={action.title}
                    onChange={(e) => updateNextAction(action.id, 'title', e.target.value)}
                    className="flex-1 bg-transparent border-b border-white/10 px-2 py-1 text-sm font-bold text-white focus:outline-none focus:border-firefox-orange transition-colors"
                    placeholder="Action Title"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500 w-12">Link</span>
                  <input
                    type="text"
                    value={action.link}
                    onChange={(e) => updateNextAction(action.id, 'link', e.target.value)}
                    className="flex-1 bg-transparent border-b border-white/10 px-2 py-1 text-sm text-zinc-300 focus:outline-none focus:border-firefox-orange transition-colors"
                    placeholder="e.g. /events or https://..."
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-auto shrink-0 pt-2 sm:pt-0">
                <button
                  onClick={() => updateNextAction(action.id, 'enabled', !action.enabled)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors ${action.enabled ? 'bg-firefox-orange/20 text-firefox-orange hover:bg-firefox-orange/30' : 'bg-white/5 text-zinc-400 hover:bg-white/10'}`}
                >
                  <CheckCircle2 size={14} />
                  {action.enabled ? 'Active' : 'Hidden'}
                </button>
                <button
                  onClick={() => deleteNextAction(action.id)}
                  className="w-8 h-8 rounded-lg bg-red-500/10 text-red-500 flex items-center justify-center hover:bg-red-500/20 transition-colors"
                  title="Delete Action"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
          {(!config.nextActions || config.nextActions.length === 0) && (
            <div className="text-center py-8 bg-black/20 rounded-2xl border border-dashed border-white/10">
              <p className="text-zinc-500 text-sm">No Next Actions defined.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
