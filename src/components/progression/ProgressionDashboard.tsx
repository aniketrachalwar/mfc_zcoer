/**
 * Progression Dashboard Widget
 * Quick overview of user's progression
 */

import React from 'react';
import { useProgression } from '../../lib/ProgressionContext';
import { LevelBadge } from './LevelBadge';
import { ProgressToNextLevel } from './ProgressToNextLevel';
import { StreakDisplay } from './StreakDisplay';
import { BadgeCard } from './BadgeCard';
import { BADGES } from '../../lib/progression/constants';
import { ArrowRight } from 'lucide-react';

interface ProgressionDashboardProps {
  compact?: boolean;
  showBadges?: boolean;
  onViewProfile?: () => void;
}

export function ProgressionDashboard({
  compact = false,
  showBadges = true,
  onViewProfile,
}: ProgressionDashboardProps) {
  const { profile, badges, loading } = useProgression();
  
  if (loading || !profile) {
    return (
      <div className="bg-gradient-to-br from-[#050505] to-purple-50 rounded-lg p-6 animate-pulse">
        <div className="h-6 bg-gray-300 rounded w-48 mb-4" />
        <div className="grid grid-cols-2 gap-4">
          <div className="h-20 bg-gray-300 rounded" />
          <div className="h-20 bg-gray-300 rounded" />
        </div>
      </div>
    );
  }
  
  const recentBadges = badges.slice(0, 3);
  
  if (compact) {
    return (
      <div className="bg-white border border-white/10 rounded-lg p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div>
              <p className="font-bold text-white">{profile.name}</p>
              <p className="text-sm text-white/60">{profile.totalPoints} points • {profile.level.replace('_', ' ')}</p>
            </div>
          </div>
          <div className="text-2xl">{profile.badges.length === 0 ? '🌱' : '⭐'}</div>
        </div>
        
        <div className="space-y-2">
          <ProgressToNextLevel showDetails={false} animated={true} />
        </div>
        
        {onViewProfile && (
          <button
            onClick={onViewProfile}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-600/80 transition-all text-sm font-medium"
          >
            View Profile <ArrowRight size={16} />
          </button>
        )}
      </div>
    );
  }
  
  return (
    <div className="bg-gradient-to-br from-[#050505] via-purple-50 to-blue-50 rounded-xl overflow-hidden shadow-lg">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
        <h2 className="text-2xl font-bold mb-2">Your Progression</h2>
        <p className="text-white/80">Track your contribution journey</p>
      </div>
      
      <div className="p-6 space-y-6">
        {/* Level & Points */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Level */}
          <div className="flex flex-col items-center p-4 bg-white rounded-md border border-white/10">
            <LevelBadge profile={profile} size="md" showLabel={true} />
          </div>
          
          {/* Total Points */}
          <div className="flex items-center justify-center p-4 bg-white rounded-md border border-white/10">
            <div className="text-center">
              <p className="text-sm text-white/60 mb-1">Total Points</p>
              <p className="text-4xl font-bold text-blue-600">{profile.totalPoints.toLocaleString()}</p>
            </div>
          </div>
          
          {/* Streak */}
          <div className="flex items-center justify-center p-4 bg-white rounded-md border border-white/10">
            <div className="text-center">
              <p className="text-2xl mb-1">🔥</p>
              <p className="text-sm text-white/60 mb-1">Current Streak</p>
              <p className="text-4xl font-bold text-orange-600">{profile.currentStreak}</p>
            </div>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="bg-white rounded-md border border-white/10 p-4">
          <ProgressToNextLevel showDetails={true} animated={true} />
        </div>
        
        {/* Recent Badges */}
        {showBadges && badges.length > 0 && (
          <div>
            <h3 className="font-bold text-white mb-3">Recent Badges ({profile.badges.length})</h3>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
              {recentBadges.map(badge => (
                <BadgeCard key={badge.id} badge={badge} unlocked={true} size="md" />
              ))}
              {profile.badges.length > 3 && (
                <div className="flex items-center justify-center p-2 rounded-lg border-2 border-white/20 bg-gray-50">
                  <p className="text-center text-sm font-semibold text-white/60">
                    +{profile.badges.length - 3} more
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* No badges yet */}
        {showBadges && badges.length === 0 && (
          <div className="bg-blue-600/10 rounded-lg p-4 border border-blue-200 text-center">
            <p className="text-sm text-blue-600">
              💡 Complete contributions to unlock badges!
            </p>
          </div>
        )}
        
        {/* Call to Action */}
        {onViewProfile && (
          <button
            onClick={onViewProfile}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg hover:shadow-lg transition-all font-semibold flex items-center justify-center gap-2"
          >
            View Full Profile <ArrowRight size={18} />
          </button>
        )}
      </div>
    </div>
  );
}


