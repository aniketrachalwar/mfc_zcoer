import React, { useState, useEffect } from 'react';
import { collection, query, getDocs, addDoc, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Ticket, Plus, Trash2, Edit2, Loader2, Power, PowerOff } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Coupon {
  id: string;
  code: string;
  type: 'percentage' | 'flat';
  value: number;
  expiryDate: string;
  usageLimit: number;
  usageCount: number;
  tierRestrictions: string[];
  isActive: boolean;
}

const CouponManager = () => {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    code: '',
    type: 'percentage',
    value: 0,
    expiryDate: '',
    usageLimit: 0,
    tierRestrictions: 'silver, platinum'
  });

  const fetchCoupons = async () => {
    try {
      const q = query(collection(db, 'coupons'));
      const snap = await getDocs(q);
      setCoupons(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Coupon)));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await addDoc(collection(db, 'coupons'), {
        code: formData.code.toUpperCase(),
        type: formData.type,
        value: Number(formData.value),
        expiryDate: formData.expiryDate,
        usageLimit: Number(formData.usageLimit),
        usageCount: 0,
        tierRestrictions: formData.tierRestrictions.split(',').map(s => s.trim().toLowerCase()),
        isActive: true,
        createdAt: new Date().toISOString()
      });
      setIsModalOpen(false);
      fetchCoupons();
    } catch (err) {
      console.error(err);
      alert("Failed to create coupon.");
    } finally {
      setSubmitting(false);
    }
  };

  const toggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      await updateDoc(doc(db, 'coupons', id), { isActive: !currentStatus });
      fetchCoupons();
    } catch (err) {
      console.error(err);
    }
  };

  const deleteCoupon = async (id: string) => {
    if (!confirm('Are you sure you want to delete this coupon?')) return;
    try {
      await deleteDoc(doc(db, 'coupons', id));
      fetchCoupons();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-full">
      <Loader2 size={32} className="animate-spin text-firefox-orange" />
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-display font-black uppercase text-white mb-2">Coupon Management</h2>
          <p className="text-zinc-400">Create and track membership discount codes.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-firefox-orange text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-orange-600 transition-colors"
        >
          <Plus size={16} /> New Coupon
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {coupons.map((coupon) => (
          <div key={coupon.id} className="bg-black/50 border border-white/5 rounded-2xl p-5 hover:border-firefox-orange/30 transition-all">
            <div className="flex justify-between items-start mb-4">
              <div>
                <span className="text-[10px] font-bold text-firefox-orange uppercase tracking-widest bg-firefox-orange/10 px-2 py-1 rounded">
                  {coupon.type === 'percentage' ? `${coupon.value}% OFF` : `₹${coupon.value} OFF`}
                </span>
                <h3 className="text-xl font-mono font-bold text-white mt-2">{coupon.code}</h3>
              </div>
              <button 
                onClick={() => toggleStatus(coupon.id, coupon.isActive)}
                className={`p-2 rounded-lg transition-colors ${coupon.isActive ? 'text-green-500 bg-green-500/10' : 'text-zinc-500 bg-zinc-800'}`}
              >
                {coupon.isActive ? <Power size={16} /> : <PowerOff size={16} />}
              </button>
            </div>
            
            <div className="space-y-2 text-xs text-zinc-400">
              <div className="flex justify-between">
                <span>Usage</span>
                <span className="text-white">{coupon.usageCount} / {coupon.usageLimit > 0 ? coupon.usageLimit : '∞'}</span>
              </div>
              <div className="flex justify-between">
                <span>Expires</span>
                <span className="text-white">{coupon.expiryDate ? new Date(coupon.expiryDate).toLocaleDateString() : 'Never'}</span>
              </div>
              <div className="flex justify-between">
                <span>Tiers</span>
                <span className="text-white capitalize">{coupon.tierRestrictions.join(', ')}</span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-white/5 flex justify-end">
              <button onClick={() => deleteCoupon(coupon.id)} className="text-red-400 hover:text-red-500 hover:bg-red-400/10 p-2 rounded-lg transition-colors">
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {coupons.length === 0 && (
        <div className="text-center py-20 bg-black/30 rounded-2xl border border-white/5">
          <Ticket size={48} className="mx-auto text-zinc-600 mb-4" />
          <h3 className="text-white font-bold mb-2">No coupons created</h3>
          <p className="text-zinc-400">Create your first coupon to offer discounts.</p>
        </div>
      )}

      {/* Create Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-zinc-900 border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl"
            >
              <h3 className="text-lg font-black text-white uppercase tracking-widest mb-4">Create Coupon</h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Coupon Code</label>
                  <input required type="text" value={formData.code} onChange={e => setFormData({...formData, code: e.target.value.toUpperCase()})} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2 text-white font-mono uppercase" placeholder="e.g. EARLYBIRD50" />
                </div>
                
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Type</label>
                    <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2 text-white">
                      <option value="percentage">Percentage (%)</option>
                      <option value="flat">Flat Amount (₹)</option>
                    </select>
                  </div>
                  <div className="flex-1">
                    <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Value</label>
                    <input required type="number" min="1" value={formData.value} onChange={e => setFormData({...formData, value: Number(e.target.value)})} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2 text-white" />
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Usage Limit (0 for ∞)</label>
                    <input type="number" min="0" value={formData.usageLimit} onChange={e => setFormData({...formData, usageLimit: Number(e.target.value)})} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2 text-white" />
                  </div>
                  <div className="flex-1">
                    <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Expiry Date (Opt)</label>
                    <input type="date" value={formData.expiryDate} onChange={e => setFormData({...formData, expiryDate: e.target.value})} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2 text-white" />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Applicable Tiers</label>
                  <input type="text" value={formData.tierRestrictions} onChange={e => setFormData({...formData, tierRestrictions: e.target.value})} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2 text-white" placeholder="silver, platinum" />
                </div>

                <div className="flex gap-3 mt-6">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 rounded-xl bg-white/5 text-white font-bold text-xs uppercase hover:bg-white/10 transition-colors">Cancel</button>
                  <button type="submit" disabled={submitting} className="flex-1 py-3 rounded-xl bg-firefox-orange text-white font-bold text-xs uppercase hover:bg-orange-600 transition-colors flex items-center justify-center gap-2">
                    {submitting ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />} Create
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CouponManager;
