import { cn } from "@/lib/utils";
import logoFull from "@/assets/rexxon-logo-full.png";

type Size = "sm" | "md" | "lg";

// White wordmark on a transparent background — sized 4x larger than before
// with a soft glow shadow behind it for depth on dark surfaces.
const SIZES: Record<Size, string> = {
  sm: "h-32",
  md: "h-40",
  lg: "h-56",
};

// Layered drop-shadow creates a soft halo/glow behind the wordmark.
const SHADOW =
  "drop-shadow-[0_4px_12px_rgba(0,0,0,0.6)] drop-shadow-[0_0_24px_rgba(139,92,246,0.35)]";

/**
 * Rexxon AI logo — white wordmark, transparent background. Drops into dark
 * UI surfaces and inherits the parent's background seamlessly.
 */
export function RexxonLogo({
  size = "md",
  className,
}: {
  size?: Size;
  className?: string;
}) {
  return (
    <img
      src={logoFull}
      alt="Rexxon AI"
      className={cn("w-auto object-contain", SIZES[size], SHADOW, className)}
      draggable={false}
    />
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
