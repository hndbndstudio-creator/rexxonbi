import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DashboardShell } from '@/components/dashboard-shell';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
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
import { Checkbox } from '@/components/ui/checkbox';
import {
  Target,
  Plus,
  Users,
  Trash2,
  Pencil,
  Sparkles,
  Loader2,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/lib/use-auth';
import {
  CAMPAIGN_COLORS,
  SECTOR_PRESETS,
  type CampaignFilters,
  type CampaignRow,
  createCampaign,
  deleteCampaign,
  fetchCampaigns,
  updateCampaign,
} from '@/lib/campaigns';
import { SIGNAL_TYPE_LABELS, type SignalType } from '@/lib/types';
import { Link } from '@tanstack/react-router';
import { cn } from '@/lib/utils';

export const Route = createFileRoute('/campaigns')({
  head: () => ({
    meta: [
      { title: 'Campaigns — Rexxon AI' },
      { name: 'robots', content: 'noindex, nofollow' },
    ],
  }),
  component: CampaignsPage,
});

const SENIORITY_OPTIONS = ['C_LEVEL', 'VP', 'DIRECTOR', 'MANAGER', 'IC'];
const ROLE_CATEGORIES = ['Sales', 'Engineering', 'Security', 'Marketing', 'Finance', 'Operations', 'Product', 'Data'];
const INDUSTRY_PRESETS = ['Software', 'Healthcare', 'Finance', 'Retail', 'Manufacturing', 'Education', 'Government'];
const GEO_PRESETS = ['North America', 'EMEA', 'APAC', 'LATAM', 'US', 'Canada', 'UK', 'Germany'];

function CampaignsPage() {
  return (
    <DashboardShell>
      <CampaignsView />
    </DashboardShell>
  );
}

function CampaignsView() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [editing, setEditing] = useState<CampaignRow | null>(null);
  const [open, setOpen] = useState(false);

  const { data: campaigns = [], isLoading } = useQuery({
    queryKey: ['campaigns'],
    queryFn: fetchCampaigns,
  });

  const delMut = useMutation({
    mutationFn: (id: string) => deleteCampaign(id),
    onSuccess: () => {
      toast.success('Campaign deleted');
      qc.invalidateQueries({ queryKey: ['campaigns'] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : 'Delete failed'),
  });

  const myCampaigns = campaigns.filter((c) => c.user_id === user?.id);
  const sharedCampaigns = campaigns.filter((c) => c.user_id !== user?.id);

  return (
    <>
      <PageHeader
        icon={Target}
        eyebrow="Sector orchestration"
        title="Campaigns"
        subtitle="Group signals by sales sector. Each campaign has its own filters, team, and goals."
        badge={`${campaigns.length} total`}
        badgeTone="green"
        stats={[
          { label: 'Mine', value: myCampaigns.length, icon: Target },
          { label: 'Shared', value: sharedCampaigns.length, icon: Users },
          { label: 'Active', value: campaigns.filter((c) => c.status === 'ACTIVE').length, accent: 'green', icon: CheckCircle2 },
        ]}
        actions={
          <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) setEditing(null); }}>
            <DialogTrigger asChild>
              <Button size="sm" className="btn-press" onClick={() => setEditing(null)}>
                <Plus className="mr-1.5 h-3.5 w-3.5" />
                New campaign
              </Button>
            </DialogTrigger>
            <CampaignDialog
              campaign={editing}
              onClose={() => { setOpen(false); setEditing(null); }}
            />
          </Dialog>
        }
      />

      <div className="mx-auto max-w-7xl px-4 py-5 md:px-8 md:py-6">
        {isLoading ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="skeleton-shimmer h-44 rounded-xl border border-border" />
            ))}
          </div>
        ) : campaigns.length === 0 ? (
          <div className="surface-1 animate-rise rounded-xl border border-border p-10 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand/10">
              <Target className="h-6 w-6 text-brand" />
            </div>
            <h3 className="mt-4 font-semibold">No campaigns yet</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Create your first campaign to organize signals by sector — Enterprise, FinServ, Federal, etc.
            </p>
            <Button size="sm" className="btn-press mt-4" onClick={() => setOpen(true)}>
              <Sparkles className="mr-1.5 h-3.5 w-3.5" />
              Create campaign
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {myCampaigns.length > 0 && (
              <Section title="Your campaigns" count={myCampaigns.length}>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {myCampaigns.map((c) => (
                    <CampaignCard
                      key={c.id}
                      campaign={c}
                      isOwner
                      onEdit={() => { setEditing(c); setOpen(true); }}
                      onDelete={() => {
                        if (confirm(`Delete campaign "${c.name}"?`)) delMut.mutate(c.id);
                      }}
                    />
                  ))}
                </div>
              </Section>
            )}
            {sharedCampaigns.length > 0 && (
              <Section title="Shared with you" count={sharedCampaigns.length}>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {sharedCampaigns.map((c) => (
                    <CampaignCard key={c.id} campaign={c} isOwner={false} />
                  ))}
                </div>
              </Section>
            )}
          </div>
        )}
      </div>
    </>
  );
}

