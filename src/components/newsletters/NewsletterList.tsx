import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/CleanAuthContext';
import { supabase } from '@/integrations/supabase/client';
import { formatDistanceToNow } from 'date-fns';
import { FileText, Eye, Send, Edit, Trash2, Users } from 'lucide-react';

interface Newsletter {
  id: string;
  title: string;
  summary: string;
  content: string;
  category: string;
  is_published: boolean;
  publication_date: string;
  email_recipient_count: number;
  subscriber_count: number;
  created_at: string;
  tags: string[];
  featured_image_url: string;
}

interface NewsletterListProps {
  onEdit?: (newsletter: Newsletter) => void;
  showOnlyPublished?: boolean;
}

const NewsletterList: React.FC<NewsletterListProps> = ({ onEdit, showOnlyPublished = false }) => {
  const { user } = useAuth();
  const [newsletters, setNewsletters] = useState<Newsletter[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedNewsletter, setSelectedNewsletter] = useState<Newsletter | null>(null);

  useEffect(() => {
    fetchNewsletters();
  }, [user, showOnlyPublished]);

  const fetchNewsletters = async () => {
    if (!user) return;

    try {
      let query = supabase
        .from('newsletters')
        .select('*')
        .order('created_at', { ascending: false });

      if (showOnlyPublished) {
        query = query.eq('is_published', true);
      } else {
        query = query.eq('created_by', user.id);
      }

      const { data, error } = await query;
      if (error) throw error;

      setNewsletters(data || []);
    } catch (error) {
      console.error('Error fetching newsletters:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteNewsletter = async (id: string) => {
    if (!confirm('Are you sure you want to delete this newsletter?')) return;

    try {
      const { error } = await supabase
        .from('newsletters')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setNewsletters(prev => prev.filter(n => n.id !== id));
    } catch (error) {
      console.error('Error deleting newsletter:', error);
    }
  };

  const republishNewsletter = async (id: string) => {
    try {
      const { error } = await supabase.functions.invoke('send-newsletter', {
        body: { newsletterId: id }
      });
      
      if (error) throw error;
      
      alert('Newsletter sent successfully!');
    } catch (error) {
      console.error('Error sending newsletter:', error);
      alert('Failed to send newsletter');
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse space-y-3">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-full"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (selectedNewsletter) {
    return (
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Newsletter Preview
            </CardTitle>
            <Button
              variant="outline"
              onClick={() => setSelectedNewsletter(null)}
            >
              Back to List
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {selectedNewsletter.featured_image_url && (
            <img 
              src={selectedNewsletter.featured_image_url} 
              alt="Featured" 
              className="w-full h-48 object-cover rounded-lg"
            />
          )}
          
          <div>
            <h1 className="text-3xl font-bold text-dna-forest mb-2">
              {selectedNewsletter.title}
            </h1>
            
            <div className="flex items-center gap-4 mb-4">
              {selectedNewsletter.category && (
                <Badge className="bg-dna-copper text-white">
                  {selectedNewsletter.category}
                </Badge>
              )}
              
              <Badge variant={selectedNewsletter.is_published ? "default" : "secondary"}>
                {selectedNewsletter.is_published ? 'Published' : 'Draft'}
              </Badge>
              
              <span className="text-sm text-gray-500">
                {selectedNewsletter.is_published 
                  ? `Published ${formatDistanceToNow(new Date(selectedNewsletter.publication_date))} ago`
                  : `Created ${formatDistanceToNow(new Date(selectedNewsletter.created_at))} ago`
                }
              </span>
            </div>
            
            {selectedNewsletter.summary && (
              <p className="text-lg text-gray-600 mb-4">
                {selectedNewsletter.summary}
              </p>
            )}
          </div>
          
          <div className="prose max-w-none">
            <div className="whitespace-pre-wrap">
              {selectedNewsletter.content}
            </div>
          </div>
          
          {selectedNewsletter.tags && selectedNewsletter.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {selectedNewsletter.tags.map(tag => (
                <Badge key={tag} variant="outline">#{tag}</Badge>
              ))}
            </div>
          )}
          
          {selectedNewsletter.is_published && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  {selectedNewsletter.email_recipient_count} recipients
                </div>
                <div className="flex items-center gap-1">
                  <Send className="w-4 h-4" />
                  Sent via email
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-dna-forest">
          {showOnlyPublished ? 'Published Newsletters' : 'My Newsletters'}
        </h2>
        
        {!showOnlyPublished && (
          <div className="text-sm text-gray-600">
            {newsletters.length} newsletter{newsletters.length !== 1 ? 's' : ''}
          </div>
        )}
      </div>

      {newsletters.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {showOnlyPublished ? 'No Published Newsletters' : 'No Newsletters Yet'}
            </h3>
            <p className="text-gray-600">
              {showOnlyPublished 
                ? 'Check back later for published newsletters from the community.'
                : 'Create your first newsletter to share insights with your followers.'
              }
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {newsletters.map((newsletter) => (
            <Card key={newsletter.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {newsletter.title}
                      </h3>
                      
                      <Badge variant={newsletter.is_published ? "default" : "secondary"}>
                        {newsletter.is_published ? 'Published' : 'Draft'}
                      </Badge>
                      
                      {newsletter.category && (
                        <Badge variant="outline">
                          {newsletter.category}
                        </Badge>
                      )}
                    </div>
                    
                    {newsletter.summary && (
                      <p className="text-gray-600 mb-3 line-clamp-2">
                        {newsletter.summary}
                      </p>
                    )}
                    
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>
                        {newsletter.is_published 
                          ? `Published ${formatDistanceToNow(new Date(newsletter.publication_date))} ago`
                          : `Created ${formatDistanceToNow(new Date(newsletter.created_at))} ago`
                        }
                      </span>
                      
                      {newsletter.is_published && (
                        <span className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {newsletter.email_recipient_count} recipients
                        </span>
                      )}
                    </div>
                    
                    {newsletter.tags && newsletter.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {newsletter.tags.slice(0, 3).map(tag => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            #{tag}
                          </Badge>
                        ))}
                        {newsletter.tags.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{newsletter.tags.length - 3} more
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedNewsletter(newsletter)}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    
                    {!showOnlyPublished && (
                      <>
                        {onEdit && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onEdit(newsletter)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                        )}
                        
                        {newsletter.is_published && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => republishNewsletter(newsletter.id)}
                          >
                            <Send className="w-4 h-4" />
                          </Button>
                        )}
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deleteNewsletter(newsletter.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default NewsletterList;