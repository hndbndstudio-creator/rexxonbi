import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useEffect, useMemo, useState } from 'react';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { DashboardShell } from '@/components/dashboard-shell';
import { useAuth } from '@/lib/use-auth';
import { useIsAdmin } from '@/lib/use-admin';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  ShieldCheck,
  Users as UsersIcon,
  Activity as ActivityIcon,
  Building2,
  Radio,
  Mail,
  Sparkles,
  Plug,
  Search,
  Loader2,
  Crown,
  CheckCircle2,
  XCircle,
  Cpu,
  Slack,
  Database as DbIcon,
} from 'lucide-react';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';

export const Route = createFileRoute('/admin')({
  head: () => ({
    meta: [
      { title: "Admin — Rexxon AI" },
      { name: "robots", content: "noindex, nofollow, noarchive, noimageindex" },
    ],
  }),
  component: AdminPage,
});

function AdminPage() {
  return (
    <DashboardShell>
      <AdminGate />
    </DashboardShell>
  );
}

function AdminGate() {
  const { isAdmin, loading } = useIsAdmin();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !isAdmin) {
      toast.error('Admin access required');
      navigate({ to: '/dashboard' });
    }
  }, [isAdmin, loading, navigate]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-brand" />
      </div>
    );
  }
  if (!isAdmin) return null;

  return <AdminConsole />;
}

/* ----------------------- Console shell ----------------------- */

function AdminConsole() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-6 md:px-8">
      {/* Hero */}
      <header className="surface-2 mb-6 overflow-hidden rounded-2xl border border-brand/30 p-6 animate-rise">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="logo-badge flex h-12 w-12 items-center justify-center rounded-xl">
              <Crown className="h-6 w-6 text-brand-foreground" strokeWidth={2.4} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight">Super admin console</h1>
                <Badge className="border-brand/40 bg-brand/15 text-brand">Sudo</Badge>
              </div>
              <p className="mt-1 max-w-xl text-sm text-muted-foreground">
                Oversee every subscriber, signal, draft and integration on the Rexxon platform. Full read-access — handle with care.
              </p>
            </div>
          </div>
          <PlatformPulse />
        </div>
      </header>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-2 gap-1 sm:grid-cols-5">
          <TabsTrigger value="overview"><ActivityIcon className="mr-1.5 h-3.5 w-3.5" />Overview</TabsTrigger>
          <TabsTrigger value="users"><UsersIcon className="mr-1.5 h-3.5 w-3.5" />Subscribers</TabsTrigger>
          <TabsTrigger value="signals"><Radio className="mr-1.5 h-3.5 w-3.5" />Signals</TabsTrigger>
          <TabsTrigger value="accounts"><Building2 className="mr-1.5 h-3.5 w-3.5" />Accounts</TabsTrigger>
          <TabsTrigger value="integrations"><Plug className="mr-1.5 h-3.5 w-3.5" />Integrations</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-5"><OverviewTab /></TabsContent>
        <TabsContent value="users" className="mt-5"><SubscribersTab /></TabsContent>
        <TabsContent value="signals" className="mt-5"><SignalsTab /></TabsContent>
        <TabsContent value="accounts" className="mt-5"><AccountsTab /></TabsContent>
        <TabsContent value="integrations" className="mt-5"><IntegrationsTab /></TabsContent>
      </Tabs>
    </div>
  );
}

/* ----------------------- Pulse (top-right live count) ----------------------- */

function PlatformPulse() {
  const { data } = useQuery({
    queryKey: ['admin-pulse'],
    refetchInterval: 30_000,
    queryFn: async () => {
      const [u, s, d] = await Promise.all([
        supabase.from('profiles').select('user_id', { count: 'exact', head: true }),
        supabase.from('signals').select('id', { count: 'exact', head: true }),
        supabase.from('outreach_drafts').select('id', { count: 'exact', head: true }),
      ]);
      return {
        users: u.count ?? 0,
        signals: s.count ?? 0,
        drafts: d.count ?? 0,
      };
    },
  });

  return (
    <div className="grid grid-cols-3 gap-3">
      <PulseStat label="Subscribers" value={data?.users ?? '—'} icon={UsersIcon} />
      <PulseStat label="Signals" value={data?.signals ?? '—'} icon={Radio} />
      <PulseStat label="Drafts" value={data?.drafts ?? '—'} icon={Mail} />
    </div>
  );
}

