import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, Sparkles, CheckCircle2, Crown, Rocket, Zap, BookOpen, Loader2, ArrowRight, UploadCloud, Image as ImageIcon, Ticket, Copy } from 'lucide-react';
import { doc, getDoc, addDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../lib/AuthContext';
import { useOutletContext } from 'react-router-dom';
import { MembershipTier } from '../../types/membership';

export default function MembershipApply() {
  const { profile, refreshProfile } = useOutletContext<{ profile: any, refreshProfile: () => void }>();
  const onComplete = refreshProfile;
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [fees, setFees] = useState({ silver: 99, platinum: 199 });
  const [upiId, setUpiId] = useState('mfc.zcoer@upi');
  
  const [step, setStep] = useState(1);
  const [selectedTier, setSelectedTier] = useState<MembershipTier | null>(null);
  
  // Coupon States
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [couponError, setCouponError] = useState('');
  const [validatingCoupon, setValidatingCoupon] = useState(false);
  
  // Payment States
  const [transactionId, setTransactionId] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const isFoundingMember = profile?.isFoundingMember || false;

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const settingsSnap = await getDoc(doc(db, 'settings', 'membership'));
        if (settingsSnap.exists()) {
          const data = settingsSnap.data();
          setFees({
            silver: data.silverFee || 99,
            platinum: data.platinumFee || 199
          });
          if (data.upiId) {
            setUpiId(data.upiId);
          }
        }
      } catch (err) {
        console.error("Error fetching settings:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const getFinalAmount = () => {
    if (isFoundingMember) return 0;
    if (!selectedTier) return 0;
    let baseAmount = selectedTier === 'platinum' ? fees.platinum : fees.silver;
    
    if (appliedCoupon) {
      if (appliedCoupon.type === 'percentage') {
        baseAmount = baseAmount - (baseAmount * (appliedCoupon.value / 100));
      } else {
        baseAmount = Math.max(0, baseAmount - appliedCoupon.value);
      }
    }
    return Math.floor(baseAmount);
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim() || !selectedTier) return;
    setValidatingCoupon(true);
    setCouponError('');
    setAppliedCoupon(null);

    try {
      const q = query(
        collection(db, 'coupons'), 
        where('code', '==', couponCode.toUpperCase().trim()),
        where('isActive', '==', true)
      );
      const snap = await getDocs(q);
      
      if (snap.empty) {
        setCouponError('Invalid or expired coupon.');
        return;
      }

      const coupon = snap.docs[0].data();
      
      if (coupon.usageLimit > 0 && coupon.usageCount >= coupon.usageLimit) {
        setCouponError('Coupon usage limit reached.');
        return;
      }
      
      if (coupon.expiryDate && new Date(coupon.expiryDate).getTime() < Date.now()) {
        setCouponError('Coupon has expired.');
        return;
      }

      if (!coupon.tierRestrictions.includes(selectedTier)) {
        setCouponError(`This coupon is not valid for ${selectedTier} tier.`);
        return;
      }

      setAppliedCoupon({ id: snap.docs[0].id, ...coupon });
    } catch (err) {
      console.error(err);
      setCouponError('Error validating coupon.');
    } finally {
      setValidatingCoupon(false);
    }
  };

  const handleManualApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTier) return;
    
      if (!isFoundingMember && !transactionId.trim()) {
        setError("Please enter a valid Transaction ID.");
        return;
      }

      setSubmitting(true);
      setError('');

      try {
        if (!user) throw new Error("No authenticated user.");

        // Add payment record
        await addDoc(collection(db, 'payments'), {
        gateway: 'manual',
        userId: user.uid,
        amount: getFinalAmount(),
        requestedTier: selectedTier,
        transactionId: isFoundingMember ? 'FOUNDING_WAIVED' : transactionId.trim(),
        couponUsed: appliedCoupon ? appliedCoupon.code : null,
        status: 'pending', // backward compatibility
        paymentStatus: 'pending',
        timestamp: new Date().toISOString(),
        userEmail: user.email,
        userName: profile.fullName || user.displayName,
      });

      // Show success screen
      setStep(4);
      onComplete();
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Application failed. Please try again or contact support.");
    } finally {
      setSubmitting(false);
    }
  };


  const currentTier = profile?.membershipTier || 'free';

  if (loading) return (
    <div className="py-20 flex justify-center">
      <div className="w-10 h-10 border-4 border-firefox-orange border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (currentTier === 'platinum') {
    return (
      <div className="max-w-4xl mx-auto py-20 text-center">
        <Crown size={64} className="text-[#FFBD00] mx-auto mb-6" />
        <h2 className="text-3xl md:text-5xl font-display font-black uppercase tracking-tight text-white mb-4">
          Highest Tier <span className="text-firefox-orange">Reached</span>
        </h2>
        <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
          You are already enjoying all premium benefits and exclusive perks as a Platinum member. Thank you for your continued support!
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8">
      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div
            key="benefits"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-12"
          >
            <div className="text-center">
              <div className="inline-flex items-center gap-3 px-4 py-2 bg-firefox-orange/10 border border-firefox-orange/20 rounded-full text-firefox-orange text-[10px] font-black uppercase tracking-[0.2em] mb-6">
                <Rocket size={14} /> Ecosystem Access
              </div>
              <h2 className="text-4xl md:text-5xl font-display font-black uppercase tracking-tight text-white mb-4">
                Unlock The <span className="text-firefox-orange">Premium Portal</span>
              </h2>
              <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
                {currentTier === 'silver' 
                  ? "Upgrade to Platinum to unlock the full builder network, premium resources, and exclusive events."
                  : "Your Free Tier gives you basic access. Upgrade to Silver or Platinum to unlock the full builder network, premium resources, and exclusive events."}
              </p>
            </div>

            <div className="flex justify-center">
              <button
                onClick={() => setStep(2)}
                className="px-8 py-4 bg-firefox-orange hover:bg-orange-600 text-white rounded-full font-display font-black uppercase tracking-widest text-sm flex items-center gap-3 transition-all shadow-[0_0_20px_rgba(255,106,0,0.3)] hover:shadow-[0_0_30px_rgba(255,106,0,0.5)]"
              >
                View Upgrade Plans <ArrowRight size={18} />
              </button>
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            key="tiers"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="max-w-3xl mx-auto"
          >
            <div className="text-center mb-10">
              <h3 className="text-3xl font-display font-black uppercase text-white mb-2">Select Your Tier</h3>
              <p className="text-zinc-400">Choose the membership that best fits your goals.</p>
            </div>

            <div className={`grid ${currentTier === 'silver' ? 'max-w-md mx-auto grid-cols-1' : 'md:grid-cols-2'} gap-6`}>
              {/* Silver Tier */}
              {currentTier !== 'silver' && (
                <div 
                  onClick={() => setSelectedTier('silver')}
                  className={`relative bg-zinc-900 border-2 rounded-3xl p-8 cursor-pointer transition-all duration-300 hover:-translate-y-2 ${selectedTier === 'silver' ? 'border-zinc-400 shadow-[0_0_30px_rgba(161,161,170,0.2)]' : 'border-white/5 hover:border-white/20'}`}
                >
                  {selectedTier === 'silver' && (
                    <div className="absolute -top-3 -right-3 w-8 h-8 bg-zinc-400 rounded-full flex items-center justify-center text-zinc-900 shadow-lg">
                      <CheckCircle2 size={18} className="fill-current" />
                    </div>
                  )}
                  <div className="mb-6">
                    <Shield size={32} className="text-zinc-400 mb-4" />
                    <h4 className="text-2xl font-display font-black uppercase text-white mb-1">Silver</h4>
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-black text-zinc-400">₹{fees.silver}</span>
                      <span className="text-zinc-500 text-sm font-bold uppercase">/year</span>
                    </div>
                  </div>
                  <ul className="space-y-3 mb-8">
                    <li className="flex items-start gap-2 text-zinc-300 text-sm"><CheckCircle2 size={16} className="text-zinc-500 shrink-0 mt-0.5" /> Official Member ID Card</li>
                    <li className="flex items-start gap-2 text-zinc-300 text-sm"><CheckCircle2 size={16} className="text-zinc-500 shrink-0 mt-0.5" /> Access to Member Directory</li>
                    <li className="flex items-start gap-2 text-zinc-300 text-sm"><CheckCircle2 size={16} className="text-zinc-500 shrink-0 mt-0.5" /> Standard Event Discounts</li>
                    <li className="flex items-start gap-2 text-zinc-300 text-sm"><CheckCircle2 size={16} className="text-zinc-500 shrink-0 mt-0.5" /> Access to Roadmaps & Resources</li>
                  </ul>
                </div>
              )}

              {/* Platinum Tier */}
              <div 
                onClick={() => setSelectedTier('platinum')}
                className={`relative bg-zinc-900 border-2 rounded-3xl p-8 cursor-pointer transition-all duration-300 hover:-translate-y-2 ${selectedTier === 'platinum' ? 'border-[#FF5C00] shadow-[0_0_30px_rgba(255,92,0,0.3)]' : 'border-white/5 hover:border-firefox-orange/50'}`}
              >
                <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-[#FF5C00] to-[#FFBD00]" />
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-gradient-to-r from-[#FF5C00] to-[#FFBD00] text-black text-[9px] font-black uppercase tracking-widest rounded-full">
                  Recommended
                </div>
                {selectedTier === 'platinum' && (
                  <div className="absolute -top-3 -right-3 w-8 h-8 bg-[#FF5C00] rounded-full flex items-center justify-center text-white shadow-lg">
                    <CheckCircle2 size={18} className="fill-current" />
                  </div>
                )}
                
                <div className="mb-6 mt-2">
                  <Crown size={32} className="text-[#FFBD00] mb-4" />
                  <h4 className="text-2xl font-display font-black uppercase text-white mb-1">Platinum</h4>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#FF5C00] to-[#FFBD00]">₹{fees.platinum}</span>
                    <span className="text-zinc-500 text-sm font-bold uppercase">/year</span>
                  </div>
                </div>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-start gap-2 text-zinc-300 text-sm"><CheckCircle2 size={16} className="text-[#FF5C00] shrink-0 mt-0.5" /> Everything in Silver</li>
                  <li className="flex items-start gap-2 text-zinc-300 text-sm"><CheckCircle2 size={16} className="text-[#FF5C00] shrink-0 mt-0.5" /> Free Access to Premium Events</li>
                  <li className="flex items-start gap-2 text-zinc-300 text-sm"><CheckCircle2 size={16} className="text-[#FF5C00] shrink-0 mt-0.5" /> Eligible for Core Team/Leadership</li>
                  <li className="flex items-start gap-2 text-zinc-300 text-sm"><CheckCircle2 size={16} className="text-[#FF5C00] shrink-0 mt-0.5" /> Project Incubation & Mentorship</li>
                </ul>
              </div>
            </div>

            <div className="mt-8 flex justify-between">
               <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-6 py-4 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold transition-colors"
                >
                  Back
               </button>
               <button
                  onClick={() => setStep(3)}
                  disabled={!selectedTier}
                  className="px-8 py-4 bg-firefox-orange text-white rounded-xl font-display font-black uppercase tracking-widest text-sm flex items-center gap-3 transition-all disabled:opacity-50 hover:bg-orange-600"
               >
                  Proceed to Payment <ArrowRight size={18} />
               </button>
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div
            key="payment"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="max-w-2xl mx-auto w-full"
          >
            <div className="bg-zinc-900 border border-white/10 rounded-3xl p-5 sm:p-8 md:p-12 shadow-2xl relative overflow-hidden">
              {isFoundingMember && (
                <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-500/20 blur-[100px] rounded-full pointer-events-none" />
              )}
              
              <div className="mb-10 text-center">
                <h3 className="text-2xl font-display font-black uppercase text-white mb-2">Complete Payment</h3>
                <p className="text-zinc-400 capitalize">{selectedTier} Membership Application</p>
              </div>

              <div className="space-y-8">
                {/* Order Summary */}
                <div className="bg-black/50 border border-white/5 rounded-2xl p-6">
                  <div className="flex justify-between items-center mb-4">
                     <span className="text-zinc-400 font-bold uppercase text-[10px] tracking-widest">Base Amount</span>
                     <span className="text-white font-black uppercase tracking-wider text-sm">₹{selectedTier === 'platinum' ? fees.platinum : fees.silver}</span>
                  </div>
                  
                  {appliedCoupon && (
                     <div className="flex justify-between items-center mb-4 text-green-400">
                        <span className="font-bold uppercase text-[10px] tracking-widest">Discount ({appliedCoupon.code})</span>
                        <span className="font-black uppercase tracking-wider text-sm">
                           -{appliedCoupon.type === 'percentage' ? `${appliedCoupon.value}%` : `₹${appliedCoupon.value}`}
                        </span>
                     </div>
                  )}

                  <div className="flex justify-between items-center pt-4 border-t border-white/10">
                    <span className="text-zinc-400 font-bold uppercase text-[10px] tracking-widest">Total Payable</span>
                    <div className="text-right">
                      {isFoundingMember ? (
                        <div className="flex items-center gap-2">
                          <span className="text-zinc-600 line-through">₹{getFinalAmount()}</span>
                          <span className="text-yellow-500 font-black text-2xl tracking-tight">₹0</span>
                        </div>
                      ) : (
                        <span className="text-white font-black text-2xl tracking-tight">₹{getFinalAmount()}</span>
                      )}
                    </div>
                  </div>
                  
                  {isFoundingMember && (
                    <div className="mt-4 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl flex items-start gap-3">
                      <Sparkles size={18} className="text-yellow-500 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-yellow-500 font-bold text-sm mb-1">Founding Member Privilege</p>
                        <p className="text-yellow-500/80 text-xs leading-relaxed">As an early supporter of MFC ZCOER, your membership fee has been permanently waived. Thank you for building with us!</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Coupon Section */}
                {!isFoundingMember && (
                  <div className="space-y-2">
                     <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Have a Coupon?</label>
                     <div className="flex gap-2">
                        <input 
                           type="text"
                           value={couponCode}
                           onChange={e => setCouponCode(e.target.value)}
                           disabled={!!appliedCoupon || validatingCoupon}
                           placeholder="Enter Code"
                           className="flex-1 min-w-0 bg-black/50 border border-white/10 rounded-xl px-3 sm:px-4 py-3 text-white uppercase font-mono tracking-widest focus:border-firefox-orange outline-none disabled:opacity-50"
                        />
                        {appliedCoupon ? (
                           <button type="button" onClick={() => { setAppliedCoupon(null); setCouponCode(''); }} className="shrink-0 px-4 py-3 bg-red-500/20 text-red-400 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-red-500/30">
                              Remove
                           </button>
                        ) : (
                           <button type="button" onClick={handleApplyCoupon} disabled={!couponCode || validatingCoupon} className="shrink-0 px-4 py-3 bg-white/5 text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-white/10 disabled:opacity-50 flex items-center gap-2">
                              {validatingCoupon ? <Loader2 size={14} className="animate-spin" /> : <Ticket size={14} />}
                              <span className="hidden sm:inline">Apply</span>
                              <span className="sm:hidden">Add</span>
                           </button>
                        )}
                     </div>
                     {couponError && <p className="text-red-400 text-xs mt-1">{couponError}</p>}
                  </div>
                )}

                {/* Manual UPI Flow */}
                {!isFoundingMember && (
                  <form onSubmit={handleManualApply} className="space-y-6">
                     <div className="p-5 bg-firefox-orange/5 border border-firefox-orange/20 rounded-xl mt-4">
                        <h4 className="text-firefox-orange font-bold text-sm mb-2">UPI Payment Instructions</h4>
                        <p className="text-zinc-400 text-sm mb-4">Transfer the exact amount (₹{getFinalAmount()}) to the official UPI ID. Your account will be upgraded within 24 hours after verification.</p>
                        <div className="flex items-center justify-between bg-black/50 p-3 rounded-lg border border-white/5">
                           <div className="font-mono text-white tracking-wider text-lg sm:text-xl truncate">{upiId}</div>
                           <button 
                             type="button"
                             onClick={() => {
                               navigator.clipboard.writeText(upiId);
                               setCopied(true);
                               setTimeout(() => setCopied(false), 2000);
                             }}
                             className="ml-2 shrink-0 p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-zinc-400 hover:text-white"
                             title="Copy UPI ID"
                           >
                             {copied ? <CheckCircle2 size={18} className="text-green-400" /> : <Copy size={18} />}
                           </button>
                        </div>
                     </div>

                     <div>
                        <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-2">Transaction ID / UTR</label>
                        <input 
                        type="text" 
                        required
                        value={transactionId}
                        onChange={(e) => setTransactionId(e.target.value)}
                        placeholder="e.g. 123456789012"
                        className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-[16px] focus:border-firefox-orange outline-none transition-colors text-white font-mono tracking-widest"
                        />
                     </div>

                     {error && (
                        <p className="text-red-400 text-sm text-center bg-red-500/10 p-3 rounded-lg border border-red-500/20">{error}</p>
                     )}

                     <div className="flex gap-4 pt-4">
                        <button
                           type="button"
                           onClick={() => setStep(2)}
                           className="px-6 py-4 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold transition-colors"
                           disabled={submitting}
                        >
                           Back
                        </button>

                        <button
                           type="submit"
                           disabled={submitting}
                           className="flex-1 py-4 bg-firefox-orange hover:bg-orange-600 text-white rounded-xl font-display font-black uppercase tracking-widest text-sm flex items-center justify-center gap-3 transition-all shadow-[0_0_20px_rgba(255,106,0,0.3)] disabled:opacity-50 disabled:hover:shadow-none"
                        >
                           {submitting ? <Loader2 size={18} className="animate-spin" /> : <Shield size={18} />}
                           {submitting ? 'Submitting...' : 'Submit Verification'}
                        </button>
                     </div>
                  </form>
                )}

                {isFoundingMember && (
                  <div className="flex gap-4 pt-4">
                     <button
                        type="button"
                        onClick={() => setStep(2)}
                        className="px-6 py-4 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold transition-colors"
                        disabled={submitting}
                     >
                        Back
                     </button>
                     <button
                        type="button"
                        onClick={handleManualApply}
                        disabled={submitting}
                        className="flex-1 py-4 bg-firefox-orange hover:bg-orange-600 text-white rounded-xl font-display font-black uppercase tracking-widest text-sm flex items-center justify-center gap-3 transition-all shadow-[0_0_20px_rgba(255,106,0,0.3)] disabled:opacity-50 disabled:hover:shadow-none"
                     >
                        {submitting ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
                        {submitting ? 'Processing...' : 'Claim Free Access'}
                     </button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {step === 4 && (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-xl mx-auto text-center py-12"
          >
            <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 size={48} className="text-green-500" />
            </div>
            <h3 className="text-3xl font-display font-black uppercase text-white mb-4">Application Submitted!</h3>
            <p className="text-zinc-400 text-lg mb-8">
              Your {selectedTier} membership application has been successfully submitted. Our team will verify your payment and upgrade your account within 24 hours.
            </p>
            <button
              onClick={() => window.location.href = '/dashboard'}
              className="px-8 py-4 bg-white/10 hover:bg-white/20 text-white rounded-xl font-bold transition-colors"
            >
              Return to Dashboard
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
