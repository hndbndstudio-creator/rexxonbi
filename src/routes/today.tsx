import { createFileRoute, Link } from '@tanstack/react-router';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format, startOfDay, endOfDay, formatDistanceToNow } from 'date-fns';
import {
  CalendarDays,
  Sparkles,
  Loader2,
  Building2,
  User as UserIcon,
  Clock,
  ChevronRight,
  AlertCircle,
  Target,
  MessageSquare,
  ShieldAlert,
  ListChecks,
  Plus,
  CalendarPlus,
  CalendarCheck,
  Download,
  Link2,
  Rss,
  Copy,
  Check,
} from 'lucide-react';
import { toast } from 'sonner';

import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/use-auth';
import { DashboardShell } from '@/components/dashboard-shell';
import { PageHeader } from '@/components/page-header';
import { ScheduleMeetingDialog } from '@/components/schedule-meeting-dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import {
  googleCalendarUrl,
  outlookCalendarUrl,
  buildIcs,
  downloadIcs,
  type CalendarEvent,
} from '@/lib/calendar';

export const Route = createFileRoute('/today')({
  head: () => ({
    meta: [
      { title: "Today's meetings — Rexxon AI" },
      { name: 'robots', content: 'noindex, nofollow' },
    ],
  }),
  component: TodayPage,
});

interface MeetingRow {
  id: string;
  title: string;
  notes: string | null;
  scheduled_at: string;
  duration_minutes: number;
  status: string;
  brief: any | null;
  brief_generated_at: string | null;
  contact_id: string | null;
  company_id: string | null;
  signal_id: string | null;
  company: { id: string; name: string; domain: string; industry: string | null } | null;
  contact: { id: string; first_name: string; last_name: string; title: string | null } | null;
}

function TodayPage() {
  return (
    <DashboardShell>
      <TodayBriefing />
    </DashboardShell>
  );
}

