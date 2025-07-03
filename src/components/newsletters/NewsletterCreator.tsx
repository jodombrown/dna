import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/CleanAuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Send, Plus, X, Eye, Save, Upload } from 'lucide-react';

interface NewsletterCreatorProps {
  onNewsletterCreated?: () => void;
}

const NewsletterCreator: React.FC<NewsletterCreatorProps> = ({ onNewsletterCreated }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    title: '',
    summary: '',
    content: '',
    category: '',
    tags: [] as string[],
    featured_image_url: ''
  });
  
  const [currentTag, setCurrentTag] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isPreview, setIsPreview] = useState(false);

  const categories = [
    'Africa Tech',
    'Business & Finance',
    'Culture & Society', 
    'Health & Wellness',
    'Education',
    'Environment',
    'Politics & Governance',
    'Startup Ecosystem',
    'Diaspora Stories',
    'Innovation'
  ];

  const addTag = () => {
    if (currentTag.trim() && !formData.tags.includes(currentTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, currentTag.trim()]
      }));
      setCurrentTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleSubmit = async (e: React.FormEvent, publish = false) => {
    e.preventDefault();
    if (!user) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('newsletters')
        .insert({
          ...formData,
          created_by: user.id,
          is_published: publish,
          publication_date: publish ? new Date().toISOString() : null
        })
        .select()
        .single();

      if (error) throw error;

      // If publishing, send emails to followers
      if (publish) {
        const { error: emailError } = await supabase.functions.invoke('send-newsletter', {
          body: { newsletterId: data.id }
        });
        
        if (emailError) {
          console.error('Email sending error:', emailError);
          toast({
            title: "Newsletter Saved",
            description: "Newsletter saved but email delivery failed. You can resend from the manage view.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Newsletter Published!",
            description: "Your newsletter has been published and sent to followers",
          });
        }
      } else {
        toast({
          title: "Draft Saved",
          description: "Your newsletter draft has been saved",
        });
      }

      // Reset form
      setFormData({
        title: '',
        summary: '',
        content: '',
        category: '',
        tags: [],
        featured_image_url: ''
      });
      
      onNewsletterCreated?.();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isPreview) {
    return (
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Newsletter Preview</CardTitle>
            <Button
              variant="outline"
              onClick={() => setIsPreview(false)}
            >
              <X className="w-4 h-4 mr-2" />
              Close Preview
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {formData.featured_image_url && (
            <img 
              src={formData.featured_image_url} 
              alt="Featured" 
              className="w-full h-48 object-cover rounded-lg"
            />
          )}
          
          <div>
            <h1 className="text-3xl font-bold text-dna-forest mb-2">{formData.title}</h1>
            {formData.category && (
              <Badge className="bg-dna-copper text-white mb-4">{formData.category}</Badge>
            )}
            {formData.summary && (
              <p className="text-lg text-gray-600 mb-4">{formData.summary}</p>
            )}
          </div>
          
          <div className="prose max-w-none">
            <div className="whitespace-pre-wrap">{formData.content}</div>
          </div>
          
          {formData.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {formData.tags.map(tag => (
                <Badge key={tag} variant="outline">#{tag}</Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Send className="w-5 h-5" />
          Create Newsletter
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={(e) => handleSubmit(e, false)} className="space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Newsletter Title *
              </label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter newsletter title..."
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <Select 
                value={formData.category} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Featured Image URL
              </label>
              <Input
                value={formData.featured_image_url}
                onChange={(e) => setFormData(prev => ({ ...prev, featured_image_url: e.target.value }))}
                placeholder="https://example.com/image.jpg"
              />
            </div>
          </div>

          {/* Summary */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Summary/Excerpt
            </label>
            <Textarea
              value={formData.summary}
              onChange={(e) => setFormData(prev => ({ ...prev, summary: e.target.value }))}
              placeholder="Brief summary of the newsletter..."
              rows={3}
            />
          </div>

          {/* Content */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Newsletter Content *
            </label>
            <Textarea
              value={formData.content}
              onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
              placeholder="Write your newsletter content here..."
              rows={12}
              required
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tags
            </label>
            <div className="flex gap-2 mb-2">
              <Input
                value={currentTag}
                onChange={(e) => setCurrentTag(e.target.value)}
                placeholder="Add a tag..."
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
              />
              <Button type="button" onClick={addTag} variant="outline">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            
            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.tags.map(tag => (
                  <Badge key={tag} variant="outline" className="flex items-center gap-1">
                    #{tag}
                    <X 
                      className="w-3 h-3 cursor-pointer" 
                      onClick={() => removeTag(tag)}
                    />
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsPreview(true)}
              disabled={!formData.title || !formData.content}
            >
              <Eye className="w-4 h-4 mr-2" />
              Preview
            </Button>
            
            <Button
              type="submit"
              variant="outline"
              disabled={isLoading || !formData.title || !formData.content}
            >
              <Save className="w-4 h-4 mr-2" />
              Save Draft
            </Button>
            
            <Button
              type="button"
              onClick={(e) => handleSubmit(e, true)}
              disabled={isLoading || !formData.title || !formData.content}
              className="bg-dna-emerald hover:bg-dna-forest text-white"
            >
              <Send className="w-4 h-4 mr-2" />
              {isLoading ? 'Publishing...' : 'Publish & Send'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default NewsletterCreator;