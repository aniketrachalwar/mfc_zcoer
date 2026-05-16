import React from 'react';
import { ShoppingBag } from 'lucide-react';

const MerchandiseManager = () => {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-display font-black uppercase text-white mb-2">
          Merchandise <span className="text-firefox-orange">Management</span>
        </h1>
        <p className="text-zinc-400 text-sm">Track orders, inventory, and payment status for club merchandise.</p>
      </div>
      
      <div className="bg-white/5 border border-white/10 rounded-2xl p-12 text-center flex flex-col items-center justify-center">
        <div className="w-16 h-16 bg-white/5 border border-white/10 rounded-full flex items-center justify-center mb-4 text-zinc-500">
          <ShoppingBag size={24} />
        </div>
        <h3 className="text-xl font-display font-bold text-white mb-2">No Active Orders</h3>
        <p className="text-zinc-400 text-sm max-w-md">There are currently no merchandise orders to process.</p>
      </div>
    </div>
  );
};

export default MerchandiseManager;
