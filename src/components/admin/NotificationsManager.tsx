import React from 'react';
import { Bell, Send } from 'lucide-react';

const NotificationsManager = () => {
  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-display font-black uppercase text-white mb-2">
            System <span className="text-firefox-orange">Notifications</span>
          </h1>
          <p className="text-zinc-400 text-sm">Send announcements and trigger event reminders.</p>
        </div>
        <button className="flex items-center gap-2 px-6 py-3 bg-firefox-orange text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-orange-600 transition-colors">
          <Send size={16} />
          New Announcement
        </button>
      </div>
      
      <div className="bg-white/5 border border-white/10 rounded-2xl p-12 text-center flex flex-col items-center justify-center">
        <div className="w-16 h-16 bg-white/5 border border-white/10 rounded-full flex items-center justify-center mb-4 text-zinc-500">
          <Bell size={24} />
        </div>
        <h3 className="text-xl font-display font-bold text-white mb-2">No Recent Broadcasts</h3>
        <p className="text-zinc-400 text-sm max-w-md">You haven't sent any notifications recently. Use the button above to broadcast a message to all members.</p>
      </div>
    </div>
  );
};

export default NotificationsManager;