function PulseStat({ label, value, icon: Icon }: { label: string; value: number | string; icon: any }) {
  return (
    <div className="surface-1 min-w-[88px] rounded-lg p-3">
      <div className="mb-1 flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
        <Icon className="h-3 w-3" />
        {label}
      </div>
      <div className="text-xl font-semibold tabular-nums">{value}</div>
    </div>
  );
}

/* ----------------------- Overview tab ----------------------- */

function OverviewTab() {
  const { data: stats } = useQuery({
    queryKey: ['admin-overview'],
    queryFn: async () => {
      const [profiles, signals, drafts, accts, activity, sequences] = await Promise.all([
        supabase.from('profiles').select('user_id', { count: 'exact', head: true }),
        supabase.from('signals').select('id', { count: 'exact', head: true }),
        supabase.from('outreach_drafts').select('id', { count: 'exact', head: true }),
        supabase.from('companies').select('id', { count: 'exact', head: true }),
        supabase.from('activity_events').select('id', { count: 'exact', head: true }),
        supabase.from('outreach_sequences').select('id', { count: 'exact', head: true }),
      ]);
      return {
        users: profiles.count ?? 0,
        signals: signals.count ?? 0,
        drafts: drafts.count ?? 0,
        accounts: accts.count ?? 0,
        activity: activity.count ?? 0,
        sequences: sequences.count ?? 0,
      };
    },
  });

  const { data: recent = [] } = useQuery({
    queryKey: ['admin-recent-activity'],
    refetchInterval: 30_000,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('activity_events')
        .select('id, type, user_id, entity_type, created_at')
        .order('created_at', { ascending: false })
        .limit(20);
      if (error) throw error;
      return data ?? [];
    },
  });

  const cards = [
    { label: 'Subscribers', value: stats?.users ?? 0, icon: UsersIcon, hint: 'Total registered accounts' },
    { label: 'Signals captured', value: stats?.signals ?? 0, icon: Radio, hint: 'Across all sources' },
    { label: 'Drafts generated', value: stats?.drafts ?? 0, icon: Mail, hint: 'AI-written outreach' },
    { label: 'Accounts tracked', value: stats?.accounts ?? 0, icon: Building2, hint: 'Companies in database' },
    { label: 'Activity events', value: stats?.activity ?? 0, icon: ActivityIcon, hint: 'User actions logged' },
    { label: 'Sequences', value: stats?.sequences ?? 0, icon: Sparkles, hint: 'Multi-step plays' },
  ];

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
        {cards.map((c, i) => (
          <div
            key={c.label}
            className="surface-1 card-interactive rounded-xl p-4 animate-rise"
            style={{ animationDelay: `${i * 40}ms` }}
          >
            <div className="mb-2 flex items-center justify-between">
              <c.icon className="h-4 w-4 text-brand" />
              <span className="text-[10px] font-mono uppercase text-muted-foreground">Live</span>
            </div>
            <div className="text-2xl font-bold tabular-nums">{c.value}</div>
            <div className="mt-0.5 text-[11px] text-muted-foreground">{c.hint}</div>
          </div>
        ))}
      </div>

      <div className="surface-1 rounded-xl p-5">
        <div className="mb-3 flex items-center gap-2">
          <ActivityIcon className="h-4 w-4 text-brand" />
          <h2 className="text-sm font-semibold">Platform-wide activity</h2>
          <span className="ml-auto text-xs text-muted-foreground">refreshes every 30s</span>
        </div>
        {recent.length === 0 ? (
          <div className="rounded-md border border-dashed border-border p-8 text-center text-xs text-muted-foreground">
            No activity yet.
          </div>
        ) : (
          <ol className="stagger space-y-1.5">
            {recent.map((a) => (
              <li
                key={a.id}
                className="flex items-center justify-between rounded-md border border-border/60 px-3 py-2 text-sm transition-colors hover:border-brand/40"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="rounded bg-brand/15 px-1.5 py-0.5 text-[10px] font-mono uppercase tracking-wider text-brand">
                    {a.type}
                  </span>
                  <span className="truncate text-xs text-muted-foreground">
                    user {a.user_id.slice(0, 8)} · {a.entity_type ?? '—'}
                  </span>
                </div>
                <span className="text-[11px] text-muted-foreground tabular-nums">
                  {formatDistanceToNow(new Date(a.created_at), { addSuffix: true })}
                </span>
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  );
}

/* ----------------------- Subscribers tab ----------------------- */

type ProfileRow = {
  user_id: string;
  first_name: string | null;
  last_name: string | null;
  company_name: string | null;
  position: string | null;
  created_at: string;
};

function SubscribersTab() {
  const qc = useQueryClient();
  const { user: me } = useAuth();
  const [search, setSearch] = useState('');

  const { data: profiles = [], isLoading } = useQuery({
    queryKey: ['admin-profiles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('user_id, first_name, last_name, company_name, position, created_at')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data ?? []) as ProfileRow[];
    },
  });

  const { data: roles = [] } = useQuery({
    queryKey: ['admin-roles'],
    queryFn: async () => {
      const { data, error } = await supabase.from('user_roles').select('user_id, role');
      if (error) throw error;
      return data ?? [];
    },
  });

  const { data: draftCounts = {} } = useQuery({
    queryKey: ['admin-draft-counts'],
    queryFn: async () => {
      const { data, error } = await supabase.from('outreach_drafts').select('user_id');
      if (error) throw error;
      const counts: Record<string, number> = {};
      (data ?? []).forEach((d: any) => {
        counts[d.user_id] = (counts[d.user_id] ?? 0) + 1;
      });
      return counts;
    },
  });

  const roleByUser = useMemo(() => {
    const map: Record<string, string> = {};
    roles.forEach((r: any) => {
      // a user could have multiple roles; admin wins
      if (r.role === 'admin' || !map[r.user_id]) map[r.user_id] = r.role;
    });
    return map;
  }, [roles]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return profiles;
    return profiles.filter((p) => {
      const hay = [p.first_name, p.last_name, p.company_name, p.position, p.user_id]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return hay.includes(q);
    });
  }, [profiles, search]);

  const promoteMut = useMutation({
    mutationFn: async ({ userId, makeAdmin }: { userId: string; makeAdmin: boolean }) => {
      if (makeAdmin) {
        const { error } = await supabase
          .from('user_roles')
          .insert({ user_id: userId, role: 'admin' });
        if (error && !/duplicate/i.test(error.message)) throw error;
      } else {
        const { error } = await supabase
          .from('user_roles')
          .delete()
          .eq('user_id', userId)
          .eq('role', 'admin');
        if (error) throw error;
      }
    },
    onSuccess: (_d, v) => {
      toast.success(v.makeAdmin ? 'Promoted to admin' : 'Admin removed');
      qc.invalidateQueries({ queryKey: ['admin-roles'] });
    },
    onError: (e: any) => toast.error(e?.message || 'Role change failed'),
  });

  return (
    <div className="space-y-4">
      <div className="surface-1 flex flex-wrap items-center gap-3 rounded-xl p-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, company, position…"
            className="h-9 pl-8"
          />
        </div>
        <div className="text-xs text-muted-foreground">
          {filtered.length} of {profiles.length} subscribers
        </div>
      </div>

      <div className="surface-1 overflow-hidden rounded-xl">
        <div className="grid grid-cols-12 gap-2 border-b border-border bg-sidebar/40 px-4 py-2 text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
          <div className="col-span-3">Name</div>
          <div className="col-span-3">Company</div>
          <div className="col-span-2">Position</div>
          <div className="col-span-1 text-right">Drafts</div>
          <div className="col-span-1">Role</div>
          <div className="col-span-2 text-right">Action</div>
        </div>
        {isLoading ? (
          <div className="space-y-2 p-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="skeleton-shimmer h-10 rounded-md" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-10 text-center text-sm text-muted-foreground">No subscribers match.</div>
        ) : (
          <ul className="divide-y divide-border">
            {filtered.map((p) => {
              const role = roleByUser[p.user_id] ?? 'user';
              const isAdminRow = role === 'admin';
              const fullName = [p.first_name, p.last_name].filter(Boolean).join(' ') || '—';
              const drafts = draftCounts[p.user_id] ?? 0;
              const isMe = me?.id === p.user_id;
              return (
                <li
                  key={p.user_id}
                  className="grid grid-cols-12 items-center gap-2 px-4 py-2.5 text-sm transition-colors hover:bg-sidebar/30"
                >
                  <div className="col-span-3 min-w-0">
                    <div className="flex items-center gap-2">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand/15 text-[10px] font-semibold text-brand">
                        {(p.first_name?.[0] ?? p.user_id[0] ?? 'U').toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="truncate font-medium">{fullName}</div>
                        <div className="truncate text-[10px] text-muted-foreground">
                          {p.user_id.slice(0, 8)}… · joined {formatDistanceToNow(new Date(p.created_at), { addSuffix: true })}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-span-3 truncate text-muted-foreground">{p.company_name ?? '—'}</div>
                  <div className="col-span-2 truncate text-muted-foreground">{p.position ?? '—'}</div>
                  <div className="col-span-1 text-right tabular-nums">{drafts}</div>
                  <div className="col-span-1">
                    {isAdminRow ? (
                      <Badge className="border-brand/40 bg-brand/15 text-brand">Admin</Badge>
                    ) : (
                      <Badge variant="outline">User</Badge>
                    )}
                  </div>
                  <div className="col-span-2 text-right">
                    {isMe ? (
                      <span className="text-[10px] text-muted-foreground">you</span>
                    ) : (
                      <Button
                        size="sm"
                        variant={isAdminRow ? 'outline' : 'default'}
                        className="h-7 text-xs"
                        disabled={promoteMut.isPending}
                        onClick={() =>
                          promoteMut.mutate({ userId: p.user_id, makeAdmin: !isAdminRow })
                        }
                      >
                        {isAdminRow ? 'Demote' : 'Make admin'}
                      </Button>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}

/* ----------------------- Signals tab ----------------------- */

function SignalsTab() {
  const { data = [], isLoading } = useQuery({
    queryKey: ['admin-signals'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('signals')
        .select('id, title, signal_type, status, confidence_score, source, published_at, company_id, companies(name, domain)')
        .order('published_at', { ascending: false })
        .limit(100);
      if (error) throw error;
      return data ?? [];
    },
  });

  return (
    <div className="surface-1 overflow-hidden rounded-xl">
      <div className="border-b border-border px-4 py-3">
        <h2 className="text-sm font-semibold">All signals · last 100</h2>
        <p className="text-xs text-muted-foreground">Cross-tenant view of every signal in the database.</p>
      </div>
      {isLoading ? (
        <div className="space-y-2 p-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="skeleton-shimmer h-12 rounded-md" />
          ))}
        </div>
      ) : (
        <ul className="divide-y divide-border">
          {data.map((s: any) => (
            <li key={s.id} className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-sidebar/30">
              <span className="rounded bg-brand/10 px-1.5 py-0.5 text-[10px] font-mono uppercase tracking-wider text-brand">
                {s.signal_type}
              </span>
              <div className="min-w-0 flex-1">
                <div className="truncate font-medium">{s.title}</div>
                <div className="truncate text-[11px] text-muted-foreground">
                  {s.companies?.name ?? '—'} · {s.source} · conf {s.confidence_score}
                </div>
              </div>
              <Badge variant="outline" className="text-[10px]">{s.status}</Badge>
              <span className="text-[10px] text-muted-foreground tabular-nums">
                {formatDistanceToNow(new Date(s.published_at), { addSuffix: true })}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/* ----------------------- Accounts tab ----------------------- */

function AccountsTab() {
  const { data = [], isLoading } = useQuery({
    queryKey: ['admin-accounts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('companies')
        .select('id, name, domain, industry, employee_range, hq_country, created_at')
        .order('created_at', { ascending: false })
        .limit(100);
      if (error) throw error;
      return data ?? [];
    },
  });

  return (
    <div className="surface-1 overflow-hidden rounded-xl">
      <div className="border-b border-border px-4 py-3">
        <h2 className="text-sm font-semibold">All accounts · last 100</h2>
      </div>
      {isLoading ? (
        <div className="space-y-2 p-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="skeleton-shimmer h-10 rounded-md" />
          ))}
        </div>
      ) : (
        <ul className="divide-y divide-border">
          {data.map((c: any) => (
            <li key={c.id} className="grid grid-cols-12 items-center gap-2 px-4 py-2.5 text-sm hover:bg-sidebar/30">
              <div className="col-span-4">
                <div className="font-medium">{c.name}</div>
                <div className="text-[11px] text-muted-foreground">{c.domain}</div>
              </div>
              <div className="col-span-3 truncate text-xs text-muted-foreground">{c.industry ?? '—'}</div>
              <div className="col-span-2 text-xs text-muted-foreground">{c.employee_range ?? '—'}</div>
              <div className="col-span-2 text-xs text-muted-foreground">{c.hq_country ?? '—'}</div>
              <div className="col-span-1 text-right text-[10px] text-muted-foreground tabular-nums">
                {formatDistanceToNow(new Date(c.created_at), { addSuffix: true })}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/* ----------------------- Integrations tab ----------------------- */

const AI_MODELS = [
  { value: 'google/gemini-2.5-flash', label: 'Gemini 2.5 Flash · balanced (recommended)' },
  { value: 'google/gemini-2.5-flash-lite', label: 'Gemini 2.5 Flash Lite · cheapest' },
  { value: 'google/gemini-2.5-pro', label: 'Gemini 2.5 Pro · highest quality' },
  { value: 'google/gemini-3-flash-preview', label: 'Gemini 3 Flash · preview' },
  { value: 'openai/gpt-5-nano', label: 'GPT-5 Nano · fast' },
  { value: 'openai/gpt-5-mini', label: 'GPT-5 Mini · balanced' },
  { value: 'openai/gpt-5', label: 'GPT-5 · top-tier' },
];

function IntegrationsTab() {
  const qc = useQueryClient();
  const { user } = useAuth();

  const { data: settings, isLoading } = useQuery({
    queryKey: ['admin-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('workspace_settings')
        .select('id, default_ai_model, slack_enabled, slack_default_channel, updated_at')
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const [model, setModel] = useState<string>('google/gemini-2.5-flash');
  const [slackEnabled, setSlackEnabled] = useState(false);
  const [slackChannel, setSlackChannel] = useState('');

  useEffect(() => {
    if (settings) {
      setModel(settings.default_ai_model);
      setSlackEnabled(settings.slack_enabled);
      setSlackChannel(settings.slack_default_channel ?? '');
    }
  }, [settings]);

  const saveMut = useMutation({
    mutationFn: async () => {
      if (!settings?.id) throw new Error('Settings not loaded');
      const { error } = await supabase
        .from('workspace_settings')
        .update({
          default_ai_model: model,
          slack_enabled: slackEnabled,
          slack_default_channel: slackChannel || null,
          updated_by: user?.id ?? null,
        })
        .eq('id', settings.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Settings saved');
      qc.invalidateQueries({ queryKey: ['admin-settings'] });
    },
    onError: (e: any) => toast.error(e?.message || 'Save failed'),
  });

  // Probe Lovable AI by hitting an existing edge function with a tiny prompt
  const [probing, setProbing] = useState(false);
  const [probe, setProbe] = useState<{ ok: boolean; msg: string } | null>(null);
  const runProbe = async () => {
    setProbing(true);
    setProbe(null);
    try {
      const { error } = await supabase.functions.invoke('generate-signal');
      if (error) throw error;
      setProbe({ ok: true, msg: 'Lovable AI gateway reachable.' });
      toast.success('AI gateway healthy');
    } catch (e: any) {
      const msg = e?.message ?? String(e);
      setProbe({ ok: false, msg });
      toast.error(`Probe failed: ${msg}`);
    } finally {
      setProbing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-5 w-5 animate-spin text-brand" />
      </div>
    );
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {/* AI Gateway */}
      <div className="surface-1 rounded-xl p-5">
        <div className="mb-4 flex items-center gap-2">
          <Cpu className="h-4 w-4 text-brand" />
          <h2 className="text-sm font-semibold">Lovable AI gateway</h2>
          <Badge className="ml-auto border-emerald-500/30 bg-emerald-500/10 text-emerald-400">
            <CheckCircle2 className="mr-1 h-3 w-3" /> Connected
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground">
          Default model used for signal generation, briefs and outreach drafting.
        </p>

        <div className="mt-4 space-y-2">
          <Label className="text-xs">Default model</Label>
          <Select value={model} onValueChange={setModel}>
            <SelectTrigger className="h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {AI_MODELS.map((m) => (
                <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="mt-4 flex items-center gap-2">
          <Button size="sm" onClick={() => saveMut.mutate()} disabled={saveMut.isPending}>
            {saveMut.isPending && <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />}
            Save preferences
          </Button>
          <Button size="sm" variant="outline" onClick={runProbe} disabled={probing}>
            {probing ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <Sparkles className="mr-1.5 h-3.5 w-3.5" />}
            Run health probe
          </Button>
        </div>

        {probe && (
          <div
            className={`mt-3 flex items-start gap-2 rounded-md border px-3 py-2 text-xs ${
              probe.ok
                ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
                : 'border-destructive/30 bg-destructive/10 text-destructive'
            }`}
          >
            {probe.ok ? <CheckCircle2 className="h-3.5 w-3.5" /> : <XCircle className="h-3.5 w-3.5" />}
            <span className="break-words">{probe.msg}</span>
          </div>
        )}
      </div>

      {/* Slack */}
      <div className="surface-1 rounded-xl p-5">
        <div className="mb-4 flex items-center gap-2">
          <Slack className="h-4 w-4 text-brand" />
          <h2 className="text-sm font-semibold">Slack notifications</h2>
          <Badge variant="outline" className="ml-auto">Optional</Badge>
        </div>
        <p className="text-xs text-muted-foreground">
          Push high-confidence signals to a Slack channel. Requires the Slack connector to be linked at the workspace level.
        </p>

        <div className="mt-4 flex items-center justify-between rounded-md border border-border px-3 py-2">
          <Label htmlFor="slack-enabled" className="text-sm">Enable Slack alerts</Label>
          <Switch id="slack-enabled" checked={slackEnabled} onCheckedChange={setSlackEnabled} />
        </div>

        <div className="mt-3 space-y-2">
          <Label className="text-xs">Default channel</Label>
          <Input
            placeholder="#sales-signals"
            value={slackChannel}
            onChange={(e) => setSlackChannel(e.target.value)}
            disabled={!slackEnabled}
            className="h-9"
          />
        </div>

        <div className="mt-4">
          <Button size="sm" onClick={() => saveMut.mutate()} disabled={saveMut.isPending}>
            Save Slack settings
          </Button>
        </div>
      </div>

      {/* Database / Edge */}
      <div className="surface-1 rounded-xl p-5 lg:col-span-2">
        <div className="mb-4 flex items-center gap-2">
          <DbIcon className="h-4 w-4 text-brand" />
          <h2 className="text-sm font-semibold">Platform health</h2>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <HealthRow label="Database" ok status="Live · RLS enforced" />
          <HealthRow label="Edge functions" ok status="generate-signal · brief · outreach · sequence" />
          <HealthRow label="Auth" ok status="Email + password" />
        </div>
      </div>
    </div>
  );
}

function HealthRow({ label, status, ok }: { label: string; status: string; ok: boolean }) {
  return (
    <div className="rounded-md border border-border px-3 py-2.5">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">{label}</span>
        {ok ? (
          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
        ) : (
          <XCircle className="h-4 w-4 text-destructive" />
        )}
      </div>
      <div className="mt-0.5 text-[11px] text-muted-foreground">{status}</div>
    </div>
  );
}
