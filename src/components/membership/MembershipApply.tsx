import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, Sparkles, CheckCircle2, ChevronRight, Rocket, Zap, BookOpen, Clock, Loader2, ArrowRight, UploadCloud, Image as ImageIcon, CreditCard } from 'lucide-react';
import { doc, getDoc, updateDoc, addDoc, collection } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../lib/firebase';
import { useAuth } from '../../lib/AuthContext';
import useRazorpay from 'react-razorpay';

export default function MembershipApply({ profile, onComplete }: { profile: any, onComplete: () => void }) {
  const { user } = useAuth();
  const [Razorpay] = useRazorpay();
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [fee, setFee] = useState<number | null>(null);
  
  // Payment States
  const [paymentMode, setPaymentMode] = useState<'razorpay' | 'manual'>('razorpay');
  const [transactionId, setTransactionId] = useState('');
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  
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

  const handleRazorpayPayment = useCallback(async () => {
    if (!user) return;
    setSubmitting(true);
    setError('');

    try {
      // 1. Create Order on Backend
      const orderResponse = await fetch('/api/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.uid })
      });
      
      const orderData = await orderResponse.json();
      if (!orderResponse.ok) throw new Error(orderData.error || 'Failed to create order');

      // 2. Open Razorpay Checkout
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || '', // Frontend public key fallback
        amount: orderData.amount,
        currency: orderData.currency,
        name: "MFC ZCOER",
        description: "Premium Ecosystem Membership",
        image: "https://upload.wikimedia.org/wikipedia/commons/d/d2/Mozilla_logo.svg", // Replace with actual logo URL
        order_id: orderData.id,
        handler: async (response: any) => {
          try {
            // 3. Verify Payment Signature on Backend
            const verifyRes = await fetch('/api/verify-payment', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                userId: user.uid,
                userEmail: user.email,
                userName: profile.fullName || user.displayName
              })
            });
            
            const verifyData = await verifyRes.json();
            if (!verifyRes.ok) throw new Error(verifyData.error || 'Verification failed');

            // Success! The backend has updated the DB.
            onComplete();
          } catch (err: any) {
            console.error('Verification Error:', err);
            setError(err.message || "Payment verification failed. If money was deducted, it will be refunded.");
          } finally {
            setSubmitting(false);
          }
        },
        prefill: {
          name: profile?.fullName || user.displayName || "",
          email: user.email || "",
        },
        theme: {
          color: "#ff6a00", // firefox-orange
        },
      };

      const rzpay = new Razorpay(options);
      
      rzpay.on('payment.failed', function (response: any){
         setError(`Payment Failed: ${response.error.description}`);
         setSubmitting(false);
      });

      rzpay.open();
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to initiate payment gateway.");
      setSubmitting(false);
    }
  }, [Razorpay, user, profile, onComplete]);

  const handleManualApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFoundingMember) {
      if (!transactionId.trim()) {
        setError("Please enter a valid Transaction ID.");
        return;
      }
      if (!screenshot) {
        setError("Please upload a screenshot of your payment.");
        return;
      }
    }

    setSubmitting(true);
    setError('');

    try {
      if (!user) throw new Error("No authenticated user.");

      let paymentScreenshotUrl = '';

      if (!isFoundingMember && screenshot) {
        const fileRef = ref(storage, `payment_screenshots/${user.uid}/${Date.now()}_${screenshot.name}`);
        const metadata = { contentType: screenshot.type };
        const uploadTask = uploadBytesResumable(fileRef, screenshot, metadata);

        paymentScreenshotUrl = await new Promise<string>((resolve, reject) => {
          uploadTask.on(
            'state_changed',
            (snapshot) => {
              const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
              setUploadProgress(progress);
            },
            (error) => {
              console.error("Upload failed:", error);
              reject(new Error("Failed to upload screenshot."));
            },
            async () => {
              const url = await getDownloadURL(uploadTask.snapshot.ref);
              resolve(url);
            }
          );
        });
      }

      await addDoc(collection(db, 'payments'), {
        gateway: 'manual',
        userId: user.uid,
        amount: isFoundingMember ? 0 : fee,
        transactionId: isFoundingMember ? 'FOUNDING_WAIVED' : transactionId.trim(),
        paymentScreenshotUrl,
        status: 'pending',
        paymentStatus: 'pending',
        timestamp: new Date().toISOString(),
        userEmail: user.email,
        userName: profile.fullName || user.displayName,
      });

      await updateDoc(doc(db, 'users', user.uid), {
        membershipStatus: 'pending'
      });

      onComplete();
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Application failed. Please try again or contact support.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) {
        setError("Screenshot must be less than 5MB");
        return;
      }
      setScreenshot(file);
      setError('');
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
                Join the Ecosystem <ArrowRight size={18} />
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
                <h3 className="text-2xl font-display font-black uppercase text-white mb-2">Membership Checkout</h3>
                <p className="text-zinc-400">Secure your spot in the builder network.</p>
              </div>

              <div className="space-y-8">
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
                  <div className="space-y-4">
                    <div className="flex gap-2 p-1 bg-black/50 rounded-xl border border-white/5">
                      <button 
                        onClick={() => { setPaymentMode('razorpay'); setError(''); }}
                        className={`flex-1 py-3 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${paymentMode === 'razorpay' ? 'bg-zinc-800 text-white shadow-lg' : 'text-zinc-500 hover:text-white'}`}
                      >
                        Secure Pay
                      </button>
                      <button 
                        onClick={() => { setPaymentMode('manual'); setError(''); }}
                        className={`flex-1 py-3 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${paymentMode === 'manual' ? 'bg-zinc-800 text-white shadow-lg' : 'text-zinc-500 hover:text-white'}`}
                      >
                        Manual UPI
                      </button>
                    </div>

                    <AnimatePresence mode="wait">
                      {paymentMode === 'manual' && (
                        <motion.form
                          key="manual"
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          onSubmit={handleManualApply}
                          className="space-y-6 overflow-hidden"
                        >
                          <div className="p-5 bg-firefox-orange/5 border border-firefox-orange/20 rounded-xl mt-4">
                             <h4 className="text-firefox-orange font-bold text-sm mb-2">Payment Instructions</h4>
                             <p className="text-zinc-400 text-sm mb-4">Please scan the QR code at the club desk or use the official UPI ID. Manual verification takes 24-48 hours.</p>
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

                          <div>
                            <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-2">Payment Screenshot</label>
                            <label className="relative flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-white/10 hover:border-firefox-orange/50 rounded-xl cursor-pointer bg-black/50 transition-colors overflow-hidden group">
                              {screenshot ? (
                                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80">
                                  <ImageIcon className="text-firefox-orange mb-2" size={24} />
                                  <p className="text-xs text-zinc-300 truncate max-w-[200px] font-medium">{screenshot.name}</p>
                                  <p className="text-[10px] text-firefox-orange font-bold mt-1 uppercase tracking-wider">Click to change</p>
                                </div>
                              ) : (
                                <div className="flex flex-col items-center justify-center">
                                  <UploadCloud className="text-zinc-500 mb-2 group-hover:text-firefox-orange transition-colors" size={24} />
                                  <p className="text-xs text-zinc-400 font-medium">Upload Screenshot</p>
                                  <p className="text-[10px] text-zinc-600 mt-1 uppercase tracking-wider">JPG, PNG (Max 5MB)</p>
                                </div>
                              )}
                              <input 
                                type="file" 
                                className="hidden" 
                                accept="image/*"
                                onChange={handleFileChange}
                              />
                            </label>
                          </div>

                          {uploadProgress > 0 && uploadProgress < 100 && (
                            <div className="w-full bg-black/50 rounded-full h-2 mt-2 border border-white/5 overflow-hidden">
                              <div className="bg-firefox-orange h-full transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                            </div>
                          )}

                          <button
                            type="submit"
                            disabled={submitting}
                            className="w-full py-4 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl font-display font-black uppercase tracking-widest text-sm flex items-center justify-center gap-3 transition-all shadow-lg disabled:opacity-50"
                          >
                            {submitting ? <Loader2 size={18} className="animate-spin" /> : <UploadCloud size={18} />}
                            {submitting ? (uploadProgress > 0 && uploadProgress < 100 ? 'Uploading...' : 'Submitting...') : 'Submit Manual Verification'}
                          </button>
                        </motion.form>
                      )}
                    </AnimatePresence>
                  </div>
                )}

                {error && (
                  <p className="text-red-400 text-sm text-center bg-red-500/10 p-3 rounded-lg border border-red-500/20">{error}</p>
                )}

                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="px-6 py-4 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold transition-colors"
                    disabled={submitting}
                  >
                    Back
                  </button>

                  {(isFoundingMember || paymentMode === 'razorpay') && (
                    <button
                      type="button"
                      onClick={isFoundingMember ? handleManualApply : handleRazorpayPayment}
                      disabled={submitting}
                      className="flex-1 py-4 bg-firefox-orange hover:bg-orange-600 text-white rounded-xl font-display font-black uppercase tracking-widest text-sm flex items-center justify-center gap-3 transition-all shadow-[0_0_20px_rgba(255,106,0,0.3)] hover:shadow-[0_0_30px_rgba(255,106,0,0.5)] disabled:opacity-50 disabled:hover:shadow-none"
                    >
                      {submitting ? <Loader2 size={18} className="animate-spin" /> : <CreditCard size={18} />}
                      {submitting ? 'Processing...' : isFoundingMember ? 'Claim Free Access' : `Pay ₹${fee} Securely`}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
