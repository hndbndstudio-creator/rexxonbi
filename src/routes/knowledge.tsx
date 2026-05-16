import { createFileRoute, Link } from '@tanstack/react-router';
import { DashboardShell } from '@/components/dashboard-shell';
import { PageHeader } from '@/components/page-header';
import { KnowledgeBaseWidget } from '@/components/knowledge-base-widget';
import { usePlan } from '@/lib/use-plan';
import { Button } from '@/components/ui/button';
import { BookOpen, Lock, Sparkles, FileText, Search } from 'lucide-react';

export const Route = createFileRoute('/knowledge')({
  head: () => ({
    meta: [
      { title: 'Knowledge base — Rexxon' },
      { name: 'robots', content: 'noindex, nofollow' },
    ],
  }),
  component: KnowledgePage,
});

function KnowledgePage() {
  const { hasKnowledgeBase, isLoading, plan } = usePlan();

  return (
    <DashboardShell>
      <PageHeader
        icon={BookOpen}
        title="Knowledge base"
        subtitle="Upload your company docs and chat with them — grounded, cited answers your reps can trust."
      />
      <div className="mx-auto max-w-5xl px-4 py-5 md:px-8 md:py-6">
        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-brand border-t-transparent" />
          </div>
        ) : hasKnowledgeBase ? (
          <KnowledgeBaseWidget defaultOpen />
        ) : (
          <UpsellCard plan={plan} />
        )}
      </div>
    </DashboardShell>
  );
}

function UpsellCard({ plan }: { plan: string }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border surface-2">
      <div className="relative border-b border-border bg-gradient-to-br from-brand/10 via-background to-background p-8">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-brand/30 bg-brand/10 px-3 py-1 text-xs font-semibold text-brand">
          <Lock className="h-3 w-3" /> Pro & Team add-on
        </div>
        <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">
          Turn your company docs into a sales co-pilot
        </h2>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Upload battle cards, pricing sheets, security FAQs and past proposals. Your team asks
          questions in plain English and gets cited answers in seconds — never stall on an
          objection again.
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          <Button asChild size="sm">
            <Link to="/checkout" search={{ plan: 'pro' } as any}>
              Upgrade to Pro
            </Link>
          </Button>
          <Button asChild size="sm" variant="outline">
            <Link to="/">See plans</Link>
          </Button>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          You're on the <span className="font-medium capitalize text-foreground">{plan}</span> plan.
          Knowledge base is included on Pro and Team.
        </p>
      </div>

      <div className="grid gap-px bg-border md:grid-cols-3">
        <Feature
          icon={FileText}
          title="Upload anything"
          body="PDFs, DOCX, TXT, MD. Sales playbooks, pricing, security docs, case studies."
        />
        <Feature
          icon={Search}
          title="Cited answers"
          body="Every answer links to the source document, so reps can verify before sending."
        />
        <Feature
          icon={Sparkles}
          title="Grounded AI"
          body="Backed by Lovable AI Gateway. Your docs never leave your workspace."
        />
      </div>

      <div className="border-t border-border bg-background/40 px-6 py-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <BookOpen className="h-3.5 w-3.5" />
          Pro · 500 docs · cited answers · workspace search &nbsp;·&nbsp; Team · unlimited docs +
          shared collections
        </div>
      </div>
    </div>
  );
}

function Feature({ icon: Icon, title, body }: { icon: any; title: string; body: string }) {
  return (
    <div className="bg-background p-5">
      <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-brand/10 text-brand">
        <Icon className="h-4 w-4" />
      </div>
      <h3 className="text-sm font-semibold">{title}</h3>
      <p className="mt-1 text-xs text-muted-foreground">{body}</p>
    </div>
  );
}
