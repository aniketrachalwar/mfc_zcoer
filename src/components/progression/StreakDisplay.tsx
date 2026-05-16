/**
 * Activity Streak Component
 */

import React from 'react';
import { MemberProfile } from '../../lib/progression/types';

interface StreakDisplayProps {
  profile: MemberProfile;
}

export function StreakDisplay({ profile }: StreakDisplayProps) {
  const getStreakMessage = (streak: number): string => {
    if (streak === 0) return 'Start your first contribution!';
    if (streak === 1) return 'Great start!';
    if (streak < 7) return 'Keep it going!';
    if (streak < 30) return 'Impressive run!';
    if (streak < 90) return 'Fantastic momentum!';
    if (streak < 365) return 'Unstoppable!';
    return 'Legendary streak! 👑';
  };
  
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-4">
        <div className="text-4xl">🔥</div>
        <div className="flex-1">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-orange-600">{profile.currentStreak}</span>
            <span className="text-sm text-white/60">day streak</span>
          </div>
          <p className="text-sm text-white/80 font-medium">{getStreakMessage(profile.currentStreak)}</p>
        </div>
      </div>
      
      <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-lg p-3 border border-orange-200">
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <p className="text-xs text-white/60 mb-1">Current Streak</p>
            <p className="text-2xl font-bold text-orange-600">{profile.currentStreak}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-white/60 mb-1">Longest Streak</p>
            <p className="text-2xl font-bold text-amber-600">{profile.longestStreak}</p>
          </div>
        </div>
      </div>
      
      {profile.currentStreak > 0 && profile.lastActivityDate && (
        <p className="text-xs text-white/60 text-center">
          Last activity: {new Date(profile.lastActivityDate).toLocaleDateString()}
        </p>
      )}
      
      {profile.currentStreak === 0 && (
        <div className="bg-blue-600/10 rounded-lg p-3 border border-blue-200 text-sm text-blue-600">
          💡 Make your first contribution today to start your streak!
        </div>
      )}
    </div>
  );
}


