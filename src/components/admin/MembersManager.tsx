import React, { useEffect, useState } from 'react';
import { collection, getDocs, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Search, Edit2, Trash2, Shield, Check, X } from 'lucide-react';
import { motion } from 'motion/react';

const MembersManager = () => {
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchMembers = async () => {
    setLoading(true);
    try {
      const usersSnap = await getDocs(collection(db, 'users'));
      const usersList = usersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMembers(usersList);
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
        alert("Failed to update points.");
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

  const filteredMembers = members.filter(m => 
    (m.fullName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (m.email?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (m.username?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-display font-black uppercase text-white mb-2">
            Member <span className="text-firefox-orange">Management</span>
          </h1>
          <p className="text-zinc-400 text-sm">Manage users, roles, and status.</p>
        </div>
        
        <div className="relative w-full md:w-64">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input 
            type="text" 
            placeholder="Search members..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-[16px] text-white focus:outline-none focus:border-firefox-orange transition-colors"
          />
        </div>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 text-xs font-black uppercase tracking-wider text-zinc-500">
                <th className="p-4">Member</th>
                <th className="p-4">Role</th>
                <th className="p-4">Points</th>
                <th className="p-4">Membership</th>
                <th className="p-4 text-center">Founding</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-zinc-500">
                    <div className="inline-block w-6 h-6 border-2 border-firefox-orange border-t-transparent rounded-full animate-spin" />
                  </td>
                </tr>
              ) : filteredMembers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-zinc-500">No members found.</td>
                </tr>
              ) : (
                filteredMembers.map((member) => (
                  <motion.tr 
                    key={member.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="border-b border-white/5 hover:bg-white/5 transition-colors group"
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-zinc-800 overflow-hidden border border-white/10">
                          {member.photoURL ? (
                            <img loading="lazy" src={member.photoURL} alt={member.fullName} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-zinc-500 font-bold uppercase">
                              {member.fullName?.charAt(0) || '?'}
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-white">{member.fullName || 'Unknown'}</p>
                          <p className="text-xs text-zinc-500">{member.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <select 
                        value={member.role || 'member'}
                        onChange={(e) => handleRoleChange(member.id, e.target.value)}
                        className="bg-zinc-900 border border-white/10 rounded-lg px-3 py-1 text-[16px] text-white focus:outline-none focus:border-firefox-orange"
                      >
                        <option value="member">Member</option>
                        <option value="volunteer">Volunteer</option>
                        <option value="core_team">Core Team</option>
                        <option value="president">President</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td className="p-4">
                      <button 
                        onClick={() => handlePointsChange(member.id, member.points || 0)}
                        className="bg-zinc-900 border border-white/10 rounded-lg px-3 py-1 text-xs text-white hover:border-firefox-orange flex items-center gap-2 group/btn"
                        title="Edit Points"
                      >
                        {member.points || 0} pts
                        <Edit2 size={12} className="text-zinc-500 group-hover/btn:text-firefox-orange" />
                      </button>
                    </td>
                    <td className="p-4">
                      <select 
                        value={member.membershipStatus || 'public'}
                        onChange={(e) => handleStatusChange(member.id, e.target.value)}
                        className={`bg-zinc-900 border rounded-lg px-3 py-1 text-[16px] focus:outline-none focus:border-firefox-orange ${
                          member.membershipStatus === 'active' ? 'border-green-500/50 text-green-400' : 
                          member.membershipStatus === 'pending' ? 'border-yellow-500/50 text-yellow-400' : 
                          member.membershipStatus === 'suspended' ? 'border-red-500/50 text-red-400' :
                          member.membershipStatus === 'alumni' ? 'border-purple-500/50 text-purple-400' :
                          'border-zinc-500/50 text-zinc-400'
                        }`}
                      >
                        <option value="public">Public</option>
                        <option value="pending">Pending</option>
                        <option value="active">Active</option>
                        <option value="suspended">Suspended</option>
                        <option value="alumni">Alumni</option>
                      </select>
                    </td>
                    <td className="p-4 text-center">
                      <label className="relative inline-flex items-center cursor-pointer justify-center">
                        <input 
                          type="checkbox" 
                          className="sr-only peer"
                          checked={member.isFoundingMember || false}
                          onChange={(e) => handleFoundingChange(member.id, e.target.checked)}
                        />
                        <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-500"></div>
                      </label>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => handleDeleteMember(member.id)}
                          className="p-2 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-lg transition-colors"
                          title="Remove Member"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default MembersManager;
