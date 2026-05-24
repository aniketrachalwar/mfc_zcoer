import { Link } from 'react-router-dom';
import { Home, Compass } from 'lucide-react';
import { motion } from 'motion/react';
import { Helmet } from 'react-helmet-async';

const NotFound = () => {
  return (
    <>
      <Helmet>
        <title>Page Not Found | MFC Open Web</title>
      </Helmet>
      <div className="min-h-screen pt-32 pb-20 flex flex-col items-center justify-center px-4 text-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-xl mx-auto flex flex-col items-center"
        >
          <div className="text-[120px] leading-none font-display font-black text-transparent bg-clip-text bg-gradient-to-br from-firefox-orange to-firefox-yellow mb-6">
            404
          </div>
          
          <h1 className="text-3xl md:text-4xl font-display font-black uppercase text-white mb-4 tracking-tight">
            Lost in Cyberspace
          </h1>
          
          <p className="text-zinc-400 text-lg mb-10 max-w-md mx-auto">
            The page you are looking for has been moved, deleted, or possibly never existed.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center w-full sm:w-auto">
            <Link 
              to="/"
              className="flex items-center justify-center gap-2 px-8 py-4 bg-firefox-orange text-white rounded-full font-black uppercase tracking-widest text-xs hover:bg-orange-600 transition-colors group"
            >
              <Home size={16} className="group-hover:-translate-y-0.5 transition-transform" />
              Return Home
            </Link>
            
            <Link 
              to="/community"
              className="flex items-center justify-center gap-2 px-8 py-4 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-full font-black uppercase tracking-widest text-xs transition-colors group"
            >
              <Compass size={16} className="group-hover:rotate-45 transition-transform" />
              Explore Community
            </Link>
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default NotFound;
