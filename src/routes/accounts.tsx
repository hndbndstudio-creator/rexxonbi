import { createFileRoute, Link } from '@tanstack/react-router';
import { useState } from 'react';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { useAuth } from '@/lib/use-auth';
import { DashboardShell } from '@/components/dashboard-shell';
import { PageHeader } from '@/components/page-header';
import {
  fetchCompanies,
  fetchCompanySignalCounts,
  fetchMonitoredAccountIds,
  toggleMonitor,
  insertCompany,
} from '@/lib/queries';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Building2,
  Search,
  Eye,
  ArrowRight,
  FileDown,
  Radio,
  Sparkles,
  Filter,
  Plus,
  Loader2,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { getInitials } from '@/lib/types';
import { toast } from 'sonner';
import { downloadCSV, toCSV } from '@/lib/csv';
import { logActivity } from '@/lib/activity';

export const Route = createFileRoute('/accounts')({
  head: () => ({
    meta: [
      { title: 'Accounts — Rexxon AI' },
      { name: 'robots', content: 'noindex, nofollow, noarchive, noimageindex' },
    ],
  }),
  component: AccountsPage,
});

function AccountsPage() {
  return (
    <DashboardShell>
      <Accounts />
    </DashboardShell>
  );
}

function Accounts() {
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [industry, setIndustry] = useState<string>('ALL');
  const qc = useQueryClient();

  const { data: companies = [], isLoading } = useQuery({
    queryKey: ['companies', search, industry],
    queryFn: () => fetchCompanies({ search, industry, limit: 100 }),
  });

  const { data: counts } = useQuery({
    queryKey: ['signal-counts'],
    queryFn: fetchCompanySignalCounts,
  });

  const { data: monitored = new Set<string>() } = useQuery({
    queryKey: ['monitored', user?.id],
    queryFn: () => fetchMonitoredAccountIds(user!.id),
    enabled: !!user,
  });

  const monitorMut = useMutation({
    mutationFn: ({ companyId, on }: { companyId: string; on: boolean }) =>
      toggleMonitor(user!.id, companyId, on),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['monitored'] });
      toast.success('Monitor preference updated');
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : 'Failed'),
  });

  const industries = Array.from(new Set(companies.map((c) => c.industry).filter(Boolean))) as string[];

  const totalSignals = companies.reduce((acc, c) => acc + (counts?.get(c.id)?.count ?? 0), 0);
  const withSignals = companies.filter((c) => (counts?.get(c.id)?.count ?? 0) > 0).length;

  const exportCsv = () => {
    if (companies.length === 0) return toast.info('Nothing to export');
    const csv = toCSV(
      companies.map((c) => ({
        name: c.name,
        domain: c.domain,
        industry: c.industry ?? '',
        employees: c.employee_range ?? '',
        stage: c.funding_stage ?? '',
        hq: [c.hq_city, c.hq_state, c.hq_country].filter(Boolean).join(', '),
        signals: counts?.get(c.id)?.count ?? 0,
        monitored: monitored.has(c.id) ? 'yes' : 'no',
      })),
      [
        { key: 'name', header: 'Name' },
        { key: 'domain', header: 'Domain' },
        { key: 'industry', header: 'Industry' },
        { key: 'employees', header: 'Employees' },
        { key: 'stage', header: 'Stage' },
        { key: 'hq', header: 'HQ' },
        { key: 'signals', header: 'Signals' },
        { key: 'monitored', header: 'Monitored' },
      ]
    );
    downloadCSV('rexxon-accounts.csv', csv);
    if (user)
      logActivity(user.id, 'CSV_EXPORTED', {
        metadata: { kind: 'accounts', count: companies.length },
      });
  };

  return (
    <>
      <PageHeader
        icon={Building2}
        eyebrow="Target accounts"
        title="Accounts"
        subtitle="Track every company that matters. Monitor key accounts so the agent never misses a moment."
        stats={[
          { label: 'Companies', value: companies.length, icon: Building2 },
          { label: 'Monitored', value: monitored.size, accent: 'brand', icon: Eye },
          { label: 'With signals', value: withSignals, accent: 'green', icon: Radio },
          { label: 'Total signals', value: totalSignals, accent: 'amber', icon: Sparkles },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <AddCompanyDialog />
            <Button size="sm" variant="outline" className="btn-press" onClick={exportCsv}>
              <FileDown className="mr-1.5 h-3.5 w-3.5" /> Export CSV
            </Button>
          </div>
        }
      />

      <div className="mx-auto max-w-7xl px-4 py-6 md:px-8">
        {/* Filters */}
        <div
          className="surface-1 mb-5 flex flex-wrap items-end gap-3 rounded-xl border border-border p-3 animate-rise"
          style={{ animationDelay: '160ms' }}
        >
          <div className="flex items-center gap-1.5 px-1 text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
            <Filter className="h-3 w-3" /> Refine
          </div>
          <div className="relative min-w-[260px] flex-1">
            <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search companies…"
              className="pl-8"
            />
          </div>
          <Select value={industry} onValueChange={setIndustry}>
            <SelectTrigger className="w-[200px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All industries</SelectItem>
              {industries.map((i) => (
                <SelectItem key={i} value={i}>
                  {i}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Grid */}
        {isLoading ? (
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="skeleton-shimmer h-44 rounded-xl border border-border" />
            ))}
          </div>
        ) : companies.length === 0 ? (
          <div className="surface-1 rounded-xl border border-border p-10 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand/10">
              <Building2 className="h-6 w-6 text-brand" />
            </div>
            <h3 className="mt-4 font-semibold">No companies found</h3>
            <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
              Adjust your filters, or add a target account manually so the agent can start tracking it.
            </p>
            <div className="mt-4 flex justify-center">
              <AddCompanyDialog />
            </div>
          </div>
        ) : (
          <div className="stagger grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {companies.map((c) => {
              const stat = counts?.get(c.id);
              const isMon = monitored.has(c.id);
              const hasSignals = (stat?.count ?? 0) > 0;
              return (
                <div
                  key={c.id}
                  className="group relative flex flex-col overflow-hidden rounded-xl border border-border bg-card p-4 shadow-soft transition-all hover-lift hover:border-brand/40"
                >
                  {hasSignals && (
                    <div
                      aria-hidden
                      className="pointer-events-none absolute -top-12 -right-12 h-32 w-32 rounded-full opacity-40 blur-2xl"
                      style={{
                        background:
                          'radial-gradient(circle, color-mix(in oklab, var(--brand) 35%, transparent), transparent 70%)',
                      }}
                    />
                  )}
                  <div className="relative flex items-start gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-muted to-muted/60 font-semibold">
                      {getInitials(c.name)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <Link
                        to="/accounts/$id"
                        params={{ id: c.id }}
                        className="block truncate font-semibold transition-colors hover:text-brand"
                      >
                        {c.name}
                      </Link>
                      <div className="truncate text-[11px] text-muted-foreground">
                        {c.domain} · {c.industry ?? '—'}
                      </div>
                    </div>
                    {isMon && (
                      <span className="flex h-5 items-center gap-1 rounded-full bg-brand/15 px-1.5 text-[9px] font-mono uppercase text-brand">
                        <Eye className="h-2.5 w-2.5" /> Watching
                      </span>
                    )}
                  </div>

                  <div className="relative mt-3 grid grid-cols-2 gap-2 text-[11px]">
                    <div>
                      <div className="font-mono uppercase text-muted-foreground">Employees</div>
                      <div className="font-medium">{c.employee_range ?? '—'}</div>
                    </div>
                    <div>
                      <div className="font-mono uppercase text-muted-foreground">Stage</div>
                      <div className="font-medium">{c.funding_stage ?? '—'}</div>
                    </div>
                  </div>

                  <div className="relative mt-3 flex items-center justify-between border-t border-border pt-3 text-xs">
                    <div className="flex items-center gap-2">
                      {stat ? (
                        <>
                          <span className="inline-flex items-center gap-1 rounded-full bg-brand/15 px-2 py-0.5 font-medium text-brand">
                            <Radio className="h-2.5 w-2.5" /> {stat.count}
                          </span>
                          <span className="text-muted-foreground">
                            {formatDistanceToNow(new Date(stat.latest), { addSuffix: true })}
                          </span>
                        </>
                      ) : (
                        <span className="text-muted-foreground">No signals yet</span>
                      )}
                    </div>
                  </div>

                  <div className="relative mt-3 flex items-center justify-between">
                    <label className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Switch
                        checked={isMon}
                        onCheckedChange={(on) => monitorMut.mutate({ companyId: c.id, on })}
                      />
                      Monitor
                    </label>
                    <Button asChild size="sm" variant="ghost" className="h-7 text-xs">
                      <Link to="/accounts/$id" params={{ id: c.id }}>
                        Open
                        <ArrowRight className="ml-1 h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                      </Link>
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
