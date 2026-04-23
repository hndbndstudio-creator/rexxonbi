import { cn } from "@/lib/utils";
import logoMark from "@/assets/rexxon-mark.png";

type Size = "sm" | "md" | "lg";

const SIZES: Record<Size, string> = {
  sm: "h-7 w-7",
  md: "h-8 w-8",
  lg: "h-10 w-10",
};

/**
 * Rexxon brand mark — same R glyph as the favicon, on the brand gradient badge.
 * Use across sidebar, marketing nav, footer, and email headers.
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
        "logo-badge relative flex shrink-0 items-center justify-center overflow-hidden rounded-md",
        SIZES[size],
        className,
      )}
      aria-label="Rexxon AI"
    >
      <img
        src={logoMark}
        alt=""
        width={64}
        height={64}
        className="relative z-10 h-[60%] w-[60%] object-contain drop-shadow-[0_1px_1px_rgba(0,0,0,0.45)]"
        draggable={false}
      />
    </div>
  );
}

export function RexxonWordmark({
  size = "md",
  className,
}: {
  size?: Size;
  className?: string;
}) {
  const text =
    size === "sm" ? "text-sm" : size === "lg" ? "text-lg" : "text-base";
  return (
    <span
      className={cn(
        "flex items-center gap-2.5 font-semibold tracking-tight",
        text,
        className,
      )}
    >
      <RexxonLogo size={size} />
      <span>Rexxon AI</span>
    </span>
  );
}
