import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../lib/AuthContext';
import { Calendar, MapPin, User, Mail, Phone, ArrowRight, CheckCircle2 } from 'lucide-react';

const HostEvent = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    type: 'Hackathon',
    desc: '',
    date: '',
    location: '',
    totalSeats: 30,
    // Hidden Fields
    hostName: '',
    hostEmail: '',
    hostPhone: '',
    expectedBudget: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      alert("You must be logged in to host an event.");
      return;
    }
    
    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'events'), {
        ...formData,
        userId: user.uid,
        status: 'pending',
        timestamp: new Date().toISOString(),
        // Initialize other required event fields as empty
        img: '',
        agenda: '',
        speakerInfo: '',
        prizes: '',
        certificateType: 'Participation',
        price: 0,
        why: '',
        outcomes: ''
      });
      setIsSuccess(true);
      window.scrollTo(0, 0);
    } catch (err) {
      console.error("Failed to submit event proposal:", err);
      alert("Failed to submit your event proposal. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen pt-32 pb-20 px-4 bg-zinc-950 flex flex-col items-center justify-center text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-zinc-900 border border-white/10 p-12 rounded-[2rem] max-w-xl w-full"
        >
          <div className="w-20 h-20 bg-green-500/10 text-green-400 rounded-full flex items-center justify-center mx-auto mb-8 border border-green-500/20">
            <CheckCircle2 size={40} />
          </div>
          <h1 className="text-4xl font-display font-black text-white uppercase tracking-tight mb-4">
            Proposal Submitted!
          </h1>
          <p className="text-zinc-400 text-lg mb-8 leading-relaxed">
            Your event has been successfully submitted and is now pending review by our team. We'll reach out to you using the contact details provided to finalize everything.
          </p>
          <button
            onClick={() => navigate('/events')}
            className="px-8 py-4 bg-firefox-orange text-white rounded-full font-bold uppercase tracking-widest text-xs hover:bg-white hover:text-black transition-all shadow-[0_0_20px_rgba(255,106,0,0.3)]"
          >
            Back to Events
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-32 pb-20 px-4 relative overflow-hidden bg-zinc-950">
      <div className="hidden md:block absolute top-0 right-0 w-[600px] h-[600px] bg-firefox-orange/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
      
      <div className="max-w-3xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <span className="text-firefox-orange font-bold uppercase tracking-widest text-xs mb-2 block">Empower the Community</span>
          <h1 className="text-4xl md:text-6xl font-display font-black uppercase tracking-tight mb-6">
            Host an <span className="text-firefox-orange">Event</span>
          </h1>
          <p className="text-zinc-400 text-lg">
            Got an idea for a meetup, workshop, or hackathon? Fill out the details below. Our team will review your proposal and help you make it a reality.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-12">
          
          {/* Public Details Section */}
          <div className="bg-white/5 border border-white/10 rounded-3xl p-8 md:p-10 backdrop-blur-sm">
            <h2 className="text-2xl font-display font-black text-white uppercase tracking-wider mb-8 flex items-center gap-3">
              <Calendar className="text-firefox-orange" /> Event Details
            </h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">Event Title</label>
                <input 
                  type="text" 
                  name="title"
                  required
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-4 text-white focus:outline-none focus:border-firefox-orange transition-colors"
                  placeholder="e.g. Intro to Web3 Workshop"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">Event Type</label>
                  <select 
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-4 text-white focus:outline-none focus:border-firefox-orange transition-colors appearance-none"
                  >
                    <option>Hackathon</option>
                    <option>Workshop</option>
                    <option>Meetup</option>
                    <option>Seminar</option>
                    <option>Webinar</option>
                    <option>Sprint</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">Proposed Date & Time</label>
                  <input 
                    type="datetime-local" 
                    name="date"
                    required
                    value={formData.date}
                    onChange={handleChange}
                    className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-4 text-white focus:outline-none focus:border-firefox-orange transition-colors"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2 flex items-center gap-2">
                    Location <MapPin size={12} />
                  </label>
                  <input 
                    type="text" 
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-4 text-white focus:outline-none focus:border-firefox-orange transition-colors"
                    placeholder="e.g. Lab 304 or Online link"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">Expected Audience Size</label>
                  <input 
                    type="number" 
                    name="totalSeats"
                    value={formData.totalSeats}
                    onChange={handleChange}
                    className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-4 text-white focus:outline-none focus:border-firefox-orange transition-colors"
                    placeholder="e.g. 50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">Event Description</label>
                <textarea 
                  name="desc"
                  required
                  value={formData.desc}
                  onChange={handleChange}
                  rows={4}
                  className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-4 text-white focus:outline-none focus:border-firefox-orange transition-colors resize-none"
                  placeholder="Tell us what this event is about and what participants will learn..."
                />
              </div>
            </div>
          </div>

          {/* Private Host Details Section */}
          <div className="bg-firefox-orange/5 border border-firefox-orange/20 rounded-3xl p-8 md:p-10 backdrop-blur-sm">
            <h2 className="text-2xl font-display font-black text-white uppercase tracking-wider mb-2 flex items-center gap-3">
              <User className="text-firefox-orange" /> Organizer Details
            </h2>
            <p className="text-sm text-firefox-orange/80 mb-8 font-medium">These details remain completely private and are only used by the core team to contact you.</p>
            
            <div className="space-y-6">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2 flex items-center gap-2">
                  Full Name (Optional)
                </label>
                <input 
                  type="text" 
                  name="hostName"
                  value={formData.hostName}
                  onChange={handleChange}
                  className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-4 text-white focus:outline-none focus:border-firefox-orange transition-colors"
                  placeholder="John Doe"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2 flex items-center gap-2">
                    Email Address (Optional) <Mail size={12} />
                  </label>
                  <input 
                    type="email" 
                    name="hostEmail"
                    value={formData.hostEmail}
                    onChange={handleChange}
                    className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-4 text-white focus:outline-none focus:border-firefox-orange transition-colors"
                    placeholder="john@example.com"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2 flex items-center gap-2">
                    Phone Number (Optional) <Phone size={12} />
                  </label>
                  <input 
                    type="tel" 
                    name="hostPhone"
                    value={formData.hostPhone}
                    onChange={handleChange}
                    className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-4 text-white focus:outline-none focus:border-firefox-orange transition-colors"
                    placeholder="+91 98765 43210"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">Required Budget / Logistics Help (Optional)</label>
                <input 
                  type="text" 
                  name="expectedBudget"
                  value={formData.expectedBudget}
                  onChange={handleChange}
                  className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-4 text-white focus:outline-none focus:border-firefox-orange transition-colors"
                  placeholder="e.g. Need projector, speakers, or snacks budget"
                />
              </div>
            </div>
          </div>

          <button 
            type="submit"
            disabled={isSubmitting}
            className="w-full py-5 bg-firefox-orange text-white rounded-2xl font-display font-black text-sm uppercase tracking-widest hover:bg-white hover:text-black transition-all shadow-[0_0_30px_rgba(255,106,0,0.3)] disabled:opacity-50 flex items-center justify-center gap-3"
          >
            {isSubmitting ? 'Submitting Proposal...' : 'Submit Event Proposal'} <ArrowRight size={18} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default HostEvent;
