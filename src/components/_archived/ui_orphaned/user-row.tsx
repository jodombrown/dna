import * as React from "react"
import { cn } from "@/lib/utils"
import { Avatar, AvatarImage, AvatarFallback, AvatarOnlineIndicator } from "./avatar"
import type { AvatarSize } from "./avatar"
import { Badge } from "./badge"

/**
 * DNA UserRow — Composite Component (Design System PRD Phase 4)
 *
 * Specialized ListItem for user/member contexts: connection lists,
 * attendee panels, member directories, search results.
 * Shows avatar, name (heritage font), headline, and action slot.
 *
 * Usage:
 *   <UserRow
 *     avatarSrc={user.avatar}
 *     name="Amara Obi"
 *     headline="Impact Investor · Lagos"
 *     badge="Pro"
 *     action={<Button size="sm">Connect</Button>}
 *   />
 */

interface UserRowProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Avatar URL */
  avatarSrc?: string
  /** Avatar fallback initials */
  avatarFallback?: string
  /** Avatar size */
  avatarSize?: AvatarSize
  /** User display name */
  name: string
  /** Username / handle */
  username?: string
  /** Headline or short bio */
  headline?: string
  /** Online status */
  online?: boolean
  /** Badge label (e.g. "Pro", "Host") */
  badge?: string
  /** Badge variant */
  badgeVariant?: "default" | "connect" | "convene" | "collaborate" | "contribute" | "convey"
  /** Right-aligned action (button, icon, etc.) */
  action?: React.ReactNode
  /** Compact mode */
  compact?: boolean
  /** Mutual connection hint */
  mutualCount?: number
}

const UserRow = React.forwardRef<HTMLDivElement, UserRowProps>(
  (
    {
      avatarSrc,
      avatarFallback,
      avatarSize = "md",
      name,
      username,
      headline,
      online = false,
      badge,
      badgeVariant = "default",
      action,
      compact = false,
      mutualCount,
      className,
      ...props
    },
    ref
  ) => {
    const initials =
      avatarFallback ??
      name
        .split(" ")
        .map((w) => w[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)

    return (
      <div
        ref={ref}
        className={cn(
          "flex items-center gap-3 rounded-dna-md transition-colors",
          compact ? "px-3 py-2" : "px-4 py-3",
          "hover:bg-dna-sand/60 cursor-pointer",
          className
        )}
        {...props}
      >
        {/* Avatar */}
        <div className="relative shrink-0">
          <Avatar size={avatarSize}>
            {avatarSrc && <AvatarImage src={avatarSrc} alt={name} />}
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          {online && <AvatarOnlineIndicator size={avatarSize} />}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-[15px] font-semibold font-heritage truncate text-foreground">
              {name}
            </span>
            {badge && (
              <Badge variant={badgeVariant} className="text-[10px] px-1.5 py-0">
                {badge}
              </Badge>
            )}
          </div>
          {headline && (
            <p className="text-[13px] text-muted-foreground truncate mt-0.5">
              {headline}
            </p>
          )}
          {username && !headline && (
            <p className="text-[13px] text-muted-foreground truncate mt-0.5">
              @{username}
            </p>
          )}
          {mutualCount != null && mutualCount > 0 && (
            <p className="text-[12px] text-dna-emerald mt-0.5">
              {mutualCount} mutual connection{mutualCount !== 1 ? "s" : ""}
            </p>
          )}
        </div>

        {/* Action */}
        {action && <div className="shrink-0 ml-1">{action}</div>}
      </div>
    )
  }
)
UserRow.displayName = "UserRow"

export { UserRow }
export type { UserRowProps }
