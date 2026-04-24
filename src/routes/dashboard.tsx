import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useMemo, useState } from 'react';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { DashboardShell } from '@/components/dashboard-shell';
import { PageHeader } from '@/components/page-header';
import { SignalCard } from '@/components/signal-card';
import { fetchSignals, type SignalWithRelations } from '@/lib/queries';
import { SIGNAL_TYPE_LABELS, type SignalType } from '@/lib/types';
import { useAuth } from '@/lib/use-auth';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import {
  CheckCheck,
  Sparkles,
  Radio,
  Loader2,
  Activity,
  Inbox,
  Flame,
  Filter,
  Target,
} from 'lucide-react';
import { toast } from 'sonner';
import { ACTIVITY_LABELS, fetchActivity, logActivity } from '@/lib/activity';
import { formatDistanceToNow } from 'date-fns';
import { fetchCampaigns, type CampaignRow, CAMPAIGN_COLORS } from '@/lib/campaigns';
import { cn } from '@/lib/utils';

export const Route = createFileRoute('/dashboard')({
  head: () => ({
    meta: [
      { title: 'Signals — Rexxon AI' },
      { name: 'robots', content: 'noindex, nofollow, noarchive, noimageindex' },
    ],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  return (
    <DashboardShell>
      <SignalFeed />
    </DashboardShell>
  );
}

function SignalFeed() {
  const [type, setType] = useState<'ALL' | SignalType>('ALL');
  const [minConf, setMinConf] = useState(60);
  const qc = useQueryClient();
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data: signals = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['signals', type, minConf],
    queryFn: () => fetchSignals({ type, minConfidence: minConf }),
  });

  const actionMut = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: 'CLAIMED' | 'DISMISSED' }) => {
      const { error } = await supabase
        .from('signals')
        .update({ status, is_read: true })
        .eq('id', id);
      if (error) throw error;
    },
    onMutate: async ({ id, status }) => {
      await qc.cancelQueries({ queryKey: ['signals'] });
      const prev = qc.getQueryData<SignalWithRelations[]>(['signals', type, minConf]);
      qc.setQueryData<SignalWithRelations[]>(['signals', type, minConf], (old) =>
        (old ?? []).map((s) => (s.id === id ? { ...s, status, is_read: true } : s))
      );
      return { prev };
    },
    onError: (e, _v, ctx) => {
      if (ctx?.prev) qc.setQueryData(['signals', type, minConf], ctx.prev);
      toast.error(e instanceof Error ? e.message : 'Action failed');
    },
    onSuccess: (_d, v) => {
      toast.success(v.status === 'CLAIMED' ? '🎯 Lead claimed' : 'Signal dismissed');
      if (user) {
        logActivity(user.id, v.status === 'CLAIMED' ? 'SIGNAL_CLAIMED' : 'SIGNAL_DISMISSED', {
          entity_type: 'signal',
          entity_id: v.id,
        });
        qc.invalidateQueries({ queryKey: ['activity'] });
      }
    },
  });

  const markAllReadMut = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('signals')
        .update({ is_read: true })
        .eq('is_read', false);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('All signals marked as read');
      qc.invalidateQueries({ queryKey: ['signals'] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : 'Failed'),
  });

  const generateMut = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('generate-signal');
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success('✨ AI generated a fresh signal');
      refetch();
    },
    onError: (e: any) => {
      const msg = e?.message || 'Generation failed';
      if (/429/.test(msg)) toast.error('Rate limit reached. Try again in a moment.');
      else if (/402/.test(msg)) toast.error('AI credits exhausted. Add credits in Workspace settings.');
      else toast.error(msg);
    },
  });

  const draftMut = useMutation({
    mutationFn: async (signal: SignalWithRelations) => {
      const { data, error } = await supabase.functions.invoke('generate-outreach', {
        body: {
          signalId: signal.id,
          contactId: signal.hiring_manager_contact_id,
          tone: 'PROFESSIONAL',
          persona: 'AE',
        },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success('Outreach draft created');
      if (user) {
        logActivity(user.id, 'DRAFT_CREATED', { entity_type: 'outreach_draft' });
        qc.invalidateQueries({ queryKey: ['activity'] });
      }
      navigate({ to: '/outreach' });
    },
    onError: (e: any) => {
      const msg = e?.message || 'Draft failed';
      if (/429/.test(msg)) toast.error('Rate limit reached. Try again shortly.');
      else if (/402/.test(msg)) toast.error('AI credits exhausted.');
      else toast.error(msg);
    },
  });

  const unreadCount = signals.filter((s) => !s.is_read).length;
  const hotCount = signals.filter((s) => s.confidence_score >= 85).length;
  const claimedCount = signals.filter((s) => s.status === 'CLAIMED').length;

  const { data: activity = [] } = useQuery({
    queryKey: ['activity', user?.id],
    enabled: !!user,
    queryFn: () => fetchActivity(user!.id, 15),
    refetchInterval: 30_000,
  });

  return (
    <>
      <PageHeader
        icon={Radio}
        eyebrow="Live feed"
        title="Signals"
        subtitle="Every buying moment, the instant it happens. Claim what fits — let the rest go."
        badge="Streaming"
        badgeTone="green"
        stats={[
          { label: 'Total', value: signals.length, icon: Inbox },
          { label: 'Unread', value: unreadCount, accent: 'amber', icon: Sparkles },
          { label: 'Hot leads', value: hotCount, accent: 'rose', icon: Flame },
          { label: 'Claimed', value: claimedCount, accent: 'green', icon: CheckCheck },
        ]}
        actions={
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => generateMut.mutate()}
              disabled={generateMut.isPending}
              className="btn-press"
            >
              {generateMut.isPending ? (
                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
              ) : (
                <Sparkles className="icon-pulse mr-1.5 h-3.5 w-3.5" />
              )}
              <span className="hidden sm:inline">Generate signal</span>
              <span className="sm:hidden">Generate</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => markAllReadMut.mutate()}
              disabled={markAllReadMut.isPending || unreadCount === 0}
              className="btn-press"
            >
              <CheckCheck className="mr-1.5 h-3.5 w-3.5" />
              <span className="hidden sm:inline">Mark all read</span>
              <span className="sm:hidden">Mark read</span>
            </Button>
          </>
        }
      />

      <div className="mx-auto grid max-w-7xl gap-4 px-4 py-5 md:gap-6 md:px-8 md:py-6 lg:grid-cols-[1fr_320px]">
        <div className="min-w-0">
          {/* Filters */}
          <div
            className="surface-1 mb-4 rounded-xl border border-border p-3 animate-rise md:mb-5"
            style={{ animationDelay: '160ms' }}
          >
            <div className="mb-2 flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
              <Filter className="h-3 w-3" /> Filters
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="min-w-0">
                <label className="mb-1 block text-[10px] font-mono uppercase text-muted-foreground">
                  Signal type
                </label>
                <Select value={type} onValueChange={(v) => setType(v as any)}>
                  <SelectTrigger className="h-9 w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All types</SelectItem>
                    {(Object.keys(SIGNAL_TYPE_LABELS) as SignalType[]).map((k) => (
                      <SelectItem key={k} value={k}>
                        {SIGNAL_TYPE_LABELS[k]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="min-w-0">
                <label className="mb-1 flex items-center justify-between text-[10px] font-mono uppercase text-muted-foreground">
                  <span>Min confidence</span>
                  <span className="text-foreground">{minConf}</span>
                </label>
                <Slider
                  value={[minConf]}
                  min={0}
                  max={100}
                  step={5}
                  onValueChange={(v) => setMinConf(v[0])}
                  className="py-2"
                />
              </div>
            </div>
          </div>

          {/* Feed */}
          {isLoading && (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="skeleton-shimmer h-44 rounded-xl border border-border" />
              ))}
            </div>
          )}

          {isError && (
            <div className="animate-rise rounded-xl border border-destructive/30 bg-destructive/10 p-6 text-center">
              <p className="text-sm text-destructive">Failed to load signals.</p>
              <Button size="sm" variant="outline" className="btn-press mt-3" onClick={() => refetch()}>
                Retry
              </Button>
            </div>
          )}

          {!isLoading && !isError && signals.length === 0 && (
            <div className="surface-1 animate-rise rounded-xl border border-border p-10 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand/10">
                <Radio className="h-6 w-6 text-brand" />
              </div>
              <h3 className="mt-4 font-semibold">All caught up</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                No signals match your filters. Try lowering confidence or generate a fresh one.
              </p>
              <Button
                size="sm"
                className="btn-press mt-4"
                onClick={() => generateMut.mutate()}
                disabled={generateMut.isPending}
              >
                <Sparkles className="mr-1.5 h-3.5 w-3.5" />
                Generate signal
              </Button>
            </div>
          )}

          <div className="stagger space-y-3">
            {signals.map((s) => (
              <SignalCard
                key={s.id}
                signal={s}
                isPending={actionMut.isPending && actionMut.variables?.id === s.id}
                isDrafting={draftMut.isPending && draftMut.variables?.id === s.id}
                onClaim={(id) => actionMut.mutate({ id, status: 'CLAIMED' })}
                onDismiss={(id) => actionMut.mutate({ id, status: 'DISMISSED' })}
                onDraft={(sig) => user && draftMut.mutate(sig)}
              />
            ))}
          </div>
        </div>

        {/* Activity sidebar */}
        <aside className="hidden lg:block">
          <div
            className="surface-2 sticky top-6 rounded-xl border border-border p-4 shadow-soft animate-rise"
            style={{ animationDelay: '200ms' }}
          >
            <h2 className="flex items-center gap-2 text-sm font-semibold">
              <Activity className="h-4 w-4 text-brand" />
              Recent activity
            </h2>
            <p className="mt-0.5 text-xs text-muted-foreground">Live feed of your wins</p>
            {activity.length === 0 ? (
              <div className="mt-4 rounded-md border border-dashed border-border p-6 text-center text-xs text-muted-foreground">
                No activity yet. Claim a signal to start your streak.
              </div>
            ) : (
              <ol className="stagger mt-3 space-y-2.5">
                {activity.map((a) => (
                  <li
                    key={a.id}
                    className="flex items-start gap-2 border-l-2 border-brand/40 pl-2.5 text-xs transition-colors hover:border-brand"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="font-medium">{ACTIVITY_LABELS[a.type] ?? a.type}</div>
                      <div className="text-muted-foreground">
                        {formatDistanceToNow(new Date(a.created_at), { addSuffix: true })}
                      </div>
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </div>
        </aside>
      </div>
    </>
  );
}
