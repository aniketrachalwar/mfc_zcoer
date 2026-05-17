import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { UserPlus, Trash2, Search } from 'lucide-react';
import { motion } from 'motion/react';

const TeamManager = () => {
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // New member state
  const [selectedUserId, setSelectedUserId] = useState('');
  const [teamRole, setTeamRole] = useState('');
  const [cohort, setCohort] = useState('25-26');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [usersSnap, teamSnap] = await Promise.all([
        getDocs(collection(db, 'users')),
        getDocs(collection(db, 'team'))
      ]);
      
      const usersList = usersSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      const teamList = teamSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      
      setAllUsers(usersList);
      setTeamMembers(teamList);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserId || !teamRole || !cohort) return;
    
    try {
      // Use userId as the document ID for team collection
      await setDoc(doc(db, 'team', selectedUserId), {
        userId: selectedUserId,
        role: teamRole,
        cohort: cohort,
        addedAt: new Date().toISOString()
      });
      setShowAddForm(false);
      setSelectedUserId('');
      setTeamRole('');
      fetchData();
    } catch (err) {
      console.error("Error adding team member", err);
      alert("Failed to add team member.");
    }
  };

  const handleRemoveMember = async (id: string) => {
    if (!window.confirm("Are you sure you want to remove this member from the team page?")) return;
    try {
      await deleteDoc(doc(db, 'team', id));
      setTeamMembers(teamMembers.filter(m => m.id !== id));
    } catch (err) {
      console.error("Error removing", err);
    }
  };

  const getUserData = (userId: string) => {
    return allUsers.find(u => u.id === userId) || {};
  };

  const availableUsers = allUsers.filter(u => 
    !teamMembers.some(tm => tm.userId === u.id) &&
    (u.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
     u.username?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-display font-black uppercase text-white mb-2">Team Management</h2>
          <p className="text-zinc-400">Manage who appears on the public "Meet The Team" page.</p>
        </div>
        <button 
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2 px-6 py-3 bg-firefox-orange text-white rounded-full font-display font-black text-[10px] uppercase tracking-widest hover:bg-orange-600 transition-colors"
        >
          <UserPlus size={16} />
          {showAddForm ? 'Cancel' : 'Add Team Member'}
        </button>
      </div>

      {showAddForm && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-zinc-900 border border-white/10 rounded-3xl p-6"
        >
          <form onSubmit={handleAddMember} className="grid md:grid-cols-4 gap-4 items-end">
            <div className="col-span-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2 block">Search Community</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
                <input 
                  type="text" 
                  placeholder="Search name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-black/50 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white focus:outline-none focus:border-firefox-orange transition-colors text-sm"
                />
              </div>
            </div>
            
            <div className="col-span-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2 block">Select User</label>
              <select 
                required
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-firefox-orange transition-colors text-sm"
              >
                <option value="">-- Choose User --</option>
                {availableUsers.slice(0, 20).map(u => (
                  <option key={u.id} value={u.id}>{u.fullName || u.username || 'Unknown'}</option>
                ))}
              </select>
            </div>

            <div className="col-span-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2 block">Team Role</label>
              <input 
                type="text" 
                required
                placeholder="e.g. Lead Developer"
                value={teamRole}
                onChange={(e) => setTeamRole(e.target.value)}
                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-firefox-orange transition-colors text-sm"
              />
            </div>

            <div className="col-span-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2 block">Cohort</label>
              <div className="flex gap-2">
                <select 
                  required
                  value={cohort}
                  onChange={(e) => setCohort(e.target.value)}
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-firefox-orange transition-colors text-sm"
                >
                  <option value="25-26">25-26</option>
                  <option value="26-27">26-27</option>
                  <option value="27-28">27-28</option>
                </select>
                <button type="submit" className="px-6 py-3 bg-firefox-orange text-white rounded-xl font-display font-black text-[10px] uppercase tracking-widest hover:bg-orange-600 transition-colors">
                  Add
                </button>
              </div>
            </div>
          </form>
        </motion.div>
      )}

      {loading ? (
        <div className="text-center py-12">
          <div className="w-8 h-8 border-2 border-firefox-orange border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      ) : (
        <div className="bg-zinc-900 border border-white/10 rounded-3xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 bg-black/20">
                  <th className="p-4 text-[10px] font-black uppercase tracking-widest text-zinc-500">Member</th>
                  <th className="p-4 text-[10px] font-black uppercase tracking-widest text-zinc-500">Team Role</th>
                  <th className="p-4 text-[10px] font-black uppercase tracking-widest text-zinc-500">Cohort</th>
                  <th className="p-4 text-[10px] font-black uppercase tracking-widest text-zinc-500 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {teamMembers.map((member) => {
                  const user = getUserData(member.userId);
                  return (
                    <tr key={member.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <img 
                            src={user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`} 
                            alt={user.fullName}
                            className="w-10 h-10 rounded-full bg-zinc-800 object-cover border border-white/10"
                          />
                          <div>
                            <p className="text-sm font-bold text-white">{user.fullName || 'Unknown'}</p>
                            <p className="text-xs text-zinc-500">@{user.username || 'unknown'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="px-3 py-1 bg-firefox-orange/20 text-firefox-orange rounded-full text-xs font-bold border border-firefox-orange/20">
                          {member.role}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="text-zinc-300 font-mono text-sm">{member.cohort}</span>
                      </td>
                      <td className="p-4 text-right">
                        <button 
                          onClick={() => handleRemoveMember(member.id)}
                          className="p-2 text-zinc-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  )
                })}
                {teamMembers.length === 0 && (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-zinc-500 text-sm">
                      No team members added yet. Add someone from the community!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamManager;
