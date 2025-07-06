import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  ChevronDown, 
  ChevronRight, 
  Search, 
  HelpCircle, 
  BookOpen, 
  Users, 
  MessageCircle,
  Settings,
  Zap,
  Mail,
  Globe
} from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
  tags: string[];
}

const HelpPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [openItems, setOpenItems] = useState<string[]>([]);

  const faqData: FAQItem[] = [
    {
      id: '1',
      question: 'How do I create my DNA profile?',
      answer: 'Creating your DNA profile is simple! After signing up, go to your profile page and click "Edit Profile". Fill in your professional background, diaspora origin, current location, skills, and impact areas. Add a professional photo and compelling bio to make meaningful connections.',
      category: 'getting-started',
      tags: ['profile', 'setup', 'onboarding']
    },
    {
      id: '2',
      question: 'What is the DNA platform about?',
      answer: 'DNA (Diaspora Network of Africa) is a professional platform built to Connect, Collaborate, and Contribute toward Africa\'s advancement. We unite the global African diaspora and allies to drive meaningful impact through professional networking, project collaboration, and contribution opportunities.',
      category: 'about',
      tags: ['mission', 'diaspora', 'africa']
    },
    {
      id: '3',
      question: 'How do I join communities?',
      answer: 'Browse communities in the Connect tab or search for specific interests. Click on any community card to view details, then click "Join Community". Some communities may require approval from moderators. You\'ll get notified once you\'re accepted.',
      category: 'communities',
      tags: ['communities', 'connect', 'join']
    },
    {
      id: '4',
      question: 'How do I find collaboration opportunities?',
      answer: 'Visit the Collaborate section to discover active projects seeking contributors. Use filters to find opportunities matching your skills, location, or impact areas. Click on projects to view details and express interest to collaborate.',
      category: 'collaborate',
      tags: ['projects', 'collaborate', 'opportunities']
    },
    {
      id: '5',
      question: 'What are the three pillars of DNA?',
      answer: 'DNA operates on three core pillars: CONNECT (build meaningful professional relationships), COLLABORATE (work together on impactful projects), and CONTRIBUTE (give back through skills, knowledge, or resources to drive African development).',
      category: 'about',
      tags: ['pillars', 'connect', 'collaborate', 'contribute']
    },
    {
      id: '6',
      question: 'How do I invite others to DNA?',
      answer: 'Each user gets a unique invite code. Go to your profile settings or use the invite button in the main navigation. Share your personalized invite link with friends and colleagues. You can track your successful invitations in your profile.',
      category: 'getting-started',
      tags: ['invite', 'referral', 'sharing']
    },
    {
      id: '7',
      question: 'How do I post and engage with content?',
      answer: 'Create posts from your dashboard by clicking "Create Post". Choose which pillar your post relates to (Connect, Collaborate, or Contribute). Engage with others by liking, commenting, and sharing their posts. Use relevant hashtags to reach the right audience.',
      category: 'posting',
      tags: ['posts', 'engagement', 'content']
    },
    {
      id: '8',
      question: 'How do notifications work?',
      answer: 'You\'ll receive notifications for connection requests, comments on your posts, project updates, community activities, and more. Click the bell icon in the header to see recent notifications or visit /notifications for your full notification history.',
      category: 'features',
      tags: ['notifications', 'alerts', 'updates']
    },
    {
      id: '9',
      question: 'Can I message other members directly?',
      answer: 'Yes! Use the messaging feature to connect directly with other members. Click the Messaging tab in the main navigation or send a message from someone\'s profile. You can organize conversations and share files.',
      category: 'messaging',
      tags: ['messaging', 'communication', 'direct-message']
    },
    {
      id: '10',
      question: 'How do I contribute to African development?',
      answer: 'Explore the Contribute section for various ways to give back: mentor emerging professionals, fund projects, volunteer skills for initiatives, or create contribution opportunities. Every action counts toward collective impact.',
      category: 'contribute',
      tags: ['contribute', 'impact', 'giving-back']
    }
  ];

  const categories = [
    { id: 'all', name: 'All', icon: HelpCircle },
    { id: 'getting-started', name: 'Getting Started', icon: Zap },
    { id: 'about', name: 'About DNA', icon: Globe },
    { id: 'communities', name: 'Communities', icon: Users },
    { id: 'collaborate', name: 'Collaborate', icon: BookOpen },
    { id: 'contribute', name: 'Contribute', icon: Mail },
    { id: 'features', name: 'Features', icon: Settings },
    { id: 'messaging', name: 'Messaging', icon: MessageCircle },
    { id: 'posting', name: 'Posting', icon: BookOpen }
  ];

  const filteredFAQs = faqData.filter(faq => {
    const matchesSearch = searchQuery === '' || 
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = activeCategory === 'all' || faq.category === activeCategory;
    
    return matchesSearch && matchesCategory;
  });

  const toggleItem = (id: string) => {
    setOpenItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-dna-forest mb-4">
            Help Center
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Find answers to common questions and learn how to make the most of the DNA platform
          </p>
        </div>

        {/* Search */}
        <div className="max-w-md mx-auto mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search help articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Categories Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg text-dna-forest">Categories</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {categories.map((category) => {
                  const Icon = category.icon;
                  return (
                    <Button
                      key={category.id}
                      variant={activeCategory === category.id ? "default" : "ghost"}
                      className={`w-full justify-start ${
                        activeCategory === category.id 
                          ? 'bg-dna-emerald text-white' 
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                      onClick={() => setActiveCategory(category.id)}
                    >
                      <Icon className="h-4 w-4 mr-2" />
                      {category.name}
                    </Button>
                  );
                })}
              </CardContent>
            </Card>
          </div>

          {/* FAQ Content */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl text-dna-forest">
                    Frequently Asked Questions
                  </CardTitle>
                  <Badge variant="outline">
                    {filteredFAQs.length} articles
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                {filteredFAQs.length === 0 ? (
                  <div className="text-center py-8">
                    <HelpCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No articles found</h3>
                    <p className="text-gray-500">
                      Try adjusting your search terms or browse different categories.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredFAQs.map((faq) => (
                      <Collapsible
                        key={faq.id}
                        open={openItems.includes(faq.id)}
                        onOpenChange={() => toggleItem(faq.id)}
                      >
                        <CollapsibleTrigger asChild>
                          <Button
                            variant="ghost"
                            className="w-full justify-between p-4 h-auto text-left hover:bg-gray-50 border rounded-lg"
                          >
                            <span className="font-medium text-dna-forest">
                              {faq.question}
                            </span>
                            {openItems.includes(faq.id) ? (
                              <ChevronDown className="h-4 w-4 text-gray-500" />
                            ) : (
                              <ChevronRight className="h-4 w-4 text-gray-500" />
                            )}
                          </Button>
                        </CollapsibleTrigger>
                        <CollapsibleContent className="px-4 pb-4">
                          <div className="pt-2 text-gray-600 leading-relaxed">
                            {faq.answer}
                          </div>
                          <div className="flex flex-wrap gap-2 mt-3">
                            {faq.tags.map((tag) => (
                              <Badge 
                                key={tag} 
                                variant="secondary" 
                                className="text-xs bg-dna-emerald/10 text-dna-forest"
                              >
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </CollapsibleContent>
                      </Collapsible>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Contact Support */}
            <Card className="mt-6">
              <CardContent className="p-6 text-center">
                <h3 className="text-lg font-semibold text-dna-forest mb-2">
                  Still need help?
                </h3>
                <p className="text-gray-600 mb-4">
                  Can't find the answer you're looking for? Our support team is here to help.
                </p>
                <Button 
                  onClick={() => window.location.href = '/contact'}
                  className="bg-dna-emerald hover:bg-dna-forest text-white"
                >
                  Contact Support
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default HelpPage;