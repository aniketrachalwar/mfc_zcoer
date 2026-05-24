/**
 * Badge Definitions and Progression Constants
 */

import { Badge, MemberLevelConfig, ContributionAction, MemberLevel } from './types';

export const MEMBER_LEVELS: Record<MemberLevel, MemberLevelConfig> = {
  curious: {
    id: 'curious',
    name: 'Curious',
    minPoints: 0,
    description: 'Just starting your journey in Mozilla Firefox Club',
    benefits: ['Basic profile access', 'Join events', 'View community'],
    icon: '🌱',
    color: 'from-blue-400 to-blue-600',
  },
  contributor: {
    id: 'contributor',
    name: 'Contributor',
    minPoints: 100,
    description: 'Active member making meaningful contributions',
    benefits: ['Propose events', 'Join projects', 'Write content'],
    icon: '⭐',
    color: 'from-green-400 to-green-600',
  },
  builder: {
    id: 'builder',
    name: 'Builder',
    minPoints: 300,
    description: 'Building the community with consistent impact',
    benefits: ['Featured profile badge', 'Leadership roles', 'Special recognition'],
    icon: '🔨',
    color: 'from-purple-400 to-purple-600',
  },
  core_member: {
    id: 'core_member',
    name: 'Core Member',
    minPoints: 600,
    description: 'Core pillar of the Mozilla Firefox Club community',
    benefits: ['Access exclusive resources', 'Private workshops', 'Mentorship access'],
    icon: '💎',
    color: 'from-yellow-400 to-orange-600',
  },
  legend: {
    id: 'legend',
    name: 'Legend',
    minPoints: 1000,
    description: 'Hall of Fame member - defining the community',
    benefits: ['Hall of Fame', 'Exclusive events', 'Leadership opportunities', 'Community ambassador'],
    icon: '👑',
    color: 'from-pink-400 to-red-600',
  },
};

export const BADGES: Badge[] = [
  // Founding Member
  {
    id: 'founding_member',
    name: 'Founding Member',
    description: 'One of the first members of MFC Open Web',
    icon: '🏛️',
    category: 'achievement',
    rarity: 'legendary',
    triggerCondition: { type: 'custom', condition: 'Early adopter - joined before March 2026' },
  },
  // First Commit
  {
    id: 'first_commit',
    name: 'First Commit',
    description: 'Made your first code contribution to a club project',
    icon: '💾',
    category: 'contribution',
    tier: 1,
    rarity: 'uncommon',
    triggerCondition: { type: 'first_action', action: 'pr_merged' },
  },
  // Event Pioneer
  {
    id: 'event_pioneer',
    name: 'Event Pioneer',
    description: 'Attended 5 club events or workshops',
    icon: '🎯',
    category: 'achievement',
    rarity: 'common',
    triggerCondition: { type: 'event_participation', count: 5 },
  },
  // Builder
  {
    id: 'builder_badge',
    name: 'Builder',
    description: 'Contributed to 3 different projects',
    icon: '🏗️',
    category: 'contribution',
    tier: 2,
    rarity: 'uncommon',
    triggerCondition: { type: 'project_contribution', count: 3 },
  },
  // Top 10
  {
    id: 'top_10',
    name: 'Top 10',
    description: 'Reached top 10 most active contributors',
    icon: '🏆',
    category: 'milestone',
    rarity: 'rare',
    triggerCondition: { type: 'custom', condition: 'Rank in top 10 leaderboard' },
  },
  // Streak: 1 Month
  {
    id: 'streak_1month',
    name: 'Streak: 1 Month',
    description: 'Maintained a 30-day contribution streak',
    icon: '🔥',
    category: 'streak',
    tier: 1,
    rarity: 'uncommon',
    triggerCondition: { type: 'streak', days: 30 },
  },
  // Streak: 3 Months
  {
    id: 'streak_3months',
    name: 'Streak: 3 Months',
    description: 'Maintained a 90-day contribution streak',
    icon: '⚡',
    category: 'streak',
    tier: 2,
    rarity: 'rare',
    triggerCondition: { type: 'streak', days: 90 },
  },
  // Workshop Speaker
  {
    id: 'workshop_speaker',
    name: 'Workshop Speaker',
    description: 'Organized or spoke at a club workshop',
    icon: '🎤',
    category: 'leadership',
    rarity: 'rare',
    triggerCondition: { type: 'milestone', action: 'organize_event', count: 1 },
  },
  // Community Champion
  {
    id: 'community_champion',
    name: 'Community Champion',
    description: 'Successfully referred 5 new members to the club',
    icon: '🌟',
    category: 'achievement',
    rarity: 'rare',
    triggerCondition: { type: 'milestone', action: 'refer_member', count: 5 },
  },
  // Open Source Hero
  {
    id: 'opensource_hero',
    name: 'Open Source Hero',
    description: 'Got 10 PRs merged to organization repositories',
    icon: '🦸',
    category: 'contribution',
    tier: 3,
    rarity: 'rare',
    triggerCondition: { type: 'milestone', action: 'pr_merged', count: 10 },
  },
  // Full Stack
  {
    id: 'full_stack',
    name: 'Full Stack',
    description: 'Contributed to projects, wrote content, attended events, and earned 5+ badges',
    icon: '⚙️',
    category: 'achievement',
    rarity: 'epic',
    triggerCondition: { type: 'custom', condition: 'Multi-faceted contributor' },
  },
];

// Points mapping for each action
export const POINTS_FOR_ACTION: Record<ContributionAction, number> = {
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

export const PROFILE_COMPLETION_REQUIREMENTS = {
  photo: true,
  bio: true,
  skills: true,
  interests: false, // optional
  socialLinks: false, // optional
};

export const POINTS_MULTIPLIERS = {
  weekendBonus: 1.1, // 10% bonus for contributions on weekends
  earlyBirdBonus: 1.15, // 15% bonus for contributions in first 6 hours of day
};
