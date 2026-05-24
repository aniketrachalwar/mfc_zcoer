/**
 * Firestore Service for Progression System
 * Handles all database operations for profiles, points, and badges
 */

import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  Timestamp,
  writeBatch,
} from 'firebase/firestore';
import { db } from '../firebase';
import {
  MemberProfile,
  PointEntry,
  Contribution,
  ActivityFeedItem,
  Badge,
  ContributionAction,
} from './types';
import { calculateMemberLevel, checkBadgeQualification } from './utils';

const PROFILES_COLLECTION = 'memberProfiles';
const POINTS_COLLECTION = 'pointEntries';
const CONTRIBUTIONS_COLLECTION = 'contributions';
const ACTIVITY_FEED_COLLECTION = 'activityFeed';
const BADGES_COLLECTION = 'badges';

// ============ PROFILE OPERATIONS ============

export async function createMemberProfile(uid: string, name: string, email: string): Promise<MemberProfile> {
  const profile: MemberProfile = {
    id: uid,
    uid,
    name,
    email,
    skills: [],
    interests: [],
    joinDate: new Date(),
    totalPoints: 0,
    level: 'curious',
    recentPoints: [],
    badges: [],
    currentStreak: 0,
    longestStreak: 0,
    isVerified: false,
    isFeatured: false,
    isActive: true,
    updatedAt: new Date(),
  };
  
  await setDoc(doc(db, PROFILES_COLLECTION, uid), {
    ...profile,
    joinDate: Timestamp.fromDate(profile.joinDate),
    updatedAt: Timestamp.fromDate(profile.updatedAt),
  });
  
  // Award joining bonus points
  await addPoints(uid, 'join_club', 'Joined MFC Open Web');
  
  return profile;
}

export async function getMemberProfile(uid: string): Promise<MemberProfile | null> {
  const docSnap = await getDoc(doc(db, PROFILES_COLLECTION, uid));
  
  if (!docSnap.exists()) return null;
  
  const data = docSnap.data();
  return {
    ...data,
    id: docSnap.id,
    joinDate: data.joinDate?.toDate() || new Date(),
    profileCompletedDate: data.profileCompletedDate?.toDate(),
    lastActivityDate: data.lastActivityDate?.toDate(),
    updatedAt: data.updatedAt?.toDate() || new Date(),
  } as MemberProfile;
}

export async function updateMemberProfile(uid: string, updates: Partial<MemberProfile>): Promise<void> {
  const profileRef = doc(db, PROFILES_COLLECTION, uid);
  const updateData: any = { ...updates };
  
  // Convert dates to Timestamps
  if (updates.updatedAt) {
    updateData.updatedAt = Timestamp.fromDate(updates.updatedAt);
  } else {
    updateData.updatedAt = Timestamp.now();
  }
  
  if (updates.joinDate) {
    updateData.joinDate = Timestamp.fromDate(updates.joinDate);
  }
  
  await updateDoc(profileRef, updateData);
}

export async function completeProfile(uid: string, updates: Partial<MemberProfile>): Promise<void> {
  // Check if profile was already completed
  const profile = await getMemberProfile(uid);
  const wasCompleted = profile?.profileCompletedDate !== undefined;
  
  await updateMemberProfile(uid, {
    ...updates,
    profileCompletedDate: new Date(),
  });
  
  // Award completion bonus only once
  if (!wasCompleted) {
    await addPoints(uid, 'complete_profile', 'Completed member profile');
  }
}

// ============ POINTS OPERATIONS ============

