import React, { useEffect, useState } from 'react';
import { collection, getDocs, updateDoc, doc, deleteDoc, query, limit, startAfter } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Search, Edit2, Trash2, Shield, Check, X } from 'lucide-react';
import { motion } from 'motion/react';

const MembersManager = () => {
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTab, setFilterTab] = useState('All');

  const [lastVisible, setLastVisible] = useState<any>(null);
  const [hasMore, setHasMore] = useState(true);

  const fetchMembers = async (isLoadMore = false) => {
    if (!isLoadMore) setLoading(true);
    try {
      let q = query(collection(db, 'users'), limit(20));
      if (isLoadMore && lastVisible) {
        q = query(collection(db, 'users'), startAfter(lastVisible), limit(20));
      }
      const usersSnap = await getDocs(q);
      
      const lastVisibleDoc = usersSnap.docs[usersSnap.docs.length - 1];
      setLastVisible(lastVisibleDoc);
      
      if (usersSnap.docs.length < 20) {
        setHasMore(false);
      }
      
      const usersList = usersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      if (isLoadMore) {
        setMembers(prev => [...prev, ...usersList]);
      } else {
        setMembers(usersList);
      }
    } catch (error) {
      console.error("Error fetching members:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      await updateDoc(doc(db, 'users', userId), { role: newRole });
      setMembers(members.map(m => m.id === userId ? { ...m, role: newRole } : m));
    } catch (error) {
      console.error("Error updating role:", error);
    }
  };

  const handleStatusChange = async (userId: string, newStatus: string) => {
    try {
      await updateDoc(doc(db, 'users', userId), { membershipStatus: newStatus });
      setMembers(members.map(m => m.id === userId ? { ...m, membershipStatus: newStatus } : m));
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const handleFoundingChange = async (userId: string, isFounding: boolean) => {
    try {
      await updateDoc(doc(db, 'users', userId), { isFoundingMember: isFounding });
      setMembers(members.map(m => m.id === userId ? { ...m, isFoundingMember: isFounding } : m));
    } catch (error) {
      console.error("Error updating founding member status:", error);
    }
  };

  const handlePointsChange = async (userId: string, currentPoints: number) => {
    const newPoints = window.prompt("Enter new points:", currentPoints.toString());
    if (newPoints !== null && !isNaN(Number(newPoints))) {
      try {
        const pointsNum = Number(newPoints);
        await updateDoc(doc(db, 'users', userId), { points: pointsNum });
        setMembers(members.map(m => m.id === userId ? { ...m, points: pointsNum } : m));
      } catch (error) {
        console.error("Error updating points:", error);
      }
    }
  };

  const handleDeleteMember = async (userId: string) => {
    if (window.confirm("Are you sure you want to remove this member? This action cannot be undone.")) {
      try {
        await deleteDoc(doc(db, 'users', userId));
        setMembers(members.filter(m => m.id !== userId));
      } catch (error) {
        console.error("Error deleting member:", error);
      }
    }
  };

  const handleEditProfile = async (userId: string, currentName: string) => {
    const newName = window.prompt("Enter new full name for this member:", currentName);
    if (newName && newName !== currentName) {
      try {
        await updateDoc(doc(db, 'users', userId), { fullName: newName });
        setMembers(members.map(m => m.id === userId ? { ...m, fullName: newName } : m));
      } catch (error) {
        console.error("Error updating profile:", error);
        alert("Failed to update profile.");
      }
    }
  };

  const [expandedId, setExpandedId] = useState<string | null>(null);

  const handleTierChange = async (userId: string, newTier: string) => {
    try {
      await updateDoc(doc(db, 'users', userId), { membershipTier: newTier });
      setMembers(members.map(m => m.id === userId ? { ...m, membershipTier: newTier } : m));
    } catch (error) {
      console.error("Error updating tier:", error);
    }
  };

  const filteredMembers = members.filter(m => {
    const matchesSearch = (m.fullName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (m.email?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (m.username?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    
    if (filterTab === 'All') return matchesSearch;
    const status = m.membershipStatus || 'public';
    return matchesSearch && status.toLowerCase() === filterTab.toLowerCase();
  });

  const tabs = ['All', 'Pending', 'Active', 'Suspended', 'Alumni'];

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-display font-black uppercase text-white mb-2">
            Member <span className="text-firefox-orange">Management</span>
          </h1>
          <p className="text-zinc-400 text-xs sm:text-sm">Manage users, roles, and status.</p>
        </div>
        
        <div className="relative w-full md:w-64 shrink-0">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input 
            type="text" 
            placeholder="Search members..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-firefox-orange transition-colors"
          />
        </div>
      </div>

      {/* Mobile-friendly Tab Filters */}
      <div className="flex overflow-x-auto gap-2 pb-4 mb-2 snap-x hide-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => setFilterTab(tab)}
            className={`snap-start shrink-0 px-4 py-2 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-widest transition-colors ${
              filterTab === tab ? 'bg-white text-black' : 'bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="p-8 text-center text-zinc-500">
            <div className="inline-block w-8 h-8 border-4 border-firefox-orange border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filteredMembers.length === 0 ? (
          <div className="p-8 text-center bg-white/5 border border-white/10 rounded-2xl text-zinc-500">
            No members found.
          </div>
        ) : (
          filteredMembers.map((member) => (
            <motion.div 
              key={member.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`bg-zinc-900 border rounded-2xl overflow-hidden transition-all ${
                expandedId === member.id ? 'border-firefox-orange/50 shadow-[0_0_20px_rgba(255,106,0,0.1)]' : 'border-white/10 hover:border-white/20'
              }`}
            >
              {/* Card Header (Always Visible) */}
              <div 
                className="p-3 sm:p-4 cursor-pointer flex items-center justify-between gap-3"
                onClick={() => setExpandedId(expandedId === member.id ? null : member.id)}
              >
                <div className="flex items-center gap-3 flex-1 overflow-hidden">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-zinc-800 overflow-hidden border border-white/10 shrink-0">
                    {member.photoURL ? (
                      <img loading="lazy" src={member.photoURL} alt={member.fullName} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-zinc-500 font-bold uppercase text-xs">
                        {member.fullName?.charAt(0) || '?'}
                      </div>
                    )}
                  </div>
                  <div className="truncate">
                    <div className="flex items-center gap-2 mb-0.5">
                      <h3 className="font-bold text-white truncate text-sm">{member.fullName || 'Unknown'}</h3>
                      {member.isFoundingMember && (
                        <span className="px-2 py-0.5 bg-yellow-500/10 text-yellow-500 text-[9px] font-black uppercase tracking-widest rounded-full border border-yellow-500/20 shrink-0">
                          Founding
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] sm:text-xs text-zinc-500 truncate">{member.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <div className={`flex items-center gap-1 px-2 py-1 rounded text-[9px] font-bold uppercase tracking-widest ${
                    member.membershipStatus === 'active' ? 'text-green-400 bg-green-500/10' : 
                    member.membershipStatus === 'pending' ? 'text-yellow-400 bg-yellow-500/10' : 
                    'text-zinc-400 bg-zinc-500/10'
                  }`}>
                    {member.membershipStatus || 'public'}
                  </div>
                  <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center transition-transform ${expandedId === member.id ? 'rotate-180 bg-white/10' : 'bg-white/5'}`}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-zinc-400">
                      <path d="M6 9l6 6 6-6"/>
                    </svg>
                  </div>
                </div>
              </div>

              {/* Card Body (Expanded Content) */}
              {expandedId === member.id && (
                <div className="px-3 pb-3 sm:px-4 sm:pb-4 border-t border-white/5 pt-3">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-4">
                    {/* Role */}
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-black uppercase tracking-widest text-zinc-500">Role</label>
                      <select 
                        value={member.role || 'member'}
                        onChange={(e) => handleRoleChange(member.id, e.target.value)}
                        className="w-full bg-black/50 border border-white/10 rounded-lg px-2 sm:px-3 py-2 text-xs text-white focus:outline-none focus:border-firefox-orange"
                      >
                        <option value="member">Member</option>
                        <option value="volunteer">Volunteer</option>
                        <option value="core_team">Core Team</option>
                        <option value="president">President</option>
                        <option value="admin">Admin</option>
                      </select>
                    </div>

                    {/* Status */}
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-black uppercase tracking-widest text-zinc-500">Status</label>
                      <select 
                        value={member.membershipStatus || 'public'}
                        onChange={(e) => handleStatusChange(member.id, e.target.value)}
                        className="w-full bg-black/50 border border-white/10 rounded-lg px-2 sm:px-3 py-2 text-xs text-white focus:outline-none focus:border-firefox-orange"
                      >
                        <option value="public">Public</option>
                        <option value="pending">Pending</option>
                        <option value="active">Active</option>
                        <option value="suspended">Suspended</option>
                        <option value="alumni">Alumni</option>
                      </select>
                    </div>

                    {/* Tier */}
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-black uppercase tracking-widest text-zinc-500">Tier</label>
                      <select 
                        value={member.membershipTier || 'free'}
                        onChange={(e) => handleTierChange(member.id, e.target.value)}
                        className="w-full bg-black/50 border border-white/10 rounded-lg px-2 sm:px-3 py-2 text-xs text-white focus:outline-none focus:border-firefox-orange"
                      >
                        <option value="free">Free</option>
                        <option value="silver">Silver</option>
                        <option value="platinum">Platinum</option>
                      </select>
                    </div>

                    {/* Points */}
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-black uppercase tracking-widest text-zinc-500 block">Points</label>
                      <button 
                        onClick={() => handlePointsChange(member.id, member.points || 0)}
                        className="w-full bg-black/50 border border-white/10 rounded-lg px-2 sm:px-3 py-2 text-xs text-white hover:border-firefox-orange flex items-center justify-between group"
                      >
                        <span>{member.points || 0} pts</span>
                        <Edit2 size={12} className="text-zinc-500 group-hover:text-firefox-orange" />
                      </button>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-3 border-t border-white/5">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <div className="relative">
                        <input 
                          type="checkbox" 
                          className="sr-only peer"
                          checked={member.isFoundingMember || false}
                          onChange={(e) => handleFoundingChange(member.id, e.target.checked)}
                        />
                        <div className="w-8 h-5 bg-white/10 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-yellow-500 border border-white/5"></div>
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Founding Member</span>
                    </label>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <button 
                        onClick={() => handleEditProfile(member.id, member.fullName || '')}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-2 bg-white/5 hover:bg-white/10 text-zinc-300 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-colors"
                      >
                        <Edit2 size={12} /> Rename
                      </button>
                      <button 
                        onClick={() => handleDeleteMember(member.id)}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-colors"
                      >
                        <Trash2 size={12} /> Remove
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          ))
        )}

        {hasMore && !searchTerm && (
          <div className="text-center pt-8">
            <button 
              onClick={() => fetchMembers(true)}
              className="px-8 py-3 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-full text-xs font-bold uppercase tracking-widest transition-colors"
            >
              Load More
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MembersManager;
