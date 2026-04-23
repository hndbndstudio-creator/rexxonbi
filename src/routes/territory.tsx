import { createFileRoute } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DashboardShell } from '@/components/dashboard-shell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/use-auth';
import { toast } from 'sonner';
import { Save, Target } from 'lucide-react';
import { SIGNAL_TYPE_LABELS, type SignalType, confidenceLabel } from '@/lib/types';

export const Route = createFileRoute('/territory')({
  component: TerritoryPage,
});

const INDUSTRIES = ['Technology', 'Finance', 'Healthcare', 'Legal', 'HR', 'Marketing', 'Retail', 'Manufacturing', 'Education'];
const FUNDING_STAGES = ['SEED', 'SERIES_A', 'SERIES_B', 'SERIES_C', 'SERIES_D_PLUS', 'PUBLIC', 'PRIVATE'];
const ROLE_CATEGORIES = ['Security', 'DevOps/Cloud', 'Data/Analytics', 'Sales/Revenue', 'Marketing', 'HR/People', 'Finance/Compliance', 'Legal', 'Customer Success', 'Product/Engineering', 'Executive'];
const GEOGRAPHIES = ['United States', 'Canada', 'United Kingdom', 'Germany', 'France', 'Australia', 'India', 'Singapore'];
const SIGNAL_TYPES: SignalType[] = ['GROWTH', 'COMPLIANCE', 'TECH_EXPANSION', 'SALES_OPS', 'LEADERSHIP', 'FUNDING', 'EARNINGS'];

