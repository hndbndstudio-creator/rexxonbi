import { createFileRoute, Link } from '@tanstack/react-router';
import { useState } from 'react';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { useAuth } from '@/lib/use-auth';
import { DashboardShell } from '@/components/dashboard-shell';
import {
  fetchCompanies,
  fetchCompanySignalCounts,
  fetchMonitoredAccountIds,
  toggleMonitor,
} from '@/lib/queries';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Building2, Search, Eye, ArrowRight, FileDown } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { getInitials } from '@/lib/types';
import { toast } from 'sonner';
import { downloadCSV, toCSV } from '@/lib/csv';
import { logActivity } from '@/lib/activity';

export const Route = createFileRoute('/accounts')({
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

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 md:px-8">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
            <Building2 className="h-5 w-5 text-brand" />
            Accounts
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {companies.length} companies · {monitored.size} monitored
          </p>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={() => {
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
            if (user) logActivity(user.id, 'CSV_EXPORTED', { metadata: { kind: 'accounts', count: companies.length } });
          }}
        >
          <FileDown className="mr-1.5 h-3.5 w-3.5" /> Export CSV
        </Button>
      </div>

      {/* Filters */}
      <div className="mb-5 flex flex-wrap gap-2">
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
            <div key={i} className="skeleton-shimmer h-36 rounded-xl border border-border" />
          ))}
        </div>
      ) : companies.length === 0 ? (
        <div className="surface-1 rounded-xl p-10 text-center">
          <Building2 className="mx-auto h-8 w-8 text-muted-foreground" />
          <h3 className="mt-3 font-semibold">No companies found</h3>
          <p className="mt-1 text-sm text-muted-foreground">Try a different search or industry.</p>
        </div>
      ) : (
        <div className="stagger grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {companies.map((c) => {
            const stat = counts?.get(c.id);
            const isMon = monitored.has(c.id);
            return (
              <div
                key={c.id}
                className="surface-2 card-interactive group flex flex-col rounded-xl p-4"
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted font-semibold">
                    {getInitials(c.name)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <Link
                      to="/accounts/$id"
                      params={{ id: c.id }}
                      className="block truncate font-semibold hover:text-brand"
                    >
                      {c.name}
                    </Link>
                    <div className="truncate text-[11px] text-muted-foreground">
                      {c.domain} · {c.industry ?? '—'}
                    </div>
                  </div>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <div className="font-mono uppercase text-muted-foreground">Employees</div>
                    <div className="font-medium">{c.employee_range ?? '—'}</div>
                  </div>
                  <div>
                    <div className="font-mono uppercase text-muted-foreground">Stage</div>
                    <div className="font-medium">{c.funding_stage ?? '—'}</div>
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between border-t border-border pt-3 text-xs">
                  <div>
                    {stat ? (
                      <span className="rounded bg-brand/10 px-1.5 py-0.5 font-medium text-brand">
                        {stat.count} signals
                      </span>
                    ) : (
                      <span className="text-muted-foreground">No signals yet</span>
                    )}
                    {stat && (
                      <span className="ml-2 text-muted-foreground">
                        {formatDistanceToNow(new Date(stat.latest), { addSuffix: true })}
                      </span>
                    )}
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between">
                  <label className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Switch
                      checked={isMon}
                      onCheckedChange={(on) => monitorMut.mutate({ companyId: c.id, on })}
                    />
                    Monitor
                  </label>
                  <Button asChild size="sm" variant="ghost" className="h-7 text-xs">
                    <Link to="/accounts/$id" params={{ id: c.id }}>
                      <Eye className="mr-1 h-3.5 w-3.5" />
                      Open <ArrowRight className="ml-1 h-3 w-3" />
                    </Link>
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
