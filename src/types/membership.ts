export type MembershipTier = 'free' | 'silver' | 'platinum';

export interface Subscription {
  membershipTier: MembershipTier;
  subscriptionStart: string | null;
  subscriptionEnd: string | null;
  paymentStatus: 'pending' | 'active' | 'expired' | 'none';
  couponUsed?: string;
  paymentProof?: string;
}

export interface UserProfile extends Subscription {
  id: string;
  fullName?: string;
  username?: string;
  email: string;
  photoURL?: string;
  role?: string;
  memberId?: string;
  isFoundingMember?: boolean;
}
