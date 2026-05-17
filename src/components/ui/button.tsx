import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/**
 * Material Design 3 button.
 *
 * - All variants are pill-shaped (`rounded-full`) — the most recognizable MD3 trait.
 * - State changes use opacity overlays ("state layers") instead of color shifts.
 * - `active:scale-95` gives every press a tactile physical response.
 * - Transitions use the MD3 "Emphasized Decelerate" easing (`ease-md`).
 */
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-medium tracking-[0.01em] transition-all duration-300 ease-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-95",
  {
    variants: {
      variant: {
        // Filled — primary action
        default:
          "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 hover:shadow-md active:bg-primary/80",
        // Tonal — secondary action on a colored container
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80 active:bg-secondary/70",
        // Outlined — quiet but still discoverable
        outline:
          "border border-md-outline bg-transparent text-primary hover:bg-primary/10 active:bg-primary/5",
        // Text — lowest emphasis
        ghost: "text-primary hover:bg-primary/10 active:bg-primary/5",
        // Accent / tertiary — useful for FAB-like CTAs
        accent:
          "bg-md-tertiary text-white shadow-sm hover:bg-md-tertiary/90 hover:shadow-md active:bg-md-tertiary/80",
        destructive:
          "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90 hover:shadow-md active:bg-destructive/80",
        // Kept for backward-compat with existing call sites — same look as accent
        navy: "bg-md-tertiary text-white shadow-sm hover:bg-md-tertiary/90 hover:shadow-md active:bg-md-tertiary/80",
      },
      size: {
        default: "h-10 px-6 py-2",
        sm: "h-9 px-4",
        lg: "h-12 px-8 text-base",
        icon: "h-10 w-10",
        // 56x56 rounded square — Material 3 FAB
        fab: "h-14 w-14 rounded-2xl shadow-md hover:shadow-xl",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
