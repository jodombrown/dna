/**
 * ResponsiveModal — renders Dialog on desktop, vaul Drawer on mobile.
 * Drop-in replacement pattern for Dialog-based modals.
 */
import React from 'react';
import { useMobile } from '@/hooks/useMobile';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
} from '@/components/ui/drawer';
import { cn } from '@/lib/utils';

interface ResponsiveModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
  className?: string;
}

export function ResponsiveModal({ open, onOpenChange, children, className }: ResponsiveModalProps) {
  const { isMobile } = useMobile();

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent className={cn('max-h-[90dvh]', className)}>
          {children}
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={className}>
        {children}
      </DialogContent>
    </Dialog>
  );
}

export function ResponsiveModalHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  const { isMobile } = useMobile();
  const Comp = isMobile ? DrawerHeader : DialogHeader;
  return <Comp className={className} {...props} />;
}

export function ResponsiveModalTitle({ className, children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  const { isMobile } = useMobile();
  if (isMobile) {
    return <DrawerTitle className={className} {...(props as any)}>{children}</DrawerTitle>;
  }
  return <DialogTitle className={className} {...(props as any)}>{children}</DialogTitle>;
}

export function ResponsiveModalDescription({ className, children, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  const { isMobile } = useMobile();
  if (isMobile) {
    return <DrawerDescription className={className} {...(props as any)}>{children}</DrawerDescription>;
  }
  return <DialogDescription className={className} {...(props as any)}>{children}</DialogDescription>;
}

export function ResponsiveModalFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  const { isMobile } = useMobile();
  const Comp = isMobile ? DrawerFooter : DialogFooter;
  return <Comp className={className} {...props} />;
}