function TodayBriefing() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [syncOpen, setSyncOpen] = useState(false);

  // Fetch the user's personal calendar feed token
  const { data: calendarToken } = useQuery({
    queryKey: ['profile-calendar-token', user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('calendar_token')
        .eq('user_id', user!.id)
        .maybeSingle();
      if (error) throw error;
      return (data as any)?.calendar_token as string | undefined;
    },
  });

  const feedUrl =
    typeof window !== 'undefined' && calendarToken
      ? `${window.location.origin}/api/public/calendar/${calendarToken}`
      : '';

  const { data: meetings = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['meetings', 'today', user?.id],
    enabled: !!user,
    queryFn: async (): Promise<MeetingRow[]> => {
      const start = startOfDay(new Date()).toISOString();
      const end = endOfDay(new Date()).toISOString();
      const { data, error } = await supabase
        .from('meetings')
        .select(
          `id,title,notes,scheduled_at,duration_minutes,status,brief,brief_generated_at,contact_id,company_id,signal_id,
           company:companies!meetings_company_id_fkey(id,name,domain,industry),
           contact:contacts!meetings_contact_id_fkey(id,first_name,last_name,title)`
        )
        .gte('scheduled_at', start)
        .lte('scheduled_at', end)
        .order('scheduled_at', { ascending: true });
      if (error) throw error;
      return (data ?? []) as unknown as MeetingRow[];
    },
  });

  const generate = useMutation({
    mutationFn: async ({ meetingId, force }: { meetingId: string; force?: boolean }) => {
      const { data, error } = await supabase.functions.invoke('generate-meeting-brief', {
        body: { meetingId, force },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: (_d, v) => {
      toast.success('📋 Brief ready');
      setExpandedId(v.meetingId);
      qc.invalidateQueries({ queryKey: ['meetings'] });
    },
    onError: (e: any) => {
      const msg = e?.message || 'Generation failed';
      if (/429/.test(msg)) toast.error('Rate limit reached. Try again shortly.');
      else if (/402/.test(msg)) toast.error('AI credits exhausted.');
      else toast.error(msg);
    },
  });

  const withBrief = meetings.filter((m) => m.brief).length;

  return (
    <>
      <PageHeader
        icon={CalendarDays}
        eyebrow="Today"
        title="Today's meetings"
        subtitle="Generate a pre-call brief for every meeting on your calendar — account summary, talking points, and a sales script."
        badge={format(new Date(), 'EEEE, MMM d')}
        badgeTone="green"
        stats={[
          { label: 'Meetings', value: meetings.length, icon: CalendarDays },
          { label: 'Briefed', value: withBrief, accent: 'green', icon: Sparkles },
          {
            label: 'Pending',
            value: meetings.length - withBrief,
            accent: 'amber',
            icon: AlertCircle,
          },
        ]}
        actions={
          <>
            <Button
              size="sm"
              variant="outline"
              className="btn-press"
              onClick={() => setSyncOpen(true)}
            >
              <Rss className="mr-1.5 h-3.5 w-3.5" />
              <span className="hidden sm:inline">Sync calendar</span>
              <span className="sm:hidden">Sync</span>
            </Button>
            <ScheduleMeetingDialog
              trigger={
                <Button size="sm" className="btn-press">
                  <CalendarPlus className="mr-1.5 h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Schedule meeting</span>
                  <span className="sm:hidden">Schedule</span>
                </Button>
              }
            />
          </>
        }
      />

      <div className="mx-auto max-w-5xl px-4 py-5 md:px-8 md:py-6">
        {isLoading && (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="skeleton-shimmer h-32 rounded-xl border border-border" />
            ))}
          </div>
        )}

        {isError && (
          <div className="animate-rise rounded-xl border border-destructive/30 bg-destructive/10 p-6 text-center">
            <p className="text-sm text-destructive">Failed to load meetings.</p>
            <Button size="sm" variant="outline" className="mt-3" onClick={() => refetch()}>
              Retry
            </Button>
          </div>
        )}

        {!isLoading && !isError && meetings.length === 0 && (
          <div className="surface-1 animate-rise rounded-xl border border-border p-10 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand/10">
              <CalendarDays className="h-6 w-6 text-brand" />
            </div>
            <h3 className="mt-4 font-semibold">No meetings today</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Schedule a meeting to get a pre-call brief.
            </p>
            <ScheduleMeetingDialog
              trigger={
                <Button size="sm" className="btn-press mt-4">
                  <Plus className="mr-1.5 h-3.5 w-3.5" />
                  Schedule meeting
                </Button>
              }
            />
          </div>
        )}

        <div className="stagger space-y-3">
          {meetings.map((m) => (
            <MeetingCard
              key={m.id}
              meeting={m}
              expanded={expandedId === m.id}
              onToggle={() => setExpandedId(expandedId === m.id ? null : m.id)}
              onGenerate={(force) => generate.mutate({ meetingId: m.id, force })}
              isGenerating={generate.isPending && generate.variables?.meetingId === m.id}
            />
          ))}
        </div>
      </div>

      <SyncCalendarDialog open={syncOpen} onOpenChange={setSyncOpen} feedUrl={feedUrl} />
    </>
  );
}

