/**
 * Progression Context
 * Manages state and operations for the contribution & progression system
 */

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useAuth } from './AuthContext';
import {
  MemberProfile,
  PointEntry,
  Contribution,
  ActivityFeedItem,
  Badge,
  ContributionAction,
} from './progression/types';
import {
  getMemberProfile,
  updateMemberProfile,
  addPoints,
  getUserPoints,
  getUserContributions,
  getUserBadges,
  getUserActivityFeed,
  submitContribution,
  awardBadge,
  getTopContributors,
  getTrendingContributors,
} from './progression/firestore';
import { calculateCurrentStreak, getProgressToNextLevel } from './progression/utils';

interface ProgressionContextType {
  // Profile
  profile: MemberProfile | null;
  loading: boolean;
  error: string | null;
  
  // Data
  recentPoints: PointEntry[];
  contributions: Contribution[];
  badges: Badge[];
  activityFeed: ActivityFeedItem[];
  
  // Leaderboard data
  topContributors: any[];
  trendingContributors: any[];
  
  // Operations
  loadProfile: () => Promise<void>;
  updateProfile: (updates: Partial<MemberProfile>) => Promise<void>;
  completeProfile: (updates: Partial<MemberProfile>) => Promise<void>;
  recordActivity: (action: ContributionAction, description: string, metadata?: Record<string, any>) => Promise<void>;
  submitContribution: (type: 'event' | 'project' | 'content' | 'feedback' | 'referral', title: string, description: string, metadata?: Record<string, any>) => Promise<void>;
  loadLeaderboardData: () => Promise<void>;
  
  // Computed values
  progressToNextLevel: ReturnType<typeof getProgressToNextLevel>;
}

const ProgressionContext = createContext<ProgressionContextType | undefined>(undefined);

export function ProgressionProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  
  const [profile, setProfile] = useState<MemberProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [recentPoints, setRecentPoints] = useState<PointEntry[]>([]);
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [activityFeed, setActivityFeed] = useState<ActivityFeedItem[]>([]);
  
  const [topContributors, setTopContributors] = useState<any[]>([]);
  const [trendingContributors, setTrendingContributors] = useState<any[]>([]);
  
  const loadProfile = useCallback(async () => {
    if (!user?.uid) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const memberProfile = await getMemberProfile(user.uid);
      if (memberProfile) {
        setProfile(memberProfile);
        
        // Load related data
        const [points, contribs, userBadges, feed] = await Promise.all([
          getUserPoints(user.uid, 20),
          getUserContributions(user.uid, 10),
          getUserBadges(user.uid),
          getUserActivityFeed(user.uid, 15),
        ]);
        
        setRecentPoints(points);
        setContributions(contribs);
        setBadges(userBadges);
        setActivityFeed(feed);
      }
    } catch (err) {
      console.error('Error loading profile:', err);
      setError(err instanceof Error ? err.message : 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  }, [user?.uid]);
  
  const updateProfile = useCallback(
    async (updates: Partial<MemberProfile>) => {
      if (!user?.uid) return;
      
      try {
        await updateMemberProfile(user.uid, {
          ...updates,
          updatedAt: new Date(),
        });
        
        // Update local state
        setProfile(prev => prev ? { ...prev, ...updates, updatedAt: new Date() } : null);
      } catch (err) {
        console.error('Error updating profile:', err);
        setError(err instanceof Error ? err.message : 'Failed to update profile');
        throw err;
      }
    },
    [user?.uid]
  );
  
  const completeProfile = useCallback(
    async (updates: Partial<MemberProfile>) => {
      if (!user?.uid) return;
      
      try {
        await updateMemberProfile(user.uid, {
          ...updates,
          profileCompletedDate: new Date(),
          updatedAt: new Date(),
        });
        
        // Award points for profile completion
        if (!profile?.profileCompletedDate) {
          await addPoints(user.uid, 'complete_profile', 'Completed member profile');
          // Reload to get updated points
          await loadProfile();
        }
        
        setProfile(prev =>
          prev
            ? {
                ...prev,
                ...updates,
                profileCompletedDate: new Date(),
                updatedAt: new Date(),
              }
            : null
        );
      } catch (err) {
        console.error('Error completing profile:', err);
        setError(err instanceof Error ? err.message : 'Failed to complete profile');
        throw err;
      }
    },
    [user?.uid, profile?.profileCompletedDate, loadProfile]
  );
  
  const recordActivity = useCallback(
    async (
      action: ContributionAction,
      description: string,
      metadata?: Record<string, any>
    ) => {
      if (!user?.uid) return;
      
      try {
        await addPoints(user.uid, action, description, metadata);
        
        // Reload profile to get updated points
        await loadProfile();
      } catch (err) {
        console.error('Error recording activity:', err);
        setError(err instanceof Error ? err.message : 'Failed to record activity');
        throw err;
      }
    },
    [user?.uid, loadProfile]
  );
  
  const submitContributionRecord = useCallback(
    async (
      type: 'event' | 'project' | 'content' | 'feedback' | 'referral',
      title: string,
      description: string,
      metadata?: Record<string, any>
    ) => {
      if (!user?.uid) return;
      
      try {
        await submitContribution(user.uid, type, title, description, metadata);
        
        // Reload contributions
        const contribs = await getUserContributions(user.uid, 10);
        setContributions(contribs);
      } catch (err) {
        console.error('Error submitting contribution:', err);
        setError(err instanceof Error ? err.message : 'Failed to submit contribution');
        throw err;
      }
    },
    [user?.uid]
  );
  
  const loadLeaderboardData = useCallback(async () => {
    try {
      const [topUsers, trendingUsers] = await Promise.all([
        getTopContributors(10),
        getTrendingContributors('week'),
      ]);
      
      setTopContributors(topUsers);
      setTrendingContributors(trendingUsers);
    } catch (err) {
      console.error('Error loading leaderboard data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load leaderboard');
    }
  }, []);
  
  // Load profile on mount and when user changes
  useEffect(() => {
    if (user?.uid) {
      loadProfile();
    } else {
      setProfile(null);
      setRecentPoints([]);
      setContributions([]);
      setBadges([]);
      setActivityFeed([]);
    }
  }, [user?.uid, loadProfile]);
  
  // Calculate progress to next level
  const progressToNextLevel = profile
    ? getProgressToNextLevel(profile.totalPoints)
    : {
        currentLevel: 'Curious',
        nextLevel: 'Contributor',
        currentPoints: 0,
        pointsNeeded: 100,
        progressPercent: 0,
      };
  
  const value: ProgressionContextType = {
    profile,
    loading,
    error,
    recentPoints,
    contributions,
    badges,
    activityFeed,
    topContributors,
    trendingContributors,
    loadProfile,
    updateProfile,
    completeProfile,
    recordActivity,
    submitContribution: submitContributionRecord,
    loadLeaderboardData,
    progressToNextLevel,
  };
  
  return (
    <ProgressionContext.Provider value={value}>
      {children}
    </ProgressionContext.Provider>
  );
}

export function useProgression() {
  const context = useContext(ProgressionContext);
  if (!context) {
    throw new Error('useProgression must be used within ProgressionProvider');
  }
  return context;
}
