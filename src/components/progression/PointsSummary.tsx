/**
 * Points Summary Component
 */

import React from 'react';
import { MemberProfile, PointEntry } from '../../lib/progression/types';
import { formatPoints } from '../../lib/progression/utils';

interface PointsSummaryProps {
  profile: MemberProfile;
  recentPoints: PointEntry[];
  showBreakdown?: boolean;
}

const ACTION_NAMES: Record<string, string> = {
  join_club: 'Joined Club',
  complete_profile: 'Completed Profile',
  attend_event: 'Attended Event',
  organize_event: 'Organized Event',
  contribute_project: 'Project Contribution',
  pr_merged: 'PR Merged',
  publish_content: 'Published Content',
  submit_feedback: 'Submitted Feedback',
  refer_member: 'Member Referral',
  earn_badge: 'Badge Unlocked',
  streak_30days: '30-Day Streak',
  other: 'Other Activity',
};

export function PointsSummary({ profile, recentPoints, showBreakdown = true }: PointsSummaryProps) {
  const actionCounts = recentPoints.reduce(
    (acc, entry) => {
      acc[entry.action] = (acc[entry.action] || 0) + entry.points;
      return acc;
    },
    {} as Record<string, number>
  );
  
  const sortedActions = Object.entries(actionCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);
  
  const totalRecentPoints = recentPoints.reduce((sum, entry) => sum + entry.points, 0);
  
  return (
    <div className="space-y-4">
      {/* Total Points */}
      <div className="bg-gradient-to-br from-[#050505]0 to-blue-600 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium opacity-90">Total Points</p>
            <p className="text-4xl font-bold">{formatPoints(profile.totalPoints)}</p>
          </div>
          <div className="text-6xl opacity-20">⭐</div>
        </div>
      </div>
      
      {/* Recent Activity */}
      {showBreakdown && recentPoints.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-white text-sm">Recent Activity</h4>
            <span className="text-xs text-white/60 bg-white/5 px-2 py-1 rounded">
              +{totalRecentPoints} points
            </span>
          </div>
          
          <div className="space-y-2">
            {sortedActions.map(([action, points]) => (
              <div key={action} className="flex items-center justify-between text-sm">
                <span className="text-white/80">{ACTION_NAMES[action] || action}</span>
                <span className="font-semibold text-blue-600">+{points}</span>
              </div>
            ))}
          </div>
          
          {recentPoints.length > 0 && (
            <div className="pt-2 border-t border-white/10 flex items-center justify-between text-sm font-semibold">
              <span className="text-white/80">Recent Total</span>
              <span className="text-blue-600">+{totalRecentPoints}</span>
            </div>
          )}
        </div>
      )}
      
      {/* Empty State */}
      {recentPoints.length === 0 && showBreakdown && (
        <div className="text-center py-6 text-white/60">
          <p className="text-sm">No recent activity</p>
          <p className="text-xs mt-1">Start contributing to earn points!</p>
        </div>
      )}
    </div>
  );
}


