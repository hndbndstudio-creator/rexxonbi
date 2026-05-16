import { createFileRoute, Link } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { format, formatDistanceToNow } from 'date-fns';
import { History, ChevronLeft, FileText, Sparkles, Loader2 } from 'lucide-react';

import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/use-auth';
import { DashboardShell } from '@/components/dashboard-shell';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export const Route = createFileRoute('/proposals/history')({
  head: () => ({
    meta: [
      { title: 'Proposal history — Rexxon AI' },
      { name: 'description', content: 'Every generated proposal version with timestamps and key inputs.' },
      { name: 'robots', content: 'noindex, nofollow' },
    ],
  }),
  component: ProposalHistoryPage,
});

interface RfpRow {
  id: string;
  title: string;
  industry: string;
  mode: string;
  status: 'DRAFT' | 'GENERATED' | 'FINALIZED';
  inputs: Record<string, any> | null;
  generated_at: string | null;
  created_at: string;
  updated_at: string;
}

const KEY_INPUT_FIELDS: { key: string; label: string }[] = [
  { key: 'organization', label: 'Organization' },
  { key: 'budget', label: 'Budget' },
  { key: 'pricing_model', label: 'Pricing model' },
  { key: 'start_date', label: 'Start date' },
  { key: 'go_live', label: 'Go live' },
  { key: 'submission_deadline', label: 'Submission' },
  { key: 'contact_email', label: 'Contact' },
];

function ProposalHistoryPage() {
  const { user } = useAuth();

  const { data: rfps, isLoading } = useQuery({
    queryKey: ['rfps-history', user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('rfps')
        .select('id,title,industry,mode,status,inputs,generated_at,created_at,updated_at')
        .order('generated_at', { ascending: false, nullsFirst: false })
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as RfpRow[];
    },
  });

  return (
    <DashboardShell>
      <div className="mx-auto max-w-5xl space-y-6 p-4 md:p-8">
        <PageHeader
          icon={History}
          title="Proposal history"
          subtitle="Every generated proposal version with timestamps and the key inputs used."
          actions={
            <Button variant="outline" asChild>
              <Link to="/proposals">
                <ChevronLeft className="mr-1.5 h-4 w-4" />
                Back to proposals
              </Link>
            </Button>
          }
        />

        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : !rfps?.length ? (
          <div className="rounded-lg border border-dashed border-border bg-card/50 p-12 text-center">
            <FileText className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
            <h3 className="mb-1 font-medium">No proposal history yet</h3>
            <p className="text-sm text-muted-foreground">
              Generated proposals will appear here with their inputs and timestamps.
            </p>
          </div>
        ) : (
          <ol className="relative space-y-4 border-l border-border pl-6">
            {rfps.map((rfp) => {
              const inputs = rfp.inputs ?? {};
              const ts = rfp.generated_at ?? rfp.created_at;
              const entries = KEY_INPUT_FIELDS
                .map((f) => ({ ...f, value: (inputs as any)[f.key] }))
                .filter((e) => e.value && String(e.value).trim().length > 0);
              return (
                <li key={rfp.id} className="relative">
                  <span className="absolute -left-[31px] top-2 flex h-4 w-4 items-center justify-center rounded-full border border-border bg-background">
                    <Sparkles className="h-2.5 w-2.5 text-brand" />
                  </span>
                  <Link
                    to="/proposals"
                    className="block rounded-lg border border-border bg-card p-4 transition hover:border-brand/50 hover:shadow-sm"
                  >
                    <div className="mb-2 flex flex-wrap items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <h3 className="truncate font-medium text-foreground">{rfp.title}</h3>
                        <p className="text-xs text-muted-foreground">
                          {rfp.industry} · {rfp.mode === 'BUYER' ? 'Buyer brief' : 'Vendor response'}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={rfp.status === 'GENERATED' ? 'default' : 'secondary'} className="text-[10px]">
                          {rfp.status}
                        </Badge>
                      </div>
                    </div>

                    <div className="mb-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                      <span title={new Date(ts).toLocaleString()}>
                        {rfp.generated_at ? 'Generated' : 'Created'}{' '}
                        {format(new Date(ts), 'MMM d, yyyy · HH:mm')}
                      </span>
                      <span>·</span>
                      <span>{formatDistanceToNow(new Date(ts), { addSuffix: true })}</span>
                    </div>

                    {entries.length > 0 ? (
                      <dl className="grid grid-cols-1 gap-x-4 gap-y-1.5 text-xs sm:grid-cols-2">
                        {entries.map((e) => (
                          <div key={e.key} className="flex gap-1.5">
                            <dt className="shrink-0 text-muted-foreground">{e.label}:</dt>
                            <dd className="min-w-0 truncate text-foreground">{String(e.value)}</dd>
                          </div>
                        ))}
                      </dl>
                    ) : (
                      <p className="text-xs italic text-muted-foreground">No key inputs recorded.</p>
                    )}
                  </Link>
                </li>
              );
            })}
          </ol>
        )}
      </div>
    </DashboardShell>
  );
}
