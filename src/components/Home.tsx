import React, { Suspense } from 'react';
import Hero from './Hero';
import UpcomingEvent from './UpcomingEvent';
import Leaderboard from './Leaderboard';
import Blogs from './Blogs';

// Lazy load off-screen components to reduce initial bundle size and improve TTI
const About = React.lazy(() => import('./About'));
const System = React.lazy(() => import('./System'));
const Team = React.lazy(() => import('./Team'));
const Contact = React.lazy(() => import('./Contact'));

// Very lightweight fallback for lazy components
const SectionFallback = () => (
  <div className="py-20 flex justify-center items-center">
    <div className="w-8 h-8 border-2 border-firefox-orange border-t-transparent rounded-full animate-spin" />
  </div>
);

const Home = () => {
  return (
    <>
      {/* Critical above-the-fold content */}
      <Hero />
      <UpcomingEvent />
      
      {/* Previews of main systems */}
      <Leaderboard />
      <Blogs />
      
      {/* Lower priority content loaded lazily */}
      <Suspense fallback={<SectionFallback />}>
        <About />
        <System />
        <Team />
        <Contact />
      </Suspense>
    </>
  );
};

export default Home;
