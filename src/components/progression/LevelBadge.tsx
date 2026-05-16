/**
 * Level Badge Component - Shows current member level
 */

import React from 'react';
import { MemberProfile } from '../../lib/progression/types';
import { MEMBER_LEVELS } from '../../lib/progression/constants';

interface LevelBadgeProps {
  profile: MemberProfile;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export function LevelBadge({ profile, size = 'md', showLabel = true }: LevelBadgeProps) {
  const levelData = MEMBER_LEVELS[profile.level];
  
  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-20 h-20',
    lg: 'w-32 h-32',
  };
  
  const iconSizes = {
    sm: 'text-xl',
    md: 'text-3xl',
    lg: 'text-6xl',
  };
  
  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className={`flex items-center justify-center rounded-full shadow-lg 
          bg-gradient-to-br ${levelData.color} text-white font-bold
          ${sizeClasses[size]}`}
      >
        <span className={iconSizes[size]}>{levelData.icon}</span>
      </div>
      {showLabel && (
        <div className="text-center">
          <p className="font-bold text-sm">{levelData.name}</p>
          <p className="text-xs text-white/60">{profile.totalPoints} points</p>
        </div>
      )}
    </div>
  );
}


