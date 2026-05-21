/**
 * Progression System Utilities
 */

import { MemberProfile, Contribution, PointEntry, Badge, ActivityFeedItem } from './types';
import { MEMBER_LEVELS, BADGES, POINTS_FOR_ACTION } from './constants';

/**
 * Calculate member level based on total points
 */
export function calculateMemberLevel(totalPoints: number): import('./types').MemberLevel {
  if (totalPoints >= 1000) return 'legend';
  if (totalPoints >= 600) return 'core_member';
  if (totalPoints >= 300) return 'builder';
  if (totalPoints >= 100) return 'contributor';
  return 'curious';
}

/**
 * Get progress to next level
 */
export function getProgressToNextLevel(totalPoints: number): {
  currentLevel: string;
  nextLevel: string;
  currentPoints: number;
  pointsNeeded: number;
  progressPercent: number;
} {
  const currentLevel = calculateMemberLevel(totalPoints);
  const levels = Object.entries(MEMBER_LEVELS).sort((a, b) => a[1].minPoints - b[1].minPoints);
  
  const currentLevelIndex = levels.findIndex(([key]) => key === currentLevel);
  const nextLevelIndex = currentLevelIndex + 1;
  
  if (nextLevelIndex >= levels.length) {
    // Already at max level
    return {
      currentLevel: MEMBER_LEVELS[currentLevel].name,
      nextLevel: MEMBER_LEVELS[currentLevel].name,
      currentPoints: totalPoints,
      pointsNeeded: 0,
      progressPercent: 100,
    };
  }
  
  const currentLevelMinPoints = levels[currentLevelIndex][1].minPoints;
  const nextLevelMinPoints = levels[nextLevelIndex][1].minPoints;
  
  const pointsInCurrentLevel = totalPoints - currentLevelMinPoints;
  const pointsRequiredForLevel = nextLevelMinPoints - currentLevelMinPoints;
  const progressPercent = Math.min(100, (pointsInCurrentLevel / pointsRequiredForLevel) * 100);
  
  return {
    currentLevel: MEMBER_LEVELS[currentLevel].name,
    nextLevel: MEMBER_LEVELS[levels[nextLevelIndex][0]].name,
    currentPoints: pointsInCurrentLevel,
    pointsNeeded: nextLevelMinPoints - totalPoints,
    progressPercent,
  };
}

/**
 * Check if member qualifies for a badge
 */
export function checkBadgeQualification(
  profile: MemberProfile,
  contributions: Contribution[],
  pointEntries: PointEntry[],
  badge: Badge
): boolean {
  const trigger = badge.triggerCondition;
  
  switch (trigger.type) {
    case 'first_action':
      return pointEntries.some(entry => entry.action === trigger.action);
    
    case 'milestone':
      const relevantActions = pointEntries.filter(entry => entry.action === trigger.action);
      return relevantActions.length >= trigger.count;
    
    case 'streak':
      return profile.longestStreak >= trigger.days;
    
    case 'event_participation':
      const eventCount = contributions.filter(c => c.type === 'event').length;
      return eventCount >= trigger.count;
    
    case 'project_contribution':
      const projectCount = new Set(
        contributions
          .filter(c => c.type === 'project' && c.metadata?.projectId)
          .map(c => c.metadata?.projectId)
      ).size;
      return projectCount >= trigger.count;
    
    case 'custom':
      // Custom conditions are handled by admin/system
      return false;
    
    default:
      return false;
  }
}

/**
 * Calculate current streak
 */
export function calculateCurrentStreak(
  lastActivityDate?: Date,
  pointEntries: PointEntry[] = []
): number {
  if (!lastActivityDate || pointEntries.length === 0) return 0;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const lastActivity = new Date(lastActivityDate);
  lastActivity.setHours(0, 0, 0, 0);
  
  const daysDifference = Math.floor((today.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24));
  
  // If last activity was today or yesterday, continue streak
  if (daysDifference > 1) return 0;
  
  // Count consecutive days with activity
  let streak = 1;
  let currentDate = new Date(today);
  currentDate.setDate(currentDate.getDate() - 1);
  
  while (currentDate.getTime() > new Date(pointEntries[pointEntries.length - 1].timestamp).getTime()) {
    const dayEntries = pointEntries.filter(entry => {
      const entryDate = new Date(entry.timestamp);
      entryDate.setHours(0, 0, 0, 0);
      return entryDate.getTime() === currentDate.getTime();
    });
    
    if (dayEntries.length === 0) break;
    
    streak++;
    currentDate.setDate(currentDate.getDate() - 1);
  }
  
  return streak;
}

