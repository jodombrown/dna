import * as React from "react"
import { cn } from "@/lib/utils"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"

/**
 * DNA StatCard — Composite Component (Design System PRD Phase 4)
 *
 * Dashboard stat tile with icon, value, label, and optional trend.
 * Module-colored accent strip and heritage-font value.
 *
 * Usage:
 *   <StatCard
 *     label="Connections"
 *     value={142}
 *     icon={<Users className="h-5 w-5" />}
 *     module="connect"
 *     trend={{ value: 12, direction: "up" }}
 *   />
 */

type StatModule = "connect" | "convene" | "collaborate" | "contribute" | "convey" | "dia"

const moduleTopBorderClasses: Record<StatModule, string> = {
  connect: "border-t-module-connect",
  convene: "border-t-module-convene",
  collaborate: "border-t-module-collaborate",
  contribute: "border-t-module-contribute",
  convey: "border-t-module-convey",
  dia: "border-t-dna-gold",
}

const moduleIconBgClasses: Record<StatModule, string> = {
  connect: "bg-dna-emerald-subtle text-dna-emerald-dark",
  convene: "bg-dna-gold-light text-dna-gold-dark",
  collaborate: "bg-dna-forest-light text-dna-forest-dark",
  contribute: "bg-dna-copper-light text-dna-copper-dark",
  convey: "bg-dna-ocean-light text-dna-ocean-dark",
  dia: "bg-dna-gold-light text-dna-gold-dark",
}

interface StatTrend {
  value: number
  direction: "up" | "down" | "neutral"
}

interface StatCardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Stat label */
  label: string
  /** Main value (number or formatted string) */
  value: React.ReactNode
  /** Optional icon */
  icon?: React.ReactNode
  /** Module accent color */
  module?: StatModule
  /** Trend indicator */
  trend?: StatTrend
  /** Compact variant */
  compact?: boolean
}

const StatCard = React.forwardRef<HTMLDivElement, StatCardProps>(
  (
    { label, value, icon, module, trend, compact = false, className, ...props },
    ref
  ) => {
    const TrendIcon =
      trend?.direction === "up"
        ? TrendingUp
        : trend?.direction === "down"
        ? TrendingDown
        : Minus

    return (
      <div
        ref={ref}
        className={cn(
          "rounded-dna-lg border border-dna-stone bg-card shadow-dna-1",
          module && `border-t-[3px] ${moduleTopBorderClasses[module]}`,
          compact ? "p-3" : "p-4",
          className
        )}
        {...props}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-col gap-1 min-w-0">
            <span className="text-[12px] font-medium text-muted-foreground uppercase tracking-wide">
              {label}
            </span>
            <span className="text-2xl font-heritage font-bold text-foreground leading-none">
              {value}
            </span>
          </div>

          {icon && module && (
            <div
              className={cn(
                "shrink-0 flex items-center justify-center rounded-dna-md",
                compact ? "h-9 w-9" : "h-10 w-10",
                moduleIconBgClasses[module]
              )}
            >
              {icon}
            </div>
          )}
        </div>

        {trend && (
          <div className="flex items-center gap-1 mt-2">
            <TrendIcon
              className={cn(
                "h-3.5 w-3.5",
                trend.direction === "up" && "text-dna-emerald-dark",
                trend.direction === "down" && "text-destructive",
                trend.direction === "neutral" && "text-muted-foreground"
              )}
            />
            <span
              className={cn(
                "text-[12px] font-medium",
                trend.direction === "up" && "text-dna-emerald-dark",
                trend.direction === "down" && "text-destructive",
                trend.direction === "neutral" && "text-muted-foreground"
              )}
            >
              {trend.value}%
            </span>
          </div>
        )}
      </div>
    )
  }
)
StatCard.displayName = "StatCard"

export { StatCard }
export type { StatCardProps, StatModule, StatTrend }
