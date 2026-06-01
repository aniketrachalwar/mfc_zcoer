import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Save, Plus, Trash2, ArrowUp, ArrowDown, Globe, Share2 } from 'lucide-react';

interface NavLink {
  id: string;
  name: string;
  href: string;
  type: 'link' | 'anchor';
  icon?: string;
  enabled: boolean;
}

interface SocialLink {
  id: string;
  platform: string;
  url: string;
  enabled: boolean;
}

export default function NavigationManager() {
  const [links, setLinks] = useState<NavLink[]>([]);
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const defaultLinks: NavLink[] = [
    { id: '1', name: 'Home', href: '/', type: 'link', icon: 'Home', enabled: true },
    { id: '2', name: 'About', href: '/about', type: 'link', icon: 'Info', enabled: true },
    { id: '3', name: 'Blogs', href: '/blogs', type: 'link', icon: 'BookOpen', enabled: true },
    { id: '4', name: 'Leaderboard', href: '/leaderboard', type: 'link', icon: 'Trophy', enabled: true },
    { id: '5', name: 'Events', href: '/events', type: 'link', icon: 'Calendar', enabled: true },
    { id: '6', name: 'Projects', href: '/projects', type: 'link', icon: 'Rocket', enabled: true },
    { id: '7', name: 'Team', href: '/team', type: 'link', icon: 'Users', enabled: true },
    { id: '8', name: 'Community', href: '/community', type: 'link', icon: 'Zap', enabled: true },
  ];

  const defaultSocials: SocialLink[] = [
    { id: 's1', platform: 'Email', url: 'mailto:mfc@zcoer.edu.in', enabled: true },
    { id: 's2', platform: 'Instagram', url: 'https://www.instagram.com/mfc.zcoer/', enabled: true },
    { id: 's3', platform: 'Youtube', url: '#', enabled: true },
    { id: 's4', platform: 'Github', url: 'https://github.com/mfczcoer/', enabled: true },
    { id: 's5', platform: 'Linkedin', url: '#', enabled: true },
    { id: 's6', platform: 'Twitter', url: '#', enabled: true },
  ];

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const docSnap = await getDoc(doc(db, 'config', 'navigation'));
      if (docSnap.exists()) {
        const data = docSnap.data();
        setLinks(data.links || defaultLinks);
        setSocialLinks(data.socialLinks || defaultSocials);
      } else {
        setLinks(defaultLinks);
        setSocialLinks(defaultSocials);
      }
    } catch (err) {
      console.error('Error fetching navigation config:', err);
      setLinks(defaultLinks);
      setSocialLinks(defaultSocials);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await setDoc(doc(db, 'config', 'navigation'), { links, socialLinks });
    } catch (err) {
      console.error('Error saving navigation config:', err);
    } finally {
      setSaving(false);
    }
  };

  const addLink = () => {
    const newLink: NavLink = {
      id: Date.now().toString(),
      name: 'New Link',
      href: '/new-link',
      type: 'link',
      icon: 'Globe',
      enabled: true
    };
    setLinks([...links, newLink]);
  };

  const updateLink = (id: string, field: keyof NavLink, value: any) => {
    setLinks(links.map(link => link.id === id ? { ...link, [field]: value } : link));
  };

  const removeLink = (id: string) => {
    setLinks(links.filter(link => link.id !== id));
  };

  const moveLink = (index: number, direction: 'up' | 'down') => {
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === links.length - 1)) return;
    
    const newLinks = [...links];
    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    [newLinks[index], newLinks[swapIndex]] = [newLinks[swapIndex], newLinks[index]];
    setLinks(newLinks);
  };

  // Social Links Handlers
  const addSocial = () => {
    setSocialLinks([...socialLinks, { id: Date.now().toString(), platform: 'Instagram', url: 'https://', enabled: true }]);
  };

  const updateSocial = (id: string, field: keyof SocialLink, value: any) => {
    setSocialLinks(socialLinks.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  const removeSocial = (id: string) => {
    setSocialLinks(socialLinks.filter(s => s.id !== id));
  };

  if (loading) return <div className="p-8 text-zinc-400">Loading configuration...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-zinc-900 border border-zinc-800 p-6 rounded-3xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-firefox-orange/20 flex items-center justify-center text-firefox-orange">
            <Globe size={24} />
          </div>
          <div>
            <h2 className="text-xl font-display font-black text-white tracking-wide uppercase">Site Navigation</h2>
            <p className="text-zinc-400 text-sm">Manage the links that appear in the website's main navigation bar and footer.</p>
          </div>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-3 bg-firefox-orange text-white rounded-full font-bold uppercase tracking-widest text-xs hover:scale-105 transition-transform disabled:opacity-50 shadow-[0_0_20px_rgba(255,106,0,0.3)]"
        >
          <Save size={16} />
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-black text-white uppercase tracking-widest">Main Menu Links</h3>
          <button
            onClick={addLink}
            className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-xl transition-colors text-xs font-bold uppercase tracking-widest border border-white/10"
          >
            <Plus size={14} /> Add Link
          </button>
        </div>

        <div className="space-y-4">
          {links.map((link, index) => (
            <motion.div 
              key={link.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-4 rounded-xl border flex flex-col md:flex-row items-start md:items-center gap-4 transition-all ${
                link.enabled ? 'bg-zinc-950 border-zinc-800' : 'bg-zinc-950/50 border-zinc-900 opacity-60'
              }`}
            >
              <div className="flex flex-col gap-1 shrink-0">
                <button 
                  onClick={() => moveLink(index, 'up')}
                  disabled={index === 0}
                  className="p-1 text-zinc-500 hover:text-white disabled:opacity-30 disabled:hover:text-zinc-500 transition-colors"
                >
                  <ArrowUp size={16} />
                </button>
                <button 
                  onClick={() => moveLink(index, 'down')}
                  disabled={index === links.length - 1}
                  className="p-1 text-zinc-500 hover:text-white disabled:opacity-30 disabled:hover:text-zinc-500 transition-colors"
                >
                  <ArrowDown size={16} />
                </button>
              </div>

              <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-4 w-full">
                <div className="md:col-span-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1 block">Icon</label>
                  <select
                    value={link.icon || 'Globe'}
                    onChange={(e) => updateLink(link.id, 'icon', e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2 py-2 text-white focus:outline-none focus:border-firefox-orange text-sm"
                  >
                    <option value="Globe">Globe</option>
                    <option value="Home">Home</option>
                    <option value="Info">Info</option>
                    <option value="BookOpen">Book</option>
                    <option value="Trophy">Trophy</option>
                    <option value="Calendar">Calendar</option>
                    <option value="Rocket">Rocket</option>
                    <option value="Users">Users</option>
                    <option value="Zap">Zap</option>
                    <option value="MessageSquare">Chat</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1 block">Name</label>
                  <input
                    type="text"
                    value={link.name}
                    onChange={(e) => updateLink(link.id, 'name', e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-firefox-orange text-sm font-bold"
                  />
                </div>
                <div className="md:col-span-4">
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1 block">URL Path</label>
                  <input
                    type="text"
                    value={link.href}
                    onChange={(e) => updateLink(link.id, 'href', e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-firefox-orange text-sm"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1 block">Type</label>
                  <select
                    value={link.type}
                    onChange={(e) => updateLink(link.id, 'type', e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-firefox-orange text-sm"
                  >
                    <option value="link">New Page</option>
                    <option value="anchor">Scroll Anchor</option>
                  </select>
                </div>
                <div className="md:col-span-2 flex items-center justify-between md:justify-end gap-4 h-full pt-5">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={link.enabled}
                      onChange={(e) => updateLink(link.id, 'enabled', e.target.checked)}
                      className="w-4 h-4 rounded border-zinc-700 text-firefox-orange focus:ring-firefox-orange focus:ring-offset-zinc-950 bg-zinc-900"
                    />
                    <span className="text-xs font-bold uppercase tracking-widest text-zinc-400">Enabled</span>
                  </label>
                  <button
                    onClick={() => removeLink(link.id)}
                    className="w-8 h-8 rounded-lg bg-red-500/10 text-red-400 flex items-center justify-center hover:bg-red-500/20 transition-colors"
                    title="Delete Link"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
          {links.length === 0 && (
            <div className="text-center py-8 text-zinc-500 text-sm font-bold uppercase tracking-widest">
              No navigation links added.
            </div>
          )}
        </div>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Share2 className="text-firefox-orange" size={20} />
            <h3 className="text-lg font-black text-white uppercase tracking-widest">Footer Social Links</h3>
          </div>
          <button
            onClick={addSocial}
            className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-xl transition-colors text-xs font-bold uppercase tracking-widest border border-white/10"
          >
            <Plus size={14} /> Add Social
          </button>
        </div>

        <div className="space-y-4">
          {socialLinks.map((social) => (
            <motion.div 
              key={social.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-4 rounded-xl border flex flex-col md:flex-row items-start md:items-center gap-4 transition-all ${
                social.enabled ? 'bg-zinc-950 border-zinc-800' : 'bg-zinc-950/50 border-zinc-900 opacity-60'
              }`}
            >
              <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-4 w-full">
                <div className="md:col-span-4">
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1 block">Platform Icon</label>
                  <select
                    value={social.platform}
                    onChange={(e) => updateSocial(social.id, 'platform', e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-firefox-orange text-sm font-bold"
                  >
                    <option value="Email">Email</option>
                    <option value="Instagram">Instagram</option>
                    <option value="Facebook">Facebook</option>
                    <option value="Twitter">Twitter / X</option>
                    <option value="Linkedin">Linkedin</option>
                    <option value="Youtube">Youtube</option>
                    <option value="WhatsApp">WhatsApp</option>
                    <option value="Telegram">Telegram</option>
                    <option value="Discord">Discord</option>
                    <option value="Github">Github</option>
                    <option value="Medium">Medium / Blog</option>
                    <option value="Spotify">Spotify / Podcast</option>
                    <option value="Globe">Website (Globe)</option>
                  </select>
                </div>
                <div className="md:col-span-6">
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1 block">External URL</label>
                  <input
                    type="text"
                    value={social.url}
                    onChange={(e) => updateSocial(social.id, 'url', e.target.value)}
                    placeholder="https://..."
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-firefox-orange text-sm"
                  />
                </div>
                <div className="md:col-span-2 flex items-center justify-between md:justify-end gap-4 h-full pt-5">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={social.enabled}
                      onChange={(e) => updateSocial(social.id, 'enabled', e.target.checked)}
                      className="w-4 h-4 rounded border-zinc-700 text-firefox-orange focus:ring-firefox-orange focus:ring-offset-zinc-950 bg-zinc-900"
                    />
                    <span className="text-xs font-bold uppercase tracking-widest text-zinc-400">Enabled</span>
                  </label>
                  <button
                    onClick={() => removeSocial(social.id)}
                    className="w-8 h-8 rounded-lg bg-red-500/10 text-red-400 flex items-center justify-center hover:bg-red-500/20 transition-colors"
                    title="Delete Social Link"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