function TerritoryPage() {
  const { user } = useAuth();
  const qc = useQueryClient();

  const { data: territory, isLoading } = useQuery({
    queryKey: ['territory', user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase.from('territories').select('*').eq('user_id', user!.id).maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const [industries, setIndustries] = useState<string[]>([]);
  const [employeeMin, setEmployeeMin] = useState<string>('');
  const [employeeMax, setEmployeeMax] = useState<string>('');
  const [fundingStages, setFundingStages] = useState<string[]>([]);
  const [geographies, setGeographies] = useState<string[]>([]);
  const [signalTypes, setSignalTypes] = useState<string[]>(SIGNAL_TYPES);
  const [minConfidence, setMinConfidence] = useState(60);
  const [roleCategories, setRoleCategories] = useState<string[]>([]);
  const [namedDomains, setNamedDomains] = useState('');
  const [notifySlack, setNotifySlack] = useState(false);
  const [slackChannel, setSlackChannel] = useState('');
  const [emailDigest, setEmailDigest] = useState<'REALTIME' | 'DAILY' | 'WEEKLY' | 'OFF'>('DAILY');

  useEffect(() => {
    if (!territory) return;
    setIndustries(territory.industries ?? []);
    setEmployeeMin(territory.employee_min?.toString() ?? '');
    setEmployeeMax(territory.employee_max?.toString() ?? '');
    setFundingStages(territory.funding_stages ?? []);
    setGeographies(territory.geographies ?? []);
    setSignalTypes(territory.signal_types?.length ? territory.signal_types : SIGNAL_TYPES);
    setMinConfidence(territory.min_confidence ?? 60);
    setRoleCategories(territory.role_categories ?? []);
    setNamedDomains((territory.named_domains ?? []).join('\n'));
    setNotifySlack(territory.notify_slack ?? false);
    setSlackChannel(territory.slack_channel ?? '');
    const ed = territory.email_digest;
    setEmailDigest((ed === 'REALTIME' || ed === 'DAILY' || ed === 'WEEKLY' || ed === 'OFF') ? ed : 'DAILY');
  }, [territory]);

  const save = useMutation({
    mutationFn: async () => {
      const payload = {
        user_id: user!.id,
        industries,
        employee_min: employeeMin ? parseInt(employeeMin) : null,
        employee_max: employeeMax ? parseInt(employeeMax) : null,
        funding_stages: fundingStages,
        geographies,
        signal_types: signalTypes,
        min_confidence: minConfidence,
        role_categories: roleCategories,
        named_domains: namedDomains.split('\n').map((s) => s.trim()).filter(Boolean),
        notify_slack: notifySlack,
        slack_channel: slackChannel || null,
        email_digest: emailDigest,
      };
      const { error } = await supabase.from('territories').upsert(payload, { onConflict: 'user_id' });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Territory saved');
      qc.invalidateQueries({ queryKey: ['territory'] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : 'Save failed'),
  });

  const toggle = (list: string[], setList: (v: string[]) => void, val: string) => {
    setList(list.includes(val) ? list.filter((x) => x !== val) : [...list, val]);
  };

  const conf = confidenceLabel(minConfidence);

  const activeFilters =
    industries.length + fundingStages.length + geographies.length + roleCategories.length +
    (employeeMin ? 1 : 0) + (employeeMax ? 1 : 0) +
    namedDomains.split('\n').map((s) => s.trim()).filter(Boolean).length;

  return (
    <DashboardShell>
      {/* Agent header */}
      <div className="border-b border-border bg-card/30">
        <div className="mx-auto max-w-4xl px-6 py-5">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-md bg-brand/15 text-brand">
                <Target className="h-4 w-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-lg font-bold tracking-tight">Signal Agent</h1>
                  <span className="rounded-full bg-green-500/15 px-2 py-0.5 text-[10px] font-medium text-green-300">
                    Monitoring
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Tells the agent which accounts to watch, which signals to surface, and how loud to be.
                </p>
              </div>
            </div>
            <Button onClick={() => save.mutate()} disabled={save.isPending || isLoading}>
              <Save className="mr-2 h-4 w-4" />
              Save changes
            </Button>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-6 text-xs">
            <Stat label="Active filters" value={activeFilters} />
            <Stat label="Signal types on" value={signalTypes.length} />
            <Stat label="Min confidence" value={minConfidence} suffix="%" />
            <Stat label="Notify mode" value={notifySlack ? 'Slack + Email' : 'Email'} />
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-6 py-8 space-y-8">
        <header>
          <h2 className="text-base font-semibold">Configure your territory</h2>
          <p className="text-xs text-muted-foreground mt-1">
            Each change updates what the Signal Agent surfaces in real time.
          </p>
        </header>

        {/* Account filters */}
        <Section title="Account filters" desc="Limit signals to companies that match these criteria.">
          <div className="space-y-5">
            <div>
              <Label className="text-sm">Industries</Label>
              <ChipGroup items={INDUSTRIES} selected={industries} onToggle={(v) => toggle(industries, setIndustries, v)} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm">Employee count min</Label>
                <Input type="number" placeholder="0" value={employeeMin} onChange={(e) => setEmployeeMin(e.target.value)} className="mt-1.5" />
              </div>
              <div>
                <Label className="text-sm">Employee count max</Label>
                <Input type="number" placeholder="No max" value={employeeMax} onChange={(e) => setEmployeeMax(e.target.value)} className="mt-1.5" />
              </div>
            </div>
            <div>
              <Label className="text-sm">Funding stages</Label>
              <ChipGroup items={FUNDING_STAGES} labels={{
                SEED: 'Seed', SERIES_A: 'Series A', SERIES_B: 'Series B',
                SERIES_C: 'Series C', SERIES_D_PLUS: 'Series D+', PUBLIC: 'Public', PRIVATE: 'Private',
              }} selected={fundingStages} onToggle={(v) => toggle(fundingStages, setFundingStages, v)} />
            </div>
            <div>
              <Label className="text-sm">Geographies</Label>
              <ChipGroup items={GEOGRAPHIES} selected={geographies} onToggle={(v) => toggle(geographies, setGeographies, v)} />
            </div>
          </div>
        </Section>

        {/* Signal preferences */}
        <Section title="Signal preferences" desc="Choose which signal types matter to you.">
          <div className="space-y-5">
            <div className="space-y-2.5">
              {SIGNAL_TYPES.map((t) => (
                <div key={t} className="flex items-center justify-between rounded-md border border-border bg-card/40 px-3 py-2">
                  <Label className="text-sm cursor-pointer" htmlFor={`sig-${t}`}>{SIGNAL_TYPE_LABELS[t]}</Label>
                  <Switch
                    id={`sig-${t}`}
                    checked={signalTypes.includes(t)}
                    onCheckedChange={() => toggle(signalTypes, setSignalTypes, t)}
                  />
                </div>
              ))}
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label className="text-sm">Minimum confidence</Label>
                <span className="text-xs font-mono" style={{ color: conf.color }}>
                  {minConfidence} · {conf.label}
                </span>
              </div>
              <Slider value={[minConfidence]} onValueChange={([v]) => setMinConfidence(v)} min={0} max={100} step={5} />
            </div>
            <div>
              <Label className="text-sm">Role categories</Label>
              <ChipGroup items={ROLE_CATEGORIES} selected={roleCategories} onToggle={(v) => toggle(roleCategories, setRoleCategories, v)} />
            </div>
          </div>
        </Section>

        {/* Notifications */}
        <Section title="Notifications" desc="Where and how often we ping you.">
          <div className="space-y-5">
            <div className="flex items-center justify-between rounded-md border border-border bg-card/40 px-3 py-2">
              <div>
                <Label className="text-sm">Slack notifications</Label>
                <p className="text-xs text-muted-foreground mt-0.5">Send new matching signals to a channel.</p>
              </div>
              <Switch checked={notifySlack} onCheckedChange={setNotifySlack} />
            </div>
            {notifySlack && (
              <div>
                <Label className="text-sm">Slack channel</Label>
                <Input placeholder="#sales-signals" value={slackChannel} onChange={(e) => setSlackChannel(e.target.value)} className="mt-1.5" />
              </div>
            )}
            <div>
              <Label className="text-sm mb-2 block">Email digest</Label>
              <RadioGroup value={emailDigest} onValueChange={(v) => setEmailDigest(v as typeof emailDigest)}>
                {[
                  { v: 'REALTIME', l: 'Real-time alerts' },
                  { v: 'DAILY', l: 'Daily digest at 8am' },
                  { v: 'WEEKLY', l: 'Weekly digest on Monday' },
                  { v: 'OFF', l: 'Off' },
                ].map((o) => (
                  <div key={o.v} className="flex items-center gap-2">
                    <RadioGroupItem value={o.v} id={`ed-${o.v}`} />
                    <Label htmlFor={`ed-${o.v}`} className="text-sm cursor-pointer">{o.l}</Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          </div>
        </Section>

        {/* Named accounts */}
        <Section title="Named accounts" desc="These domains are always monitored regardless of filters above.">
          <Textarea
            value={namedDomains}
            onChange={(e) => setNamedDomains(e.target.value)}
            placeholder={'stripe.com\ndatabricks.com\nfigma.com'}
            rows={5}
            className="font-mono text-sm"
          />
        </Section>

        <div className="flex justify-end">
          <Button onClick={() => save.mutate()} disabled={save.isPending || isLoading} size="lg">
            <Save className="mr-2 h-4 w-4" />
            Save territory
          </Button>
        </div>
      </div>
    </DashboardShell>
  );
}

function Section({ title, desc, children }: { title: string; desc: string; children: React.ReactNode }) {
  return (
    <section className="rounded-lg border border-border bg-card/30 p-5">
      <header className="mb-4">
        <h2 className="font-semibold">{title}</h2>
        <p className="text-xs text-muted-foreground mt-1">{desc}</p>
      </header>
      {children}
    </section>
  );
}

function ChipGroup({
  items,
  selected,
  onToggle,
  labels,
}: {
  items: string[];
  selected: string[];
  onToggle: (v: string) => void;
  labels?: Record<string, string>;
}) {
  return (
    <div className="mt-2 flex flex-wrap gap-2">
      {items.map((it) => {
        const on = selected.includes(it);
        return (
          <button
            key={it}
            type="button"
            onClick={() => onToggle(it)}
            className={`rounded-full border px-3 py-1 text-xs transition-colors ${
              on
                ? 'border-brand bg-brand/15 text-brand'
                : 'border-border bg-card/40 text-muted-foreground hover:bg-accent/40'
            }`}
          >
            {labels?.[it] ?? it}
          </button>
        );
      })}
    </div>
  );
}