/**
 * Check for milestone achievements (e.g., 30-day streak)
 */
export function checkMilestoneAchievements(
  currentStreak: number,
  previousStreak: number
): string[] {
  const unlocked: string[] = [];
  
  if (currentStreak === 30 && previousStreak < 30) {
    unlocked.push('streak_30days');
  }
  
  if (currentStreak === 90 && previousStreak < 90) {
    unlocked.push('streak_90days');
  }
  
  if (currentStreak === 365 && previousStreak < 365) {
    unlocked.push('streak_1year');
  }
  
  return unlocked;
}

/**
 * Generate activity feed items
 */
export function generateActivityFeedItems(
  profile: MemberProfile,
  recentPointEntries: PointEntry[],
  recentBadges: Badge[] = []
): ActivityFeedItem[] {
  const items: ActivityFeedItem[] = [];
  
  // Add recent point entries
  for (const entry of recentPointEntries.slice(0, 5)) {
    items.push({
      id: entry.id,
      userId: profile.id,
      type: 'points_earned',
      title: `Earned ${entry.points} points`,
      description: entry.description,
      icon: '⭐',
      timestamp: entry.timestamp,
      metadata: { action: entry.action, points: entry.points },
    });
  }
  
  // Add recent badge unlocks
  for (const badge of recentBadges) {
    items.push({
      id: `badge-${badge.id}`,
      userId: profile.id,
      type: 'badge_unlocked',
      title: `Unlocked Badge: ${badge.name}`,
      description: badge.description,
      icon: badge.icon,
      timestamp: badge.earnedDate || new Date(),
      metadata: { badgeId: badge.id },
    });
  }
  
  // Sort by timestamp descending
  return items.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
}

/**
 * Calculate profile completion percentage
 */
export function calculateProfileCompletion(profile: MemberProfile): number {
  let completed = 0;
  let total = 0;
  
  // Name
  if (profile.name) completed++;
  total++;
  
  // Photo
  if (profile.photoURL) completed++;
  total++;
  
  // Bio
  if (profile.bio) completed++;
  total++;
  
  // Skills
  if (profile.skills && profile.skills.length > 0) completed++;
  total++;
  
  // Social links
  const hasLinks = profile.github || profile.linkedin || profile.portfolio || profile.twitter;
  if (hasLinks) completed++;
  total++;
  
  return Math.round((completed / total) * 100);
}

/**
 * Get badges grouped by category
 */
export function groupBadgesByCategory(badges: Badge[]): Record<string, Badge[]> {
  return badges.reduce((acc, badge) => {
    if (!acc[badge.category]) {
      acc[badge.category] = [];
    }
    acc[badge.category].push(badge);
    return acc;
  }, {} as Record<string, Badge[]>);
}

/**
 * Get badge rarity color
 */
export function getBadgeRarityColor(rarity: string): string {
  const colors: Record<string, string> = {
    common: 'bg-gray-100 text-gray-800 border-gray-300',
    uncommon: 'bg-green-100 text-green-800 border-green-300',
    rare: 'bg-blue-100 text-blue-800 border-blue-300',
    epic: 'bg-purple-100 text-purple-800 border-purple-300',
    legendary: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  };
  return colors[rarity] || colors.common;
}

/**
 * Format points with commas
 */
export function formatPoints(points: number): string {
  return points.toLocaleString();
}

/**
 * Get level badge styling
 */
export function getLevelBadgeStyle(level: string): { icon: string; color: string; name: string } {
  const levelData = MEMBER_LEVELS[level as keyof typeof MEMBER_LEVELS];
  return {
    icon: levelData.icon,
    color: levelData.color,
    name: levelData.name,
  };
}
