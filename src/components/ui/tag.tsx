import * as React from "react"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

/**
 * DNA Tag / Chip Component (Design System PRD)
 *
 * Used for: skills, interests, topics, filters, multi-select tokens.
 * Padding: 4px vertical, 12px horizontal. Gap between chips: 8px.
 */

type TagVariant = "default" | "connect" | "convene" | "collaborate" | "contribute" | "convey"

interface TagProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: TagVariant
  removable?: boolean
  onRemove?: () => void
}

const variantClasses: Record<TagVariant, string> = {
  default: "bg-dna-emerald-subtle text-dna-emerald-dark",
  connect: "bg-dna-emerald-subtle text-dna-emerald-dark",
  convene: "bg-dna-gold-light text-dna-gold-dark",
  collaborate: "bg-dna-forest-light text-dna-forest-dark",
  contribute: "bg-dna-copper-light text-dna-copper-dark",
  convey: "bg-dna-ocean-light text-dna-ocean-dark",
}

const Tag: React.FC<TagProps> = ({
  variant = "default",
  removable = false,
  onRemove,
  className,
  children,
  ...props
}) => {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-dna-sm px-3 py-1 text-[13px] font-medium leading-tight",
        variantClasses[variant],
        className
      )}
      {...props}
    >
      {children}
      {removable && (
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onRemove?.(); }}
          className="ml-0.5 rounded-full hover:bg-black/10 p-0.5 transition-colors"
          aria-label="Remove"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </span>
  )
}
Tag.displayName = "Tag"

/** BadgeCount — notification counter dot */
interface BadgeCountProps {
  count: number
  maxCount?: number
  className?: string
}

const BadgeCount: React.FC<BadgeCountProps> = ({ count, maxCount = 99, className }) => {
  if (count <= 0) return null
  const display = count > maxCount ? `${maxCount}+` : String(count)

  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-full bg-destructive text-destructive-foreground",
        "min-w-[18px] h-[18px] px-1 text-[11px] font-bold leading-none",
        className
      )}
    >
      {display}
    </span>
  )
}
BadgeCount.displayName = "BadgeCount"

export { Tag, BadgeCount }
export type { TagVariant }
