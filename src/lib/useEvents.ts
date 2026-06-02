import { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from './firebase';

let cachedEvents: any[] | null = null;
let fetchPromise: Promise<any[]> | null = null;

export const useEvents = () => {
  const [events, setEvents] = useState<any[]>(cachedEvents || []);
  const [loading, setLoading] = useState(!cachedEvents);

  useEffect(() => {
    if (cachedEvents) {
      setEvents(cachedEvents);
      setLoading(false);
      return;
    }

    if (!fetchPromise) {
      fetchPromise = (async () => {
        const q = query(collection(db, 'events'), orderBy('date', 'asc'));
        const snap = await getDocs(q);
        const now = new Date().getTime();
        
        const fetchedEvents = snap.docs
          .map(doc => ({ id: doc.id, ...doc.data() } as any))
          .filter((e: any) => (e.status === 'approved' || !e.status) && new Date(e.date).getTime() > now);
          
        return fetchedEvents;
      })();
    }

    fetchPromise.then((data) => {
      cachedEvents = data;
      setEvents(data);
      setLoading(false);
    }).catch(err => {
      console.error("Error fetching events:", err);
      setLoading(false);
    });
  }, []);

  return { events, loading };
};
