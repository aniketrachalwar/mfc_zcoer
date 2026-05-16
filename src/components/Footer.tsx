import { motion } from 'motion/react';
import { Mail, Instagram, Linkedin, Github, Twitter, Youtube } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="relative bg-zinc-950 pt-32 pb-12 px-6 overflow-hidden border-t border-white/5">
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Contact Form Link / CTA */}
        <div className="flex flex-col items-center text-center mb-40">
           <p className="text-zinc-500 font-display font-black uppercase tracking-[0.4em] text-xs mb-8">Ready to contribute?</p>
           <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-16 py-6 border-2 border-firefox-orange rounded-3xl text-white font-display font-black uppercase tracking-[0.4em] hover:bg-firefox-orange transition-all shadow-[0_0_40px_rgba(255,113,57,0.2)]"
           >
              Submit
           </motion.button>
        </div>

        {/* Social Bar */}
        <div className="flex justify-center gap-8 mb-32">
          {[
            { icon: Mail, label: 'Email', url: 'mailto:mfc@zcoer.edu.in' },
            { icon: Instagram, label: 'Instagram', url: 'https://www.instagram.com/mfc.zcoer/' },
            { icon: Youtube, label: 'Youtube', url: '#' },
            { icon: Github, label: 'Github', url: '#' },
            { icon: Linkedin, label: 'Linkedin', url: '#' },
            { icon: Twitter, label: 'X', url: '#' },
          ].map((social, i) => (
            <motion.a
                key={i}
                href={social.url}
                target={social.url !== '#' && !social.url.startsWith('mailto:') ? '_blank' : undefined}
                rel={social.url !== '#' && !social.url.startsWith('mailto:') ? 'noopener noreferrer' : undefined}
                whileHover={{ y: -5 }}
                className="text-zinc-500 hover:text-firefox-orange transition-colors"
            >
                <social.icon size={32} strokeWidth={1.5} />
            </motion.a>
          ))}
        </div>

        {/* Huge Text Backdrop */}
        <div className="relative mb-20 pointer-events-none select-none">
            <h2 className="text-[15vw] md:text-[20vw] font-display font-black leading-none uppercase tracking-[-0.05em] text-center flex justify-center items-center gap-[0.05em]">
                <span className="text-firefox-orange">FIRE</span>
                <span className="text-zinc-800">FOX</span>
            </h2>
        </div>

        {/* Legal Grid */}
        <div className="flex flex-col md:flex-row justify-between items-center pt-12 border-t border-white/5 text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 gap-6 md:gap-0">
           <div className="flex flex-col items-center md:items-start gap-4">
               <p className="text-center md:text-left">© {new Date().getFullYear()} MOZILLA FIREFOX CLUB ZCOER. ALL RIGHTS RESERVED.</p>
               <p className="text-center md:text-left text-firefox-orange/80">DEVELOPED BY ANIKET RACHALWAR</p>
           </div>
           <div className="flex gap-8 md:gap-12">
                <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
                <a href="#" className="hover:text-white transition-colors">ZCOER Pune</a>
           </div>
        </div>
      </div>

      {/* Decorative Blur */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-firefox-orange/10 blur-[120px] rounded-full z-0" />
    </footer>
  );
};

export default Footer;
