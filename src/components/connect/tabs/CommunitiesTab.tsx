
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users, MessageSquare, Plus } from 'lucide-react';

interface CommunitiesTabProps {
  searchTerm: string;
}

const CommunitiesTab: React.FC<CommunitiesTabProps> = ({ searchTerm }) => {
  // Mock data for communities with diverse African representation
  const communities = [
    {
      id: '1',
      name: 'African Tech Leaders',
      description: 'A community of senior technology leaders from across the African diaspora sharing insights and opportunities.',
      category: 'Technology',
      memberCount: 450,
      isFeatured: true,
      image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=150&h=150&fit=crop&crop=face'
    },
    {
      id: '2',
      name: 'Climate Solutions Africa',
      description: 'Professionals working on climate change solutions and environmental sustainability across Africa.',
      category: 'Environment',
      memberCount: 280,
      isFeatured: true,
      image: 'https://images.unsplash.com/photo-1581092795360-fd1ca04f0952?w=150&h=150&fit=crop&crop=face'
    },
    {
      id: '3',
      name: 'African Women in Finance',
      description: 'Empowering African women in financial services through mentorship and professional development.',
      category: 'Finance',
      memberCount: 320,
      isFeatured: false,
      image: 'https://images.unsplash.com/photo-1605810230434-7631ac76ec81?w=150&h=150&fit=crop&crop=face'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <p className="text-gray-600">
          Showing {communities.length} communities {searchTerm && `matching "${searchTerm}"`}
        </p>
        <Button className="bg-dna-emerald hover:bg-dna-forest text-white">
          <Plus className="w-4 h-4 mr-2" />
          Create Community
        </Button>
      </div>

      <div className="grid gap-6">
        {communities.map((community) => (
          <Card key={community.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start gap-4">
                <img
                  src={community.image}
                  alt={community.name}
                  className="w-16 h-16 rounded-lg object-cover"
                />
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg mb-1">{community.name}</CardTitle>
                      <Badge variant="outline" className="mb-2">
                        {community.category}
                      </Badge>
                      {community.isFeatured && (
                        <Badge className="bg-dna-gold text-white ml-2">Featured</Badge>
                      )}
                    </div>
                    <Button className="bg-dna-emerald hover:bg-dna-forest text-white">
                      Join Community
                    </Button>
                  </div>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <p className="text-gray-700">{community.description}</p>
              
              <div className="flex items-center justify-between pt-2 border-t">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Users className="w-4 h-4" />
                  <span>{community.memberCount.toLocaleString()} members</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" className="flex items-center gap-1">
                    <MessageSquare className="w-4 h-4" />
                    Discussions
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default CommunitiesTab;
