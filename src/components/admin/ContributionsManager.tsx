import React from 'react';
import { Award, CheckCircle } from 'lucide-react';

const ContributionsManager = () => {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-display font-black uppercase text-white mb-2">
          Contribution <span className="text-firefox-orange">Verification</span>
        </h1>
        <p className="text-zinc-400 text-sm">Review and verify member contributions for progression.</p>
      </div>
      
      <div className="bg-white/5 border border-white/10 rounded-2xl p-12 text-center flex flex-col items-center justify-center">
        <div className="w-16 h-16 bg-white/5 border border-white/10 rounded-full flex items-center justify-center mb-4 text-zinc-500">
          <CheckCircle size={24} />
        </div>
        <h3 className="text-xl font-display font-bold text-white mb-2">All Caught Up!</h3>
        <p className="text-zinc-400 text-sm max-w-md">There are currently no pending contribution verifications. Great job keeping up with the queue.</p>
      </div>
    </div>
  );
};

export default ContributionsManager;
