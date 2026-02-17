
import * as React from "react"

import { cn } from "@/lib/utils"

/**
 * DNA Card System (Design System PRD)
 *
 * Base: white bg, 12px radius, 1px dna-stone border, level1 shadow, 16px padding
 * Accented: left-border in module color (3px)
 * Interactive: hover lift + level2 shadow
 * Unread: cream background
 */

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    accented?: boolean
    interactive?: boolean
    unread?: boolean
  }
>(({ className, accented, interactive, unread, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-dna-lg border border-dna-stone bg-card text-card-foreground shadow-dna-1",
      interactive && "cursor-pointer transition-all duration-150 hover:shadow-dna-2 hover:-translate-y-px",
      unread && "bg-dna-cream",
      accented && "border-l-[3px]",
      className
    )}
    {...props}
  />
))
Card.displayName = "Card"

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("flex flex-col space-y-1.5 p-4", className)} {...props} />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-[17px] md:text-lg font-semibold leading-snug tracking-tight",
      className
    )}
    {...props}
  />
))
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-[13px] md:text-sm text-muted-foreground", className)}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-4 pt-0", className)} {...props} />
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-4 pt-0", className)}
    {...props}
  />
))
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }
