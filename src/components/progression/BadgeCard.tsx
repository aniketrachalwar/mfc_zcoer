/**
 * Badge Card Component - Displays individual badge
 */

import React from 'react';
import { Badge } from '../../lib/progression/types';
import { getBadgeRarityColor } from '../../lib/progression/utils';

interface BadgeCardProps {
  badge: Badge;
  unlocked?: boolean;
  size?: 'sm' | 'md' | 'lg';
  key?: React.Key;
}

export function BadgeCard({ badge, unlocked = true, size = 'md' }: BadgeCardProps) {
  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-32 h-32',
  };
  
  const textSizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };
  
  const iconSizes = {
    sm: 'text-2xl',
    md: 'text-4xl',
    lg: 'text-6xl',
  };
  
  return (
    <div
      className={`flex flex-col items-center justify-center p-2 rounded-lg border-2 transition-all
        ${unlocked ? getBadgeRarityColor(badge.rarity) : 'bg-white/10 text-white/50 border-white/20'}
        ${!unlocked && 'opacity-50'}`}
      title={badge.description}
    >
      <div className={iconSizes[size]}>{badge.icon}</div>
      <p className={`${textSizes[size]} font-semibold text-center mt-1 truncate w-full`}>
        {badge.name}
      </p>
      {!unlocked && <p className="text-xs text-white/60 mt-0.5">Locked</p>}
    </div>
  );
}


