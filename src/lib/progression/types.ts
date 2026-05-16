/**
 * Contribution & Progression System Types
 */

export type MemberLevel = 'curious' | 'contributor' | 'builder' | 'core_member' | 'legend';

export interface MemberProfile {
  id: string;
  uid: string;
  name: string;
  email: string;
  photoURL?: string;
  bio?: string;
  skills: string[];
  interests: string[];
  joinDate: Date;
  profileCompletedDate?: Date;
  
  // Progression
  totalPoints: number;
  level: MemberLevel;
  recentPoints: PointEntry[];
  
  // Badges
  badges: string[]; // badge IDs
  
  // Streak
  currentStreak: number;
  longestStreak: number;
  lastActivityDate?: Date;
  
  // Links
  github?: string;
  linkedin?: string;
  portfolio?: string;
  twitter?: string;
  
  // Status
  isVerified: boolean;
  isFeatured: boolean;
  isActive: boolean;
  
  // Metadata
  updatedAt: Date;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string; // emoji or icon name
  category: 'achievement' | 'milestone' | 'contribution' | 'streak' | 'leadership';
  tier?: number;
  triggerCondition: BadgeTrigger;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  image?: string;
  earnedDate?: Date;
}

export type BadgeTrigger = 
  | { type: 'first_action'; action: string }
  | { type: 'milestone'; action: string; count: number }
  | { type: 'streak'; days: number }
  | { type: 'event_participation'; count: number }
  | { type: 'project_contribution'; count: number }
  | { type: 'custom'; condition: string };

export interface PointEntry {
  id: string;
  userId: string;
  action: ContributionAction;
  points: number;
  description: string;
  metadata?: Record<string, any>;
  timestamp: Date;
  verified?: boolean;
}

export type ContributionAction = 
  | 'join_club'
  | 'complete_profile'
  | 'attend_event'
  | 'organize_event'
  | 'contribute_project'
  | 'pr_merged'
  | 'publish_content'
  | 'submit_feedback'
  | 'refer_member'
  | 'earn_badge'
  | 'streak_30days'
  | 'other';

export interface Contribution {
  id: string;
  userId: string;
  type: 'event' | 'project' | 'content' | 'feedback' | 'referral';
  title: string;
  description: string;
  pointsAwarded: number;
  status: 'pending' | 'approved' | 'rejected';
  date: Date;
  metadata?: {
    eventId?: string;
    projectId?: string;
    contentUrl?: string;
    referralEmail?: string;
  };
}

export interface MemberLevel {
  id: MemberLevel;
  name: string;
  minPoints: number;
  description: string;
  benefits: string[];
  icon: string;
  color: string;
}

export interface ActivityFeedItem {
  id: string;
  userId: string;
  type: 'points_earned' | 'badge_unlocked' | 'level_up' | 'streak_milestone' | 'contribution_approved';
  title: string;
  description: string;
  icon: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface StreakData {
  userId: string;
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: Date;
  streakStartDate: Date;
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  name: string;
  photoURL?: string;
  totalPoints: number;
  level: MemberLevel;
  badges: number;
  currentStreak: number;
}