export async function addPoints(
  uid: string,
  action: ContributionAction,
  description: string,
  metadata?: Record<string, any>
): Promise<PointEntry> {
  const pointsMap: Record<ContributionAction, number> = {
    join_club: 25,
    complete_profile: 20,
    attend_event: 15,
    organize_event: 60,
    contribute_project: 35,
    pr_merged: 25,
    publish_content: 30,
    submit_feedback: 5,
    refer_member: 20,
    earn_badge: 10,
    streak_30days: 50,
    other: 0,
  };
  
  const points = pointsMap[action] || 0;
  
  const pointEntry: PointEntry = {
    id: `${uid}-${Date.now()}`,
    userId: uid,
    action,
    points,
    description,
    metadata,
    timestamp: new Date(),
    verified: true,
  };
  
  // Add to points collection
  await setDoc(doc(db, POINTS_COLLECTION, pointEntry.id), {
    ...pointEntry,
    timestamp: Timestamp.fromDate(pointEntry.timestamp),
  });
  
  // Update user profile
  const profile = await getMemberProfile(uid);
  if (profile) {
    const newTotalPoints = profile.totalPoints + points;
    const newLevel = calculateMemberLevel(newTotalPoints);
    
    // Add to recent points (keep last 10)
    const recentPoints = [pointEntry, ...profile.recentPoints].slice(0, 10);
    
    await updateMemberProfile(uid, {
      totalPoints: newTotalPoints,
      level: newLevel,
      recentPoints,
      lastActivityDate: new Date(),
    });
    
    // Create activity feed entry
    await addActivityFeedItem({
      id: `activity-${pointEntry.id}`,
      userId: uid,
      type: 'points_earned',
      title: `Earned ${points} points`,
      description,
      icon: '⭐',
      timestamp: new Date(),
      metadata: { action, points },
    });
  }
  
  return pointEntry;
}

export async function getUserPoints(uid: string, limit_count: number = 50): Promise<PointEntry[]> {
  const q = query(
    collection(db, POINTS_COLLECTION),
    where('userId', '==', uid),
    orderBy('timestamp', 'desc'),
    limit(limit_count)
  );
  
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => {
    const data = doc.data();
    return {
      ...data,
      id: doc.id,
      timestamp: data.timestamp?.toDate() || new Date(),
    } as PointEntry;
  });
}

// ============ CONTRIBUTION OPERATIONS ============

export async function submitContribution(
  uid: string,
  type: 'event' | 'project' | 'content' | 'feedback' | 'referral',
  title: string,
  description: string,
  metadata?: Record<string, any>
): Promise<Contribution> {
  const contribution: Contribution = {
    id: `contrib-${uid}-${Date.now()}`,
    userId: uid,
    type,
    title,
    description,
    pointsAwarded: 0,
    status: 'pending',
    date: new Date(),
    metadata,
  };
  
  await setDoc(doc(db, CONTRIBUTIONS_COLLECTION, contribution.id), {
    ...contribution,
    date: Timestamp.fromDate(contribution.date),
  });
  
  return contribution;
}

export async function approveContribution(contributionId: string, pointsToAward: number): Promise<void> {
  const contribRef = doc(db, CONTRIBUTIONS_COLLECTION, contributionId);
  const contrib = await getDoc(contribRef);
  
  if (!contrib.exists()) throw new Error('Contribution not found');
  
  const data = contrib.data();
  const uid = data.userId;
  
  // Update contribution status
  await updateDoc(contribRef, {
    status: 'approved',
    pointsAwarded: pointsToAward,
  });
  
  // Award points based on contribution type
  const actionMap: Record<string, ContributionAction> = {
    event: 'attend_event',
    project: 'contribute_project',
    content: 'publish_content',
    feedback: 'submit_feedback',
    referral: 'refer_member',
  };
  
  await addPoints(uid, actionMap[data.type], `${data.type} approved: ${data.title}`, {
    contributionId,
  });
}

export async function getUserContributions(uid: string, limit_count: number = 50): Promise<Contribution[]> {
  const q = query(
    collection(db, CONTRIBUTIONS_COLLECTION),
    where('userId', '==', uid),
    orderBy('date', 'desc'),
    limit(limit_count)
  );
  
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => {
    const data = doc.data();
    return {
      ...data,
      id: doc.id,
      date: data.date?.toDate() || new Date(),
    } as Contribution;
  });
}

// ============ BADGE OPERATIONS ============

