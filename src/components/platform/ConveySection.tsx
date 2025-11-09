import React from 'react';
import { Megaphone, Share2, MessageCircle, Eye, Heart, ArrowRight, Sparkles, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import SwipeableCardStack from './SwipeableCardStack';

const ConveySection = () => {
  const navigate = useNavigate();

  const stories = [
    {
      title: 'How I Raised $2M for My FinTech Startup',
      author: { name: 'Amara Okafor', initials: 'AO' },
      category: 'Success Story',
      readTime: '6 min read',
      engagement: { views: 12400, likes: 892, comments: 143 },
      reach: '15K+ reached',
      gradient: 'from-dna-forest to-dna-emerald',
      featured: true,
    },
    {
      title: 'Building Climate Tech Solutions Across East Africa',
      author: { name: 'Kwame Mensah', initials: 'KM' },
      category: 'Impact Journey',
      readTime: '8 min read',
      engagement: { views: 9800, likes: 654, comments: 87 },
      reach: '12K+ reached',
      gradient: 'from-dna-emerald to-dna-copper',
      featured: false,
    },
    {
      title: 'From Software Engineer to Social Entrepreneur',
      author: { name: 'Zainab Hassan', initials: 'ZH' },
      category: 'Member Spotlight',
      readTime: '5 min read',
      engagement: { views: 8200, likes: 521, comments: 64 },
      reach: '10K+ reached',
      gradient: 'from-dna-copper to-dna-gold',
      featured: true,
    },
  ];

  const handleCardClick = (index: number) => {
    navigate('/convey');
  };

  return (
    <section id="convey-section" className="mb-16 w-full -mx-4 sm:-mx-6 lg:-mx-8">
      <div className="text-center mb-8 px-4">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-dna-forest to-dna-emerald rounded-xl flex items-center justify-center">
            <Megaphone className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Convey</h2>
        </div>
        <p className="text-xl font-semibold text-gray-900 mb-3">
          Your Story, Our Movement
        </p>
        <p className="text-lg text-gray-600 mb-6 max-w-3xl mx-auto">
          Amplify your impact by sharing your stories, insights, and successes through articles, social media, newsletters, and communities, inspiring others to join the movement.
        </p>
        <Button 
          onClick={() => navigate('/convey')}
          className="bg-dna-forest hover:bg-dna-emerald text-white inline-flex items-center gap-2"
        >
          Explore Impact Stories
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>

      <div className="bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 w-full">
        <SwipeableCardStack
          cards={stories.map((story) => (
            <div className={`bg-gradient-to-br ${story.gradient} rounded-3xl p-1.5 shadow-2xl h-full w-full`}>
              <div className="bg-white rounded-[22px] overflow-hidden h-full flex flex-col">
                <div className={`bg-gradient-to-r ${story.gradient} text-white p-6`}>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-lg">Impact Story</h3>
                    <Megaphone className="w-5 h-5" />
                  </div>
                  <p className="text-sm text-white/80">Inspire the movement</p>
                </div>
                
                <div className="p-6 space-y-4 flex-1">
                  {/* Featured Badge */}
                  {story.featured && (
                    <div className="flex items-center gap-1.5 text-dna-gold">
                      <Sparkles className="w-4 h-4" />
                      <span className="text-xs font-bold uppercase tracking-wide">Featured Story</span>
                    </div>
                  )}

                  {/* Story Title & Category */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Badge className="bg-dna-forest text-white text-xs">{story.category}</Badge>
                      <span className="text-xs text-gray-500">{story.readTime}</span>
                    </div>
                    <h4 className="font-bold text-xl text-gray-900 leading-tight">{story.title}</h4>
                  </div>

                  {/* Author */}
                  <div className="flex items-center gap-3 pt-2">
                    <Avatar className="w-10 h-10">
                      <AvatarFallback className="bg-dna-emerald text-white font-bold">
                        {story.author.initials}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{story.author.name}</p>
                      <p className="text-xs text-gray-500">DNA Member</p>
                    </div>
                  </div>

                  {/* Engagement Metrics */}
                  <div className="bg-dna-forest/5 rounded-xl p-4 border-2 border-dna-forest/20">
                    <div className="grid grid-cols-3 gap-3 mb-3">
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 mb-1">
                          <Eye className="w-3.5 h-3.5 text-dna-forest" />
                        </div>
                        <p className="text-sm font-bold text-gray-900">{(story.engagement.views / 1000).toFixed(1)}K</p>
                        <p className="text-xs text-gray-500">Views</p>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 mb-1">
                          <Heart className="w-3.5 h-3.5 text-dna-copper" />
                        </div>
                        <p className="text-sm font-bold text-gray-900">{story.engagement.likes}</p>
                        <p className="text-xs text-gray-500">Likes</p>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 mb-1">
                          <MessageCircle className="w-3.5 h-3.5 text-dna-gold" />
                        </div>
                        <p className="text-sm font-bold text-gray-900">{story.engagement.comments}</p>
                        <p className="text-xs text-gray-500">Comments</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-center gap-2 pt-2 border-t border-dna-forest/10">
                      <TrendingUp className="w-4 h-4 text-dna-emerald" />
                      <span className="text-xs font-semibold text-gray-700">{story.reach}</span>
                    </div>
                  </div>

                  {/* CTA */}
                  <Button 
                    className="w-full bg-gradient-to-r from-dna-forest to-dna-emerald hover:from-dna-emerald hover:to-dna-forest text-white font-semibold"
                  >
                    Read Full Story
                  </Button>

                  <div className="flex items-center justify-center gap-2">
                    <Share2 className="w-3.5 h-3.5 text-gray-400" />
                    <p className="text-xs text-center text-gray-500">
                      Share your own success story →
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
          onCardClick={handleCardClick}
        />
      </div>
    </section>
  );
};

export default ConveySection;
