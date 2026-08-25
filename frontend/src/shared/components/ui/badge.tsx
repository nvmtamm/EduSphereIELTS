import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/shared/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-bold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-xs",
        secondary: "border-transparent bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100",
        destructive: "border-transparent bg-red-600 text-white shadow-xs",
        outline: "text-zinc-950 dark:text-zinc-100 border-zinc-200 dark:border-zinc-800",
        success: "border-emerald-500/30 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
        warning: "border-amber-500/30 bg-amber-500/15 text-amber-600 dark:text-amber-400",
        indigo: "border-indigo-500/30 bg-indigo-500/15 text-indigo-600 dark:text-indigo-300",
        purple: "border-purple-500/30 bg-purple-500/15 text-purple-600 dark:text-purple-300",
        cambridge: "border-red-500/30 bg-red-500/15 text-red-600 dark:text-red-400 font-extrabold"
      }
    },
    defaultVariants: {
      variant: "default"
    }
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }
