import { VercelRequest, VercelResponse } from '@vercel/node';
import Razorpay from 'razorpay';
import { db } from './_lib/firebase-admin';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  try {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ error: 'User ID is required' });

    // Ensure Razorpay is configured
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      console.warn("Razorpay environment variables missing. Falling back to test mode simulated response.");
      return res.status(200).json({
        id: `order_mock_${Date.now()}`,
        amount: 9900,
        currency: "INR",
        receipt: `receipt_${userId}_${Date.now()}`
      });
    }

    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    // Fetch the correct fee from Firestore to prevent frontend spoofing
    const settingsSnap = await db.collection('settings').doc('membership').get();
    let fee = 99; // Fallback default
    if (settingsSnap.exists) {
      const data = settingsSnap.data();
      fee = data?.currentFee || 99;
    }

    const options = {
      amount: fee * 100, // Amount is in paise (e.g. ₹99 = 9900 paise)
      currency: "INR",
      receipt: `receipt_${userId}_${Date.now()}`
    };

    const order = await razorpay.orders.create(options);
    res.status(200).json(order);
  } catch (error: any) {
    console.error('Error creating Razorpay order:', error);
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}
