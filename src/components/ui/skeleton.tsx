import { cn } from "@/lib/utils"

/**
 * Base Skeleton with DNA shimmer animation.
 * Uses dna-sand → dna-cream shimmer (PRD §15).
 */
function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-dna-md bg-dna-sand animate-shimmer",
        className,
      )}
      {...props}
    />
  )
}

/* ── Per-variant skeletons (PRD §15) ── */

function FeedCardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("rounded-dna-lg border border-dna-stone bg-card p-4 space-y-3", className)}>
      <div className="flex items-center gap-3">
        <Skeleton className="h-11 w-11 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-3/5" />
          <Skeleton className="h-3 w-2/5" />
        </div>
      </div>
      <div className="space-y-2">
        <Skeleton className="h-3.5 w-full" />
        <Skeleton className="h-3.5 w-4/5" />
      </div>
      <Skeleton className="h-8 w-full rounded-dna-md" />
    </div>
  )
}

function ProfileHeaderSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("space-y-4", className)}>
      <Skeleton className="w-full h-[180px] rounded-dna-lg" />
      <div className="flex items-end gap-4 -mt-12 px-4">
        <Skeleton className="h-24 w-24 rounded-full border-4 border-card" />
        <div className="flex-1 space-y-2 pb-2">
          <Skeleton className="h-5 w-2/5" />
          <Skeleton className="h-3.5 w-3/5" />
        </div>
      </div>
    </div>
  )
}

function ConversationItemSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-3 p-3", className)}>
      <Skeleton className="h-12 w-12 rounded-full" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-3 w-3/4" />
      </div>
    </div>
  )
}

function NotificationItemSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-3 p-3", className)}>
      <Skeleton className="h-11 w-11 rounded-full" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-3.5 w-4/5" />
        <Skeleton className="h-3 w-1/5" />
      </div>
    </div>
  )
}

export {
  Skeleton,
  FeedCardSkeleton,
  ProfileHeaderSkeleton,
  ConversationItemSkeleton,
  NotificationItemSkeleton,
}
