/**
 * Activity Feed Component - Shows recent contributions and achievements
 */

import React from 'react';
import { ActivityFeedItem } from '../../lib/progression/types';

interface ActivityFeedProps {
  activities: ActivityFeedItem[];
  maxItems?: number;
}

const ACTIVITY_ICONS: Record<string, string> = {
  points_earned: '⭐',
  badge_unlocked: '🏆',
  level_up: '📈',
  streak_milestone: '🔥',
  contribution_approved: '✅',
};

export function ActivityFeed({ activities, maxItems = 10 }: ActivityFeedProps) {
  const displayActivities = activities.slice(0, maxItems);
  
  const formatDate = (date: Date | string): string => {
    const d = new Date(date);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return d.toLocaleDateString();
  };
  
  if (displayActivities.length === 0) {
    return (
      <div className="text-center py-8 text-white/60">
        <p className="text-lg">No activity yet</p>
        <p className="text-sm mt-1">Start contributing to see your activity here!</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-3">
      {displayActivities.map((activity, index) => (
        <div
          key={activity.id}
          className="flex gap-3 p-3 rounded-lg border border-white/10 hover:border-white/20 transition-colors bg-white"
        >
          {/* Timeline dot */}
          <div className="flex flex-col items-center">
            <div className="text-2xl">{ACTIVITY_ICONS[activity.type] || activity.icon}</div>
            {index < displayActivities.length - 1 && (
              <div className="h-8 w-0.5 bg-gradient-to-b from-gray-300 to-transparent mt-2" />
            )}
          </div>
          
          {/* Activity content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <p className="font-semibold text-white text-sm">{activity.title}</p>
                {activity.description && (
                  <p className="text-xs text-white/60 mt-0.5 line-clamp-2">{activity.description}</p>
                )}
              </div>
              <span className="text-xs text-white/50 whitespace-nowrap">
                {formatDate(activity.timestamp)}
              </span>
            </div>
          </div>
        </div>
      ))}
      
      {activities.length > maxItems && (
        <div className="text-center pt-2">
          <p className="text-xs text-white/60">
            +{activities.length - maxItems} more activities
          </p>
        </div>
      )}
    </div>
  );
}


