/**
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './components/Home';
import Footer from './components/Footer';
import ErrorBoundary from './components/ErrorBoundary';
import NotFound from './components/NotFound';
import EcosystemTour from './components/EcosystemTour';
import InstallPwaBanner from './components/InstallPwaBanner';

// Lazy loaded components
const About = React.lazy(() => import('./components/About'));
const Projects = React.lazy(() => import('./components/Projects'));
const TeamPage = React.lazy(() => import('./components/TeamPage'));
const CommunityPage = React.lazy(() => import('./components/community/CommunityPage'));
const DashboardLayout = React.lazy(() => import('./components/community/DashboardLayout'));
const DashboardOverview = React.lazy(() => import('./components/community/DashboardOverview'));
const MembershipApply = React.lazy(() => import('./components/membership/MembershipApply'));
const ProfileCard = React.lazy(() => import('./components/community/ProfileCard'));
const ProfileForm = React.lazy(() => import('./components/community/ProfileForm'));
const PublicProfile = React.lazy(() => import('./components/community/PublicProfile'));
const VerifyProfile = React.lazy(() => import('./components/community/VerifyProfile'));
const EventDetails = React.lazy(() => import('./components/events/EventDetails'));
const EventsPage = React.lazy(() => import('./components/events/EventsPage'));
const MemberProfilePage = React.lazy(() => import('./components/progression').then(m => ({ default: m.MemberProfilePage })));
const AdminLayout = React.lazy(() => import('./components/admin/AdminLayout'));
const AdminDashboard = React.lazy(() => import('./components/admin/AdminDashboard'));
const MembersManager = React.lazy(() => import('./components/admin/MembersManager'));
const ContributionsManager = React.lazy(() => import('./components/admin/ContributionsManager'));
const EventsManager = React.lazy(() => import('./components/admin/EventsManager'));
const ProjectsManager = React.lazy(() => import('./components/admin/ProjectsManager'));
const MerchandiseManager = React.lazy(() => import('./components/admin/MerchandiseManager'));
const NotificationsManager = React.lazy(() => import('./components/admin/NotificationsManager'));
const TeamManager = React.lazy(() => import('./components/admin/TeamManager'));
const BlogsManager = React.lazy(() => import('./components/admin/BlogsManager'));
const SettingsManager = React.lazy(() => import('./components/admin/SettingsManager'));
const ApplicationsManager = React.lazy(() => import('./components/admin/ApplicationsManager'));
const AboutManager = React.lazy(() => import('./components/admin/AboutManager'));
const AdminAccessManager = React.lazy(() => import('./components/admin/AdminAccessManager'));

const BlogsPage = React.lazy(() => import('./components/blogs/BlogsPage'));
const BlogDetails = React.lazy(() => import('./components/blogs/BlogDetails'));
const WriteBlog = React.lazy(() => import('./components/blogs/WriteBlog'));
const CouponManager = React.lazy(() => import('./components/admin/CouponManager'));
const MembersDashboardManager = React.lazy(() => import('./components/admin/MembersDashboardManager'));
const WorkshopProposalsManager = React.lazy(() => import('./components/admin/WorkshopProposalsManager'));

const RunningProjects = React.lazy(() => import('./components/student/RunningProjects'));
const PurchasedItems = React.lazy(() => import('./components/student/PurchasedItems'));
const MembershipHistory = React.lazy(() => import('./components/student/MembershipHistory'));

// Leaderboard will be lazy loaded
const LeaderboardPage = React.lazy(() => import('./components/leaderboard/LeaderboardPage'));

const PageLoader = () => (
  <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
    <div className="w-12 h-12 border-4 border-firefox-orange border-t-transparent rounded-full animate-spin" />
  </div>
);

import { motion, useScroll, useSpring, AnimatePresence } from 'motion/react';
import { useAuth } from './lib/AuthContext';
import { LayoutDashboard, Rocket, X } from 'lucide-react';
import { HelmetProvider } from 'react-helmet-async';
import { analytics } from './lib/firebase';
import { logEvent } from 'firebase/analytics';

// Scroll Handler to fix scroll on route change and hash navigation
const ScrollHandler = () => {
  const { pathname, hash } = useLocation();

  React.useEffect(() => {
    if (hash) {
      const id = hash.replace('#', '');
      
      const scrollToElement = () => {
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
          return true;
        }
        return false;
      };

      if (!scrollToElement()) {
        const observer = new MutationObserver(() => {
          if (scrollToElement()) {
            observer.disconnect();
          }
        });
        
        observer.observe(document.body, {
          childList: true,
          subtree: true,
        });

        // Cleanup observer after 5 seconds if element is never found
        const timeout = setTimeout(() => observer.disconnect(), 5000);
        
        return () => {
          observer.disconnect();
          clearTimeout(timeout);
        };
      }
    } else {
      window.scrollTo(0, 0);
    }
  }, [pathname, hash]);

  return null;
};

// Route Tracker for Analytics
const RouteTracker = () => {
  const location = useLocation();

  React.useEffect(() => {
    const trackPageView = async () => {
      const analyticsInstance = await analytics;
      if (analyticsInstance) {
        logEvent(analyticsInstance, 'page_view', {
          page_path: location.pathname + location.search,
        });
      }
    };
    trackPageView();
  }, [location]);

  return null;
};

// Shell container for common UI
const Layout = ({ children, scaleX }: { children: React.ReactNode; scaleX: any }) => {
  const { error, success, clearError, clearSuccess, user } = useAuth();
  const location = useLocation();
  
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
      
      <EcosystemTour />
      <InstallPwaBanner />

      {/* Member Portal Overlay - Floating Action if logged in */}
      {user && !location.pathname.startsWith('/dashboard') && !location.pathname.startsWith('/admin') && (
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
    <HelmetProvider>
      <Router>
        <ScrollHandler />
        <RouteTracker />
        <Layout scaleX={scaleX}>
          <ErrorBoundary>
            <React.Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/about" element={<About />} />
                <Route path="/projects" element={<Projects />} />
                <Route path="/team" element={<TeamPage />} />
                <Route path="/community" element={<CommunityPage />} />
                <Route path="/dashboard" element={<DashboardLayout />}>
                  <Route index element={<DashboardOverview />} />
                  <Route path="projects" element={<RunningProjects />} />
                  <Route path="purchases" element={<PurchasedItems />} />
                  <Route path="membership" element={<MembershipApply />} />
                  <Route path="id-card" element={<ProfileCard />} />
                  <Route path="settings" element={<ProfileForm />} />
                  <Route path="membership-history" element={<MembershipHistory />} />
                </Route>
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
                <Route path="/leaderboard" element={<LeaderboardPage />} />
                
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
                  <Route path="about" element={<AboutManager />} />
                  <Route path="access" element={<AdminAccessManager />} />
                  <Route path="applications" element={<ApplicationsManager />} />
                  <Route path="coupons" element={<CouponManager />} />
                  <Route path="members-dashboard" element={<MembersDashboardManager />} />
                  <Route path="proposals" element={<WorkshopProposalsManager />} />
                </Route>

                {/* 404 Catch All Route */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </React.Suspense>
          </ErrorBoundary>
        </Layout>
      </Router>
    </HelmetProvider>
  );
}
