import * as React from "react"
import { cn } from "@/lib/utils"
import { Button } from "./button"

/**
 * DNA SectionHeader — Composite Component (Design System PRD Phase 4)
 *
 * Consistent section heading with optional subtitle, action button,
 * and module accent. Uses heritage font for titles by default.
 *
 * Usage:
 *   <SectionHeader
 *     title="Upcoming Events"
 *     subtitle="Events in your network"
 *     module="convene"
 *     action={{ label: "See All", onClick: () => navigate(...) }}
 *   />
 */

type SectionModule = "connect" | "convene" | "collaborate" | "contribute" | "convey" | "dia"

const moduleAccentClasses: Record<SectionModule, string> = {
  connect: "text-module-connect",
  convene: "text-module-convene",
  collaborate: "text-module-collaborate",
  contribute: "text-module-contribute",
  convey: "text-module-convey",
  dia: "text-dna-gold-dark",
}

interface SectionHeaderAction {
  label: string
  onClick: () => void
  variant?: "link" | "ghost" | "outline"
}

interface SectionHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Section title — rendered in heritage font */
  title: string
  /** Optional subtitle / description */
  subtitle?: string
  /** Module accent color for the title */
  module?: SectionModule
  /** Right-aligned action button */
  action?: SectionHeaderAction
  /** Use heritage (Lora) font for title — default true */
  heritage?: boolean
  /** Icon to the left of the title */
  icon?: React.ReactNode
  /** Render an underline bar in module color */
  underline?: boolean
}

const SectionHeader = React.forwardRef<HTMLDivElement, SectionHeaderProps>(
  (
    {
      title,
      subtitle,
      module,
      action,
      heritage = true,
      icon,
      underline = false,
      className,
      ...props
    },
    ref
  ) => {
    return (
      <div ref={ref} className={cn("flex flex-col gap-1", className)} {...props}>
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 min-w-0">
            {icon && (
              <span className={cn("shrink-0", module && moduleAccentClasses[module])}>
                {icon}
              </span>
            )}
            <h2
              className={cn(
                "text-lg font-semibold leading-snug truncate",
                heritage && "font-heritage",
                module ? moduleAccentClasses[module] : "text-foreground"
              )}
            >
              {title}
            </h2>
          </div>

          {action && (
            <Button
              variant={action.variant ?? "link"}
              size="sm"
              onClick={action.onClick}
              className="shrink-0 text-[13px] px-0 h-auto"
            >
              {action.label}
            </Button>
          )}
        </div>

        {subtitle && (
          <p className="text-[13px] text-muted-foreground">{subtitle}</p>
        )}

        {underline && module && (
          <div
            className={cn(
              "h-[2px] w-12 rounded-full mt-1",
              module === "connect" && "bg-module-connect",
              module === "convene" && "bg-module-convene",
              module === "collaborate" && "bg-module-collaborate",
              module === "contribute" && "bg-module-contribute",
              module === "convey" && "bg-module-convey",
              module === "dia" && "bg-dna-gold"
            )}
          />
        )}
      </div>
    )
  }
)
SectionHeader.displayName = "SectionHeader"

export { SectionHeader }
export type { SectionHeaderProps, SectionModule }
