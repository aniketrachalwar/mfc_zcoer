import { VercelRequest, VercelResponse } from '@vercel/node';
import crypto from 'crypto';
import { db, admin } from './_lib/firebase-admin';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  try {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
    if (!secret) {
      console.warn('RAZORPAY_WEBHOOK_SECRET is not set');
      return res.status(500).json({ error: 'Server configuration error' });
    }

    const signature = req.headers['x-razorpay-signature'] as string;
    if (!signature) {
      return res.status(400).json({ error: 'Missing signature' });
    }

    // Verify webhook signature
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(JSON.stringify(req.body))
      .digest('hex');

    if (expectedSignature !== signature) {
      return res.status(400).json({ error: 'Invalid webhook signature' });
    }

    const event = req.body.event;
    const payload = req.body.payload;

    if (event === 'payment.captured') {
      const paymentEntity = payload.payment.entity;
      const razorpayPaymentId = paymentEntity.id;
      
      // Update the payment document via webhook
      const paymentRef = db.collection('payments').doc(razorpayPaymentId);
      await paymentRef.set({
        webhookVerified: true,
        webhookVerifiedAt: new Date().toISOString(),
        paymentMethod: paymentEntity.method, // card, upi, etc.
        amountCaptured: paymentEntity.amount / 100,
        currency: paymentEntity.currency
      }, { merge: true });

    } else if (event === 'payment.failed') {
      const paymentEntity = payload.payment.entity;
      const razorpayPaymentId = paymentEntity.id;
      const reason = paymentEntity.error_description;
      
      // Log the failure
      const paymentRef = db.collection('payments').doc(razorpayPaymentId);
      await paymentRef.set({
        webhookVerified: true,
        status: 'failed',
        paymentStatus: 'failed',
        failureReason: reason,
        webhookVerifiedAt: new Date().toISOString(),
      }, { merge: true });
    }

    res.status(200).json({ status: 'ok' });
  } catch (error: any) {
    console.error('Error handling Razorpay webhook:', error);
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}
