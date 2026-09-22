import * as React from "react";
import { cn } from "@/lib/utils";

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-2xl bg-white shadow-card ring-1 ring-grey-20/60",
      className,
    )}
    {...props}
  />
));
Card.displayName = "Card";

export { Card };
