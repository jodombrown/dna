
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-semibold ring-offset-background transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground hover:bg-dna-emerald-light active:bg-dna-emerald-dark shadow-dna-1 hover:shadow-dna-2",
        secondary:
          "bg-transparent text-primary border-[1.5px] border-primary hover:bg-dna-emerald-subtle active:bg-dna-emerald-subtle",
        ghost:
          "text-foreground hover:bg-dna-sand active:bg-dna-stone font-medium rounded-dna-sm",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-dna-crimson-dark active:bg-dna-crimson-dark shadow-dna-1 hover:shadow-dna-2",
        outline:
          "border-[1.5px] border-input bg-background hover:bg-accent hover:text-accent-foreground shadow-dna-1 hover:shadow-dna-2",
        link:
          "text-primary underline-offset-4 hover:underline font-medium",
        module:
          "bg-[hsl(var(--module-color))] text-white hover:opacity-90 active:opacity-80 shadow-dna-1 hover:shadow-dna-2",
      },
      size: {
        sm: "h-8 rounded-dna-lg px-4 text-[13px] [&_svg]:size-3.5",
        default: "h-10 rounded-dna-lg px-6 text-[15px] [&_svg]:size-4",
        lg: "h-12 rounded-dna-lg px-8 text-base [&_svg]:size-5",
        icon: "h-10 w-10 rounded-dna-md [&_svg]:size-5",
        touch: "h-12 w-12 min-w-[48px] min-h-[48px] rounded-dna-md [&_svg]:size-5",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
