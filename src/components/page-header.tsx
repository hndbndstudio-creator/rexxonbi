import { type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export type HeaderStat = {
  label: string;
  value: string | number;
  accent?: 'brand' | 'green' | 'amber' | 'cyan' | 'rose' | 'muted';
  icon?: LucideIcon;
};

const ACCENT_MAP: Record<NonNullable<HeaderStat['accent']>, string> = {
  brand: 'text-brand',
  green: 'text-green-300',
  amber: 'text-amber-300',
  cyan: 'text-cyan-300',
  rose: 'text-rose-300',
  muted: 'text-foreground',
};

/**
 * Consistent aurora-themed page header used across all dashboard pages.
 * Calm, motivating, CRO-focused: clear hierarchy, prominent CTA, glanceable stats.
 */
export function PageHeader({
  icon: Icon,
  eyebrow,
  title,
  subtitle,
  stats,
  actions,
  badge,
  badgeTone = 'green',
}: {
  icon: LucideIcon;
  eyebrow?: string;
  title: string;
  subtitle?: string;
  stats?: HeaderStat[];
  actions?: React.ReactNode;
  badge?: string;
  badgeTone?: 'green' | 'amber' | 'brand';
}) {
  const badgeClass =
    badgeTone === 'green'
      ? 'bg-green-500/15 text-green-300'
      : badgeTone === 'amber'
      ? 'bg-amber-500/15 text-amber-300'
      : 'bg-brand/15 text-brand';

  return (
    <div className="relative isolate overflow-hidden border-b border-border bg-aurora">
      {/* Soft glow orb */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 right-10 -z-10 h-64 w-64 rounded-full opacity-50 blur-3xl"
        style={{
          background:
            'radial-gradient(circle, color-mix(in oklab, var(--brand) 35%, transparent), transparent 70%)',
        }}
      />
      <div className="mx-auto max-w-7xl px-4 py-7 md:px-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0 flex-1 animate-rise">
            <div className="flex items-center gap-3">
              <div className="relative flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-brand to-brand-glow text-brand-foreground shadow-elevated">
                <Icon className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                {eyebrow && (
                  <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                    {eyebrow}
                  </p>
                )}
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl font-bold tracking-tight md:text-3xl">{title}</h1>
                  {badge && (
                    <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-medium', badgeClass)}>
                      ● {badge}
                    </span>
                  )}
                </div>
                {subtitle && (
                  <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{subtitle}</p>
                )}
              </div>
            </div>
          </div>

          {actions && (
            <div className="flex flex-shrink-0 flex-wrap items-center gap-2 animate-rise" style={{ animationDelay: '60ms' }}>
              {actions}
            </div>
          )}
        </div>

        {stats && stats.length > 0 && (
          <div
            className="mt-6 grid grid-cols-2 gap-3 animate-rise sm:grid-cols-4"
            style={{ animationDelay: '120ms' }}
          >
            {stats.map((s) => {
              const StatIcon = s.icon;
              return (
                <div
                  key={s.label}
                  className="rounded-xl border border-border bg-card/50 px-4 py-3 backdrop-blur-sm transition-colors hover:border-brand/40"
                >
                  <div className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                    {StatIcon && <StatIcon className="h-3 w-3" />}
                    {s.label}
                  </div>
                  <div className={cn('mt-1 text-xl font-bold tabular-nums md:text-2xl', ACCENT_MAP[s.accent ?? 'muted'])}>
                    {s.value}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
