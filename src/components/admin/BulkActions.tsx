import React from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  ChevronDown, 
  UserCheck, 
  UserX, 
  Trash2, 
  Download,
  Mail
} from 'lucide-react';

interface BulkActionsProps {
  selectedCount: number;
  totalCount: number;
  onSelectAll: (checked: boolean) => void;
  onBulkApprove: () => void;
  onBulkSuspend: () => void;
  onBulkDelete: () => void;
  onBulkExport: () => void;
  onBulkEmail: () => void;
  isAllSelected: boolean;
  isIndeterminate: boolean;
}

export function BulkActions({
  selectedCount,
  totalCount,
  onSelectAll,
  onBulkApprove,
  onBulkSuspend,
  onBulkDelete,
  onBulkExport,
  onBulkEmail,
  isAllSelected,
  isIndeterminate
}: BulkActionsProps) {
  return (
    <div className="flex items-center justify-between p-4 bg-gray-50 border-t border-gray-200">
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <Checkbox
            checked={isAllSelected}
            onCheckedChange={onSelectAll}
            className={isIndeterminate ? "data-[state=indeterminate]:bg-primary" : ""}
          />
          <span className="text-sm text-gray-600">
            {selectedCount > 0 ? (
              <>
                <span className="font-medium">{selectedCount}</span> of{' '}
                <span className="font-medium">{totalCount}</span> users selected
              </>
            ) : (
              'Select users for bulk actions'
            )}
          </span>
        </div>
      </div>

      {selectedCount > 0 && (
        <div className="flex items-center space-x-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                Bulk Actions
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 bg-white border shadow-lg z-50">
              <DropdownMenuItem 
                onClick={onBulkApprove}
                className="cursor-pointer hover:bg-gray-50"
              >
                <UserCheck className="mr-2 h-4 w-4" />
                Approve Selected
              </DropdownMenuItem>
              
              <DropdownMenuItem 
                onClick={onBulkSuspend}
                className="cursor-pointer hover:bg-gray-50"
              >
                <UserX className="mr-2 h-4 w-4" />
                Suspend Selected
              </DropdownMenuItem>
              
              <DropdownMenuSeparator />
              
              <DropdownMenuItem 
                onClick={onBulkEmail}
                className="cursor-pointer hover:bg-gray-50"
              >
                <Mail className="mr-2 h-4 w-4" />
                Send Email
              </DropdownMenuItem>
              
              <DropdownMenuItem 
                onClick={onBulkExport}
                className="cursor-pointer hover:bg-gray-50"
              >
                <Download className="mr-2 h-4 w-4" />
                Export Data
              </DropdownMenuItem>
              
              <DropdownMenuSeparator />
              
              <DropdownMenuItem 
                onClick={onBulkDelete}
                className="cursor-pointer hover:bg-red-50 text-red-600"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Selected
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
    </div>
  );
}