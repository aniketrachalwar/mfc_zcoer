import { motion } from 'motion/react';
import { Mail, Phone, MapPin, Send } from 'lucide-react';

const Contact = () => {
  return (
    <section id="newsletter" className="section-padding bg-white relative overflow-hidden">
      {/* Decorative Blur */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-firefox-orange/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2" />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid lg:grid-cols-2 gap-24">
          <div>
            <span className="text-firefox-orange font-bold text-xs uppercase tracking-[0.3em]">Reach Out</span>
            <h2 className="text-5xl md:text-7xl font-display font-black mt-6 mb-10 tracking-tighter text-zinc-950">Let's <span className="text-gradient">Innovate.</span></h2>
            <p className="text-zinc-500 text-xl leading-relaxed mb-12 max-w-lg">
              Have an idea, a project, or just want to chat about the open web? 
              Drop us a message and we'll get back to you within 24 hours.
            </p>

            <div className="space-y-8">
              {[
                { icon: Mail, label: "Email Us", val: "mfc@zcoer.in" },
                { icon: MapPin, label: "Visit Us", val: "Innovation Hub, A-Block, ZCOER Pune" }
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
            className="p-10 bg-zinc-50 rounded-[3rem] border border-zinc-200"
          >
            <form className="space-y-8">
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Full Name</label>
                  <input type="text" placeholder="John Doe" className="w-full bg-white border border-zinc-200 rounded-2xl px-6 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-firefox-orange/20 transition-all" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Email Address</label>
                  <input type="email" placeholder="john@example.com" className="w-full bg-white border border-zinc-200 rounded-2xl px-6 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-firefox-orange/20 transition-all" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Domain Interest</label>
                <select className="w-full bg-white border border-zinc-200 rounded-2xl px-6 py-4 text-sm focus:outline-none appearance-none">
                  <option>Technical</option>
                  <option>Design</option>
                  <option>Management</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Your Message</label>
                <textarea rows={4} placeholder="Tell us what's on your mind..." className="w-full bg-white border border-zinc-200 rounded-2xl px-6 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-firefox-orange/20 transition-all" />
              </div>
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-5 bg-zinc-950 text-white rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-zinc-800 transition-all shadow-xl shadow-black/10"
              >
                Send Message <Send size={18} />
              </motion.button>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
