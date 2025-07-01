
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Search, 
  Filter, 
  Heart, 
  MessageCircle, 
  Share2, 
  Plus,
  MapPin,
  Calendar,
  TrendingUp,
  Users
} from 'lucide-react';

interface ContributionDiscoveryFeedProps {
  onCreateContribution: () => void;
}

const ContributionDiscoveryFeed: React.FC<ContributionDiscoveryFeedProps> = ({
  onCreateContribution
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  const mockContributions = [
    {
      id: 1,
      title: "Solar Education Initiative",
      description: "Installing solar panels in rural schools across Kenya to provide reliable electricity for learning",
      pathway: "Financial Investment",
      impactArea: "Education",
      location: "Kenya",
      targetAmount: 50000,
      currentAmount: 32000,
      contributors: 45,
      daysLeft: 23,
      author: "Dr. Amara Okafor",
      authorImage: "/api/placeholder/40/40",
      likes: 127,
      comments: 23,
      shares: 18,
      isFollowing: false
    },
    {
      id: 2,
      title: "FinTech Mentorship Program",
      description: "Providing technical mentorship to African fintech startups",
      pathway: "Skills & Expertise",
      impactArea: "Technology",
      location: "Nigeria",
      targetAmount: 0,
      currentAmount: 0,
      contributors: 12,
      daysLeft: 0,
      author: "Sarah Mbeki",
      authorImage: "/api/placeholder/40/40",
      likes: 89,
      comments: 15,
      shares: 12,
      isFollowing: true
    },
    {
      id: 3,
      title: "Clean Water Advocacy Campaign",
      description: "Raising awareness about water scarcity and policy solutions",
      pathway: "Advocacy & Awareness",
      impactArea: "Infrastructure",
      location: "Ghana",
      targetAmount: 15000,
      currentAmount: 8500,
      contributors: 78,
      daysLeft: 45,
      author: "Joseph Asante",
      authorImage: "/api/placeholder/40/40",
      likes: 156,
      comments: 34,
      shares: 28,
      isFollowing: false
    }
  ];

  const getPathwayColor = (pathway: string) => {
    const colors: { [key: string]: string } = {
      'Financial Investment': 'bg-green-100 text-green-800',
      'Skills & Expertise': 'bg-blue-100 text-blue-800',
      'Advocacy & Awareness': 'bg-red-100 text-red-800',
      'Time & Volunteering': 'bg-purple-100 text-purple-800',
      'Network & Connections': 'bg-orange-100 text-orange-800',
      'In-Kind Resources': 'bg-indigo-100 text-indigo-800'
    };
    return colors[pathway] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      {/* Header with CTA */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Discover Contributions</h2>
          <p className="text-gray-600">Explore impactful projects and ways to contribute</p>
        </div>
        <Button
          onClick={onCreateContribution}
          className="bg-dna-emerald hover:bg-dna-forest text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Contribution
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search contributions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={selectedFilter} onValueChange={setSelectedFilter}>
          <SelectTrigger className="w-full md:w-48">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Filter by pathway" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Pathways</SelectItem>
            <SelectItem value="funding">Financial Investment</SelectItem>
            <SelectItem value="skills">Skills & Expertise</SelectItem>
            <SelectItem value="time">Time & Volunteering</SelectItem>
            <SelectItem value="network">Network & Connections</SelectItem>
            <SelectItem value="advocacy">Advocacy & Awareness</SelectItem>
            <SelectItem value="resources">In-Kind Resources</SelectItem>
          </SelectContent>
        </Select>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-full md:w-48">
            <TrendingUp className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest First</SelectItem>
            <SelectItem value="popular">Most Popular</SelectItem>
            <SelectItem value="impact">Highest Impact</SelectItem>
            <SelectItem value="urgent">Most Urgent</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Contributions Feed */}
      <div className="grid gap-6">
        {mockContributions.map((contribution) => (
          <Card key={contribution.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={contribution.authorImage}
                    alt={contribution.author}
                    className="w-10 h-10 rounded-full"
                  />
                  <div>
                    <h3 className="font-semibold text-lg">{contribution.title}</h3>
                    <p className="text-sm text-gray-600">by {contribution.author}</p>
                  </div>
                </div>
                <Badge className={getPathwayColor(contribution.pathway)}>
                  {contribution.pathway}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700">{contribution.description}</p>
              
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {contribution.location}
                </Badge>
                <Badge variant="outline">
                  {contribution.impactArea}
                </Badge>
                {contribution.daysLeft > 0 && (
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {contribution.daysLeft} days left
                  </Badge>
                )}
              </div>

              {contribution.targetAmount > 0 && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>${contribution.currentAmount.toLocaleString()} raised</span>
                    <span>${contribution.targetAmount.toLocaleString()} goal</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-dna-emerald h-2 rounded-full"
                      style={{
                        width: `${(contribution.currentAmount / contribution.targetAmount) * 100}%`
                      }}
                    />
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between pt-4 border-t">
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {contribution.contributors} contributors
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" className="flex items-center gap-1">
                    <Heart className="w-4 h-4" />
                    {contribution.likes}
                  </Button>
                  <Button variant="ghost" size="sm" className="flex items-center gap-1">
                    <MessageCircle className="w-4 h-4" />
                    {contribution.comments}
                  </Button>
                  <Button variant="ghost" size="sm" className="flex items-center gap-1">
                    <Share2 className="w-4 h-4" />
                    {contribution.shares}
                  </Button>
                  <Button 
                    className={`ml-2 ${
                      contribution.isFollowing 
                        ? 'bg-gray-200 text-gray-700 hover:bg-gray-300' 
                        : 'bg-dna-emerald hover:bg-dna-forest text-white'
                    }`}
                    size="sm"
                  >
                    {contribution.isFollowing ? 'Following' : 'Follow'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Load More */}
      <div className="text-center">
        <Button variant="outline" className="px-8">
          Load More Contributions
        </Button>
      </div>
    </div>
  );
};

export default ContributionDiscoveryFeed;
