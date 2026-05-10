import { motion } from 'motion/react';
import { Calendar, MapPin, ArrowRight } from 'lucide-react';

const Events = () => {
  const events = [
    {
      title: "Hackathons",
      type: "Intense Coding",
      desc: "Where teams build functional prototypes under pressure. Hacks are where skills are tested and friendships forged.",
      img: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&q=80&w=800"
    },
    {
      title: "Workshops",
      type: "Tech Sessions",
      desc: "From Git and GitHub to advanced web development, machine learning, and cloud. Led by members who've mastered the topic.",
      img: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=800"
    },
    {
      title: "Open Source Sprints",
      type: "Contribution",
      desc: "Dedicated sessions where we pick real projects, identify issues, and work together to submit pull requests.",
      img: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=800"
    }
  ];

  return (
    <section id="events" className="py-24 px-4 bg-white/2">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-4">
          <div>
            <span className="text-firefox-orange font-bold uppercase tracking-widest text-xs">Activities</span>
            <h2 className="text-4xl md:text-6xl font-display font-bold mt-4 tracking-tight">Events & <span className="text-gradient">Community</span></h2>
          </div>
          <p className="text-gray-400 max-w-md md:text-right">
            We don't do events for attendance. We do events for output. 
            Every event has a clear learning outcome.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {events.map((event, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="group relative overflow-hidden rounded-3xl aspect-[4/5]"
            >
              <img 
                src={event.img} 
                alt={event.title} 
                className="absolute inset-0 w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-110 transition-all duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-obsidian via-obsidian/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-8">
                <span className="text-firefox-orange text-xs font-bold uppercase tracking-widest">{event.type}</span>
                <h3 className="text-3xl font-display font-bold mt-2 mb-4">{event.title}</h3>
                <p className="text-gray-300 text-sm opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-500 line-clamp-3">
                  {event.desc}
                </p>
                <motion.div 
                  whileHover={{ x: 5 }}
                  className="mt-6 flex items-center gap-2 text-white font-bold text-sm cursor-pointer"
                >
                  View Details <ArrowRight size={16} />
                </motion.div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Events;
