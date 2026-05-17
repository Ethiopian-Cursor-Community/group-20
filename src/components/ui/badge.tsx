import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium tracking-[0.01em] transition-colors duration-200 ease-md",
  {
    variants: {
      variant: {
        // Filled — primary
        default: "bg-primary text-primary-foreground",
        // Tonal — uses the MD3 secondary container
        secondary: "bg-secondary text-secondary-foreground",
        // Tertiary tonal — useful for "popular"/highlight chips
        accent: "bg-md-tertiary text-white",
        // Outlined — quiet, sits on any surface
        outline: "border border-md-outline text-foreground",
        // State chips
        verified: "bg-primary/15 text-primary",
        pending: "bg-md-tertiary/15 text-md-tertiary",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