function SyncCalendarDialog({
  open,
  onOpenChange,
  feedUrl,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  feedUrl: string;
}) {
  const [copied, setCopied] = useState(false);
  const webcalUrl = feedUrl.replace(/^https?:/, 'webcal:');

  const copy = async () => {
    if (!feedUrl) return;
    await navigator.clipboard.writeText(feedUrl);
    setCopied(true);
    toast.success('Feed URL copied');
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Sync to your calendar</DialogTitle>
          <DialogDescription>
            Subscribe once and every meeting you schedule in Rexxon shows up in your calendar
            automatically. Updates every ~15 minutes.
          </DialogDescription>
        </DialogHeader>

        {!feedUrl ? (
          <div className="rounded-md border border-border bg-muted/30 p-4 text-sm text-muted-foreground">
            Generating your private feed…
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <div className="mb-1.5 text-[10px] font-mono uppercase text-muted-foreground">
                Your private feed URL
              </div>
              <div className="flex gap-2">
                <Input readOnly value={feedUrl} className="font-mono text-xs" />
                <Button size="sm" variant="outline" onClick={copy}>
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
              <p className="mt-1.5 text-xs text-muted-foreground">
                Keep this URL private — anyone with it can read your meetings.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              <a
                href={`https://calendar.google.com/calendar/r/settings/addbyurl?cid=${encodeURIComponent(feedUrl)}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-2 rounded-md border border-border bg-background/40 px-3 py-2 text-xs font-medium hover:bg-muted/40"
              >
                <CalendarCheck className="h-3.5 w-3.5" />
                Google Calendar
              </a>
              <a
                href={webcalUrl}
                className="flex items-center justify-center gap-2 rounded-md border border-border bg-background/40 px-3 py-2 text-xs font-medium hover:bg-muted/40"
              >
                <CalendarCheck className="h-3.5 w-3.5" />
                Apple Calendar
              </a>
              <a
                href={`https://outlook.live.com/owa?path=/calendar/action/compose&rru=addsubscription&url=${encodeURIComponent(feedUrl)}&name=Rexxon`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-2 rounded-md border border-border bg-background/40 px-3 py-2 text-xs font-medium hover:bg-muted/40"
              >
                <CalendarCheck className="h-3.5 w-3.5" />
                Outlook
              </a>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function MeetingCard({
  meeting,
  expanded,
  onToggle,
  onGenerate,
  isGenerating,
}: {
  meeting: MeetingRow;
  expanded: boolean;
  onToggle: () => void;
  onGenerate: (force?: boolean) => void;
  isGenerating: boolean;
}) {
  const hasBrief = !!meeting.brief;
  const scheduled = new Date(meeting.scheduled_at);
  const isPast = scheduled.getTime() < Date.now() - meeting.duration_minutes * 60_000;

  return (
    <article
      className={cn(
        'surface-2 card-interactive rounded-xl border border-border p-4',
        isPast && 'opacity-70'
      )}
    >
      <div className="flex flex-wrap items-start gap-3">
        <div className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-lg border border-border bg-background/40">
          <div className="text-[10px] font-mono uppercase text-muted-foreground">
            {format(scheduled, 'MMM')}
          </div>
          <div className="text-base font-bold leading-none">{format(scheduled, 'd')}</div>
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-sm font-semibold">{meeting.title}</h3>
            {hasBrief ? (
              <Badge variant="secondary" className="gap-1 text-[10px]">
                <Sparkles className="h-3 w-3 text-brand" /> Briefed
              </Badge>
            ) : (
              <Badge variant="outline" className="gap-1 text-[10px] text-muted-foreground">
                Awaiting brief
              </Badge>
            )}
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {format(scheduled, 'h:mm a')} · {meeting.duration_minutes}m
            </span>
            {meeting.company && (
              <Link
                to="/accounts/$id"
                params={{ id: meeting.company.id }}
                className="inline-flex items-center gap-1 hover:text-foreground"
              >
                <Building2 className="h-3 w-3" />
                {meeting.company.name}
              </Link>
            )}
            {meeting.contact && (
              <span className="inline-flex items-center gap-1">
                <UserIcon className="h-3 w-3" />
                {meeting.contact.first_name} {meeting.contact.last_name}
                {meeting.contact.title && (
                  <span className="text-muted-foreground/70">· {meeting.contact.title}</span>
                )}
              </span>
            )}
          </div>
          {meeting.notes && (
            <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">{meeting.notes}</p>
          )}
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-1.5">
          {!hasBrief ? (
            <Button
              size="sm"
              className="btn-press h-8 bg-brand text-brand-foreground hover:opacity-90"
              onClick={() => onGenerate(false)}
              disabled={isGenerating}
            >
              {isGenerating ? (
                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
              ) : (
                <Sparkles className="mr-1.5 h-3.5 w-3.5" />
              )}
              Generate brief
            </Button>
          ) : (
            <>
              <Button size="sm" variant="default" className="btn-press h-8" onClick={onToggle}>
                {expanded ? 'Hide brief' : 'Open brief'}
                <ChevronRight
                  className={cn(
                    'ml-1 h-3.5 w-3.5 transition-transform',
                    expanded && 'rotate-90'
                  )}
                />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="btn-press h-8 text-xs"
                onClick={() => onGenerate(true)}
                disabled={isGenerating}
                title="Regenerate brief"
              >
                {isGenerating ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Sparkles className="h-3.5 w-3.5" />
                )}
              </Button>
            </>
          )}
        </div>
      </div>

      {hasBrief && expanded && (
        <BriefView brief={meeting.brief} generatedAt={meeting.brief_generated_at} />
      )}
    </article>
  );
}

function BriefView({ brief, generatedAt }: { brief: any; generatedAt: string | null }) {
  return (
    <div className="mt-4 space-y-4 border-t border-border pt-4">
      {generatedAt && (
        <div className="text-[10px] font-mono uppercase text-muted-foreground">
          Generated {formatDistanceToNow(new Date(generatedAt), { addSuffix: true })}
        </div>
      )}

      {/* Account summary */}
      <Section icon={Building2} title="Account summary">
        <p className="text-sm leading-relaxed">{brief.account_summary}</p>
        {brief.why_now && (
          <div className="mt-2 rounded-md border border-brand/30 bg-brand/5 p-2.5">
            <div className="text-[10px] font-mono uppercase text-brand">Why now</div>
            <p className="mt-0.5 text-xs leading-relaxed">{brief.why_now}</p>
          </div>
        )}
      </Section>

      {/* Contact background */}
      {brief.contact_background && (
        <Section icon={UserIcon} title="Who you're meeting">
          <p className="text-sm">{brief.contact_background.role_summary}</p>
          {brief.contact_background.likely_priorities?.length > 0 && (
            <div className="mt-2">
              <div className="text-[10px] font-mono uppercase text-muted-foreground">
                Likely priorities
              </div>
              <ul className="mt-1 space-y-1">
                {brief.contact_background.likely_priorities.map((p: string, i: number) => (
                  <li key={i} className="flex gap-2 text-xs">
                    <span className="text-brand">•</span>
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {brief.contact_background.how_to_approach && (
            <p className="mt-2 text-xs italic text-muted-foreground">
              Approach: {brief.contact_background.how_to_approach}
            </p>
          )}
        </Section>
      )}

      {/* Key facts */}
      {brief.key_facts?.length > 0 && (
        <Section icon={ListChecks} title="Key facts to know">
          <ul className="space-y-1.5">
            {brief.key_facts.map((f: string, i: number) => (
              <li key={i} className="flex gap-2 text-sm">
                <span className="font-mono text-brand">{(i + 1).toString().padStart(2, '0')}</span>
                <span>{f}</span>
              </li>
            ))}
          </ul>
        </Section>
      )}

      {/* Talking points */}
      {brief.talking_points?.length > 0 && (
        <Section icon={Target} title="Talking points">
          <div className="space-y-2.5">
            {brief.talking_points.map((tp: any, i: number) => (
              <div key={i} className="rounded-md border border-border bg-background/40 p-2.5">
                <div className="text-[10px] font-mono uppercase text-brand">{tp.topic}</div>
                <p className="mt-1 text-sm font-medium">"{tp.question}"</p>
                <p className="mt-1 text-xs text-muted-foreground">→ {tp.why_it_matters}</p>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Sales script */}
      {brief.sales_script && (
        <Section icon={MessageSquare} title="Sales script">
          <ScriptBlock label="Opener" text={brief.sales_script.opener} />
          <ScriptBlock label="Value pitch" text={brief.sales_script.value_pitch} />
          {brief.sales_script.objection_handling?.length > 0 && (
            <div className="mt-3">
              <div className="mb-1.5 text-[10px] font-mono uppercase text-muted-foreground">
                Objection handling
              </div>
              <div className="space-y-1.5">
                {brief.sales_script.objection_handling.map((o: any, i: number) => (
                  <div key={i} className="rounded-md border border-border bg-background/40 p-2">
                    <p className="text-xs font-medium text-foreground/90">"{o.objection}"</p>
                    <p className="mt-1 text-xs text-muted-foreground">→ {o.response}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
          <ScriptBlock label="Close" text={brief.sales_script.close} />
        </Section>
      )}

      {/* Avoid */}
      {brief.things_to_avoid?.length > 0 && (
        <Section icon={ShieldAlert} title="Things to avoid" tone="warn">
          <ul className="space-y-1">
            {brief.things_to_avoid.map((t: string, i: number) => (
              <li key={i} className="flex gap-2 text-xs">
                <span className="text-amber-500">⚠</span>
                <span>{t}</span>
              </li>
            ))}
          </ul>
        </Section>
      )}
    </div>
  );
}

function Section({
  icon: Icon,
  title,
  children,
  tone,
}: {
  icon: typeof Building2;
  title: string;
  children: React.ReactNode;
  tone?: 'warn';
}) {
  return (
    <section
      className={cn(
        'rounded-lg border border-border bg-muted/20 p-3',
        tone === 'warn' && 'border-amber-500/30 bg-amber-500/5'
      )}
    >
      <h4 className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        <Icon className="h-3.5 w-3.5" />
        {title}
      </h4>
      {children}
    </section>
  );
}

function ScriptBlock({ label, text }: { label: string; text: string }) {
  return (
    <div className="mt-2 first:mt-0">
      <div className="text-[10px] font-mono uppercase text-muted-foreground">{label}</div>
      <p className="mt-1 rounded-md border-l-2 border-brand bg-background/40 px-2.5 py-1.5 text-sm leading-relaxed">
        {text}
      </p>
    </div>
  );
}
