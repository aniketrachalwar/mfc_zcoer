import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { ShieldAlert, Check, X, UserCog, Save, Shield } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const availableTabs = [
  'Dashboard',
  'Members',
  'Applications',
  'Team',
  'Contributions',
  'Events',
  'Projects',
  'Blogs',
  'Merchandise',
  'Notifications',
  'About Page',
  'Members Dashboard',
  'Workshop Proposals',
  'Coupons',
  'Settings'
];

export default function AdminAccessManager() {
  const [leaders, setLeaders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Local state for permissions being edited
  const [editedPerms, setEditedPerms] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  const fetchLeaders = async () => {
    setLoading(true);
    try {
      // Fetch users who have admin access to the portal
      const q = query(collection(db, 'users'), where('role', 'in', ['admin', 'president', 'core_team']));
      const snap = await getDocs(q);
      const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setLeaders(data);
    } catch (err) {
      console.error("Failed to fetch leaders:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaders();
  }, []);

  const openModal = (user: any) => {
    setSelectedUser(user);
    // If they have an existing array, use it.
    if (Array.isArray(user.adminPermissions)) {
      setEditedPerms(user.adminPermissions);
    } else {
      // Default legacy permissions for core_team / president if they don't have an array yet
      if (user.role === 'admin') {
        setEditedPerms([...availableTabs, 'Access Control']);
      } else {
        const legacyDefault = availableTabs.filter(t => !['Members', 'Team', 'Applications', 'Settings', 'About Page', 'Coupons'].includes(t));
        setEditedPerms(legacyDefault);
      }
    }
    setIsModalOpen(true);
  };

  const toggleTab = (tabName: string) => {
    setEditedPerms(prev => 
      prev.includes(tabName) 
        ? prev.filter(t => t !== tabName)
        : [...prev, tabName]
    );
  };

  const handleSave = async () => {
    if (!selectedUser) return;
    setSaving(true);
    try {
      await updateDoc(doc(db, 'users', selectedUser.id), {
        adminPermissions: editedPerms
      });
      
      // Update local state
      setLeaders(prev => prev.map(l => l.id === selectedUser.id ? { ...l, adminPermissions: editedPerms } : l));
      setIsModalOpen(false);
    } catch (err) {
      console.error("Error saving permissions:", err);
      alert("Failed to save permissions.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-display font-black uppercase text-white mb-2">Access Control</h2>
        <p className="text-zinc-400">Manage which admin portal features are available to individual Core Team members and Presidents.</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-2 border-firefox-orange border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="bg-zinc-900 border border-white/10 rounded-3xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/5 border-b border-white/10 text-[10px] font-black uppercase tracking-widest text-zinc-500">
                  <th className="p-4">Member</th>
                  <th className="p-4">Role</th>
                  <th className="p-4 text-center">Configured</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {leaders.map(leader => (
                  <tr key={leader.id} className="border-b border-white/5 hover:bg-white/5 transition-colors group">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img 
                          src={leader.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${leader.username}`} 
                          alt="Avatar" 
                          className="w-10 h-10 rounded-full object-cover bg-black/50"
                        />
                        <div>
                          <p className="font-bold text-white">{leader.fullName}</p>
                          <p className="text-[10px] text-zinc-500 font-mono">@{leader.username}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        leader.role === 'admin' ? 'bg-red-500/10 text-red-500 border border-red-500/20' :
                        leader.role === 'president' ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20' :
                        'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                      }`}>
                        {leader.role === 'admin' && <ShieldAlert size={10} />}
                        {leader.role === 'president' && <Shield size={10} />}
                        {leader.role === 'core_team' && <UserCog size={10} />}
                        {leader.role.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      {Array.isArray(leader.adminPermissions) ? (
                        <span className="text-green-400 flex items-center justify-center gap-1 text-[10px] font-bold uppercase">
                          <Check size={12} /> Custom
                        </span>
                      ) : (
                        <span className="text-zinc-500 text-[10px] font-bold uppercase">Default</span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      {leader.role !== 'admin' ? (
                        <button 
                          onClick={() => openModal(leader)}
                          className="px-4 py-2 bg-white/5 text-white rounded-xl font-display font-black text-[10px] uppercase tracking-widest hover:bg-white/10 transition-colors"
                        >
                          Manage Access
                        </button>
                      ) : (
                        <span className="text-zinc-600 text-[10px] font-black uppercase tracking-widest italic pr-4">Super Admin</span>
                      )}
                    </td>
                  </tr>
                ))}
                {leaders.length === 0 && (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-zinc-500">No leadership members found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Management Modal */}
      <AnimatePresence>
        {isModalOpen && selectedUser && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="relative bg-zinc-950 border border-white/10 rounded-3xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[85vh]"
            >
              <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/5">
                <div>
                  <h3 className="text-lg font-black uppercase tracking-widest text-white">Manage Permissions</h3>
                  <p className="text-zinc-400 text-xs mt-1">Configuring access for <span className="text-firefox-orange font-bold">{selectedUser.fullName}</span></p>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="text-zinc-500 hover:text-white transition-colors">
                  <X size={24} />
                </button>
              </div>

              <div className="p-6 overflow-y-auto">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {availableTabs.map(tab => {
                    const hasAccess = editedPerms.includes(tab);
                    return (
                      <button
                        key={tab}
                        onClick={() => toggleTab(tab)}
                        className={`flex items-center justify-between p-4 rounded-xl border transition-all text-left ${
                          hasAccess 
                            ? 'bg-firefox-orange/10 border-firefox-orange/30' 
                            : 'bg-white/5 border-white/5 hover:bg-white/10'
                        }`}
                      >
                        <span className={`font-bold text-sm ${hasAccess ? 'text-firefox-orange' : 'text-zinc-400'}`}>
                          {tab}
                        </span>
                        <div className={`w-5 h-5 rounded flex items-center justify-center border ${
                          hasAccess ? 'bg-firefox-orange border-firefox-orange text-white' : 'border-zinc-600 text-transparent'
                        }`}>
                          <Check size={12} strokeWidth={3} />
                        </div>
                      </button>
                    );
                  })}
                </div>
                <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                  <p className="text-blue-400 text-xs leading-relaxed">
                    <strong>Note:</strong> The "Access Control" tab is strictly reserved for Super Admins and cannot be granted to Core Team members. Changes made here will take effect immediately upon their next navigation.
                  </p>
                </div>
              </div>

              <div className="p-6 border-t border-white/5 bg-black/20 flex justify-end gap-3">
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-3 bg-white/5 text-zinc-400 rounded-xl font-display font-black text-[10px] uppercase tracking-widest hover:bg-white/10 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-2 px-6 py-3 bg-firefox-orange text-white rounded-xl font-display font-black text-[10px] uppercase tracking-widest hover:bg-orange-600 transition-colors disabled:opacity-50"
                >
                  {saving ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <><Save size={16} /> Save Permissions</>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