export async function awardBadge(uid: string, badgeId: string): Promise<void> {
  const profile = await getMemberProfile(uid);
  if (!profile) throw new Error('User profile not found');
  
  // Check if already has badge
  if (profile.badges.includes(badgeId)) {
    return; // Already has this badge
  }
  
  // Add badge to profile
  const updatedBadges = [...profile.badges, badgeId];
  await updateMemberProfile(uid, {
    badges: updatedBadges,
  });
  
  // Award bonus points for badge unlock
  await addPoints(uid, 'earn_badge', `Unlocked badge: ${badgeId}`);
  
  // Create activity feed entry
  await addActivityFeedItem({
    id: `badge-${badgeId}-${uid}`,
    userId: uid,
    type: 'badge_unlocked',
    title: `Unlocked Badge: ${badgeId}`,
    description: `New achievement unlocked!`,
    icon: '🏆',
    timestamp: new Date(),
    metadata: { badgeId },
  });
}

export async function getUserBadges(uid: string): Promise<Badge[]> {
  const profile = await getMemberProfile(uid);
  if (!profile) return [];
  
  const badges: Badge[] = [];
  
  for (const badgeId of profile.badges) {
    const badgeDoc = await getDoc(doc(db, BADGES_COLLECTION, badgeId));
    if (badgeDoc.exists()) {
      const data = badgeDoc.data();
      badges.push({
        ...data,
        id: badgeDoc.id,
        earnedDate: data.earnedDate?.toDate(),
      } as Badge);
    }
  }
  
  return badges;
}

// ============ ACTIVITY FEED OPERATIONS ============

export async function addActivityFeedItem(item: ActivityFeedItem): Promise<void> {
  await setDoc(doc(db, ACTIVITY_FEED_COLLECTION, item.id), {
    ...item,
    timestamp: Timestamp.fromDate(item.timestamp),
  });
}

export async function getUserActivityFeed(uid: string, limit_count: number = 20): Promise<ActivityFeedItem[]> {
  const q = query(
    collection(db, ACTIVITY_FEED_COLLECTION),
    where('userId', '==', uid),
    orderBy('timestamp', 'desc'),
    limit(limit_count)
  );
  
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => {
    const data = doc.data();
    return {
      ...data,
      id: doc.id,
      timestamp: data.timestamp?.toDate() || new Date(),
    } as ActivityFeedItem;
  });
}

// ============ LEADERBOARD OPERATIONS ============

export async function getTopContributors(limit_count: number = 10) {
  const q = query(
    collection(db, PROFILES_COLLECTION),
    orderBy('totalPoints', 'desc'),
    limit(limit_count)
  );
  
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc, index) => {
    const data = doc.data();
    return {
      rank: index + 1,
      userId: doc.id,
      name: data.name,
      photoURL: data.photoURL,
      totalPoints: data.totalPoints,
      level: data.level,
      badges: (data.badges || []).length,
      currentStreak: data.currentStreak || 0,
    };
  });
}

export async function getTrendingContributors(timeframe: 'week' | 'month' = 'week') {
  const now = new Date();
  const startDate = new Date();
  
  if (timeframe === 'week') {
    startDate.setDate(now.getDate() - 7);
  } else {
    startDate.setMonth(now.getMonth() - 1);
  }
  
  const q = query(
    collection(db, POINTS_COLLECTION),
    where('timestamp', '>=', Timestamp.fromDate(startDate))
  );
  
  const querySnapshot = await getDocs(q);
  
  // Group by user and sum points
  const userPoints: Record<string, number> = {};
  querySnapshot.docs.forEach(doc => {
    const data = doc.data();
    userPoints[data.userId] = (userPoints[data.userId] || 0) + data.points;
  });
  
  // Get top contributors
  const sorted = Object.entries(userPoints)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10);
  
  const contributors = [];
  for (const [uid, points] of sorted) {
    const profile = await getMemberProfile(uid);
    if (profile) {
      contributors.push({
        rank: contributors.length + 1,
        userId: uid,
        name: profile.name,
        photoURL: profile.photoURL,
        recentPoints: points,
        level: profile.level,
        badges: profile.badges.length,
      });
    }
  }
  
  return contributors;
}

export async function initializeBadgesCollection(): Promise<void> {
  // This function can be called once to initialize all badge definitions
  // In practice, this would be done through admin panel or Firestore rules
  // For now, badges are stored in constants and checked programmatically
}
