import { Link } from '@tanstack/react-router';
import { formatDistanceToNow } from 'date-fns';
import {
  Building2,
  CheckCircle2,
  Mail,
  Sparkles,
  X,
  ArrowRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  SIGNAL_SOURCE_LABELS,
  SIGNAL_TYPE_COLOR_VAR,
  SIGNAL_TYPE_LABELS,
  confidenceLabel,
  getInitials,
  maskEmail,
} from '@/lib/types';
import type { SignalWithRelations } from '@/lib/queries';

interface Props {
  signal: SignalWithRelations;
  onClaim?: (id: string) => void;
  onDismiss?: (id: string) => void;
  isPending?: boolean;
}

export function SignalCard({ signal, onClaim, onDismiss, isPending }: Props) {
  const conf = confidenceLabel(signal.confidence_score);
  const typeColor = SIGNAL_TYPE_COLOR_VAR[signal.signal_type as keyof typeof SIGNAL_TYPE_COLOR_VAR];
  const company = signal.company;
  const mgr = signal.hiring_manager;
  const isClaimed = signal.status === 'CLAIMED';
  const isDismissed = signal.status === 'DISMISSED';

  return (
    <article
      className={cn(
        'group relative rounded-xl border bg-card/60 p-4 transition-colors animate-signal-in',
        signal.is_read ? 'border-border' : 'border-brand/30 bg-card/80',
        isDismissed && 'opacity-50',
        isPending && 'opacity-70'
      )}
    >
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted font-semibold text-foreground">
          {company ? getInitials(company.name) : '??'}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <Link
              to="/accounts/$id"
              params={{ id: signal.company_id }}
              className="font-semibold hover:text-brand"
            >
              {company?.name ?? 'Unknown'}
            </Link>
            <span
              className="rounded-md border px-1.5 py-0.5 text-[10px] font-mono uppercase tracking-wider"
              style={{ color: typeColor, borderColor: `color-mix(in oklab, ${typeColor} 40%, transparent)` }}
            >
              {SIGNAL_TYPE_LABELS[signal.signal_type as keyof typeof SIGNAL_TYPE_LABELS]}
            </span>
            {!signal.is_read && (
              <span className="h-1.5 w-1.5 rounded-full bg-brand" title="Unread" />
            )}
          </div>
          <div className="mt-0.5 flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <span>{SIGNAL_SOURCE_LABELS[signal.source as keyof typeof SIGNAL_SOURCE_LABELS]}</span>
            <span>·</span>
            <span>{formatDistanceToNow(new Date(signal.published_at), { addSuffix: true })}</span>
            {company?.industry && (
              <>
                <span>·</span>
                <Building2 className="h-3 w-3" />
                <span>{company.industry}</span>
              </>
            )}
          </div>
        </div>

        <div
          className="shrink-0 rounded-md border px-2 py-1 text-center"
          style={{ borderColor: `color-mix(in oklab, ${conf.color} 35%, transparent)` }}
        >
          <div className="text-[9px] font-mono uppercase text-muted-foreground">Confidence</div>
          <div className="text-xs font-semibold" style={{ color: conf.color }}>
            {conf.label}
          </div>
        </div>
      </div>

      {/* Title */}
      <h3 className="mt-3 text-sm font-semibold">{signal.title}</h3>

      {/* AI Insight */}
      <div className="mt-2 flex gap-2 rounded-lg border border-border bg-muted/30 p-2.5">
        <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand" />
        <p className="text-xs leading-relaxed text-foreground/90">{signal.ai_insight}</p>
      </div>

      {/* Pills */}
      {(signal.spend_categories.length > 0 || signal.vendor_suggestions.length > 0) && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {signal.spend_categories.slice(0, 4).map((s) => (
            <span
              key={'sc-' + s}
              className="rounded border border-border bg-background/40 px-1.5 py-0.5 text-[10px] text-foreground/80"
            >
              {s}
            </span>
          ))}
          {signal.vendor_suggestions.slice(0, 4).map((v) => (
            <span
              key={'vs-' + v}
              className="rounded border border-brand/30 bg-brand/10 px-1.5 py-0.5 text-[10px] text-brand"
            >
              {v}
            </span>
          ))}
        </div>
      )}

      {/* Hiring manager */}
      {mgr && (
        <div className="mt-3 flex items-center gap-2 rounded-md border border-border bg-background/40 px-2.5 py-1.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-muted text-[10px] font-semibold">
            {getInitials(`${mgr.first_name} ${mgr.last_name}`)}
          </div>
          <div className="min-w-0 flex-1 text-xs">
            <div className="truncate font-medium">
              {mgr.first_name} {mgr.last_name}
            </div>
            <div className="truncate text-[11px] text-muted-foreground">{mgr.title}</div>
          </div>
          <div className="flex items-center gap-1 font-mono text-[10px] text-muted-foreground">
            <Mail className="h-3 w-3" />
            {maskEmail(mgr.email)}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        <Button
          size="sm"
          variant={isClaimed ? 'secondary' : 'default'}
          className={cn('h-8 text-xs', !isClaimed && 'bg-brand text-brand-foreground hover:opacity-90')}
          onClick={() => onClaim?.(signal.id)}
          disabled={isClaimed || isDismissed || isPending}
        >
          <CheckCircle2 className="mr-1 h-3.5 w-3.5" />
          {isClaimed ? 'Claimed' : 'Claim Lead'}
        </Button>
        <Button size="sm" variant="ghost" asChild className="h-8 text-xs">
          <Link to="/accounts/$id" params={{ id: signal.company_id }}>
            View Account <ArrowRight className="ml-1 h-3 w-3" />
          </Link>
        </Button>
        <div className="flex-1" />
        <Button
          size="sm"
          variant="ghost"
          className="h-8 text-xs text-muted-foreground hover:text-destructive"
          onClick={() => onDismiss?.(signal.id)}
          disabled={isDismissed || isPending}
        >
          <X className="mr-1 h-3.5 w-3.5" />
          Dismiss
        </Button>
      </div>
    </article>
  );
}
