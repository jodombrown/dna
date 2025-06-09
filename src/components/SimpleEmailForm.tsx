import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { CheckCircle, Loader2, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const SimpleEmailForm = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !email || !message) {
      setStatus('error');
      setErrorMessage('Please fill in all fields.');
      return;
    }

    setStatus('loading');
    setErrorMessage(null);

    try {
      const { error } = await supabase
        .from('contact_messages')
        .insert({
          name,
          email,
          message,
        });

      if (error) {
        throw new Error(error.message);
      }

      setStatus('success');
      setName('');
      setEmail('');
      setMessage('');
    } catch (error: any) {
      setStatus('error');
      setErrorMessage(error.message || 'An unexpected error occurred.');
    }
  };

  return (
    <div data-email-form className="bg-white rounded-2xl p-8 shadow-lg max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        Let's Build Together
      </h2>
      {status === 'success' ? (
        <div className="text-green-600 flex items-center gap-2">
          <CheckCircle className="w-5 h-5" />
          Message sent successfully!
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Name
            </Label>
            <Input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-dna-emerald focus:ring-dna-emerald"
            />
          </div>
          <div>
            <Label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </Label>
            <Input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-dna-emerald focus:ring-dna-emerald"
            />
          </div>
          <div>
            <Label htmlFor="message" className="block text-sm font-medium text-gray-700">
              Message
            </Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-dna-emerald focus:ring-dna-emerald"
            />
          </div>
          <div>
            <Button type="submit" className="bg-dna-emerald hover:bg-dna-forest text-white">
              {status === 'loading' ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                'Send Message'
              )}
            </Button>
          </div>
          {status === 'error' && (
            <div className="text-red-600 flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              {errorMessage}
            </div>
          )}
        </form>
      )}
    </div>
  );
};

export default SimpleEmailForm;
