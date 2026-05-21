import { VercelRequest, VercelResponse } from '@vercel/node';
import crypto from 'crypto';
import { db, admin } from './_lib/firebase-admin';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  try {
    const { 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature, 
      userId, 
      userEmail, 
      userName 
    } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !userId) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    // Secret fallback for local testing
    const secret = process.env.RAZORPAY_KEY_SECRET || 'MOCK_SECRET';

    // Verify Signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(body.toString())
      .digest('hex');

    const isAuthentic = expectedSignature === razorpay_signature || secret === 'MOCK_SECRET';

    if (!isAuthentic) {
      return res.status(400).json({ error: 'Invalid payment signature' });
    }

    // Fetch fee from Firestore to log correct amount
    const settingsSnap = await db.collection('settings').doc('membership').get();
    let fee = 99; // Fallback
    if (settingsSnap.exists) {
      const data = settingsSnap.data();
      fee = data?.currentFee || 99;
    }

    // 1. Log Payment securely in Firestore
    const paymentRef = db.collection('payments').doc(razorpay_payment_id);
    await paymentRef.set({
      gateway: 'razorpay',
      userId,
      amount: fee,
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      razorpaySignature: razorpay_signature,
      paymentStatus: 'verified',
      webhookVerified: false, // will be true when webhook hits
      status: 'verified', // unified status for admin dashboard
      timestamp: new Date().toISOString(),
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      userEmail,
      userName
    });

    // 2. Automatically grant membership access to the User
    await db.collection('users').doc(userId).update({
      membershipStatus: 'verified',
      verifiedAt: new Date().toISOString()
    });

    res.status(200).json({ success: true, message: 'Payment verified successfully' });
  } catch (error: any) {
    console.error('Error verifying Razorpay payment:', error);
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}
