import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
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
import { Settings as SettingsIcon, Users, Plug, CreditCard, Bell, CheckCircle2 } from 'lucide-react';

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
        </header>

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
              <div key={i.id} className="flex items-center justify-between rounded-lg border border-border bg-card/40 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-md bg-accent/40 font-semibold text-sm">
                    {i.name[0]}
                  </div>
                  <div>
                    <div className="font-medium text-sm">{i.name}</div>
                    <div className="text-xs text-muted-foreground">{i.desc}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="outline">Not connected</Badge>
                  <Button variant="outline" size="sm" onClick={() => toast.info(`${i.name} OAuth not yet wired`)}>
                    Connect
                  </Button>
                </div>
              </div>
            ))}
          </TabsContent>

          <TabsContent value="billing" className="mt-6 space-y-4">
            <div className="rounded-lg border border-border bg-card/40 p-5">
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
              <div key={n.id} className="flex items-center justify-between rounded-lg border border-border bg-card/40 p-4">
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
    <div className="rounded-lg border border-border bg-card/40 p-5 space-y-4">
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
    <div className="rounded-lg border border-border bg-card/40 p-5 space-y-5">
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
