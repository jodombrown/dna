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

interface UserActionDialogsProps {
  deleteDialog: {
    open: boolean;
    user: AdminUser | null;
  };
  statusDialog: {
    open: boolean;
    user: AdminUser | null;
    action: string;
  };
  onDeleteConfirm: () => void;
  onStatusConfirm: () => void;
  onDeleteCancel: () => void;
  onStatusCancel: () => void;
}

export function UserActionDialogs({
  deleteDialog,
  statusDialog,
  onDeleteConfirm,
  onStatusConfirm,
  onDeleteCancel,
  onStatusCancel
}: UserActionDialogsProps) {
  return (
    <>
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialog.open} onOpenChange={onDeleteCancel}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User Account</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {deleteDialog.user?.full_name || deleteDialog.user?.email}? 
              This action cannot be undone and will permanently remove their account and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={onDeleteCancel}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={onDeleteConfirm}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete User
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Status Change Confirmation Dialog */}
      <AlertDialog open={statusDialog.open} onOpenChange={onStatusCancel}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Change User Status</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to {statusDialog.action.toLowerCase()} {statusDialog.user?.full_name || statusDialog.user?.email}?
              {statusDialog.action === 'Suspend User' && ' This will prevent them from accessing the platform.'}
              {statusDialog.action === 'Activate User' && ' This will restore their access to the platform.'}
              {statusDialog.action === 'Approve User' && ' This will activate their account and grant platform access.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={onStatusCancel}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={onStatusConfirm}>
              {statusDialog.action}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}