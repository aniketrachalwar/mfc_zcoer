import { motion, AnimatePresence } from 'motion/react';
import { Menu, X, Rocket, Zap, Users, Code, Info, LogOut, ChevronDown, ChevronRight, LayoutDashboard, User as UserIcon, ScanLine, Sparkles, Home, Globe, BookOpen, Trophy, Calendar, ShoppingBag, MessageSquare } from 'lucide-react';
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../lib/AuthContext';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import AuthModal from './AuthModal';
import LiveNotificationBar from './LiveNotificationBar';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const [activeHash, setActiveHash] = useState(window.location.hash || '#about');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(window.location.hash === '#login');
  const { user, logout } = useAuth();
  const profileDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleJoinClick = () => {
    setIsOpen(false);
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

  const defaultNavLinks = [
    { id: '1', name: 'Home', href: '/', type: 'link', icon: 'Home', enabled: true },
    { id: '2', name: 'About', href: '/about', type: 'link', icon: 'Info', enabled: true },
    { id: '3', name: 'Blogs', href: '/blogs', type: 'link', icon: 'BookOpen', enabled: true },
    { id: '4', name: 'Leaderboard', href: '/leaderboard', type: 'link', icon: 'Trophy', enabled: true },
    { id: '5', name: 'Events', href: '/events', type: 'link', icon: 'Calendar', enabled: true },
    { id: '6', name: 'Projects', href: '/projects', type: 'link', icon: 'Rocket', enabled: true },
    { id: '7', name: 'Team', href: '/team', type: 'link', icon: 'Users', enabled: true },
    { id: '8', name: 'Community', href: '/community', type: 'link', icon: 'Zap', enabled: true },
  ];

  const IconMap: Record<string, any> = {
    'Globe': Globe,
    'Home': Home,
    'Info': Info,
    'BookOpen': BookOpen,
    'Trophy': Trophy,
    'Calendar': Calendar,
    'Rocket': Rocket,
    'Users': Users,
    'ShoppingBag': ShoppingBag,
    'Zap': Zap,
    'MessageSquare': MessageSquare,
  };

  const [navLinks, setNavLinks] = useState<any[]>(defaultNavLinks);

  useEffect(() => {
    const fetchNavLinks = async () => {
      try {
        const docSnap = await getDoc(doc(db, 'config', 'navigation'));
        if (docSnap.exists() && docSnap.data().links) {
          const links = docSnap.data().links.filter((l: any) => l.enabled !== false);
          setNavLinks(links.length > 0 ? links : defaultNavLinks);
        }
      } catch (err) {
        console.error("Failed to load navigation links", err);
      }
    };
    fetchNavLinks();
  }, []);

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
  }, [navLinks]);

  // Listen to React Router location changes for the login modal
  useEffect(() => {
    if (location.hash === '#login') {
      setIsAuthModalOpen(true);
    }
  }, [location.hash]);

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
    <nav className="fixed top-0 left-0 right-0 z-50 transition-all duration-500 overflow-x-clip tour-step-navbar pt-[env(safe-area-inset-top)] bg-transparent flex flex-col pointer-events-auto">
      <LiveNotificationBar />
      <div className={`max-w-[1920px] w-full mx-auto px-4 sm:px-6 md:px-12 flex items-center justify-between gap-3 transition-all duration-500 ${scrolled ? 'py-2 md:py-4' : 'py-2.5 md:py-8'}`}>
        
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
              className="w-10 h-10 sm:w-14 sm:h-14 md:w-20 md:h-20 object-contain relative z-10 drop-shadow-[0_0_15px_rgba(255,106,0,0.5)]" 
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

            return (
              <motion.div key={link.name} whileHover={{ y: -2, scale: 1.05 }}>
                <Link
                  to={link.href}
                  onClick={(e) => handleNavClick(e, link)}
                  className={`group relative px-4 py-2 flex items-center gap-2 rounded-full transition-all duration-300 ${link.name === 'Community' ? 'tour-step-community' : ''} ${isActive ? 'bg-firefox-orange/15 text-[#FF5C00] shadow-[0_0_15px_rgba(255,92,0,0.15)] border border-firefox-orange/20' : 'text-zinc-400 hover:bg-white/10 hover:text-white border border-transparent'}`}
                >
                  {link.icon && IconMap[link.icon] && React.createElement(IconMap[link.icon], { 
                    size: 14,
                    className: `transition-colors duration-300 ${isActive ? 'text-[#FF5C00]' : 'text-zinc-500 group-hover:text-white'}`
                  })}
                  <span className="text-[10px] font-display font-black uppercase tracking-[0.15em] pt-[1px]">{link.name}</span>
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
                className="tour-step-join hidden sm:flex px-6 sm:px-8 py-3 sm:py-4 bg-[#ff6a00] text-white rounded-full font-display font-black text-[9px] sm:text-[10px] uppercase tracking-[0.3em] sm:tracking-[0.4em] transition-all relative overflow-hidden group"
              >
                <span className="relative z-10">Join Community</span>
                <div className="absolute inset-0 bg-white translate-y-full group-hover:translate-y-0 transition-transform duration-300 opacity-10" />
              </motion.button>
            </>
          ) : (
            <div className="relative" ref={profileDropdownRef}>
              <button 
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="hidden sm:flex items-center gap-2 border border-white/10 px-4 py-2 rounded-full hover:bg-white/5 transition-colors"
              >
                <img loading="lazy" 
                  src={user.photoURL || ''} 
                  alt="Avatar" 
                  className="w-6 h-6 rounded-full border border-white/20 object-cover shrink-0"
                />
                <span className="text-[10px] font-black uppercase tracking-widest text-[#f5f5f5]">{user.displayName?.split(' ')[0]}</span>
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
                      <p className="text-[9px] font-black text-[#ff6a00] uppercase tracking-widest">MFC Portal</p>
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
        </div>
      </div>

      {/* Mobile Menu Backdrop and Bottom Sheet Drawer */}
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
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed bottom-0 left-0 right-0 max-h-[85vh] bg-[#080808]/95 backdrop-blur-3xl border-t border-white/10 z-[100] flex flex-col p-6 rounded-t-[2rem] overflow-hidden xl:hidden shadow-[0_-20px_50px_rgba(0,0,0,0.5)]"
            >
              <div className="w-12 h-1.5 bg-zinc-800 rounded-full mx-auto mb-8 shrink-0" />
              
              <div className="flex-1 overflow-y-auto scrollbar-hide pb-24">
                <div className="flex flex-col gap-5">
                  {navLinks.map((link, i) => {
                    const isAnchorActive = link.type === 'anchor' && activeHash === link.href.replace('/', '');
                    const isLinkActive = link.type === 'link' && location.pathname === link.href;
                    const isActive = isAnchorActive || (link.name === 'Home' ? isLinkActive && !activeHash && location.pathname === '/' : isLinkActive);

                    return (
                      <motion.div
                        key={link.name}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 + 0.1 }}
                      >
                        <Link
                          to={link.href}
                          onClick={(e) => handleNavClick(e, link)}
                          className={`text-lg sm:text-xl leading-none font-display font-black uppercase tracking-[0.2em] transition-colors flex items-center justify-between gap-4 group break-words py-2 ${isActive ? 'text-[#FF5C00]' : 'text-zinc-300 hover:text-white'}`}
                        >
                          <div className="flex items-center gap-4">
                            {link.icon && IconMap[link.icon] && React.createElement(IconMap[link.icon], { size: 24, className: isActive ? 'text-firefox-orange' : 'text-zinc-500 group-hover:text-white transition-colors' })}
                            <span>{link.name}</span>
                          </div>
                          <ChevronRight size={20} className={`shrink-0 transition-opacity ${isActive ? 'opacity-100 text-firefox-orange' : 'opacity-0 group-hover:opacity-100 text-zinc-600'}`} />
                        </Link>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Mobile Floating Action Pill */}
      <div className="xl:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-[110] w-max max-w-[95vw]">
        <div className="bg-zinc-950/90 backdrop-blur-2xl border border-white/10 rounded-full px-5 sm:px-6 py-2.5 sm:py-3 flex items-center justify-center gap-6 sm:gap-8 shadow-[0_10px_40px_rgba(0,0,0,0.5)]">
          <button 
            onClick={() => {
              setIsOpen(false);
              navigate('/');
            }}
            className={`shrink-0 flex flex-col items-center gap-1 transition-colors ${location.pathname === '/' && !activeHash ? 'text-firefox-orange' : 'text-zinc-400 hover:text-white'}`}
          >
            <Home size={22} />
          </button>
          
          {!user ? (
            <button 
              onClick={handleJoinClick}
              className="tour-step-join-mobile shrink-0 bg-firefox-orange text-white px-5 py-2 rounded-full text-[11px] font-black uppercase tracking-widest shadow-[0_0_20px_rgba(255,106,0,0.4)] active:scale-95 transition-all whitespace-nowrap"
            >
              Join
            </button>
          ) : (
            <button 
              onClick={handleJoinClick}
              className="shrink-0 flex flex-col items-center gap-1 transition-colors text-firefox-orange"
            >
              <img loading="lazy" src={user.photoURL || ''} alt="User" className="w-[26px] h-[26px] rounded-full border-2 border-firefox-orange shadow-[0_0_10px_rgba(255,106,0,0.3)] object-cover shrink-0" />
            </button>
          )}

          <button 
            onClick={() => setIsOpen(!isOpen)}
            className={`shrink-0 flex flex-col items-center gap-1 transition-colors ${isOpen ? 'text-firefox-orange' : 'text-zinc-400 hover:text-white'}`}
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </nav>
  );
};

export default Navbar;

