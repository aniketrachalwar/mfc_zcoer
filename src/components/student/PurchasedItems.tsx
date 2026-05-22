import { ShoppingBag, Ticket, Shirt } from 'lucide-react';
import { useOutletContext } from 'react-router-dom';

export default function PurchasedItems() {
  const { profile } = useOutletContext<{ profile: any }>();
  // In a real scenario, fetch purchases from the database
  const purchases: any[] = [];

  return (
    <div className="space-y-8">
      <div className="mb-8 text-left">
        <h2 className="text-3xl font-display font-black uppercase text-white mb-2">Purchased <span className="text-firefox-orange">Items</span></h2>
        <p className="text-zinc-500 font-medium">View your tickets, merchandise, and other community purchases.</p>
      </div>

      <div className="bg-zinc-900 border border-white/10 rounded-3xl overflow-hidden">
        {purchases.length > 0 ? (
          <div className="divide-y divide-white/5">
            {purchases.map(item => (
              <div key={item.id} className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-white/5 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-black/40 rounded-xl flex items-center justify-center border border-white/5 text-zinc-400">
                    {item.type === 'ticket' ? <Ticket size={24} /> : <Shirt size={24} />}
                  </div>
                  <div>
                    <h3 className="font-bold text-white">{item.name}</h3>
                    <p className="text-xs text-zinc-500 font-medium">Order ID: {item.id} • {item.date}</p>
                  </div>
                </div>
                <div className="bg-white/5 px-4 py-2 rounded-full border border-white/5">
                  <span className="text-sm font-black text-white">{item.price}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <ShoppingBag size={48} className="mx-auto text-zinc-600 mb-4" />
            <p className="text-zinc-500">You haven't made any purchases yet. Merch and tickets will appear here.</p>
          </div>
        )}
      </div>
    </div>
  );
}
