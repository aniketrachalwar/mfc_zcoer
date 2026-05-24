import React, { useState, useEffect } from 'react';
import { Bell, Save, Plus, Trash2, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../lib/AuthContext';

interface LiveNotification {
  id: string;
  text: string;
  isImportant: boolean;
  expiryDate?: string;
}

interface LiveNotificationConfig {
  enabled: boolean;
  autoScroll: boolean;
  messages: LiveNotification[];
}

export default function NotificationsManager() {
  const [config, setConfig] = useState<LiveNotificationConfig>({
    enabled: false,
    autoScroll: true,
    messages: []
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { setSuccessMessage, setError } = useAuth();

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const docRef = doc(db, 'config', 'dashboardSettings');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.liveNotifications) {
            setConfig({
              enabled: data.liveNotifications.enabled ?? false,
              autoScroll: data.liveNotifications.autoScroll ?? true,
              messages: data.liveNotifications.messages || []
            });
          }
        }
      } catch (err) {
        console.error("Error fetching live notifications:", err);
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
      await setDoc(doc(db, 'config', 'dashboardSettings'), {
        liveNotifications: config,
        updatedAt: new Date().toISOString()
      }, { merge: true });
      setSuccessMessage('Live notifications updated successfully!');
    } catch (err: any) {
      console.error(err);
      setError('Failed to update live notifications.');
    } finally {
      setSaving(false);
    }
  };

  const addMessage = () => {
    setConfig(prev => ({
      ...prev,
      messages: [
        ...prev.messages,
        { id: Math.random().toString(36).substr(2, 9), text: '', isImportant: false }
      ]
    }));
  };

  const updateMessage = (id: string, field: keyof LiveNotification, value: any) => {
    setConfig(prev => ({
      ...prev,
      messages: prev.messages.map(msg => 
        msg.id === id ? { ...msg, [field]: value } : msg
      )
    }));
  };

  const removeMessage = (id: string) => {
    setConfig(prev => ({
      ...prev,
      messages: prev.messages.filter(msg => msg.id !== id)
    }));
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
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-firefox-orange/10 rounded-xl flex items-center justify-center text-firefox-orange">
            <Bell size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-display font-black uppercase text-white tracking-tight">
              Live <span className="text-firefox-orange">Notifications</span>
            </h1>
            <p className="text-zinc-400 text-sm">Manage the top live announcement bar.</p>
          </div>
        </div>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
        <form onSubmit={handleSave} className="space-y-8">
          
          {/* General Toggles */}
          <div className="flex flex-wrap gap-6 border-b border-white/10 pb-6">
            <label className="flex items-center gap-3 cursor-pointer group">
              <div className={`w-12 h-6 rounded-full transition-colors relative flex items-center ${config.enabled ? 'bg-firefox-orange' : 'bg-zinc-700'}`}>
                <div className={`w-4 h-4 rounded-full bg-white absolute transition-all ${config.enabled ? 'left-7' : 'left-1'}`} />
              </div>
              <span className="text-sm font-bold text-white group-hover:text-firefox-orange transition-colors">Show Live Bar</span>
              <input 
                type="checkbox" 
                className="hidden" 
                checked={config.enabled}
                onChange={(e) => setConfig(prev => ({ ...prev, enabled: e.target.checked }))}
              />
            </label>

            <label className="flex items-center gap-3 cursor-pointer group">
              <div className={`w-12 h-6 rounded-full transition-colors relative flex items-center ${config.autoScroll ? 'bg-firefox-orange' : 'bg-zinc-700'}`}>
                <div className={`w-4 h-4 rounded-full bg-white absolute transition-all ${config.autoScroll ? 'left-7' : 'left-1'}`} />
              </div>
              <span className="flex items-center gap-2 text-sm font-bold text-white group-hover:text-firefox-orange transition-colors">
                <RefreshCw size={14} /> Auto Scroll
              </span>
              <input 
                type="checkbox" 
                className="hidden" 
                checked={config.autoScroll}
                onChange={(e) => setConfig(prev => ({ ...prev, autoScroll: e.target.checked }))}
              />
            </label>
          </div>

          {/* Messages */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <AlertCircle className="text-firefox-orange" size={18} />
                Announcements
              </h3>
              <button
                type="button"
                onClick={addMessage}
                className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg text-xs font-bold uppercase tracking-wider transition-colors"
              >
                <Plus size={14} /> Add Message
              </button>
            </div>

            {config.messages.length === 0 ? (
              <div className="text-center py-8 bg-black/30 rounded-xl border border-white/5 border-dashed">
                <p className="text-zinc-500 text-sm">No messages configured. Add one to display it on the live bar.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {config.messages.map((msg, idx) => (
                  <div key={msg.id} className="p-4 bg-black/50 border border-white/10 rounded-xl flex flex-col md:flex-row gap-4 items-start md:items-center">
                    <div className="flex-1 w-full space-y-3">
                      <input 
                        type="text" 
                        value={msg.text}
                        onChange={(e) => updateMessage(msg.id, 'text', e.target.value)}
                        placeholder="Enter announcement text..."
                        className="w-full bg-transparent border-b border-white/10 focus:border-firefox-orange outline-none px-2 py-1 text-white text-sm transition-colors"
                        required
                      />
                      <div className="flex flex-wrap items-center gap-4 px-2">
                        <label className="flex items-center gap-2 cursor-pointer text-xs text-zinc-400 hover:text-white transition-colors">
                          <input 
                            type="checkbox" 
                            checked={msg.isImportant}
                            onChange={(e) => updateMessage(msg.id, 'isImportant', e.target.checked)}
                            className="rounded bg-zinc-800 border-zinc-700 text-firefox-orange focus:ring-firefox-orange"
                          />
                          Important Flag
                        </label>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-zinc-500">Expiry (Optional):</span>
                          <input 
                            type="datetime-local" 
                            value={msg.expiryDate || ''}
                            onChange={(e) => updateMessage(msg.id, 'expiryDate', e.target.value)}
                            className="bg-zinc-900 border border-white/10 rounded-md px-2 py-1 text-xs text-zinc-300 focus:border-firefox-orange outline-none"
                          />
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeMessage(msg.id)}
                      className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors shrink-0 self-end md:self-center"
                      title="Remove Message"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end pt-4 border-t border-white/10">
            <button
              type="submit"
              disabled={saving}
              className="px-8 py-3 bg-firefox-orange hover:bg-orange-600 text-white rounded-xl font-bold transition-all disabled:opacity-50 flex items-center gap-2 text-sm uppercase tracking-wider shadow-lg shadow-firefox-orange/20"
            >
              {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
              {saving ? 'Saving...' : 'Save Configuration'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
