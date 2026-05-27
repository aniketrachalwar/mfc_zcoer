import React, { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, doc, getDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { motion, AnimatePresence } from 'motion/react';
import { Package, ShoppingBag, Sparkles, X, CheckCircle2, Copy, Shield, Loader2, MapPin } from 'lucide-react';
import { useAuth } from '../../lib/AuthContext';

const ShopPage = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Checkout State
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [upiId, setUpiId] = useState('mfc.zcoer@upi');
  const [copied, setCopied] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({
    fullName: user?.displayName || '',
    phone: '',
    transactionId: ''
  });

  useEffect(() => {
    const fetchProductsAndSettings = async () => {
      try {
        const snap = await getDocs(collection(db, 'merchandise'));
        const list = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setProducts(list);

        const settingsSnap = await getDoc(doc(db, 'settings', 'membership'));
        if (settingsSnap.exists() && settingsSnap.data().upiId) {
          setUpiId(settingsSnap.data().upiId);
        }
      } catch (err) {
        console.error("Error fetching shop data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProductsAndSettings();
  }, []);

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;
    setIsSubmitting(true);

    try {
      await addDoc(collection(db, 'orders'), {
        productId: selectedProduct.id,
        productName: selectedProduct.name,
        price: selectedProduct.price,
        customerName: formData.fullName,
        customerPhone: formData.phone,
        transactionId: formData.transactionId,
        userId: user?.uid || 'guest',
        status: 'pending',
        timestamp: new Date().toISOString(),
        pickupLocation: 'DBMSL Lab, 3rd Floor, D - Block, ZCOER, Pune'
      });
      setSuccess(true);
    } catch (err) {
      console.error("Error submitting order:", err);
      alert("Failed to submit order. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const closeCheckout = () => {
    setSelectedProduct(null);
    setSuccess(false);
    setFormData(prev => ({ ...prev, transactionId: '' }));
  };

  return (
    <div className="pt-32 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto min-h-screen">
      <div className="text-center mb-16 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-firefox-orange/20 blur-[120px] rounded-full pointer-events-none" />
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-firefox-orange/10 border border-firefox-orange/20 text-firefox-orange text-xs font-black uppercase tracking-widest mb-6">
          <Sparkles size={14} /> Exclusive Gear
        </div>
        <h1 className="text-5xl md:text-7xl font-display font-black uppercase tracking-tight text-white mb-6">
          MFC <span className="text-firefox-orange">Shop</span>
        </h1>
        <p className="text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto">
          Official merchandise, hardware kits, and exclusive gear for builders.
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-12 h-12 border-4 border-firefox-orange border-t-transparent rounded-full animate-spin" />
        </div>
      ) : products.length === 0 ? (
        <div className="bg-white/5 border border-white/10 rounded-3xl p-16 text-center max-w-2xl mx-auto">
          <div className="w-20 h-20 bg-white/5 border border-white/10 rounded-full flex items-center justify-center mx-auto mb-6 text-zinc-500">
            <Package size={32} />
          </div>
          <h3 className="text-2xl font-display font-black text-white mb-4">Coming Soon</h3>
          <p className="text-zinc-400">Our new collection of merchandise and kits is dropping very soon. Stay tuned!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((product, i) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="group bg-zinc-900/50 border border-white/10 hover:border-firefox-orange/30 rounded-3xl overflow-hidden transition-all duration-300 hover:shadow-[0_0_40px_rgba(255,92,0,0.1)] flex flex-col"
            >
              <div className="relative h-64 bg-black/50 p-6 flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 to-transparent z-10" />
                {product.image ? (
                  <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                ) : (
                  <Package size={64} className="text-zinc-800" />
                )}
                <div className="absolute top-4 left-4 z-20">
                  <span className="px-3 py-1 bg-black/50 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-widest text-firefox-orange border border-firefox-orange/20">
                    {product.category || 'Gear'}
                  </span>
                </div>
              </div>
              
              <div className="p-8 flex-1 flex flex-col relative z-20 -mt-10 bg-zinc-900/90 backdrop-blur-xl border-t border-white/5">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-display font-black text-white">{product.name}</h3>
                  <span className="text-xl font-black text-firefox-orange shrink-0 ml-4">₹{product.price}</span>
                </div>
                
                <p className="text-zinc-400 text-sm leading-relaxed flex-1 mb-8">
                  {product.description}
                </p>
                
                <button 
                  onClick={() => setSelectedProduct(product)}
                  disabled={product.stock <= 0}
                  className="w-full py-4 bg-white/5 hover:bg-firefox-orange/10 text-white hover:text-firefox-orange border border-white/10 hover:border-firefox-orange/30 rounded-xl font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ShoppingBag size={16} />
                  {product.stock > 0 ? 'Purchase Now' : 'Out of Stock'}
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Checkout Modal */}
      <AnimatePresence>
        {selectedProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
              onClick={closeCheckout}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-zinc-950 border border-white/10 rounded-3xl w-full max-w-xl relative z-10 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              {success ? (
                <div className="p-12 text-center">
                  <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2 size={40} className="text-green-500" />
                  </div>
                  <h3 className="text-3xl font-display font-black uppercase text-white mb-4">Order Placed!</h3>
                  <p className="text-zinc-400 mb-8">
                    Your payment details have been submitted for verification. You will receive an update shortly.
                  </p>
                  
                  <div className="bg-white/5 border border-white/10 p-4 rounded-xl mb-8 flex items-start gap-3 text-left">
                    <MapPin size={24} className="text-firefox-orange shrink-0 mt-1" />
                    <div>
                      <h4 className="text-white font-bold mb-1">Mandatory Pickup Location</h4>
                      <p className="text-zinc-400 text-sm">DBMSL Lab, 3rd Floor, D - Block, ZCOER, Pune</p>
                    </div>
                  </div>

                  <button
                    onClick={closeCheckout}
                    className="px-8 py-4 bg-white/10 hover:bg-white/20 text-white rounded-xl font-bold uppercase tracking-widest text-xs transition-colors"
                  >
                    Continue Shopping
                  </button>
                </div>
              ) : (
                <>
                  <div className="p-6 border-b border-white/10 flex justify-between items-center shrink-0 bg-black/20">
                    <h2 className="text-xl font-display font-black uppercase text-white">Checkout</h2>
                    <button onClick={closeCheckout} className="text-zinc-500 hover:text-white transition-colors">
                      <X size={20} />
                    </button>
                  </div>
                  
                  <div className="p-6 overflow-y-auto flex-1">
                    <div className="flex gap-4 mb-8 bg-white/5 p-4 rounded-2xl border border-white/10">
                      <div className="w-20 h-20 bg-black/50 rounded-xl overflow-hidden shrink-0">
                        {selectedProduct.image ? (
                           <img src={selectedProduct.image} alt={selectedProduct.name} className="w-full h-full object-cover" />
                        ) : (
                           <div className="w-full h-full flex items-center justify-center"><Package size={24} className="text-zinc-700"/></div>
                        )}
                      </div>
                      <div className="flex-1 flex flex-col justify-center">
                        <h3 className="text-lg font-bold text-white mb-1">{selectedProduct.name}</h3>
                        <p className="text-firefox-orange font-black text-xl">₹{selectedProduct.price}</p>
                      </div>
                    </div>

                    <div className="p-5 bg-firefox-orange/5 border border-firefox-orange/20 rounded-xl mb-8">
                      <h4 className="text-firefox-orange font-bold text-sm mb-2">UPI Payment Instructions</h4>
                      <p className="text-zinc-400 text-sm mb-4">Transfer exactly <strong>₹{selectedProduct.price}</strong> to the official UPI ID.</p>
                      <div className="flex items-center justify-between bg-black/50 p-3 rounded-lg border border-white/5">
                        <div className="font-mono text-white tracking-wider text-lg sm:text-xl truncate">{upiId}</div>
                        <button 
                          onClick={() => {
                            navigator.clipboard.writeText(upiId);
                            setCopied(true);
                            setTimeout(() => setCopied(false), 2000);
                          }}
                          className="ml-2 shrink-0 p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-zinc-400 hover:text-white"
                        >
                          {copied ? <CheckCircle2 size={18} className="text-green-400" /> : <Copy size={18} />}
                        </button>
                      </div>
                    </div>

                    <form id="checkout-form" onSubmit={handleCheckout} className="space-y-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Full Name</label>
                        <input 
                          type="text" 
                          required 
                          value={formData.fullName}
                          onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                          className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-firefox-orange outline-none" 
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Phone Number</label>
                        <input 
                          type="tel" 
                          required 
                          value={formData.phone}
                          onChange={(e) => setFormData({...formData, phone: e.target.value})}
                          className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-firefox-orange outline-none" 
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Transaction ID / UTR</label>
                        <input 
                          type="text" 
                          required 
                          placeholder="12-digit UTR number"
                          value={formData.transactionId}
                          onChange={(e) => setFormData({...formData, transactionId: e.target.value})}
                          className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm font-mono tracking-widest text-white focus:border-firefox-orange outline-none" 
                        />
                      </div>
                      
                      <div className="bg-yellow-500/10 border border-yellow-500/20 p-4 rounded-xl flex items-start gap-3">
                        <MapPin size={20} className="text-yellow-500 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-yellow-500 font-bold text-sm mb-1">Mandatory College Pickup</p>
                          <p className="text-yellow-500/80 text-xs leading-relaxed">
                            By placing this order, you agree to pick up your item from: <br/>
                            <strong className="text-yellow-500">DBMSL Lab, 3rd Floor, D - Block, ZCOER, Pune</strong>
                          </p>
                        </div>
                      </div>
                    </form>
                  </div>
                  
                  <div className="p-6 border-t border-white/10 shrink-0 flex gap-4 bg-black/20">
                    <button 
                      onClick={closeCheckout} 
                      className="px-6 py-4 bg-white/5 text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-white/10 transition-colors"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={(e) => {
                        const form = document.getElementById('checkout-form') as HTMLFormElement;
                        if (form.checkValidity()) handleCheckout(e as any);
                        else form.reportValidity();
                      }}
                      disabled={isSubmitting}
                      className="flex-1 px-4 py-4 bg-firefox-orange text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-orange-600 transition-colors shadow-[0_0_20px_rgba(255,92,0,0.3)] flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Shield size={16} />}
                      {isSubmitting ? 'Verifying...' : 'Submit Payment Info'}
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ShopPage;
