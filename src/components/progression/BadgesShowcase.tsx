/**
 * Badges Showcase Component
 */

import React, { useState } from 'react';
import { Badge } from '../../lib/progression/types';
import { BadgeCard } from './BadgeCard';
import { BADGES } from '../../lib/progression/constants';
import { groupBadgesByCategory } from '../../lib/progression/utils';

interface BadgesShowcaseProps {
  earnedBadgeIds: string[];
  showAll?: boolean;
  title?: string;
}

const BADGE_CATEGORY_NAMES: Record<string, string> = {
  achievement: '🏅 Achievements',
  milestone: '🎯 Milestones',
  contribution: '💻 Contributions',
  streak: '🔥 Streaks',
  leadership: '👑 Leadership',
};

export function BadgesShowcase({ earnedBadgeIds, showAll = true, title = 'Badges' }: BadgesShowcaseProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  
  const earnedBadges = BADGES.filter(b => earnedBadgeIds.includes(b.id));
  const unlockedBadges = new Set(earnedBadgeIds);
  
  const badgesToShow = showAll ? BADGES : earnedBadges;
  const groupedBadges = groupBadgesByCategory(badgesToShow);
  
  const categories = Object.keys(groupedBadges);
  const displayCategory = selectedCategory || categories[0];
  const badgesInCategory = groupedBadges[displayCategory] || [];
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-white">{title}</h3>
        <span className="text-sm font-semibold text-orange-600 bg-orange-100 px-3 py-1 rounded-full">
          {earnedBadges.length} / {BADGES.length}
        </span>
      </div>
      
      {/* Category Tabs */}
      {showAll && categories.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap
                ${displayCategory === category
                  ? 'bg-blue-600 text-white shadow-2xl shadow-black/50'
                  : 'bg-white/5 text-white/80 hover:bg-white/10'
                }`}
            >
              {BADGE_CATEGORY_NAMES[category] || category}
            </button>
          ))}
        </div>
      )}
      
      {/* Badge Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {badgesInCategory.map(badge => (
          <BadgeCard
            key={badge.id}
            badge={badge}
            unlocked={unlockedBadges.has(badge.id)}
            size="md"
          />
        ))}
      </div>
      
      {badgesInCategory.length === 0 && (
        <div className="text-center py-8 text-white/60">
          <p className="text-lg">No badges in this category yet</p>
          <p className="text-sm mt-1">Keep contributing to unlock badges!</p>
        </div>
      )}
      
      {/* Stats */}
      {showAll && (
        <div className="grid grid-cols-3 gap-3 p-4 bg-gradient-to-r from-[#050505] to-white/5 rounded-lg">
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">{earnedBadges.length}</p>
            <p className="text-xs text-white/80">Unlocked</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-white/60">{BADGES.length - earnedBadges.length}</p>
            <p className="text-xs text-white/80">Remaining</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-orange-600">
              {Math.round((earnedBadges.length / BADGES.length) * 100)}%
            </p>
            <p className="text-xs text-white/80">Complete</p>
          </div>
        </div>
      )}
    </div>
  );
}


