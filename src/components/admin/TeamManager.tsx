import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { UserPlus, Trash2, Search, Users as UsersIcon, CheckSquare, Edit } from 'lucide-react';
import { motion } from 'motion/react';
import TeamApplicationsList from './TeamApplicationsList';

const TeamManager = () => {
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'members' | 'applications'>('members');
  
  // New member state
  const [selectedUserId, setSelectedUserId] = useState('');
  const [teamRole, setTeamRole] = useState('');
  const [cohort, setCohort] = useState('25-26');
  const [category, setCategory] = useState('Technical');

  const [filterCohort, setFilterCohort] = useState('25-26');

  // Edit member state
  const [editingMember, setEditingMember] = useState<any>(null);
  const [editRole, setEditRole] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editCohort, setEditCohort] = useState('');

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
    if (!selectedUserId || !teamRole || !cohort || !category) return;
    
    try {
      const docId = `${selectedUserId}_${cohort}`;
      await setDoc(doc(db, 'team', docId), {
        userId: selectedUserId,
        role: teamRole,
        category: category,
        cohort: cohort,
        addedAt: new Date().toISOString()
      });

      const isLeadership = category === 'Core Leadership' || category === 'Department Leads';
      await setDoc(doc(db, 'users', selectedUserId), {
        isLeadership: isLeadership
      }, { merge: true });

      setShowAddForm(false);
      setSelectedUserId('');
      setTeamRole('');
      setCategory('Technical');
      fetchData();
    } catch (err) {
      console.error("Error adding team member", err);
      alert("Failed to add team member.");
    }
  };

  const handleRemoveMember = async (id: string, userId: string) => {
    if (!window.confirm("Are you sure you want to remove this member from the team page?")) return;
    try {
      await deleteDoc(doc(db, 'team', id));
      await setDoc(doc(db, 'users', userId), {
        isLeadership: false
      }, { merge: true });
      setTeamMembers(teamMembers.filter(m => m.id !== id));
    } catch (err) {
      console.error("Error removing", err);
    }
  };

  const openEditModal = (member: any) => {
    setEditingMember(member);
    setEditRole(member.role);
    setEditCategory(member.category);
    setEditCohort(member.cohort || '25-26');
  };

  const handleUpdateMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMember) return;
    
    try {
      const oldDocId = editingMember.id;
      const newDocId = `${editingMember.userId}_${editCohort}`;
      
      const newMemberData = {
        userId: editingMember.userId,
        role: editRole,
        category: editCategory,
        cohort: editCohort,
        updatedAt: new Date().toISOString()
      };

      if (oldDocId !== newDocId) {
        // Changed cohort -> delete old, create new
        await deleteDoc(doc(db, 'team', oldDocId));
        await setDoc(doc(db, 'team', newDocId), newMemberData);
      } else {
        // Just update existing
        await setDoc(doc(db, 'team', oldDocId), newMemberData, { merge: true });
      }

      // Update user leadership status
      const isLeadership = editCategory === 'Core Leadership';
      await setDoc(doc(db, 'users', editingMember.userId), {
        isLeadership: isLeadership
      }, { merge: true });

      setEditingMember(null);
      fetchData();
    } catch (err) {
      console.error("Error updating member", err);
      alert("Failed to update team member.");
    }
  };

  const getUserData = (userId: string) => {
    return allUsers.find(u => u.id === userId) || {};
  };

  const availableUsers = allUsers.filter(u => 
    !teamMembers.some(tm => tm.userId === u.id && tm.cohort === cohort) &&
    (u.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
     u.username?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-8 relative">
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

      <div className="flex bg-white/5 p-1 rounded-2xl w-fit">
        <button
          onClick={() => setActiveTab('members')}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-display font-black text-[10px] uppercase tracking-widest transition-all ${
            activeTab === 'members' ? 'bg-firefox-orange text-white shadow-lg' : 'text-zinc-400 hover:text-white'
          }`}
        >
          <UsersIcon size={14} /> Current Team
        </button>
        <button
          onClick={() => setActiveTab('applications')}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-display font-black text-[10px] uppercase tracking-widest transition-all ${
            activeTab === 'applications' ? 'bg-firefox-orange text-white shadow-lg' : 'text-zinc-400 hover:text-white'
          }`}
        >
          <CheckSquare size={14} /> Applications
        </button>
      </div>

      {activeTab === 'applications' ? (
        <TeamApplicationsList />
      ) : (
        <>
          {/* Add Team Member Form */}

      {showAddForm && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-zinc-900 border border-white/10 rounded-3xl p-6"
        >
          <form onSubmit={handleAddMember} className="grid md:grid-cols-5 gap-4 items-end">
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
              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2 block">Category</label>
              <select 
                required
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-firefox-orange transition-colors text-sm"
              >
                <option value="Core Leadership">Core Leadership</option>
                <option value="Technical">Technical</option>
                <option value="Events & Community">Events & Community</option>
                <option value="Marketing & Media">Marketing & Media</option>
                <option value="Content & Newsletter">Content & Newsletter</option>
                <option value="Design">Design</option>
                <option value="Growth & Partnerships">Growth & Partnerships</option>
                <option value="Operations">Operations</option>
              </select>
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
        <div>
          <div className="flex items-center gap-4 mb-6">
            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Filter Year:</label>
            <select
              value={filterCohort}
              onChange={(e) => setFilterCohort(e.target.value)}
              className="bg-zinc-900 border border-white/10 rounded-xl px-4 py-2 text-white text-sm focus:outline-none focus:border-firefox-orange"
            >
              <option value="All">All Years</option>
              <option value="25-26">25-26</option>
              <option value="26-27">26-27</option>
              <option value="27-28">27-28</option>
            </select>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {teamMembers.filter(m => filterCohort === 'All' || m.cohort === filterCohort).map((member) => {
              const user = getUserData(member.userId);
            return (
              <motion.div 
                key={member.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-zinc-900 border border-white/10 hover:border-white/20 rounded-3xl p-5 transition-all group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <img loading="lazy" 
                      src={user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.username)}&background=FF5C00&color=fff&bold=true`} 
                      alt={user.fullName}
                      className="w-12 h-12 rounded-full bg-zinc-800 object-cover border border-white/10 shrink-0"
                    />
                    <div className="truncate">
                      <p className="text-sm font-bold text-white truncate">{user.fullName || 'Unknown'}</p>
                      <p className="text-xs text-zinc-500 truncate">@{user.username || 'unknown'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button 
                      onClick={() => openEditModal(member)}
                      className="p-2 text-zinc-500 hover:text-firefox-orange hover:bg-firefox-orange/10 rounded-lg transition-colors"
                    >
                      <Edit size={16} />
                    </button>
                    <button 
                      onClick={() => handleRemoveMember(member.id, member.userId)}
                      className="p-2 text-zinc-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                
                <div className="flex items-center justify-between pt-4 border-t border-white/5">
                  <div className="flex flex-col gap-1">
                    <span className="px-3 py-1 bg-firefox-orange/20 text-firefox-orange rounded-full text-[10px] font-black uppercase tracking-widest border border-firefox-orange/20 w-max">
                      {member.role}
                    </span>
                    <span className="text-[10px] text-zinc-500 px-1 font-bold">{member.category || 'Legacy'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-zinc-500 text-xs font-mono self-end">
                    Cohort {member.cohort}
                  </div>
                </div>
              </motion.div>
            );
          })}
          </div>
          {teamMembers.filter(m => filterCohort === 'All' || m.cohort === filterCohort).length === 0 && (
            <div className="col-span-full p-8 text-center text-zinc-500 text-sm bg-white/5 border border-white/10 rounded-3xl mt-4">
              No team members found for this year.
            </div>
          )}
        </div>
      )}
      </>
      )}

      {/* Edit Modal */}
      {editingMember && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-zinc-900 border border-white/10 rounded-3xl p-6 w-full max-w-md shadow-2xl"
          >
            <h3 className="text-xl font-display font-black uppercase text-white mb-6">Edit Team Member</h3>
            <form onSubmit={handleUpdateMember} className="space-y-4">
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2 block">Team Role</label>
                <input 
                  type="text" 
                  required
                  value={editRole}
                  onChange={(e) => setEditRole(e.target.value)}
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-firefox-orange transition-colors text-sm"
                />
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2 block">Category</label>
                <select 
                  required
                  value={editCategory}
                  onChange={(e) => setEditCategory(e.target.value)}
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-firefox-orange transition-colors text-sm"
                >
                  <option value="Core Leadership">Core Leadership</option>
                  <option value="Technical">Technical</option>
                  <option value="Events & Community">Events & Community</option>
                  <option value="Marketing & Media">Marketing & Media</option>
                  <option value="Content & Newsletter">Content & Newsletter</option>
                  <option value="Design">Design</option>
                  <option value="Growth & Partnerships">Growth & Partnerships</option>
                  <option value="Operations">Operations</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2 block">Cohort</label>
                <select 
                  required
                  value={editCohort}
                  onChange={(e) => setEditCohort(e.target.value)}
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-firefox-orange transition-colors text-sm"
                >
                  <option value="25-26">25-26</option>
                  <option value="26-27">26-27</option>
                  <option value="27-28">27-28</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-6">
                <button type="button" onClick={() => setEditingMember(null)} className="px-6 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl font-display font-black text-[10px] uppercase tracking-widest transition-colors">
                  Cancel
                </button>
                <button type="submit" className="px-6 py-3 bg-firefox-orange hover:bg-orange-600 text-white rounded-xl font-display font-black text-[10px] uppercase tracking-widest transition-colors shadow-[0_0_15px_rgba(255,92,0,0.3)]">
                  Save Changes
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

    </div>
  );
};

export default TeamManager;
