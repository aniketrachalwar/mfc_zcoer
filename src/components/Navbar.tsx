import { motion, AnimatePresence } from 'motion/react';
import { Menu, X, Rocket, Zap, Users, Code, Info, LogOut, ChevronDown, ChevronRight, LayoutDashboard, User as UserIcon, ScanLine, Sparkles } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { useAuth } from '../lib/AuthContext';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import AuthModal from './AuthModal';
import LiveNotificationBar from './LiveNotificationBar';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const [activeHash, setActiveHash] = useState(window.location.hash || '#about');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const { user, logout } = useAuth();

  const handleJoinClick = () => {
    if (user) {
      navigate('/dashboard');
    } else {
      setIsAuthModalOpen(true);
    }
  };

  const handleNavClick = (e: React.MouseEvent, link: any) => {
    setIsOpen(false);
    if (link.type === 'anchor' && location.pathname === '/') {
      e.preventDefault();
      const id = link.href.replace('/#', '');
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
        window.history.pushState(null, '', link.href);
        setActiveHash(`#${id}`);
      }
    }
  };

  const navLinks = [
    { name: 'Home', href: '/', type: 'link' },
    { name: 'About', href: '/about', type: 'link' },
    { name: 'Blogs', href: '/blogs', type: 'link' },
    { name: 'Leaderboard', href: '/leaderboard', type: 'link' },
    { name: 'Events', href: '/events', type: 'link' },
    { name: 'Projects', href: '/projects', type: 'link' },
    { name: 'Team', href: '/team', type: 'link' },
    { name: 'Community', href: '/community', type: 'link' }
  ];

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    const handleHashChange = () => setActiveHash(window.location.hash);

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('hashchange', handleHashChange);

    // Intersection Observer to update active hash on scroll
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveHash(`#${entry.target.id}`);
          }
        });
      },
      { threshold: 0.3 }
    );

    navLinks.forEach((link) => {
      if (link.type === 'anchor') {
        const id = link.href.replace('/#', '');
        const el = document.getElementById(id);
        if (el) observer.observe(el);
      }
    });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('hashchange', handleHashChange);
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const Bracket = ({ position }: { position: 'tl' | 'tr' | 'bl' | 'br' }) => {
    const styles = {
      tl: 'top-0 left-0 border-t border-l',
      tr: 'top-0 right-0 border-t border-r',
      bl: 'bottom-0 left-0 border-b border-l',
      br: 'bottom-0 right-0 border-b border-r',
    };
    return <div className={`absolute w-2 h-2 border-white/40 ${styles[position]}`} />;
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 overflow-x-clip ${scrolled ? 'glass-nav flex flex-col' : 'bg-transparent flex flex-col'}`}>
      <LiveNotificationBar />
      <div className={`max-w-[1920px] w-full mx-auto px-4 sm:px-6 md:px-12 flex items-center justify-between gap-3 transition-all duration-500 ${scrolled ? 'py-3 md:py-4' : 'py-4 md:py-8'}`}>
        
        {/* Logo Section */}
        <Link to="/" className="flex items-center gap-4 group cursor-pointer">
          <motion.div
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="relative"
          >
            <div className="absolute inset-0 bg-firefox-orange/20 blur-xl rounded-full scale-150 animate-pulse" />
            <img loading="lazy" 
              src="https://res.cloudinary.com/diyulegc1/image/upload/v1778406665/logo-removebg-preview_b9u9z8.png" 
              alt="MFC Logo" 
              className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 object-contain relative z-10 drop-shadow-[0_0_15px_rgba(255,106,0,0.5)]" 
            />
          </motion.div>
          <div className="hidden lg:flex flex-col gap-0 text-left">
            <span className="font-display font-black text-xs tracking-[0.3em] uppercase text-zinc-400 group-hover:text-white transition-colors text-left"></span>
            <span className="font-display font-black text-lg tracking-tighter uppercase text-white -mt-1 text-left"></span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden xl:flex items-center gap-4">
          {navLinks.map((link) => {
            const isAnchorActive = link.type === 'anchor' && activeHash === link.href.replace('/', '');
            const isLinkActive = link.type === 'link' && location.pathname === link.href;
            const isActive = isAnchorActive || (link.name === 'Home' ? isLinkActive && !activeHash && location.pathname === '/' : isLinkActive);

            const content = (
              <>
                {isActive && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-12 h-12 glow-orb animate-pulse-glow" />
                    <div className="absolute inset-x-2 inset-y-1">
                      <Bracket position="tl" />
                      <Bracket position="tr" />
                      <Bracket position="bl" />
                      <Bracket position="br" />
                    </div>
                  </div>
                )}
                <span className="relative z-10">{link.name}</span>
              </>
            );



            return (
              <motion.div key={link.name} whileHover={{ y: -2 }}>
                <Link
                  to={link.href}
                  onClick={(e) => handleNavClick(e, link)}
                  className={`relative px-6 py-3 text-[11px] font-display font-black uppercase tracking-[0.2em] transition-all duration-300 ${isActive ? 'text-[#FF5C00]' : 'text-zinc-400 hover:text-white hover:drop-shadow-[0_0_10px_rgba(255,106,0,0.3)]'}`}
                >
                  {content}
                </Link>
              </motion.div>
            );
          })}
        </div>

        {/* CTA Section */}
        <div className="flex items-center gap-2 sm:gap-4 md:gap-6">
          {!user ? (
            <>
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: '0 0 30px rgba(255, 106, 0, 0.4)' }}
                whileTap={{ scale: 0.95 }}
                onClick={handleJoinClick}
                className="hidden md:flex px-10 py-5 bg-[#ff6a00] text-white rounded-none font-display font-black text-[10px] uppercase tracking-[0.4em] transition-all relative overflow-hidden group"
              >
                <span className="relative z-10">Join Community</span>
                <div className="absolute inset-0 bg-white translate-y-full group-hover:translate-y-0 transition-transform duration-300 opacity-10" />
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleJoinClick}
                className="md:hidden h-10 px-4 bg-[#ff6a00] text-white rounded-full font-display font-black text-[10px] uppercase tracking-[0.16em] shadow-[0_0_18px_rgba(255,106,0,0.25)]"
              >
                Join
              </motion.button>
            </>
          ) : (
            <div className="relative">
              <button 
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-2 border border-white/10 px-4 py-2 rounded-full hover:bg-white/5 transition-colors"
              >
                <img loading="lazy" 
                  src={user.photoURL || ''} 
                  alt="Avatar" 
                  className="w-6 h-6 rounded-full border border-white/20"
                />
                <span className="text-[10px] font-black uppercase tracking-widest text-[#f5f5f5] hidden lg:block">{user.displayName?.split(' ')[0]}</span>
                <ChevronDown size={14} className={`transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {isProfileOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-2 w-56 glass rounded-2xl p-2 shadow-2xl border border-white/5"
                  >
                    <div className="p-3 border-b border-white/5 mb-1">
                      <p className="text-[9px] font-black text-[#ff6a00] uppercase tracking-widest">MFCZ Portal</p>
                      <p className="text-[10px] font-semibold truncate text-[#f5f5f5]">{user.email}</p>
                    </div>
                    
                    <Link 
                      to="/dashboard"
                      onClick={() => setIsProfileOpen(false)}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-zinc-300 hover:bg-white/5 transition-colors text-[10px] uppercase font-black tracking-widest"
                    >
                      <LayoutDashboard size={16} />
                      Dashboard
                    </Link>

                    <Link 
                      to="/verify"
                      onClick={() => setIsProfileOpen(false)}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-zinc-300 hover:bg-white/5 transition-colors text-[10px] uppercase font-black tracking-widest"
                    >
                      <ScanLine size={16} />
                      Scanner
                    </Link>

                    <Link 
                      to="/dashboard#membership"
                      onClick={() => setIsProfileOpen(false)}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[#ff6a00] hover:bg-white/5 transition-colors text-[10px] uppercase font-black tracking-widest"
                    >
                      <Sparkles size={16} />
                      Upgrade Tier
                    </Link>

                    <button 
                      onClick={() => { logout(); setIsProfileOpen(false); }}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-400/10 transition-colors text-[10px] uppercase font-black tracking-widest"
                    >
                      <LogOut size={16} />
                      Logout
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          <button 
            onClick={() => setIsOpen(!isOpen)}
            className="xl:hidden w-11 h-11 sm:w-12 sm:h-12 flex shrink-0 items-center justify-center text-white"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Backdrop and Drawer */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-md z-[90] xl:hidden"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: "spring", bounce: 0, duration: 0.4 }}
              className="fixed top-0 right-0 w-[85vw] max-w-md h-dvh bg-[#080808] border-l border-white/10 z-[100] flex flex-col p-6 sm:p-8 pt-24 overflow-y-auto xl:hidden shadow-2xl"
            >
              <div className="flex flex-col gap-6 sm:gap-8">
                {navLinks.map((link, i) => {
                  const isAnchorActive = link.type === 'anchor' && activeHash === link.href.replace('/', '');
                  const isLinkActive = link.type === 'link' && location.pathname === link.href;
                  const isActive = isAnchorActive || (link.name === 'Home' ? isLinkActive && !activeHash && location.pathname === '/' : isLinkActive);

                  return (
                    <motion.div
                      key={link.name}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                    >
                      <Link
                        to={link.href}
                        onClick={(e) => handleNavClick(e, link)}
                        className={`text-2xl sm:text-3xl leading-tight font-display font-black uppercase tracking-tight transition-colors flex items-center justify-between gap-4 group break-words min-h-[44px] ${isActive ? 'text-[#FF5C00]' : 'text-white hover:text-[#FF5C00]'}`}
                      >
                        {link.name}
                        <ChevronRight size={24} className={`shrink-0 transition-opacity ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`} />
                      </Link>
                    </motion.div>
                  );
                })}
                {!user ? (
                  <motion.button
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    onClick={handleJoinClick}
                    className="mt-4 sm:mt-8 w-full py-5 bg-[#ff6a00] text-white font-display font-black uppercase tracking-[0.2em] rounded-xl shadow-[0_0_20px_rgba(255,106,0,0.3)] min-h-[44px]"
                  >
                    Join Community
                  </motion.button>
                ) : (
                  <motion.div
                     initial={{ opacity: 0, y: 10 }}
                     animate={{ opacity: 1, y: 0 }}
                     transition={{ delay: 0.4 }}
                  >
                    <Link
                      to="/dashboard"
                      onClick={() => setIsOpen(false)}
                      className="mt-4 sm:mt-8 w-full py-5 bg-white/5 border border-white/10 text-white font-display font-black uppercase tracking-[0.2em] rounded-xl flex items-center justify-center gap-3 hover:bg-white/10 transition-colors min-h-[44px]"
                    >
                      <LayoutDashboard size={20} />
                      Dashboard
                    </Link>
                  </motion.div>
                )}
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="absolute top-6 right-6 w-12 h-12 rounded-full border border-white/10 flex items-center justify-center text-zinc-400 hover:text-white hover:border-white/30 transition-all min-h-[44px]"
              >
                <X size={24} />
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </nav>
  );
};

export default Navbar;

