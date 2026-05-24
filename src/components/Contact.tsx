import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, MapPin, Send, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: 'General Inquiry',
    message: ''
  });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return;
    
    setStatus('loading');
    try {
      await addDoc(collection(db, 'contacts'), {
        ...formData,
        createdAt: new Date().toISOString()
      });
      setStatus('success');
      setFormData({ name: '', email: '', subject: 'General Inquiry', message: '' });
      setTimeout(() => setStatus('idle'), 4000);
    } catch (error) {
      console.error("Error sending message:", error);
      setStatus('error');
      setTimeout(() => setStatus('idle'), 4000);
    }
  };

  return (
    <section id="contact" className="section-padding bg-white relative overflow-hidden">
      {/* Decorative Blur */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-firefox-orange/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2" />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-24">
          <div>
            <span className="text-firefox-orange font-bold text-xs uppercase tracking-[0.3em]">Reach Out</span>
            <h2 className="text-3xl sm:text-5xl md:text-7xl font-display font-black mt-4 sm:mt-6 mb-6 sm:mb-10 tracking-tighter text-zinc-950">Let's <span className="text-gradient">Connect.</span></h2>
            <p className="text-zinc-500 text-base sm:text-xl leading-relaxed mb-6 sm:mb-12 max-w-lg">
              Have a question, a project idea, or just want to chat about the open web? 
              Drop us a message and we'll get back to you within 24 hours.
            </p>

            <div className="space-y-6 sm:space-y-8">
              {[
                { icon: Mail, label: "Email Us", val: "mfc@zcoer.edu.in" },
                { icon: MapPin, label: "Visit Us", val: "DBMSL LAB 3rd Floor, D-Block, ZCOER Pune" }
              ].map((item, i) => (
                <motion.div 
                  key={i} 
                  whileHover={{ x: 10 }}
                  className="flex items-center gap-6 group cursor-pointer"
                >
                  <div className="w-14 h-14 rounded-2xl bg-zinc-50 border border-zinc-100 flex items-center justify-center text-zinc-400 group-hover:bg-zinc-950 group-hover:text-white transition-all duration-300">
                    <item.icon size={24} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">{item.label}</p>
                    <p className="text-lg font-bold text-zinc-900">{item.val}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="p-6 sm:p-10 bg-zinc-50 rounded-2xl sm:rounded-[3rem] border border-zinc-200 shadow-sm"
          >
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Full Name</label>
                  <input 
                    required
                    type="text" 
                    placeholder="John Doe" 
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({...prev, name: e.target.value}))}
                    className="w-full bg-white border border-zinc-200 rounded-2xl px-6 py-4 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-firefox-orange/20 transition-all" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Email Address</label>
                  <input 
                    required
                    type="email" 
                    placeholder="john@example.com" 
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({...prev, email: e.target.value}))}
                    className="w-full bg-white border border-zinc-200 rounded-2xl px-6 py-4 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-firefox-orange/20 transition-all" 
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Subject</label>
                <select 
                  value={formData.subject}
                  onChange={(e) => setFormData(prev => ({...prev, subject: e.target.value}))}
                  className="w-full bg-white border border-zinc-200 rounded-2xl px-6 py-4 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-firefox-orange/20 transition-all cursor-pointer"
                >
                  <option className="text-zinc-900" value="General Inquiry">General Inquiry</option>
                  <option className="text-zinc-900" value="Project Proposal">Project Proposal</option>
                  <option className="text-zinc-900" value="Partnership">Partnership</option>
                  <option className="text-zinc-900" value="Feedback">Feedback</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Your Message</label>
                <textarea 
                  required
                  rows={4} 
                  placeholder="Tell us what's on your mind..." 
                  value={formData.message}
                  onChange={(e) => setFormData(prev => ({...prev, message: e.target.value}))}
                  className="w-full bg-white border border-zinc-200 rounded-2xl px-6 py-4 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-firefox-orange/20 transition-all resize-none" 
                />
              </div>

              <AnimatePresence mode="wait">
                {status === 'error' && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }} 
                    animate={{ opacity: 1, height: 'auto' }} 
                    exit={{ opacity: 0, height: 0 }} 
                    className="text-red-500 text-sm font-medium flex items-center gap-2"
                  >
                    <AlertCircle size={16} /> Failed to send message. Please try again.
                  </motion.div>
                )}
                {status === 'success' && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }} 
                    animate={{ opacity: 1, height: 'auto' }} 
                    exit={{ opacity: 0, height: 0 }} 
                    className="text-green-500 text-sm font-medium flex items-center gap-2"
                  >
                    <CheckCircle2 size={16} /> Message sent successfully! We'll reach out soon.
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={status === 'loading' || status === 'success'}
                type="submit"
                className="w-full py-3.5 sm:py-5 bg-zinc-950 text-white rounded-xl sm:rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-zinc-800 transition-all shadow-xl shadow-black/10 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {status === 'loading' ? (
                  <><Loader2 size={18} className="animate-spin" /> Sending...</>
                ) : status === 'success' ? (
                  <><CheckCircle2 size={18} /> Sent Successfully</>
                ) : (
                  <>Send Message <Send size={18} /></>
                )}
              </motion.button>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
