import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

const spaceSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(100),
  description: z.string().max(500).optional(),
  visibility: z.enum(['public', 'private']),
});

type SpaceFormData = z.infer<typeof spaceSchema>;

interface CreateSpaceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateSpaceDialog({ open, onOpenChange }: CreateSpaceDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const form = useForm<SpaceFormData>({
    resolver: zodResolver(spaceSchema),
    defaultValues: {
      title: '',
      description: '',
      visibility: 'public',
    },
  });

  const createSpace = useMutation({
    mutationFn: async (data: SpaceFormData) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: space, error: spaceError } = await supabase
        .from('collaboration_spaces')
        .insert({
          title: data.title,
          description: data.description || null,
          visibility: data.visibility,
          created_by: user.id,
          status: 'active',
        })
        .select()
        .single();

      if (spaceError) throw spaceError;

      // Add creator as owner
      const { error: memberError } = await supabase
        .from('collaboration_memberships')
        .insert({
          space_id: space.id,
          user_id: user.id,
          role: 'owner',
          status: 'approved',
        });

      if (memberError) throw memberError;

      return space;
    },
    onSuccess: (space) => {
      queryClient.invalidateQueries({ queryKey: ['collaboration-spaces'] });
      toast({ title: 'Space created successfully!' });
      onOpenChange(false);
      form.reset();
      navigate(`/spaces/${space.id}`);
    },
    onError: (error) => {
      toast({
        title: 'Error creating space',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const onSubmit = (data: SpaceFormData) => {
    createSpace.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Collaboration Space</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title *</FormLabel>
                  <FormControl>
                    <Input placeholder="Africa Tech Innovation Hub" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="A collaborative space for tech innovators..."
                      rows={4}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="visibility"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Visibility *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select visibility" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="public">Public - Anyone can see and join</SelectItem>
                      <SelectItem value="private">Private - Invite only</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={createSpace.isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={createSpace.isPending} className="flex-1">
                {createSpace.isPending ? 'Creating...' : 'Create Space'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
