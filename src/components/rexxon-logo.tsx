import { cn } from "@/lib/utils";
import logoFull from "@/assets/rexxon-logo-full.jpg";

type Size = "sm" | "md" | "lg";

// Rectangular container sizes — image fills the box and blends with the
// surrounding dark UI via matching background color.
const SIZES: Record<Size, string> = {
  sm: "h-20 w-full max-w-[220px]",
  md: "h-28 w-full max-w-[320px]",
  lg: "h-40 w-full max-w-[440px]",
};

/**
 * Rexxon AI logo — rectangular lockup container. The source artwork has a
 * black background, so we wrap it in a matching black container and use
 * `object-cover` so the mark fills the rectangle edge-to-edge and blends
 * seamlessly into dark surfaces (sidebar, footer, nav).
 */
export function RexxonLogo({
  size = "md",
  className,
}: {
  size?: Size;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-md bg-black",
        SIZES[size],
        className
      )}
    >
      <img
        src={logoFull}
        alt="Rexxon AI — Business Intelligence Unleashed"
        className="h-full w-full object-cover object-center"
        draggable={false}
      />
    </div>
  );
}

/**
 * Wordmark variant — alias of RexxonLogo since the full logo already
 * contains the brand name. Kept for backward compatibility.
 */
export function RexxonWordmark({
  size = "md",
  className,
}: {
  size?: Size;
  className?: string;
}) {
  return <RexxonLogo size={size} className={className} />;
}
