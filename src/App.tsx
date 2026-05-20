/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './components/Home';
import Footer from './components/Footer';
import Projects from './components/Projects';
import CommunityPage from './components/community/CommunityPage';
import Dashboard from './components/community/Dashboard';
import PublicProfile from './components/community/PublicProfile';
import VerifyProfile from './components/community/VerifyProfile';
import EventDetails from './components/events/EventDetails';
import EventsPage from './components/events/EventsPage';
import { MemberProfilePage } from './components/progression';
import AdminLayout from './components/admin/AdminLayout';
import AdminDashboard from './components/admin/AdminDashboard';
import MembersManager from './components/admin/MembersManager';
import ContributionsManager from './components/admin/ContributionsManager';
import EventsManager from './components/admin/EventsManager';
import ProjectsManager from './components/admin/ProjectsManager';
import MerchandiseManager from './components/admin/MerchandiseManager';
import NotificationsManager from './components/admin/NotificationsManager';
import TeamManager from './components/admin/TeamManager';
import BlogsManager from './components/admin/BlogsManager';
import SettingsManager from './components/admin/SettingsManager';
import ApplicationsManager from './components/admin/ApplicationsManager';
import BlogsPage from './components/blogs/BlogsPage';
import BlogDetails from './components/blogs/BlogDetails';
import WriteBlog from './components/blogs/WriteBlog';
import { motion, useScroll, useSpring, AnimatePresence } from 'motion/react';
import { useAuth } from './lib/AuthContext';
import { LayoutDashboard, Rocket, X } from 'lucide-react';

// Scroll Handler to fix scroll on route change and hash navigation
const ScrollHandler = () => {
  const { pathname, hash } = useLocation();

  React.useEffect(() => {
    if (hash) {
      const id = hash.replace('#', '');
      let attempts = 0;
      const interval = setInterval(() => {
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
          clearInterval(interval);
        }
        attempts++;
        if (attempts > 10) clearInterval(interval); // give up after 1s
      }, 100);
    } else {
      window.scrollTo(0, 0);
    }
  }, [pathname, hash]);

  return null;
};

// Shell container for common UI
const Layout = ({ children, scaleX }: { children: React.ReactNode; scaleX: any }) => {
  const { error, success, clearError, clearSuccess, user } = useAuth();
  
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

      {/* Success Toast */}
      <AnimatePresence>
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-24 left-1/2 -translate-x-1/2 z-[100] w-full max-w-md px-4"
          >
            <div className="bg-green-500/10 border border-green-500/20 backdrop-blur-xl p-4 rounded-2xl flex items-center justify-between gap-4 shadow-2xl">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center text-green-500">
                  <Rocket size={18} />
                </div>
                <p className="text-sm font-bold text-green-100">{success}</p>
              </div>
              <button onClick={clearSuccess} className="text-green-400 hover:text-green-600 transition-colors">
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
        <Link to="/dashboard" className="fixed bottom-8 right-8 z-50 block">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            whileHover={{ scale: 1.1 }}
            className="w-16 h-16 bg-white/5 border border-white/10 backdrop-blur-md text-white rounded-full flex items-center justify-center shadow-2xl group overflow-hidden relative"
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-firefox-orange to-firefox-yellow opacity-0 group-hover:opacity-20 transition-opacity" />
            <LayoutDashboard size={24} className="relative z-10" />
          </motion.div>
        </Link>
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
      <ScrollHandler />
      <Layout scaleX={scaleX}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/community" element={<CommunityPage />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<MemberProfilePage />} />
          <Route path="/profile/:username" element={<PublicProfile />} />
          <Route path="/events" element={<EventsPage />} />
          <Route path="/event/:id" element={<EventDetails />} />
          <Route path="/verify" element={<VerifyProfile />} />
          <Route path="/verify/:username" element={<VerifyProfile />} />
          <Route path="/blogs" element={<BlogsPage />} />
          <Route path="/blog/:id" element={<BlogDetails />} />
          <Route path="/write-blog" element={<WriteBlog />} />
          <Route path="/edit-blog/:id" element={<WriteBlog />} />
          
          {/* Admin Routes */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="members" element={<MembersManager />} />
            <Route path="contributions" element={<ContributionsManager />} />
            <Route path="events" element={<EventsManager />} />
            <Route path="projects" element={<ProjectsManager />} />
            <Route path="merch" element={<MerchandiseManager />} />
            <Route path="notifications" element={<NotificationsManager />} />
            <Route path="team" element={<TeamManager />} />
            <Route path="blogs" element={<BlogsManager />} />
            <Route path="settings" element={<SettingsManager />} />
            <Route path="applications" element={<ApplicationsManager />} />
          </Route>
        </Routes>
      </Layout>
    </Router>
  );
}
