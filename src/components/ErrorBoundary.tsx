import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertOctagon, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends React.Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
    
    // Check if it's a chunk load error (Vite dynamic import failure)
    const isChunkLoadError = error?.message?.match(/Failed to fetch dynamically imported module/i) || 
                             error?.message?.match(/Importing a module script failed/i) ||
                             error?.name === 'ChunkLoadError';
    
    if (isChunkLoadError) {
      const lastReload = sessionStorage.getItem('chunk-load-error-reloaded');
      const now = Date.now();
      
      // Only reload if we haven't reloaded in the last 10 seconds to prevent infinite loops
      if (!lastReload || now - parseInt(lastReload, 10) > 10000) {
        sessionStorage.setItem('chunk-load-error-reloaded', now.toString());
        window.location.reload();
      }
    }
  }

  public render() {
    if (this.state.hasError) {
      const isChunkLoadError = this.state.error?.message?.match(/Failed to fetch dynamically imported module/i) || 
                               this.state.error?.message?.match(/Importing a module script failed/i) ||
                               this.state.error?.name === 'ChunkLoadError';
      
      const lastReload = sessionStorage.getItem('chunk-load-error-reloaded');
      const isRecentReload = lastReload && (Date.now() - parseInt(lastReload, 10) < 10000);

      if (isChunkLoadError && !isRecentReload) {
        return (
          <div className="min-h-[70vh] flex flex-col items-center justify-center p-4 text-center">
             <RefreshCw size={40} className="text-zinc-500 animate-spin mb-4" />
             <h2 className="text-xl font-display font-bold text-white mb-2 tracking-tight">
               Applying Updates...
             </h2>
             <p className="text-zinc-400">
               Please wait while we refresh the application.
             </p>
          </div>
        );
      }

      return (
        <div className="min-h-[70vh] flex flex-col items-center justify-center p-4 text-center">
          <div className="w-20 h-20 bg-red-500/10 border border-red-500/20 rounded-full flex items-center justify-center mb-6">
            <AlertOctagon size={40} className="text-red-500" />
          </div>
          <h2 className="text-3xl font-display font-black uppercase text-white mb-4 tracking-tight">
            Oops! Something broke.
          </h2>
          <p className="text-zinc-400 max-w-md mx-auto mb-8">
            We've encountered an unexpected error while loading this page. Our team has been notified.
          </p>
          <div className="bg-red-900/20 p-4 rounded-xl text-left text-xs font-mono text-red-200 w-full max-w-4xl overflow-auto mb-8">
            <p className="font-bold text-red-400 mb-2">{this.state.error?.toString()}</p>
            <pre className="whitespace-pre-wrap">{this.state.error?.stack}</pre>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => window.location.reload()}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-full font-bold uppercase tracking-widest text-xs transition-colors"
            >
              <RefreshCw size={16} />
              Reload Page
            </button>
            <Link
              to="/"
              className="flex items-center justify-center px-6 py-3 bg-firefox-orange text-white rounded-full font-bold uppercase tracking-widest text-xs hover:bg-orange-600 transition-colors"
            >
              Go to Homepage
            </Link>
          </div>
        </div>
      );
    }

    return (this as any).props.children;
  }
}

export default ErrorBoundary;
