/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './components/Home';
import Footer from './components/Footer';
import CommunityPage from './components/community/CommunityPage';
import Dashboard from './components/community/Dashboard';
import PublicProfile from './components/community/PublicProfile';
import { motion, useScroll, useSpring, AnimatePresence } from 'motion/react';
import { useAuth } from './lib/AuthContext';
import { LayoutDashboard, Rocket, X } from 'lucide-react';

// Shell container for common UI
const Layout = ({ children, scaleX }: { children: React.ReactNode; scaleX: any }) => {
  const { error, clearError, user } = useAuth();
  
  return (
    <div className="relative min-h-screen bg-zinc-950 text-white selection:bg-firefox-orange selection:text-white">
      {/* Progress Bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-firefox-orange to-firefox-yellow z-[100] origin-left"
        style={{ scaleX }}
      />

      <Navbar />

      {/* Error Toast */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-24 left-1/2 -translate-x-1/2 z-[100] w-full max-w-md px-4"
          >
            <div className="bg-red-500/10 border border-red-500/20 backdrop-blur-xl p-4 rounded-2xl flex items-center justify-between gap-4 shadow-2xl">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center text-red-500">
                  <Rocket size={18} className="rotate-45" />
                </div>
                <p className="text-sm font-bold text-red-100">{error}</p>
              </div>
              <button onClick={clearError} className="text-red-400 hover:text-red-600 transition-colors">
                <X size={18} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <main>
        {children}
      </main>
      
      <Footer />

      {/* Member Portal Overlay - Floating Action if logged in */}
      {user && (
        <motion.a
          href="/dashboard"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          whileHover={{ scale: 1.1 }}
          className="fixed bottom-8 right-8 w-16 h-16 bg-white/5 border border-white/10 backdrop-blur-md text-white rounded-full flex items-center justify-center shadow-2xl z-50 group overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-tr from-firefox-orange to-firefox-yellow opacity-0 group-hover:opacity-20 transition-opacity" />
          <LayoutDashboard size={24} className="relative z-10" />
        </motion.a>
      )}
    </div>
  );
};

export default function App() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  return (
    <Router>
      <Layout scaleX={scaleX}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/community" element={<CommunityPage />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile/:username" element={<PublicProfile />} />
        </Routes>
      </Layout>
    </Router>
  );
}

