import { createFileRoute } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { DashboardShell } from '@/components/dashboard-shell';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/lib/use-auth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Settings as SettingsIcon, Users, CheckCircle2, Radio, Mail, Sparkles, Brain, UserSearch } from 'lucide-react';

export const Route = createFileRoute('/settings')({
  component: SettingsPage,
});

const INTEGRATIONS = [
  { id: 'slack', name: 'Slack', desc: 'Real-time signal alerts to a channel.' },
  { id: 'salesforce', name: 'Salesforce', desc: 'Push leads, signals, and contacts to CRM.' },
  { id: 'hubspot', name: 'HubSpot', desc: 'Sync companies and outreach back to HubSpot.' },
  { id: 'outreach', name: 'Outreach', desc: 'Drop drafted emails into Outreach sequences.' },
  { id: 'salesloft', name: 'Salesloft', desc: 'Send drafts to Salesloft cadences.' },
  { id: 'zapier', name: 'Zapier', desc: 'Trigger any workflow on a new signal.' },
];

function SettingsPage() {
  const { user } = useAuth();

  return (
    <DashboardShell>
      <div className="mx-auto max-w-5xl px-6 py-8 space-y-6">
        <header>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <SettingsIcon className="h-6 w-6 text-brand" />
            Settings
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your agents, integrations, and team.
          </p>
        </header>

        {/* Agent status banner */}
        <div className="surface-3 rounded-xl p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-brand" />
              Your AI Agents
            </h2>
            <span className="text-xs text-muted-foreground">All systems operational</span>
          </div>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <AgentCard icon={Radio} name="Signal Agent" desc="Monitors 12 sources 24/7 for buying signals." status="Active" />
            <AgentCard icon={Mail} name="Outreach Agent" desc="Drafts hyper-relevant emails the moment a signal fires." status="Active" />
            <AgentCard icon={Brain} name="Enrichment Agent" desc="Auto-generates account briefs and finds verified contacts on every signal." status="Active" />
          </div>
        </div>

        {/* Enrichment Agent settings */}
        <EnrichmentAgentPanel />

        <Tabs defaultValue="profile">
          <TabsList>
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="team">Team</TabsTrigger>
            <TabsTrigger value="integrations">Integrations</TabsTrigger>
            <TabsTrigger value="billing">Billing</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="mt-6 space-y-4">
            <ProfileTab email={user?.email ?? ''} />
          </TabsContent>

          <TabsContent value="team" className="mt-6 space-y-4">
            <TeamTab email={user?.email ?? ''} />
          </TabsContent>

          <TabsContent value="integrations" className="mt-6 space-y-3">
            {INTEGRATIONS.map((i) => (
              <IntegrationRow key={i.id} id={i.id} name={i.name} desc={i.desc} />
            ))}
          </TabsContent>

          <TabsContent value="billing" className="mt-6 space-y-4">
            <div className="surface-2 rounded-xl p-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">Current plan</h3>
                  <p className="text-xs text-muted-foreground">You're on the Team plan trial.</p>
                </div>
                <Badge className="bg-brand/15 text-brand border-brand/30">Team · Trial</Badge>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
                <Stat label="Price" value="$349/mo" />
                <Stat label="Next bill" value="May 7, 2026" />
                <Stat label="Accounts used" value="42 / 750" />
              </div>
              <div className="mt-5 flex gap-2">
                <Button onClick={() => toast.info('Stripe checkout not wired')}>Upgrade plan</Button>
                <Button variant="outline" onClick={() => toast.info('Stripe portal not wired')}>Manage billing</Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="notifications" className="mt-6 space-y-3">
            {[
              { id: 'email-signal', label: 'Email alerts for new signals' },
              { id: 'slack-signal', label: 'Slack alerts for new signals' },
              { id: 'daily-digest', label: 'Daily digest email' },
              { id: 'weekly-summary', label: 'Weekly summary email' },
              { id: 'crm-push', label: 'Auto-push to CRM on signal claim' },
            ].map((n) => (
              <div key={n.id} className="surface-1 flex items-center justify-between rounded-lg p-4 transition-colors hover:border-hairline-brand">
                <Label htmlFor={n.id} className="cursor-pointer">{n.label}</Label>
                <Switch id={n.id} defaultChecked={n.id !== 'crm-push'} />
              </div>
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardShell>
  );
}

function ProfileTab({ email }: { email: string }) {
  const [pw, setPw] = useState('');
  const [busy, setBusy] = useState(false);
  const updatePw = async () => {
    if (pw.length < 6) return toast.error('Password must be at least 6 characters');
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password: pw });
    setBusy(false);
    if (error) toast.error(error.message);
    else { toast.success('Password updated'); setPw(''); }
  };
  return (
    <div className="surface-2 rounded-xl p-5 space-y-4">
      <div>
        <Label className="text-sm">Email</Label>
        <Input value={email} readOnly className="mt-1.5 bg-muted/40" />
      </div>
      <div>
        <Label className="text-sm">New password</Label>
        <Input type="password" value={pw} onChange={(e) => setPw(e.target.value)} className="mt-1.5" placeholder="At least 6 characters" />
      </div>
      <div>
        <Button onClick={updatePw} disabled={busy || !pw}>
          <CheckCircle2 className="mr-2 h-4 w-4" />
          Update password
        </Button>
      </div>
    </div>
  );
}

function TeamTab({ email }: { email: string }) {
  return (
    <div className="surface-2 rounded-xl p-5 space-y-5">
      <div>
        <Label className="text-sm">Team name</Label>
        <Input defaultValue="My Team" className="mt-1.5" />
      </div>
      <div>
        <Label className="text-sm">Invite teammate</Label>
        <div className="mt-1.5 flex gap-2">
          <Input placeholder="teammate@company.com" />
          <Button variant="outline" onClick={() => toast.info('Invitations not wired yet')}>
            <Users className="mr-2 h-4 w-4" />
            Send
          </Button>
        </div>
      </div>
      <div>
        <h4 className="text-sm font-semibold mb-2">Members</h4>
        <div className="rounded-md border border-border divide-y divide-border">
          <div className="flex items-center justify-between px-3 py-2.5 text-sm">
            <div>
              <div className="font-medium">{email}</div>
              <div className="text-xs text-muted-foreground">Owner</div>
            </div>
            <Badge variant="outline">Admin</Badge>
          </div>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="mt-1 font-semibold">{value}</div>
    </div>
  );
}

function EnrichmentAgentPanel() {
  const KEY_BRIEF = 'rexxon.enrichment.autoBrief';
  const KEY_CONTACTS = 'rexxon.enrichment.autoContacts';
  const KEY_DEPTH = 'rexxon.enrichment.depth';

  const [autoBrief, setAutoBrief] = useState(true);
  const [autoContacts, setAutoContacts] = useState(true);
  const [depth, setDepth] = useState<'fast' | 'deep'>('fast');

  useEffect(() => {
    if (typeof window === 'undefined') return;
    setAutoBrief(localStorage.getItem(KEY_BRIEF) !== '0');
    setAutoContacts(localStorage.getItem(KEY_CONTACTS) !== '0');
    setDepth((localStorage.getItem(KEY_DEPTH) as 'fast' | 'deep') ?? 'fast');
  }, []);

  const persist = (k: string, v: string) => {
    if (typeof window !== 'undefined') localStorage.setItem(k, v);
  };

  return (
    <div className="surface-2 rounded-xl p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-brand/15 text-brand">
            <Brain className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold">Enrichment Agent</h3>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Generates a sales-ready business summary for every account and finds verified buying-committee contacts.
            </p>
          </div>
        </div>
        <span className="rounded-full bg-green-500/15 px-2 py-0.5 text-[10px] font-medium text-green-300">
          Active
        </span>
      </div>

      <div className="mt-4 space-y-3">
        <div className="flex items-center justify-between rounded-lg border border-border bg-background/40 p-3">
          <div className="flex items-start gap-2.5">
            <Sparkles className="mt-0.5 h-4 w-4 text-brand" />
            <div>
              <div className="text-sm font-medium">Auto-generate account brief</div>
              <div className="text-xs text-muted-foreground">
                Run an AI brief (summary, why now, pain points, buying committee) when an account opens.
              </div>
            </div>
          </div>
          <Switch
            checked={autoBrief}
            onCheckedChange={(v) => { setAutoBrief(v); persist(KEY_BRIEF, v ? '1' : '0'); }}
          />
        </div>

        <div className="flex items-center justify-between rounded-lg border border-border bg-background/40 p-3">
          <div className="flex items-start gap-2.5">
            <UserSearch className="mt-0.5 h-4 w-4 text-brand" />
            <div>
              <div className="text-sm font-medium">Auto-find contacts</div>
              <div className="text-xs text-muted-foreground">
                Surface verified emails &amp; LinkedIn URLs for the buying committee on each new signal.
              </div>
            </div>
          </div>
          <Switch
            checked={autoContacts}
            onCheckedChange={(v) => { setAutoContacts(v); persist(KEY_CONTACTS, v ? '1' : '0'); }}
          />
        </div>

        <div className="rounded-lg border border-border bg-background/40 p-3">
          <Label className="text-sm font-medium">Research depth</Label>
          <p className="text-xs text-muted-foreground mt-0.5">
            Fast = quick summary &amp; top 3 contacts. Deep = full committee, tech stack, recent press.
          </p>
          <div className="mt-3 inline-flex rounded-md border border-border p-0.5">
            {(['fast', 'deep'] as const).map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => { setDepth(d); persist(KEY_DEPTH, d); }}
                className={`px-3 py-1 text-xs rounded-sm transition-colors ${
                  depth === d ? 'bg-brand text-brand-foreground' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {d === 'fast' ? 'Fast' : 'Deep'}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function AgentCard({ icon: Icon, name, desc, status }: { icon: typeof Radio; name: string; desc: string; status: string }) {
  return (
    <div className="rounded-lg border border-border bg-background/40 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-brand/15 text-brand">
            <Icon className="h-4 w-4" />
          </div>
          <div className="font-medium text-sm">{name}</div>
        </div>
        <span className="rounded-full bg-green-500/15 px-2 py-0.5 text-[10px] font-medium text-green-300">
          {status}
        </span>
      </div>
      <p className="mt-2 text-xs text-muted-foreground">{desc}</p>
    </div>
  );
}

function IntegrationRow({ id, name, desc }: { id: string; name: string; desc: string }) {
  const storageKey = `rexxon.integration.${id}`;
  const [connected, setConnected] = useState(false);
  useEffect(() => {
    if (typeof window !== 'undefined') setConnected(localStorage.getItem(storageKey) === '1');
  }, [storageKey]);
  const toggle = () => {
    const next = !connected;
    setConnected(next);
    localStorage.setItem(storageKey, next ? '1' : '0');
    toast.success(`${name} ${next ? 'connected' : 'disconnected'}`);
  };
  return (
    <div className="surface-1 flex items-center justify-between rounded-lg p-4 transition-colors hover:border-hairline-brand">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-md bg-accent/40 font-semibold text-sm">
          {name[0]}
        </div>
        <div>
          <div className="font-medium text-sm">{name}</div>
          <div className="text-xs text-muted-foreground">{desc}</div>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <Badge variant={connected ? 'default' : 'outline'} className={connected ? 'bg-green-500/15 text-green-300 border-green-500/30' : ''}>
          {connected ? 'Connected' : 'Not connected'}
        </Badge>
        <Button variant="outline" size="sm" onClick={toggle}>
          {connected ? 'Disconnect' : 'Connect'}
        </Button>
      </div>
    </div>
  );
}
