import React, { Suspense } from 'react';
import Hero from './Hero';
import HomeUpcoming from './HomeUpcoming';
import UpcomingEvent from './UpcomingEvent';
import UniversalEventBanner from './events/UniversalEventBanner';
import HomeCategories from './HomeCategories';
import Leaderboard from './Leaderboard';
import PageLoader from './PageLoader';

// Lazy load off-screen components to reduce initial bundle size
const Projects = React.lazy(() => import('./Projects'));
const Blogs = React.lazy(() => import('./Blogs'));
const TeamPreview = React.lazy(() => import('./TeamPreview'));
const Contact = React.lazy(() => import('./Contact'));

const Home = () => {
  return (
    <>
      {/* Critical above-the-fold content */}
      <Hero />
      
      {/* Featured Event / Next Big Thing with Countdown */}
      <UpcomingEvent />

      <div className="max-w-7xl mx-auto px-4 mt-8">
        <UniversalEventBanner />
      </div>

      {/* Upcoming Events Grid */}
      <HomeUpcoming />

      {/* Event Categories */}
      <HomeCategories />
      
      {/* Achievements / Top Contributors */}
      <Leaderboard />
      
      {/* Lower priority content loaded lazily */}
      <Suspense fallback={<PageLoader fullScreen={false} />}>
        <Projects />
        <Blogs />
        <TeamPreview />
        <Contact />
      </Suspense>
    </>
  );
};

export default Home;
