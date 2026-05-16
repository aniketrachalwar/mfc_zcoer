/**
 * Member Profile Page Component
 */

import React, { useState, useEffect } from 'react';
import { useProgression } from '../../lib/ProgressionContext';
import { useAuth } from '../../lib/AuthContext';
import { LevelBadge } from './LevelBadge';
import { StreakDisplay } from './StreakDisplay';
import { ProgressToNextLevel } from './ProgressToNextLevel';
import { BadgesShowcase } from './BadgesShowcase';
import { ActivityFeed } from './ActivityFeed';
import { PointsSummary } from './PointsSummary';
import { Mail, Github, Linkedin, Globe, Edit2, CheckCircle, Clock } from 'lucide-react';

export function MemberProfilePage() {
  const { user } = useAuth();
  const { profile, recentPoints, badges, activityFeed, loading } = useProgression();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    bio: '',
    skills: '',
    github: '',
    linkedin: '',
    portfolio: '',
  });
  
  useEffect(() => {
    if (profile) {
      setFormData({
        bio: profile.bio || '',
        skills: (profile.skills || []).join(', '),
        github: profile.github || '',
        linkedin: profile.linkedin || '',
        portfolio: profile.portfolio || '',
      });
    }
  }, [profile]);
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin text-4xl mb-4">⚙️</div>
          <p className="text-white/60">Loading your profile...</p>
        </div>
      </div>
    );
  }
  
  if (!profile) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-lg text-white/60">Profile not found</p>
        </div>
      </div>
    );
  }
  
  const profileCompletion = [
    profile.name ? '✓' : '',
    profile.photoURL ? '✓' : '',
    profile.bio ? '✓' : '',
    profile.skills.length > 0 ? '✓' : '',
  ].filter(Boolean).length;
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 py-8 text-white">
        <div className="max-w-6xl mx-auto px-4 flex items-center justify-between">
          <div className="flex-1">
            <h1 className="text-3xl font-bold">{profile.name}</h1>
            <p className="text-white/80 mt-1">{profile.email}</p>
          </div>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="flex items-center gap-2 bg-white bg-opacity-20 hover:bg-opacity-30 px-4 py-2 rounded-lg transition-all"
          >
            <Edit2 size={18} />
            {isEditing ? 'Cancel' : 'Edit'}
          </button>
        </div>
      </div>
      
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Profile Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Left Column - Level & Streak */}
          <div className="space-y-6">
            {/* Level Card */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="font-bold text-white mb-4">Your Level</h3>
              <div className="flex justify-center mb-4">
                <LevelBadge profile={profile} size="lg" showLabel={false} />
              </div>
              <p className="text-center text-lg font-bold text-white">{profile.level.replace('_', ' ').toUpperCase()}</p>
              <p className="text-center text-sm text-white/60 mt-2">
                {profile.totalPoints.toLocaleString()} total points
              </p>
            </div>
            
            {/* Streak Card */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="font-bold text-white mb-4">Your Streak</h3>
              <StreakDisplay profile={profile} />
            </div>
          </div>
          
          {/* Middle Column - Points & Progress */}
          <div className="space-y-6">
            {/* Points Summary */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <PointsSummary profile={profile} recentPoints={recentPoints} showBreakdown={true} />
            </div>
            
            {/* Progress to Next Level */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="font-bold text-white mb-4">Progression</h3>
              <ProgressToNextLevel showDetails={true} animated={true} />
            </div>
          </div>
          
          {/* Right Column - Profile Info */}
          <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
            <h3 className="font-bold text-white">Profile Info</h3>
            
            {/* Profile Completion */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-white/80">Profile Completion</span>
                <span className="text-sm font-bold text-blue-600">{profileCompletion}/4</span>
              </div>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-500 transition-all"
                  style={{ width: `${(profileCompletion / 4) * 100}%` }}
                />
              </div>
            </div>
            
            {/* Bio */}
            {!isEditing ? (
              <div>
                <p className="text-xs text-white/60 font-semibold mb-1">BIO</p>
                <p className="text-white text-sm">{profile.bio || 'No bio added yet'}</p>
              </div>
            ) : (
              <textarea
                value={formData.bio}
                onChange={e => setFormData({ ...formData, bio: e.target.value })}
                placeholder="Tell us about yourself..."
                className="w-full p-2 border border-white/20 rounded text-sm"
                rows={3}
              />
            )}
            
            {/* Skills */}
            <div>
              <p className="text-xs text-white/60 font-semibold mb-1">SKILLS</p>
              {!isEditing ? (
                <div className="flex flex-wrap gap-1">
                  {profile.skills.length > 0 ? (
                    profile.skills.map((skill, i) => (
                      <span key={i} className="text-xs bg-blue-600/20 text-blue-600 px-2 py-1 rounded">
                        {skill}
                      </span>
                    ))
                  ) : (
                    <p className="text-sm text-white/60">No skills added yet</p>
                  )}
                </div>
              ) : (
                <input
                  type="text"
                  value={formData.skills}
                  onChange={e => setFormData({ ...formData, skills: e.target.value })}
                  placeholder="e.g., React, Python, Web Design"
                  className="w-full p-2 border border-white/20 rounded text-sm"
                />
              )}
            </div>
            
            {/* Social Links */}
            <div className="space-y-2">
              <p className="text-xs text-white/60 font-semibold">SOCIAL LINKS</p>
              <div className="space-y-2">
                {!isEditing ? (
                  <>
                    {profile.github && (
                      <a
                        href={`https://github.com/${profile.github}`}
                        className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-600"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Github size={16} />
                        GitHub
                      </a>
                    )}
                    {profile.linkedin && (
                      <a
                        href={profile.linkedin}
                        className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-600"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Linkedin size={16} />
                        LinkedIn
                      </a>
                    )}
                    {profile.portfolio && (
                      <a
                        href={profile.portfolio}
                        className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-600"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Globe size={16} />
                        Portfolio
                      </a>
                    )}
                    {!profile.github && !profile.linkedin && !profile.portfolio && (
                      <p className="text-sm text-white/60">No social links added yet</p>
                    )}
                  </>
                ) : (
                  <>
                    <input
                      type="text"
                      value={formData.github}
                      onChange={e => setFormData({ ...formData, github: e.target.value })}
                      placeholder="GitHub username"
                      className="w-full p-2 border border-white/20 rounded text-sm"
                    />
                    <input
                      type="text"
                      value={formData.linkedin}
                      onChange={e => setFormData({ ...formData, linkedin: e.target.value })}
                      placeholder="LinkedIn URL"
                      className="w-full p-2 border border-white/20 rounded text-sm"
                    />
                    <input
                      type="text"
                      value={formData.portfolio}
                      onChange={e => setFormData({ ...formData, portfolio: e.target.value })}
                      placeholder="Portfolio URL"
                      className="w-full p-2 border border-white/20 rounded text-sm"
                    />
                  </>
                )}
              </div>
            </div>
            
            {/* Save Button */}
            {isEditing && (
              <button
                onClick={() => setIsEditing(false)}
                className="w-full bg-blue-600 text-white py-2 rounded font-medium hover:bg-blue-600/80 transition-all"
              >
                Save Changes
              </button>
            )}
          </div>
        </div>
        
        {/* Full Width Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Badges */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <BadgesShowcase
              earnedBadgeIds={profile.badges}
              showAll={true}
              title={`Badges (${profile.badges.length}/11)`}
            />
          </div>
          
          {/* Activity Feed */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-bold text-white mb-4">Recent Activity</h3>
            <ActivityFeed activities={activityFeed} maxItems={8} />
          </div>
        </div>
        
        {/* Member Info */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-bold text-white mb-4">Member Information</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-xs text-white/60 font-semibold mb-1">JOINED</p>
              <p className="text-sm text-white">{new Date(profile.joinDate).toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-xs text-white/60 font-semibold mb-1">TOTAL POINTS</p>
              <p className="text-sm text-white font-bold">{profile.totalPoints.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-xs text-white/60 font-semibold mb-1">BADGES EARNED</p>
              <p className="text-sm text-white font-bold">{profile.badges.length}</p>
            </div>
            <div>
              <p className="text-xs text-white/60 font-semibold mb-1">PROFILE STATUS</p>
              <div className="flex items-center gap-1">
                <CheckCircle size={16} className="text-green-600" />
                <p className="text-sm text-white">Verified</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


