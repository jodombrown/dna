/**
 * DNA Profile v2 - Diaspora Impact Dashboard
 * Main profile page at /dna/:username
 */

import React from 'react';
import { useParams } from 'react-router-dom';
import { useProfileV2 } from '@/hooks/useProfileV2';
import { Loader2 } from 'lucide-react';

const ProfileV2: React.FC = () => {
  const { username } = useParams<{ username: string }>();
  const { data: bundle, isLoading, error } = useProfileV2(username);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !bundle) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4">
        <h1 className="text-2xl font-bold text-foreground mb-2">Profile Not Found</h1>
        <p className="text-muted-foreground">
          {username ? `@${username} does not exist or has been removed.` : 'No username provided.'}
        </p>
      </div>
    );
  }

  const { profile, permissions, completion, verification_meta } = bundle;

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative">
        {/* Banner */}
        <div 
          className="h-48 md:h-64 w-full bg-gradient-to-r from-primary/20 to-accent/20"
          style={profile.banner_url ? { backgroundImage: `url(${profile.banner_url})`, backgroundSize: 'cover' } : undefined}
        />
        
        {/* Profile Header */}
        <div className="container mx-auto px-4">
          <div className="relative -mt-16 pb-6">
            {/* Avatar */}
            <div className="flex flex-col md:flex-row md:items-end gap-4">
              <div className="relative">
                <img
                  src={profile.avatar_url || '/placeholder.svg'}
                  alt={profile.full_name}
                  className="w-32 h-32 rounded-full border-4 border-background object-cover"
                />
                {/* Verification Badge */}
                {profile.verification_status === 'fully_verified' && (
                  <div className="absolute bottom-2 right-2 w-8 h-8 bg-primary rounded-full flex items-center justify-center border-2 border-background">
                    <svg className="w-5 h-5 text-primary-foreground" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
                {profile.verification_status === 'soft_verified' && (
                  <div className="absolute bottom-2 right-2 w-8 h-8 bg-background rounded-full flex items-center justify-center border-2 border-primary">
                    <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-foreground">{profile.full_name}</h1>
                    <p className="text-muted-foreground">@{profile.username}</p>
                    {profile.headline && (
                      <p className="text-lg text-foreground mt-1">{profile.headline}</p>
                    )}
                    <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                      {profile.professional_role && <span>{profile.professional_role}</span>}
                      {profile.company && <span>• {profile.company}</span>}
                      {profile.location && <span>• {profile.location}</span>}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    {permissions.is_owner ? (
                      <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90">
                        Edit Profile
                      </button>
                    ) : (
                      <>
                        {permissions.can_connect && (
                          <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90">
                            Connect
                          </button>
                        )}
                        <button className="px-4 py-2 border border-border rounded-lg hover:bg-accent">
                          Message
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* About Section */}
            {profile.bio && (
              <div className="bg-card rounded-lg p-6 border border-border">
                <h2 className="text-xl font-semibold mb-3">About</h2>
                <p className="text-foreground whitespace-pre-wrap">{profile.bio}</p>
              </div>
            )}

            {/* Diaspora Story */}
            {profile.country_of_origin && (
              <div className="bg-card rounded-lg p-6 border border-border">
                <h2 className="text-xl font-semibold mb-3">Diaspora Story</h2>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">Country of Origin:</span>
                    <span className="font-medium">{profile.country_of_origin}</span>
                  </div>
                  {profile.current_country && (
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">Current Country:</span>
                      <span className="font-medium">{profile.current_country}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Skills Section */}
            {bundle.tags.skills.length > 0 && (
              <div className="bg-card rounded-lg p-6 border border-border">
                <h2 className="text-xl font-semibold mb-3">Skills</h2>
                <div className="flex flex-wrap gap-2">
                  {bundle.tags.skills.map((skill, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Interests Section */}
            {bundle.tags.interests.length > 0 && (
              <div className="bg-card rounded-lg p-6 border border-border">
                <h2 className="text-xl font-semibold mb-3">Interests & Focus Areas</h2>
                <div className="flex flex-wrap gap-2">
                  {bundle.tags.interests.map((interest, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-accent text-accent-foreground rounded-full text-sm"
                    >
                      {interest}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Profile Completion (Owner Only) */}
            {permissions.is_owner && completion.score < 100 && (
              <div className="bg-card rounded-lg p-6 border border-border">
                <h3 className="text-lg font-semibold mb-3">Profile Completion</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-semibold">{completion.score}%</span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all"
                      style={{ width: `${completion.score}%` }}
                    />
                  </div>
                  {completion.suggested_actions.length > 0 && (
                    <div className="mt-4">
                      <p className="text-sm text-muted-foreground mb-2">Next steps:</p>
                      <ul className="space-y-1 text-sm">
                        {completion.suggested_actions
                          .filter(action => action)
                          .map((action, idx) => (
                            <li key={idx} className="text-primary">• {action.replace(/_/g, ' ')}</li>
                          ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* DNA Activity */}
            <div className="bg-card rounded-lg p-6 border border-border">
              <h3 className="text-lg font-semibold mb-4">DNA Activity</h3>
              
              {/* Connections */}
              <div className="mb-4">
                <div className="text-sm text-muted-foreground">Connections</div>
                <div className="text-2xl font-bold">{bundle.activity.connections_count}</div>
              </div>

              {/* Spaces */}
              {bundle.activity.spaces.length > 0 && (
                <div className="mb-4">
                  <div className="text-sm text-muted-foreground mb-2">Spaces ({bundle.activity.spaces.length})</div>
                  {bundle.activity.spaces.map((space) => (
                    <div key={space.id} className="text-sm py-1">
                      <span className="font-medium">{space.title}</span>
                      <span className="text-muted-foreground text-xs ml-2">({space.role})</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Events */}
              {bundle.activity.events.length > 0 && (
                <div>
                  <div className="text-sm text-muted-foreground mb-2">Events ({bundle.activity.events.length})</div>
                  {bundle.activity.events.map((event) => (
                    <div key={event.id} className="text-sm py-1">
                      <span className="font-medium">{event.title}</span>
                      <span className="text-muted-foreground text-xs ml-2">({event.role})</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Verification Info (Owner Only) */}
            {permissions.is_owner && verification_meta.improvement_suggestions.length > 0 && (
              <div className="bg-card rounded-lg p-6 border border-border">
                <h3 className="text-lg font-semibold mb-3">Verification</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  Status: <span className="font-medium capitalize">{verification_meta.tier.replace(/_/g, ' ')}</span>
                </p>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  {verification_meta.improvement_suggestions.map((suggestion, idx) => (
                    <li key={idx}>• {suggestion}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileV2;
