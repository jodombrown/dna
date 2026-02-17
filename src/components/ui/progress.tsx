import * as React from "react"
import * as ProgressPrimitive from "@radix-ui/react-progress"
import { cn } from "@/lib/utils"
import { cva, type VariantProps } from "class-variance-authority"

const progressVariants = cva(
  "relative w-full overflow-hidden rounded-full bg-dna-sand",
  {
    variants: {
      size: {
        sm: "h-1.5",
        md: "h-2.5",
        lg: "h-4",
      },
      variant: {
        default: "[&>div]:bg-primary",
        connect: "[&>div]:bg-[hsl(var(--module-connect))]",
        convene: "[&>div]:bg-[hsl(var(--module-convene))]",
        collaborate: "[&>div]:bg-[hsl(var(--module-collaborate))]",
        contribute: "[&>div]:bg-[hsl(var(--module-contribute))]",
        convey: "[&>div]:bg-[hsl(var(--module-convey))]",
      },
    },
    defaultVariants: { size: "md", variant: "default" },
  },
)

interface ProgressProps
  extends React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root>,
    VariantProps<typeof progressVariants> {}

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  ProgressProps
>(({ className, value, size, variant, ...props }, ref) => (
  <ProgressPrimitive.Root
    ref={ref}
    className={cn(progressVariants({ size, variant }), className)}
    {...props}
  >
    <ProgressPrimitive.Indicator
      className="h-full w-full flex-1 transition-transform duration-300 ease-out rounded-full"
      style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
    />
  </ProgressPrimitive.Root>
))
Progress.displayName = ProgressPrimitive.Root.displayName

export { Progress }
