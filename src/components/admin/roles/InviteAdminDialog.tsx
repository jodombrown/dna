import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { UserPlus, Loader2 } from 'lucide-react';

export function InviteAdminDialog() {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('moderator');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleInvite = async () => {
    if (!email || !role) {
      toast({
        title: "Error",
        description: "Please fill in all fields.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // First check if user exists
      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', email)
        .maybeSingle();

      if (profileError) throw profileError;

      if (!profiles) {
        toast({
          title: "User Not Found",
          description: "No user found with this email address. They need to sign up first.",
          variant: "destructive",
        });
        return;
      }

      // Check if user is already an admin
      const { data: existingAdmin, error: adminError } = await supabase
        .from('admin_users')
        .select('id')
        .eq('user_id', profiles.id)
        .maybeSingle();

      if (adminError) throw adminError;

      if (existingAdmin) {
        toast({
          title: "Already Admin",
          description: "This user is already an admin.",
          variant: "destructive",
        });
        return;
      }

      // Create admin user
      const { error: insertError } = await supabase
        .from('admin_users')
        .insert({
          user_id: profiles.id,
          role: role as 'admin' | 'superadmin' | 'moderator',
          is_active: true
        });

      if (insertError) throw insertError;

      toast({
        title: "Admin Invited",
        description: `Successfully added ${email} as ${role}.`,
      });

      setEmail('');
      setRole('moderator');
      setOpen(false);
    } catch (error) {
      console.error('Error inviting admin:', error);
      toast({
        title: "Error",
        description: "Failed to invite admin user.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-dna-emerald hover:bg-dna-emerald/90 text-white">
          <UserPlus className="w-4 h-4 mr-2" />
          Invite Admin
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Invite New Admin</DialogTitle>
          <DialogDescription>
            Add a new admin user to the platform. They must already have an account.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@example.com"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="role">Role</Label>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger>
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="moderator">Moderator</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="superadmin">Super Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleInvite} 
            disabled={loading}
            className="bg-dna-emerald hover:bg-dna-emerald/90 text-white"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Inviting...
              </>
            ) : (
              'Invite Admin'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}