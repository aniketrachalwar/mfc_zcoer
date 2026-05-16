/**
 * Progress to Next Level Component
 */

import React, { useEffect, useState } from 'react';
import { useProgression } from '../../lib/ProgressionContext';
import { MEMBER_LEVELS } from '../../lib/progression/constants';

interface ProgressBarProps {
  showDetails?: boolean;
  animated?: boolean;
}

export function ProgressToNextLevel({ showDetails = true, animated = true }: ProgressBarProps) {
  const { progressToNextLevel } = useProgression();
  const [displayProgress, setDisplayProgress] = useState(0);
  
  useEffect(() => {
    if (!animated) {
      setDisplayProgress(progressToNextLevel.progressPercent);
      return;
    }
    
    let interval: NodeJS.Timeout;
    let current = 0;
    const target = progressToNextLevel.progressPercent;
    
    if (current < target) {
      interval = setInterval(() => {
        current = Math.min(current + 2, target);
        setDisplayProgress(current);
      }, 30);
    }
    
    return () => clearInterval(interval);
  }, [progressToNextLevel.progressPercent, animated]);
  
  const nextLevelData = Object.values(MEMBER_LEVELS).find(
    level => level.name === progressToNextLevel.nextLevel
  );
  
  return (
    <div className="w-full space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-white/80">
          Progress to {progressToNextLevel.nextLevel}
        </span>
        {showDetails && (
          <span className="text-xs text-white/60">
            {progressToNextLevel.currentPoints} / {progressToNextLevel.pointsNeeded + progressToNextLevel.currentPoints} points
          </span>
        )}
      </div>
      
      <div className="relative h-3 bg-white/10 rounded-full overflow-hidden shadow-inner">
        <div
          className="h-full bg-gradient-to-r from-[#050505]0 to-blue-600 rounded-full shadow-2xl shadow-black/50 transition-all duration-500"
          style={{ width: `${displayProgress}%` }}
        >
          {displayProgress > 10 && (
            <div className="h-full animate-pulse opacity-50 bg-white" />
          )}
        </div>
      </div>
      
      {showDetails && (
        <div className="flex items-center justify-between text-xs text-white/60">
          <span className="font-medium">{Math.round(displayProgress)}%</span>
          {progressToNextLevel.pointsNeeded > 0 ? (
            <span>{progressToNextLevel.pointsNeeded} points away</span>
          ) : (
            <span className="text-green-600 font-semibold">🎉 Max Level Reached!</span>
          )}
        </div>
      )}
    </div>
  );
}


