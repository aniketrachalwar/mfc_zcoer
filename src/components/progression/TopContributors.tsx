/**
 * Top Contributors Leaderboard Component
 * Shows top contributors based on points
 */

import React, { useEffect } from 'react';
import { useProgression } from '../../lib/ProgressionContext';
import { MEMBER_LEVELS } from '../../lib/progression/constants';
import { Trophy, Flame } from 'lucide-react';

export function TopContributors() {
  const { topContributors, trendingContributors, loadLeaderboardData, loading } = useProgression();
  
  useEffect(() => {
    loadLeaderboardData();
  }, [loadLeaderboardData]);
  
  const renderRank = (rank: number) => {
    const medals: Record<number, string> = {
      1: '🥇',
      2: '🥈',
      3: '🥉',
    };
    return medals[rank] || `#${rank}`;
  };
  
  const ContributorRow = ({ contributor, trending = false }: any) => {
    const levelData = MEMBER_LEVELS[contributor.level as keyof typeof MEMBER_LEVELS];
    
    return (
      <div className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors border border-gray-100">
        <div className="flex items-center gap-3 flex-1">
          <div className="text-2xl font-bold text-white/40 w-8">
            {renderRank(contributor.rank)}
          </div>
          
          <div className="flex-1">
            <p className="font-semibold text-white">{contributor.name}</p>
            <div className="flex items-center gap-2">
              <span className="text-xs bg-blue-600/20 text-blue-600 px-2 py-0.5 rounded">
                {levelData.icon} {levelData.name}
              </span>
              {contributor.currentStreak > 0 && (
                <span className="flex items-center gap-0.5 text-xs text-orange-600 font-medium">
                  <Flame size={12} /> {contributor.currentStreak}
                </span>
              )}
            </div>
          </div>
        </div>
        
        <div className="text-right">
          <p className="font-bold text-lg text-blue-600">{contributor.totalPoints || contributor.recentPoints}</p>
          <p className="text-xs text-white/60">{contributor.badges} badges</p>
        </div>
      </div>
    );
  };
  
  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className="h-16 bg-white/10 rounded-lg" />
        ))}
      </div>
    );
  }
  
  return (
    <div className="space-y-8">
      {/* All Time Top Contributors */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Trophy className="text-yellow-600" size={24} />
          <h3 className="text-xl font-bold text-white">All-Time Top Contributors</h3>
        </div>
        
        <div className="space-y-2">
          {topContributors.length > 0 ? (
            topContributors.map(contributor => (
              <ContributorRow key={contributor.userId} contributor={contributor} />
            ))
          ) : (
            <div className="text-center py-8 text-white/60">
              <p>No contributors yet</p>
            </div>
          )}
        </div>
      </div>
      
      {/* This Week's Trending */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Flame className="text-orange-600" size={24} />
          <h3 className="text-xl font-bold text-white">This Week's Trending</h3>
        </div>
        
        <div className="space-y-2">
          {trendingContributors.length > 0 ? (
            trendingContributors.map(contributor => (
              <ContributorRow key={contributor.userId} contributor={contributor} trending={true} />
            ))
          ) : (
            <div className="text-center py-8 text-white/60">
              <p>No activity this week yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


