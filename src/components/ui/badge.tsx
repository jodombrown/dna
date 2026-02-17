import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline:
          "text-foreground",
        // Five C's module variants
        connect:
          "border-transparent bg-dna-emerald-subtle text-dna-emerald-dark",
        convene:
          "border-transparent bg-dna-gold-light text-dna-gold-dark",
        collaborate:
          "border-transparent bg-dna-forest-light text-dna-forest-dark",
        contribute:
          "border-transparent bg-dna-copper-light text-dna-copper-dark",
        convey:
          "border-transparent bg-dna-ocean-light text-dna-ocean-dark",
        // DIA
        dia:
          "border-transparent bg-dna-gold-light text-dna-gold-dark",
        // Legacy
        virtual:
          "bg-dna-copper text-white border-transparent hover:bg-dna-forest hover:text-white",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant, ...props }, ref) => {
    return (
      <div ref={ref} className={cn(badgeVariants({ variant }), className)} {...props} />
    )
  }
)
Badge.displayName = "Badge"

export { Badge, badgeVariants }