function Section({ title, count, children }: { title: string; count: number; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="mb-3 flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-muted-foreground">
        {title} <span className="text-foreground/60">({count})</span>
      </h2>
      {children}
    </div>
  );
}

function CampaignCard({
  campaign,
  isOwner,
  onEdit,
  onDelete,
}: {
  campaign: CampaignRow;
  isOwner: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
}) {
  const colorClass = CAMPAIGN_COLORS.find((c) => c.value === campaign.color)?.class ?? 'bg-blue-500';
  const filters = campaign.filters ?? {};
  const filterChips: string[] = [];
  if (filters.signal_types?.length) filterChips.push(`${filters.signal_types.length} signal types`);
  if (filters.min_confidence) filterChips.push(`≥${filters.min_confidence}% conf`);
  if (filters.industries?.length) filterChips.push(`${filters.industries.length} industries`);
  if (filters.geographies?.length) filterChips.push(`${filters.geographies.length} regions`);
  if (filters.role_categories?.length) filterChips.push(`${filters.role_categories.length} roles`);
  if (filters.named_domains?.length) filterChips.push(`${filters.named_domains.length} domains`);

  return (
    <div className="surface-1 group flex flex-col rounded-xl border border-border p-4 transition-all hover:shadow-soft">
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <div className={cn('h-8 w-8 shrink-0 rounded-md', colorClass)} />
          <div className="min-w-0">
            <h3 className="truncate text-sm font-semibold">{campaign.name}</h3>
            {campaign.sector && (
              <p className="truncate text-[11px] text-muted-foreground">{campaign.sector}</p>
            )}
          </div>
        </div>
        <Badge variant="outline" className="shrink-0 text-[10px]">
          {campaign.status}
        </Badge>
      </div>

      {campaign.description && (
        <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">{campaign.description}</p>
      )}

      <div className="mt-3 flex flex-wrap gap-1">
        {filterChips.length === 0 ? (
          <span className="text-[11px] italic text-muted-foreground">No filters set</span>
        ) : (
          filterChips.map((c) => (
            <span key={c} className="rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-mono">
              {c}
            </span>
          ))
        )}
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 text-[11px]">
        <div className="rounded-md border border-border bg-background/50 p-2">
          <div className="text-muted-foreground">Goal claims</div>
          <div className="font-mono text-sm font-semibold">{campaign.goal_claims}</div>
        </div>
        <div className="rounded-md border border-border bg-background/50 p-2">
          <div className="text-muted-foreground">Goal meetings</div>
          <div className="font-mono text-sm font-semibold">{campaign.goal_meetings}</div>
        </div>
      </div>

      <div className="mt-3 flex items-center gap-1 border-t border-border pt-3">
        <Link
          to="/dashboard"
          search={{ campaign: campaign.id } as any}
          className="flex-1"
        >
          <Button size="sm" variant="ghost" className="w-full justify-center text-xs">
            View signals <ArrowRight className="ml-1 h-3 w-3" />
          </Button>
        </Link>
        {isOwner && (
          <>
            <Button size="icon" variant="ghost" className="h-8 w-8" onClick={onEdit} aria-label="Edit">
              <Pencil className="h-3.5 w-3.5" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 text-destructive hover:text-destructive"
              onClick={onDelete}
              aria-label="Delete"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </>
        )}
      </div>
    </div>
  );
}

