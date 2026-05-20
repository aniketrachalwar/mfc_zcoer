import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, Sparkles, CheckCircle2, ChevronRight, Rocket, Zap, BookOpen, Clock, Loader2, ArrowRight } from 'lucide-react';
import { doc, getDoc, updateDoc, addDoc, collection } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../lib/AuthContext';

export default function MembershipApply({ profile, onComplete }: { profile: any, onComplete: () => void }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [fee, setFee] = useState<number | null>(null);
  const [transactionId, setTransactionId] = useState('');
  const [step, setStep] = useState(1);
  const [error, setError] = useState('');

  const isFoundingMember = profile?.isFoundingMember || false;

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const settingsSnap = await getDoc(doc(db, 'settings', 'membership'));
        if (settingsSnap.exists()) {
          setFee(settingsSnap.data().currentFee || 99);
        } else {
          setFee(99); // Fallback
        }
      } catch (err) {
        console.error("Error fetching settings:", err);
        setFee(99);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFoundingMember && !transactionId.trim()) {
      setError("Please enter a valid Transaction ID.");
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      if (!user) throw new Error("No authenticated user.");

      // Create Payment Application Document
      await addDoc(collection(db, 'payments'), {
        userId: user.uid,
        amount: isFoundingMember ? 0 : fee,
        transactionId: isFoundingMember ? 'FOUNDING_WAIVED' : transactionId.trim(),
        status: 'pending',
        timestamp: new Date().toISOString(),
        userEmail: user.email,
        userName: profile.fullName || user.displayName,
      });

      // Update User Profile Status
      await updateDoc(doc(db, 'users', user.uid), {
        membershipStatus: 'pending'
      });

      onComplete();
    } catch (err: any) {
      console.error(err);
      setError("Application failed. Please try again or contact support.");
    } finally {
      setSubmitting(false);
    }
  };

  const benefits = [
    { icon: Sparkles, title: 'Official Identity', desc: 'Get your verified MFC ZCOER member card and profile badge.' },
    { icon: BookOpen, title: 'Exclusive Resources', desc: 'Access premium workshops, roadmaps, and codebase repositories.' },
    { icon: Zap, title: 'Project Incubation', desc: 'Build and launch products with the core team and get mentored.' },
    { icon: Shield, title: 'Leadership Roles', desc: 'Eligibility to run for core team positions and lead domains.' }
  ];

  if (loading) return (
    <div className="py-20 flex justify-center">
      <div className="w-10 h-10 border-4 border-firefox-orange border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto py-8">
      <AnimatePresence mode="wait">
        {step === 1 ? (
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
                Unlock The <span className="text-firefox-orange">Full Potential</span>
              </h2>
              <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
                MFC ZCOER is more than a club; it's a student startup ecosystem. Official membership gives you the tools, network, and platform to build your future.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {benefits.map((b, i) => (
                <div key={i} className="p-6 bg-white/5 border border-white/10 rounded-2xl flex items-start gap-4 hover:border-firefox-orange/30 transition-colors">
                  <div className="w-12 h-12 rounded-xl bg-firefox-orange/10 text-firefox-orange flex items-center justify-center shrink-0">
                    <b.icon size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-lg mb-1">{b.title}</h3>
                    <p className="text-zinc-400 text-sm">{b.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-center">
              <button
                onClick={() => setStep(2)}
                className="px-8 py-4 bg-firefox-orange hover:bg-orange-600 text-white rounded-full font-display font-black uppercase tracking-widest text-sm flex items-center gap-3 transition-all shadow-[0_0_20px_rgba(255,106,0,0.3)] hover:shadow-[0_0_30px_rgba(255,106,0,0.5)]"
              >
                Apply For Membership <ArrowRight size={18} />
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="payment"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="max-w-2xl mx-auto"
          >
            <div className="bg-zinc-900 border border-white/10 rounded-3xl p-8 md:p-12 shadow-2xl relative overflow-hidden">
              {isFoundingMember && (
                <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-500/20 blur-[100px] rounded-full pointer-events-none" />
              )}
              
              <div className="mb-10 text-center">
                <h3 className="text-2xl font-display font-black uppercase text-white mb-2">Membership Application</h3>
                <p className="text-zinc-400">Secure your spot in the ecosystem.</p>
              </div>

              <form onSubmit={handleApply} className="space-y-8">
                <div className="bg-black/50 border border-white/5 rounded-2xl p-6">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-zinc-400 font-bold uppercase text-[10px] tracking-widest">Plan</span>
                    <span className="text-white font-black uppercase tracking-wider text-sm">Annual Membership</span>
                  </div>
                  <div className="flex justify-between items-center pb-4 border-b border-white/10">
                    <span className="text-zinc-400 font-bold uppercase text-[10px] tracking-widest">Amount</span>
                    <div className="text-right">
                      {isFoundingMember ? (
                        <div className="flex items-center gap-2">
                          <span className="text-zinc-600 line-through">₹{fee}</span>
                          <span className="text-yellow-500 font-black text-2xl tracking-tight">₹0</span>
                        </div>
                      ) : (
                        <span className="text-white font-black text-2xl tracking-tight">₹{fee}</span>
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

                {!isFoundingMember && (
                  <div className="space-y-6">
                    <div className="p-5 bg-firefox-orange/5 border border-firefox-orange/20 rounded-xl">
                       <h4 className="text-firefox-orange font-bold text-sm mb-2">Payment Instructions</h4>
                       <p className="text-zinc-400 text-sm mb-4">Please scan the QR code at the club desk or use the official UPI ID to make the payment. Razorpay integration is coming soon.</p>
                       <div className="font-mono text-white bg-black/50 p-3 rounded-lg text-center tracking-wider">mfc.zcoer@upi</div>
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
                  </div>
                )}

                {error && (
                  <p className="text-red-400 text-sm text-center">{error}</p>
                )}

                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="px-6 py-4 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold transition-colors"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 py-4 bg-firefox-orange hover:bg-orange-600 text-white rounded-xl font-display font-black uppercase tracking-widest text-sm flex items-center justify-center gap-3 transition-all shadow-lg disabled:opacity-50"
                  >
                    {submitting ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle2 size={18} />}
                    {submitting ? 'Submitting...' : isFoundingMember ? 'Claim Free Membership' : 'Submit Application'}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
