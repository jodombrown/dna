import * as React from "react"
import { cn } from "@/lib/utils"
import { Avatar, AvatarImage, AvatarFallback, AvatarOnlineIndicator } from "./avatar"
import type { AvatarSize } from "./avatar"

/**
 * DNA ListItem — Composite Component (Design System PRD Phase 4)
 *
 * A universal row component for conversations, notifications, member lists,
 * attendee lists, and search results. Provides avatar, content, meta, and
 * action slots in a consistent layout.
 *
 * Usage:
 *   <ListItem
 *     avatarSrc={user.avatar}
 *     avatarFallback="JD"
 *     title="Jane Doe"
 *     subtitle="Sent you a connection request"
 *     meta="2m ago"
 *     unread
 *     onClick={() => navigate(...)}
 *   />
 */

type ListItemVariant = "default" | "connect" | "convene" | "collaborate" | "contribute" | "convey"

const accentBorderClasses: Record<ListItemVariant, string> = {
  default: "",
  connect: "border-l-[3px] border-l-module-connect",
  convene: "border-l-[3px] border-l-module-convene",
  collaborate: "border-l-[3px] border-l-module-collaborate",
  contribute: "border-l-[3px] border-l-module-contribute",
  convey: "border-l-[3px] border-l-module-convey",
}

interface ListItemProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Avatar image URL */
  avatarSrc?: string
  /** Fallback initials */
  avatarFallback?: string
  /** Avatar size */
  avatarSize?: AvatarSize
  /** Show online indicator */
  online?: boolean
  /** Primary text */
  title: string
  /** Secondary text line */
  subtitle?: string
  /** Right-aligned meta text (e.g. timestamp) */
  meta?: React.ReactNode
  /** Right-aligned action slot (e.g. button, badge) */
  action?: React.ReactNode
  /** Module accent border */
  variant?: ListItemVariant
  /** Unread state — cream background + bold title */
  unread?: boolean
  /** Compact mode — less padding */
  compact?: boolean
  /** Custom left slot instead of avatar */
  leftSlot?: React.ReactNode
}

const ListItem = React.forwardRef<HTMLDivElement, ListItemProps>(
  (
    {
      avatarSrc,
      avatarFallback = "?",
      avatarSize = "md",
      online = false,
      title,
      subtitle,
      meta,
      action,
      variant = "default",
      unread = false,
      compact = false,
      leftSlot,
      className,
      ...props
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={cn(
          "flex items-center gap-3 rounded-dna-md transition-colors",
          compact ? "px-3 py-2" : "px-4 py-3",
          unread ? "bg-dna-cream" : "bg-transparent",
          "hover:bg-dna-sand/60 cursor-pointer",
          accentBorderClasses[variant],
          className
        )}
        {...props}
      >
        {/* Left: Avatar or custom slot */}
        {leftSlot ?? (
          <div className="relative shrink-0">
            <Avatar size={avatarSize}>
              {avatarSrc && <AvatarImage src={avatarSrc} alt={title} />}
              <AvatarFallback>{avatarFallback}</AvatarFallback>
            </Avatar>
            {online && <AvatarOnlineIndicator size={avatarSize} />}
          </div>
        )}

        {/* Center: Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline justify-between gap-2">
            <span
              className={cn(
                "text-[15px] truncate",
                unread ? "font-semibold text-foreground" : "font-medium text-foreground"
              )}
            >
              {title}
            </span>
            {meta && (
              <span className="shrink-0 text-[12px] text-muted-foreground">
                {meta}
              </span>
            )}
          </div>
          {subtitle && (
            <p
              className={cn(
                "text-[13px] truncate mt-0.5",
                unread ? "text-foreground/80" : "text-muted-foreground"
              )}
            >
              {subtitle}
            </p>
          )}
        </div>

        {/* Right: Action slot */}
        {action && <div className="shrink-0 ml-1">{action}</div>}
      </div>
    )
  }
)
ListItem.displayName = "ListItem"

export { ListItem }
export type { ListItemProps, ListItemVariant }
