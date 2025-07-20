import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { AdminUser } from '@/hooks/useAdminUsers';
import { Shield } from 'lucide-react';

interface VerifyUserDialogProps {
  open: boolean;
  user: AdminUser | null;
  onConfirm: () => void;
  onCancel: () => void;
}

export function VerifyUserDialog({
  open,
  user,
  onConfirm,
  onCancel
}: VerifyUserDialogProps) {
  if (!user) return null;

  return (
    <AlertDialog open={open} onOpenChange={onCancel}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-emerald-600" />
            Verify User as Contributor
          </AlertDialogTitle>
          <AlertDialogDescription>
            You are about to verify <strong>{user.full_name || user.email}</strong> as 
            a verified contributor. This will:
            <ul className="mt-2 space-y-1 text-sm">
              <li>• Add a verified badge to their profile</li>
              <li>• Grant them enhanced ADIN recognition</li>
              <li>• Increase their contributor score</li>
              <li>• Mark them as a trusted community member</li>
            </ul>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onCancel}>Cancel</AlertDialogCancel>
          <AlertDialogAction 
            onClick={onConfirm}
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            Verify User
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}