function CampaignDialog({
  campaign,
  onClose,
}: {
  campaign: CampaignRow | null;
  onClose: () => void;
}) {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [name, setName] = useState(campaign?.name ?? '');
  const [description, setDescription] = useState(campaign?.description ?? '');
  const [sector, setSector] = useState(campaign?.sector ?? '');
  const [color, setColor] = useState(campaign?.color ?? 'blue');
  const [status, setStatus] = useState<CampaignRow['status']>(campaign?.status ?? 'ACTIVE');
  const [filters, setFilters] = useState<CampaignFilters>(
    campaign?.filters ?? { min_confidence: 60, signal_types: [], industries: [], geographies: [], role_categories: [], seniority_levels: [], named_domains: [] }
  );
  const [goalClaims, setGoalClaims] = useState(campaign?.goal_claims ?? 10);
  const [goalMeetings, setGoalMeetings] = useState(campaign?.goal_meetings ?? 5);
  const [assigneesText, setAssigneesText] = useState((campaign?.assignees ?? []).join(', '));
  const [domainsText, setDomainsText] = useState((campaign?.filters?.named_domains ?? []).join(', '));

  const saveMut = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('Not signed in');
      if (!name.trim()) throw new Error('Name is required');
      const assignees = assigneesText
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
      const namedDomains = domainsText
        .split(',')
        .map((s) => s.trim().toLowerCase())
        .filter(Boolean);
      const payload = {
        name: name.trim(),
        description: description.trim() || null,
        sector: sector.trim() || null,
        color,
        status,
        filters: { ...filters, named_domains: namedDomains },
        assignees,
        goal_claims: goalClaims,
        goal_meetings: goalMeetings,
      };
      if (campaign) {
        return updateCampaign(campaign.id, payload as any);
      }
      return createCampaign(user.id, payload as any);
    },
    onSuccess: () => {
      toast.success(campaign ? 'Campaign updated' : '✨ Campaign created');
      qc.invalidateQueries({ queryKey: ['campaigns'] });
      onClose();
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : 'Save failed'),
  });

  const toggle = <K extends keyof CampaignFilters>(key: K, value: string) => {
    setFilters((prev) => {
      const cur = (prev[key] as any as string[] | undefined) ?? [];
      const next = cur.includes(value) ? cur.filter((v) => v !== value) : [...cur, value];
      return { ...prev, [key]: next } as CampaignFilters;
    });
  };

  return (
    <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
      <DialogHeader>
        <DialogTitle>{campaign ? 'Edit campaign' : 'New campaign'}</DialogTitle>
      </DialogHeader>

      <div className="space-y-5">
        {/* Basics */}
        <section className="space-y-3">
          <h3 className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Basics</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label className="text-xs">Name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="FinServ Enterprise" />
            </div>
            <div>
              <Label className="text-xs">Sector</Label>
              <Select value={sector || 'NONE'} onValueChange={(v) => setSector(v === 'NONE' ? '' : v)}>
                <SelectTrigger><SelectValue placeholder="Select sector" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="NONE">— None —</SelectItem>
                  {SECTOR_PRESETS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label className="text-xs">Description</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What this campaign covers and who it's for…"
              rows={2}
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label className="mb-2 block text-xs">Color</Label>
              <div className="flex gap-2">
                {CAMPAIGN_COLORS.map((c) => (
                  <button
                    type="button"
                    key={c.value}
                    onClick={() => setColor(c.value)}
                    className={cn(
                      'h-8 w-8 rounded-md ring-offset-2 transition-all',
                      c.class,
                      color === c.value && 'ring-2 ring-foreground'
                    )}
                    aria-label={c.label}
                  />
                ))}
              </div>
            </div>
            <div>
              <Label className="text-xs">Status</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as any)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="PAUSED">Paused</SelectItem>
                  <SelectItem value="ARCHIVED">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </section>

        {/* Filters */}
        <section className="space-y-3 border-t border-border pt-4">
          <h3 className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Signal filters</h3>

          <div>
            <Label className="mb-1.5 block text-xs">Signal types</Label>
            <div className="flex flex-wrap gap-2">
              {(Object.keys(SIGNAL_TYPE_LABELS) as SignalType[]).map((t) => {
                const on = filters.signal_types?.includes(t);
                return (
                  <button
                    type="button"
                    key={t}
                    onClick={() => toggle('signal_types', t)}
                    className={cn(
                      'rounded-md border px-2.5 py-1 text-xs transition-colors',
                      on ? 'border-brand bg-brand/10 text-brand' : 'border-border hover:bg-muted'
                    )}
                  >
                    {SIGNAL_TYPE_LABELS[t]}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <Label className="mb-1.5 flex items-center justify-between text-xs">
              <span>Min confidence</span>
              <span className="font-mono text-foreground">{filters.min_confidence ?? 0}</span>
            </Label>
            <Slider
              value={[filters.min_confidence ?? 0]}
              min={0}
              max={100}
              step={5}
              onValueChange={(v) => setFilters((p) => ({ ...p, min_confidence: v[0] }))}
            />
          </div>

          <ChipGroup
            label="Industries"
            options={INDUSTRY_PRESETS}
            selected={filters.industries ?? []}
            onToggle={(v) => toggle('industries', v)}
          />

          <ChipGroup
            label="Geographies"
            options={GEO_PRESETS}
            selected={filters.geographies ?? []}
            onToggle={(v) => toggle('geographies', v)}
          />

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label className="text-xs">Min employees</Label>
              <Input
                type="number"
                value={filters.employee_min ?? ''}
                onChange={(e) => setFilters((p) => ({ ...p, employee_min: e.target.value ? Number(e.target.value) : null }))}
                placeholder="e.g. 50"
              />
            </div>
            <div>
              <Label className="text-xs">Max employees</Label>
              <Input
                type="number"
                value={filters.employee_max ?? ''}
                onChange={(e) => setFilters((p) => ({ ...p, employee_max: e.target.value ? Number(e.target.value) : null }))}
                placeholder="e.g. 5000"
              />
            </div>
          </div>

          <ChipGroup
            label="Role categories"
            options={ROLE_CATEGORIES}
            selected={filters.role_categories ?? []}
            onToggle={(v) => toggle('role_categories', v)}
          />

          <div>
            <Label className="mb-1.5 block text-xs">Seniority</Label>
            <div className="flex flex-wrap gap-2">
              {SENIORITY_OPTIONS.map((s) => {
                const on = filters.seniority_levels?.includes(s);
                return (
                  <button
                    type="button"
                    key={s}
                    onClick={() => toggle('seniority_levels', s)}
                    className={cn(
                      'rounded-md border px-2.5 py-1 text-xs transition-colors',
                      on ? 'border-brand bg-brand/10 text-brand' : 'border-border hover:bg-muted'
                    )}
                  >
                    {s.replace('_', ' ')}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <Label className="text-xs">Named domains <span className="text-muted-foreground">(comma-separated)</span></Label>
            <Input
              value={domainsText}
              onChange={(e) => setDomainsText(e.target.value)}
              placeholder="acme.com, globex.com"
            />
          </div>
        </section>

        {/* Team & goals */}
        <section className="space-y-3 border-t border-border pt-4">
          <h3 className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Team & goals</h3>
          <div>
            <Label className="text-xs">Assignees <span className="text-muted-foreground">(user IDs or emails, comma-separated)</span></Label>
            <Input
              value={assigneesText}
              onChange={(e) => setAssigneesText(e.target.value)}
              placeholder="user-id-1, user-id-2"
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label className="text-xs">Goal: claims</Label>
              <Input type="number" value={goalClaims} onChange={(e) => setGoalClaims(Number(e.target.value) || 0)} />
            </div>
            <div>
              <Label className="text-xs">Goal: meetings</Label>
              <Input type="number" value={goalMeetings} onChange={(e) => setGoalMeetings(Number(e.target.value) || 0)} />
            </div>
          </div>
        </section>
      </div>

      <DialogFooter>
        <Button variant="ghost" onClick={onClose}>Cancel</Button>
        <Button onClick={() => saveMut.mutate()} disabled={saveMut.isPending}>
          {saveMut.isPending && <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />}
          {campaign ? 'Save changes' : 'Create campaign'}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}

function ChipGroup({
  label,
  options,
  selected,
  onToggle,
}: {
  label: string;
  options: string[];
  selected: string[];
  onToggle: (v: string) => void;
}) {
  return (
    <div>
      <Label className="mb-1.5 block text-xs">{label}</Label>
      <div className="flex flex-wrap gap-1.5">
        {options.map((o) => {
          const on = selected.includes(o);
          return (
            <button
              type="button"
              key={o}
              onClick={() => onToggle(o)}
              className={cn(
                'rounded-md border px-2 py-1 text-[11px] transition-colors',
                on ? 'border-brand bg-brand/10 text-brand' : 'border-border hover:bg-muted'
              )}
            >
              <span className="inline-flex items-center gap-1">
                <Checkbox checked={on} className="h-3 w-3 pointer-events-none" />
                {o}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
