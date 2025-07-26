import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Image, Video, Calendar, FileText } from 'lucide-react';

const PostComposer = () => {
  const { profile } = useAuth();
  const [isExpanded, setIsExpanded] = useState(false);
  const [postContent, setPostContent] = useState('');

  const handleStartPost = () => {
    setIsExpanded(true);
  };

  const handlePost = () => {
    // TODO: Implement post creation
    console.log('Creating post:', postContent);
    setPostContent('');
    setIsExpanded(false);
  };

  const postOptions = [
    { icon: Image, label: 'Photo', color: 'text-blue-600' },
    { icon: Video, label: 'Video', color: 'text-green-600' },
    { icon: Calendar, label: 'Event', color: 'text-orange-600' },
    { icon: FileText, label: 'Article', color: 'text-red-600' },
  ];

  return (
    <Card className="bg-white border border-gray-200 mb-4">
      <CardContent className="p-4">
        <div className="flex items-center space-x-3 mb-4">
          <Avatar className="w-12 h-12">
            <AvatarImage src={profile?.avatar_url} />
            <AvatarFallback className="bg-dna-mint text-dna-forest">
              {profile?.display_name?.charAt(0) || profile?.full_name?.charAt(0) || 'U'}
            </AvatarFallback>
          </Avatar>
          {!isExpanded ? (
            <Button
              variant="outline"
              onClick={handleStartPost}
              className="flex-1 justify-start text-gray-600 bg-gray-50 hover:bg-gray-100 border-gray-300 rounded-full"
            >
              Start a post
            </Button>
          ) : (
            <div className="flex-1">
              <Textarea
                placeholder="What do you want to talk about?"
                value={postContent}
                onChange={(e) => setPostContent(e.target.value)}
                className="border-0 resize-none text-lg placeholder-gray-500 focus:ring-0"
                rows={3}
                autoFocus
              />
            </div>
          )}
        </div>

        {!isExpanded && (
          <div className="grid grid-cols-4 gap-2">
            {postOptions.map((option, index) => (
              <Button
                key={index}
                variant="ghost"
                onClick={handleStartPost}
                className="flex items-center justify-center space-x-2 py-3 hover:bg-gray-50"
              >
                <option.icon className={`w-5 h-5 ${option.color}`} />
                <span className="text-sm font-medium text-gray-600">{option.label}</span>
              </Button>
            ))}
          </div>
        )}

        {isExpanded && (
          <div className="space-y-3">
            <div className="flex items-center space-x-4">
              {postOptions.map((option, index) => (
                <Button
                  key={index}
                  variant="ghost"
                  size="sm"
                  className="flex items-center space-x-2"
                >
                  <option.icon className={`w-4 h-4 ${option.color}`} />
                  <span className="text-sm">{option.label}</span>
                </Button>
              ))}
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setIsExpanded(false);
                  setPostContent('');
                }}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handlePost}
                disabled={!postContent.trim()}
                className="bg-dna-forest hover:bg-dna-forest/90"
              >
                Post
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PostComposer;