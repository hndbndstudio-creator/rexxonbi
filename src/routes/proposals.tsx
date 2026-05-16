import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { formatDistanceToNow } from 'date-fns';
import {
  FileText,
  Plus,
  Sparkles,
  Loader2,
  Download,
  ChevronLeft,
  Trash2,
  ArrowRight,
  ArrowLeft,
  Upload,
  X,
} from 'lucide-react';
import { toast } from 'sonner';

import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/use-auth';
import { DashboardShell } from '@/components/dashboard-shell';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import {
  exportRfpDocx,
  exportRfpPdf,
  downloadBlob,
  type RfpContent,
} from '@/lib/rfp-export';
import { extractFile, type ExtractedSource, type SourceKind } from '@/lib/rfp-intake';

export const Route = createFileRoute('/proposals')({
  head: () => ({
    meta: [
      { title: 'Proposal generator — Rexxon AI' },
      { name: 'description', content: 'Generate winning sales proposals for IT, software, and AI projects with AI.' },
      { name: 'robots', content: 'noindex, nofollow' },
    ],
  }),
  component: ProposalsPage,
});

type Mode = 'BUYER' | 'VENDOR_RESPONSE';
type Industry = 'IT' | 'SOFTWARE' | 'AI';

interface RfpRow {
  id: string;
  user_id: string;
  mode: Mode;
  title: string;
  industry: Industry;
  inputs: Record<string, any>;
  content: RfpContent | null;
  generated_at: string | null;
  status: 'DRAFT' | 'GENERATED' | 'FINALIZED';
  created_at: string;
  updated_at: string;
}

const STEPS = ['Intake', 'Basics', 'Scope', 'Requirements', 'Cost & timeline', 'Evaluation'] as const;

interface WizardData {
  mode: Mode;
  industry: Industry;
  title: string;
  organization: string;
  background: string;
  objectives: string;
  in_scope: string;
  out_of_scope: string;
  deliverables: string;
  functional: string;
  technical: string;
  integrations: string;
  security: string;
  sla: string;
  budget: string;
  pricing_model: string;
  start_date: string;
  go_live: string;
  submission_deadline: string;
  evaluation_focus: string;
  contact_email: string;
  notes: string;
}

const EMPTY_WIZARD: WizardData = {
  mode: 'BUYER',
  industry: 'SOFTWARE',
  title: '',
  organization: '',
  background: '',
  objectives: '',
  in_scope: '',
  out_of_scope: '',
  deliverables: '',
  functional: '',
  technical: '',
  integrations: '',
  security: '',
  sla: '',
  budget: '',
  pricing_model: '',
  start_date: '',
  go_live: '',
  submission_deadline: '',
  evaluation_focus: '',
  contact_email: '',
  notes: '',
};

function RfpsPage() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [wizardOpen, setWizardOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const { data: rfps, isLoading } = useQuery({
    queryKey: ['rfps', user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('rfps')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as RfpRow[];
    },
  });

  const selected = rfps?.find((r) => r.id === selectedId) ?? null;

  const deleteMut = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('rfps').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('RFP deleted');
      qc.invalidateQueries({ queryKey: ['rfps'] });
      setSelectedId(null);
    },
    onError: (e: any) => toast.error(e?.message ?? 'Failed to delete'),
  });

  if (selected) {
    return (
      <DashboardShell>
        <RfpDetail rfp={selected} onBack={() => setSelectedId(null)} onDelete={() => deleteMut.mutate(selected.id)} />
      </DashboardShell>
    );
  }

  return (
    <DashboardShell>
      <div className="mx-auto max-w-6xl space-y-6 p-4 md:p-8">
        <PageHeader
          icon={FileText}
          title="RFP generator"
          subtitle="AI-built request for proposals and vendor responses for IT, software & AI projects."
          actions={
            <Button onClick={() => setWizardOpen(true)}>
              <Plus className="mr-1.5 h-4 w-4" />
              New RFP
            </Button>
          }
        />

        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : !rfps?.length ? (
          <EmptyState onCreate={() => setWizardOpen(true)} />
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {rfps.map((rfp) => (
              <button
                key={rfp.id}
                onClick={() => setSelectedId(rfp.id)}
                className="group rounded-lg border border-border bg-card p-4 text-left transition hover:border-brand/50 hover:shadow-sm"
              >
                <div className="mb-2 flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate font-medium text-foreground">{rfp.title}</h3>
                    <p className="text-xs text-muted-foreground">
                      {rfp.industry} · {rfp.mode === 'BUYER' ? 'Issuing RFP' : 'Vendor response'}
                    </p>
                  </div>
                  <Badge variant={rfp.status === 'GENERATED' ? 'default' : 'secondary'} className="text-[10px]">
                    {rfp.status}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(rfp.updated_at), { addSuffix: true })}
                </p>
              </button>
            ))}
          </div>
        )}

        <RfpWizard
          open={wizardOpen}
          onOpenChange={setWizardOpen}
          onCreated={(id) => {
            setWizardOpen(false);
            setSelectedId(id);
            qc.invalidateQueries({ queryKey: ['rfps'] });
          }}
        />
      </div>
    </DashboardShell>
  );
}

function EmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="rounded-lg border border-dashed border-border bg-card/50 p-12 text-center">
      <FileText className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
      <h3 className="mb-1 font-medium">No RFPs yet</h3>
      <p className="mb-4 text-sm text-muted-foreground">
        Generate your first AI-built RFP for an IT, software, or AI project.
      </p>
      <Button onClick={onCreate}>
        <Plus className="mr-1.5 h-4 w-4" />
        Create RFP
      </Button>
    </div>
  );
}

// Wizard ------------------------------------------------------------------

function RfpWizard({
  open,
  onOpenChange,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onCreated: (id: string) => void;
}) {
  const { user } = useAuth();
  const [step, setStep] = useState(0);
  const [data, setData] = useState<WizardData>(EMPTY_WIZARD);
  const [submitting, setSubmitting] = useState(false);

  // Intake state (ephemeral — never uploaded as files)
  const [sources, setSources] = useState<ExtractedSource[]>([]);
  const [intakeNotes, setIntakeNotes] = useState('');
  const [extracting, setExtracting] = useState(false);
  const [prefilling, setPrefilling] = useState(false);
  const [extractedQuestions, setExtractedQuestions] = useState<{ category: string; question: string }[]>([]);
  const [sourceSummary, setSourceSummary] = useState<string>('');

  const reset = () => {
    setStep(0);
    setData(EMPTY_WIZARD);
    setSources([]);
    setIntakeNotes('');
    setExtractedQuestions([]);
    setSourceSummary('');
  };

  const handleClose = (v: boolean) => {
    if (!v) reset();
    onOpenChange(v);
  };

  const update = <K extends keyof WizardData>(key: K, value: WizardData[K]) =>
    setData((d) => ({ ...d, [key]: value }));

  const canAdvance = () => {
    if (step === 0) return true; // intake is optional
    if (step === 1) return data.title.trim().length > 0;
    return true;
  };

  const addFiles = async (files: FileList | null, kind: SourceKind) => {
    if (!files?.length) return;
    setExtracting(true);
    try {
      for (const file of Array.from(files)) {
        if (file.size > 20 * 1024 * 1024) {
          toast.error(`${file.name} is over 20MB`);
          continue;
        }
        try {
          const src = await extractFile(file, kind);
          setSources((prev) => [...prev, src]);
        } catch (e: any) {
          toast.error(e?.message ?? `Failed to read ${file.name}`);
        }
      }
    } finally {
      setExtracting(false);
    }
  };

  const removeSource = (idx: number) => setSources((prev) => prev.filter((_, i) => i !== idx));

  const runPrefill = async () => {
    const docs = [...sources];
    if (intakeNotes.trim()) {
      docs.push({ name: 'User notes', kind: 'NOTES', text: intakeNotes.trim(), size: intakeNotes.length });
    }
    if (!docs.length) {
      toast.error('Add at least one document or paste notes first');
      return;
    }
    setPrefilling(true);
    try {
      const { data: res, error } = await supabase.functions.invoke('prefill-rfp', {
        body: {
          mode: data.mode,
          industry: data.industry,
          title: data.title,
          docs: docs.map((d) => ({ name: d.name, kind: d.kind, text: d.text })),
        },
      });
      if (error) throw error;
      if ((res as any)?.error) throw new Error((res as any).error);
      const p = (res as any).prefill ?? {};
      setData((d) => ({
        ...d,
        title: d.title || p.suggested_title || '',
        organization: p.organization ?? d.organization,
        background: p.background ?? d.background,
        objectives: p.objectives ?? d.objectives,
        in_scope: p.in_scope ?? d.in_scope,
        out_of_scope: p.out_of_scope ?? d.out_of_scope,
        deliverables: p.deliverables ?? d.deliverables,
        functional: p.functional ?? d.functional,
        technical: p.technical ?? d.technical,
        integrations: p.integrations ?? d.integrations,
        security: p.security ?? d.security,
        sla: p.sla ?? d.sla,
        budget: p.budget ?? d.budget,
        pricing_model: p.pricing_model ?? d.pricing_model,
        evaluation_focus: p.evaluation_focus ?? d.evaluation_focus,
        notes: [d.notes, p.notes].filter(Boolean).join('\n\n'),
      }));
      setExtractedQuestions(Array.isArray(p.extracted_questions) ? p.extracted_questions : []);
      setSourceSummary(p.source_summary ?? '');
      toast.success('Wizard pre-filled — review each step before generating');
      setStep(1);
    } catch (e: any) {
      toast.error(e?.message ?? 'Prefill failed');
    } finally {
      setPrefilling(false);
    }
  };

  const handleSubmit = async () => {
    if (!user) return;
    if (!data.title.trim()) {
      toast.error('Title is required');
      setStep(1);
      return;
    }
    setSubmitting(true);
    try {
      // Save row — include extracted questions in inputs so the generator can use them
      const inputs: Record<string, any> = { ...data };
      if (extractedQuestions.length) inputs.extracted_questions = extractedQuestions;
      if (sourceSummary) inputs.source_summary = sourceSummary;

      const { data: inserted, error: insErr } = await supabase
        .from('rfps')
        .insert([{
          user_id: user.id,
          mode: data.mode,
          industry: data.industry,
          title: data.title.trim(),
          inputs: inputs as any,
          status: 'DRAFT',
        }])
        .select('id')
        .single();
      if (insErr) throw insErr;
      const rfpId = (inserted as any).id as string;

      toast.info('Generating RFP… this can take 20–30 seconds');

      // Generate
      const { data: genData, error: genErr } = await supabase.functions.invoke('generate-rfp', {
        body: { rfpId },
      });
      if (genErr) throw genErr;
      if ((genData as any)?.error) throw new Error((genData as any).error);

      toast.success('RFP generated');
      onCreated(rfpId);
      reset();
    } catch (e: any) {
      toast.error(e?.message ?? 'Failed to generate RFP');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>New RFP</DialogTitle>
          <DialogDescription>
            Step {step + 1} of {STEPS.length} · {STEPS[step]}
          </DialogDescription>
        </DialogHeader>

        <div className="mb-2 flex gap-1">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={cn(
                'h-1 flex-1 rounded-full',
                i <= step ? 'bg-brand' : 'bg-muted',
              )}
            />
          ))}
        </div>

        {step === 0 && (
          <StepIntake
            mode={data.mode}
            industry={data.industry}
            sources={sources}
            notes={intakeNotes}
            extracting={extracting}
            prefilling={prefilling}
            onModeChange={(v) => update('mode', v)}
            onIndustryChange={(v) => update('industry', v)}
            onAddFiles={addFiles}
            onRemoveSource={removeSource}
            onNotesChange={setIntakeNotes}
            onPrefill={runPrefill}
            extractedQuestions={extractedQuestions}
            sourceSummary={sourceSummary}
          />
        )}
        {step === 1 && <StepBasics data={data} update={update} />}
        {step === 2 && <StepScope data={data} update={update} />}
        {step === 3 && <StepRequirements data={data} update={update} />}
        {step === 4 && <StepCostTimeline data={data} update={update} />}
        {step === 5 && <StepEvaluation data={data} update={update} />}

        <DialogFooter className="mt-4 gap-2 sm:gap-2">
          <Button
            variant="outline"
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            disabled={step === 0 || submitting}
          >
            <ArrowLeft className="mr-1 h-4 w-4" /> Back
          </Button>
          {step < STEPS.length - 1 ? (
            <Button onClick={() => setStep((s) => s + 1)} disabled={!canAdvance() || submitting}>
              {step === 0 ? 'Skip & fill manually' : 'Next'} <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={submitting}>
              {submitting ? (
                <Loader2 className="mr-1 h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="mr-1 h-4 w-4" />
              )}
              Generate RFP
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

type StepProps = { data: WizardData; update: <K extends keyof WizardData>(k: K, v: WizardData[K]) => void };

function StepIntake({
  mode,
  industry,
  sources,
  notes,
  extracting,
  prefilling,
  onModeChange,
  onIndustryChange,
  onAddFiles,
  onRemoveSource,
  onNotesChange,
  onPrefill,
  extractedQuestions,
  sourceSummary,
}: {
  mode: Mode;
  industry: Industry;
  sources: ExtractedSource[];
  notes: string;
  extracting: boolean;
  prefilling: boolean;
  onModeChange: (v: Mode) => void;
  onIndustryChange: (v: Industry) => void;
  onAddFiles: (files: FileList | null, kind: SourceKind) => Promise<void>;
  onRemoveSource: (idx: number) => void;
  onNotesChange: (v: string) => void;
  onPrefill: () => void;
  extractedQuestions: { category: string; question: string }[];
  sourceSummary: string;
}) {
  const companyDocs = sources.filter((s) => s.kind === 'COMPANY');
  const inboundRfps = sources.filter((s) => s.kind === 'INBOUND_RFP');

  return (
    <div className="space-y-5">
      <div className="rounded-md border border-dashed border-border bg-muted/30 p-3 text-xs text-muted-foreground">
        <Sparkles className="mr-1 inline h-3.5 w-3.5 text-brand" />
        Upload company docs and (for vendor responses) the inbound RFP. AI will read them, extract requirements, and draft every wizard field. Files are parsed in your browser — only the extracted text is sent to the AI, then discarded.
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label>Mode</Label>
          <Select value={mode} onValueChange={(v) => onModeChange(v as Mode)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="BUYER">Buyer issuing RFP</SelectItem>
              <SelectItem value="VENDOR_RESPONSE">Vendor response</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>Industry</Label>
          <Select value={industry} onValueChange={(v) => onIndustryChange(v as Industry)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="IT">IT services & infrastructure</SelectItem>
              <SelectItem value="SOFTWARE">Software / SaaS</SelectItem>
              <SelectItem value="AI">AI / ML</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <UploadGroup
        title="Company docs"
        hint="Capabilities deck, past proposals, case studies, product overviews. PDF, DOCX, TXT, MD."
        kind="COMPANY"
        files={companyDocs}
        onAdd={onAddFiles}
        onRemove={(name) => onRemoveSource(sources.findIndex((s) => s.name === name && s.kind === 'COMPANY'))}
        disabled={extracting || prefilling}
      />

      {mode === 'VENDOR_RESPONSE' && (
        <UploadGroup
          title="Inbound RFP"
          hint="The RFP document you received from the prospect."
          kind="INBOUND_RFP"
          files={inboundRfps}
          onAdd={onAddFiles}
          onRemove={(name) => onRemoveSource(sources.findIndex((s) => s.name === name && s.kind === 'INBOUND_RFP'))}
          disabled={extracting || prefilling}
        />
      )}

      <div className="space-y-1.5">
        <Label>Plain notes (optional)</Label>
        <Textarea
          rows={4}
          placeholder="Paste anything else: meeting notes, pricing constraints, deal-breakers…"
          value={notes}
          onChange={(e) => onNotesChange(e.target.value)}
          disabled={prefilling}
        />
      </div>

      {sourceSummary && (
        <div className="rounded-md border border-border bg-card p-3 text-xs">
          <div className="mb-1 font-medium text-foreground">Source summary</div>
          <p className="text-muted-foreground">{sourceSummary}</p>
        </div>
      )}

      {extractedQuestions.length > 0 && (
        <div className="rounded-md border border-border bg-card p-3 text-xs">
          <div className="mb-1.5 font-medium text-foreground">
            {extractedQuestions.length} questions extracted from inbound RFP
          </div>
          <ul className="ml-4 list-disc space-y-0.5 text-muted-foreground">
            {extractedQuestions.slice(0, 5).map((q, i) => (
              <li key={i}><span className="font-medium">{q.category}:</span> {q.question}</li>
            ))}
            {extractedQuestions.length > 5 && (
              <li className="list-none italic">+ {extractedQuestions.length - 5} more, used during generation</li>
            )}
          </ul>
        </div>
      )}

      <Button
        onClick={onPrefill}
        disabled={extracting || prefilling || (sources.length === 0 && !notes.trim())}
        className="w-full"
      >
        {prefilling ? (
          <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
        ) : (
          <Sparkles className="mr-1.5 h-4 w-4" />
        )}
        {prefilling ? 'Reading sources…' : 'AI-fill the wizard from these sources'}
      </Button>
    </div>
  );
}

function UploadGroup({
  title,
  hint,
  kind,
  files,
  onAdd,
  onRemove,
  disabled,
}: {
  title: string;
  hint: string;
  kind: SourceKind;
  files: ExtractedSource[];
  onAdd: (files: FileList | null, kind: SourceKind) => Promise<void>;
  onRemove: (name: string) => void;
  disabled: boolean;
}) {
  const inputId = `upload-${kind}`;
  return (
    <div className="space-y-1.5">
      <Label>{title}</Label>
      <p className="text-xs text-muted-foreground">{hint}</p>
      <label
        htmlFor={inputId}
        className={cn(
          'flex cursor-pointer items-center justify-center gap-2 rounded-md border border-dashed border-border bg-muted/20 p-3 text-sm transition hover:bg-muted/40',
          disabled && 'pointer-events-none opacity-50',
        )}
      >
        <Upload className="h-4 w-4 text-muted-foreground" />
        <span className="text-muted-foreground">Click to add files</span>
        <input
          id={inputId}
          type="file"
          multiple
          accept=".pdf,.docx,.txt,.md,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain,text/markdown"
          className="hidden"
          onChange={(e) => {
            onAdd(e.target.files, kind);
            e.target.value = '';
          }}
          disabled={disabled}
        />
      </label>
      {files.length > 0 && (
        <ul className="space-y-1">
          {files.map((f) => (
            <li
              key={f.name}
              className="flex items-center justify-between rounded border border-border bg-card px-2 py-1.5 text-xs"
            >
              <span className="flex min-w-0 items-center gap-1.5">
                <FileText className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                <span className="truncate">{f.name}</span>
                <span className="shrink-0 text-muted-foreground">· {(f.size / 1000).toFixed(1)}k chars</span>
              </span>
              <button
                type="button"
                onClick={() => onRemove(f.name)}
                className="ml-2 text-muted-foreground hover:text-foreground"
                aria-label={`Remove ${f.name}`}
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function StepBasics({ data, update }: StepProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label>RFP title *</Label>
        <Input
          placeholder="e.g. Enterprise CRM platform 2025"
          value={data.title}
          onChange={(e) => update('title', e.target.value)}
        />
      </div>
      <div className="space-y-1.5">
        <Label>Organization / company name</Label>
        <Input
          placeholder="The buyer (or vendor) organization"
          value={data.organization}
          onChange={(e) => update('organization', e.target.value)}
        />
      </div>
      <div className="space-y-1.5">
        <Label>Background</Label>
        <Textarea
          rows={4}
          placeholder="Brief background: what the org does, current state, pain points driving this RFP."
          value={data.background}
          onChange={(e) => update('background', e.target.value)}
        />
      </div>
      <div className="space-y-1.5">
        <Label>Objectives (one per line)</Label>
        <Textarea
          rows={4}
          placeholder={'Reduce time to onboard new customers by 50%\nConsolidate 3 legacy systems into 1'}
          value={data.objectives}
          onChange={(e) => update('objectives', e.target.value)}
        />
      </div>
    </div>
  );
}

function StepScope({ data, update }: StepProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label>In scope (one per line)</Label>
        <Textarea rows={4} value={data.in_scope} onChange={(e) => update('in_scope', e.target.value)} />
      </div>
      <div className="space-y-1.5">
        <Label>Out of scope (one per line)</Label>
        <Textarea rows={3} value={data.out_of_scope} onChange={(e) => update('out_of_scope', e.target.value)} />
      </div>
      <div className="space-y-1.5">
        <Label>Key deliverables (one per line)</Label>
        <Textarea rows={4} value={data.deliverables} onChange={(e) => update('deliverables', e.target.value)} />
      </div>
    </div>
  );
}

function StepRequirements({ data, update }: StepProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label>Functional requirements (one per line)</Label>
        <Textarea rows={4} value={data.functional} onChange={(e) => update('functional', e.target.value)} />
      </div>
      <div className="space-y-1.5">
        <Label>Technical requirements (one per line)</Label>
        <Textarea rows={3} value={data.technical} onChange={(e) => update('technical', e.target.value)} />
      </div>
      <div className="space-y-1.5">
        <Label>Required integrations</Label>
        <Textarea rows={2} placeholder="e.g. Salesforce, Slack, Snowflake" value={data.integrations} onChange={(e) => update('integrations', e.target.value)} />
      </div>
      <div className="space-y-1.5">
        <Label>Security & compliance</Label>
        <Textarea rows={2} placeholder="SOC 2 Type II, GDPR, HIPAA, etc." value={data.security} onChange={(e) => update('security', e.target.value)} />
      </div>
      <div className="space-y-1.5">
        <Label>SLA expectations</Label>
        <Textarea rows={2} placeholder="99.9% uptime, P1 response < 1h" value={data.sla} onChange={(e) => update('sla', e.target.value)} />
      </div>
    </div>
  );
}

function StepCostTimeline({ data, update }: StepProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label>Budget range</Label>
          <Input placeholder="$100k–$250k" value={data.budget} onChange={(e) => update('budget', e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label>Preferred pricing model</Label>
          <Input placeholder="Fixed / T&M / Subscription" value={data.pricing_model} onChange={(e) => update('pricing_model', e.target.value)} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label>Target start date</Label>
          <Input type="date" value={data.start_date} onChange={(e) => update('start_date', e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label>Target go-live</Label>
          <Input type="date" value={data.go_live} onChange={(e) => update('go_live', e.target.value)} />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label>Submission deadline</Label>
        <Input type="date" value={data.submission_deadline} onChange={(e) => update('submission_deadline', e.target.value)} />
      </div>
    </div>
  );
}

function StepEvaluation({ data, update }: StepProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label>Evaluation focus areas</Label>
        <Textarea rows={3} placeholder="What matters most: cost, technical fit, team experience, references, security…" value={data.evaluation_focus} onChange={(e) => update('evaluation_focus', e.target.value)} />
      </div>
      <div className="space-y-1.5">
        <Label>Primary contact (email)</Label>
        <Input type="email" placeholder="rfp@company.com" value={data.contact_email} onChange={(e) => update('contact_email', e.target.value)} />
      </div>
      <div className="space-y-1.5">
        <Label>Anything else for the AI</Label>
        <Textarea rows={3} placeholder="Special constraints, must-haves, deal-breakers…" value={data.notes} onChange={(e) => update('notes', e.target.value)} />
      </div>
    </div>
  );
}

// Detail view --------------------------------------------------------------

function RfpDetail({ rfp, onBack, onDelete }: { rfp: RfpRow; onBack: () => void; onDelete: () => void }) {
  const [regenerating, setRegenerating] = useState(false);
  const qc = useQueryClient();

  const regenerate = async () => {
    setRegenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-rfp', {
        body: { rfpId: rfp.id },
      });
      if (error) throw error;
      if ((data as any)?.error) throw new Error((data as any).error);
      toast.success('RFP regenerated');
      qc.invalidateQueries({ queryKey: ['rfps'] });
    } catch (e: any) {
      toast.error(e?.message ?? 'Failed to regenerate');
    } finally {
      setRegenerating(false);
    }
  };

  const handleDocx = async () => {
    if (!rfp.content) return;
    try {
      const blob = await exportRfpDocx(rfp.title, rfp.content);
      downloadBlob(blob, `${slug(rfp.title)}.docx`);
    } catch (e: any) {
      toast.error('DOCX export failed: ' + (e?.message ?? 'unknown error'));
    }
  };

  const handlePdf = () => {
    if (!rfp.content) return;
    try {
      const blob = exportRfpPdf(rfp.title, rfp.content);
      downloadBlob(blob, `${slug(rfp.title)}.pdf`);
    } catch (e: any) {
      toast.error('PDF export failed: ' + (e?.message ?? 'unknown error'));
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-4 md:p-8">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ChevronLeft className="mr-1 h-4 w-4" />
          Back
        </Button>
      </div>

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="mb-1 flex items-center gap-2">
            <Badge variant="secondary" className="text-[10px]">{rfp.industry}</Badge>
            <Badge variant="outline" className="text-[10px]">
              {rfp.mode === 'BUYER' ? 'Buyer issuing RFP' : 'Vendor response'}
            </Badge>
          </div>
          <h1 className="text-2xl font-semibold">{rfp.title}</h1>
          {rfp.generated_at && (
            <p className="text-xs text-muted-foreground">
              Generated {formatDistanceToNow(new Date(rfp.generated_at), { addSuffix: true })}
            </p>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={regenerate} disabled={regenerating}>
            {regenerating ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <Sparkles className="mr-1 h-4 w-4" />}
            Regenerate
          </Button>
          <Button variant="outline" size="sm" onClick={handleDocx} disabled={!rfp.content}>
            <Download className="mr-1 h-4 w-4" /> .docx
          </Button>
          <Button variant="outline" size="sm" onClick={handlePdf} disabled={!rfp.content}>
            <Download className="mr-1 h-4 w-4" /> .pdf
          </Button>
          <Button variant="outline" size="sm" onClick={onDelete}>
            <Trash2 className="mr-1 h-4 w-4 text-destructive" />
          </Button>
        </div>
      </div>

      {!rfp.content ? (
        <div className="rounded-lg border border-dashed border-border bg-card/50 p-10 text-center">
          {regenerating ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Generating RFP…</p>
            </div>
          ) : (
            <>
              <p className="mb-3 text-sm text-muted-foreground">No content yet.</p>
              <Button size="sm" onClick={regenerate}>
                <Sparkles className="mr-1 h-4 w-4" /> Generate now
              </Button>
            </>
          )}
        </div>
      ) : (
        <RfpContentView content={rfp.content} />
      )}
    </div>
  );
}

function RfpContentView({ content }: { content: RfpContent }) {
  return (
    <article className="space-y-8 rounded-lg border border-border bg-card p-6 md:p-8">
      <Section title="1. Executive summary">
        <p className="whitespace-pre-wrap text-sm leading-relaxed">{content.executive_summary}</p>
      </Section>

      <Section title="2. Background">
        <p className="whitespace-pre-wrap text-sm leading-relaxed">{content.background}</p>
      </Section>

      <Section title="3. Objectives">
        <Bullets items={content.objectives} />
      </Section>

      <Section title="4. Scope of work">
        <SubSection title="In scope"><Bullets items={content.scope_of_work.in_scope} /></SubSection>
        <SubSection title="Out of scope"><Bullets items={content.scope_of_work.out_of_scope} /></SubSection>
        <SubSection title="Deliverables"><Bullets items={content.scope_of_work.deliverables} /></SubSection>
      </Section>

      <Section title="5. Requirements">
        <SubSection title="Functional"><Bullets items={content.requirements.functional} /></SubSection>
        <SubSection title="Technical"><Bullets items={content.requirements.technical} /></SubSection>
        {!!content.requirements.integrations?.length && (
          <SubSection title="Integrations"><Bullets items={content.requirements.integrations} /></SubSection>
        )}
        <SubSection title="Security & compliance"><Bullets items={content.requirements.security_compliance} /></SubSection>
        <SubSection title="SLA"><Bullets items={content.requirements.sla} /></SubSection>
      </Section>

      <Section title="6. Cost">
        <p className="text-sm"><span className="font-medium">Pricing model:</span> {content.cost.pricing_model}</p>
        <p className="text-sm"><span className="font-medium">Budget range:</span> {content.cost.budget_range}</p>
        <p className="text-sm"><span className="font-medium">Payment terms:</span> {content.cost.payment_terms}</p>
        <SubSection title="Cost breakdown">
          <div className="overflow-x-auto rounded border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-3 py-2 text-left font-medium">Line item</th>
                  <th className="px-3 py-2 text-left font-medium">Description</th>
                  <th className="px-3 py-2 text-right font-medium">Estimated cost</th>
                </tr>
              </thead>
              <tbody>
                {content.cost.cost_breakdown.map((row, i) => (
                  <tr key={i} className="border-t border-border">
                    <td className="px-3 py-2 font-medium">{row.line_item}</td>
                    <td className="px-3 py-2 text-muted-foreground">{row.description}</td>
                    <td className="px-3 py-2 text-right">{row.estimated_cost}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SubSection>
      </Section>

      <Section title="7. Timeline">
        <p className="text-sm"><span className="font-medium">Submission deadline:</span> {content.timeline.submission_deadline}</p>
        <p className="text-sm"><span className="font-medium">Decision date:</span> {content.timeline.decision_date}</p>
        <SubSection title="Milestones">
          <ul className="space-y-2">
            {content.timeline.milestones.map((m, i) => (
              <li key={i} className="rounded border border-border p-3">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <span className="font-medium text-sm">{m.name}</span>
                  <span className="text-xs text-muted-foreground">{m.target_date}</span>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{m.description}</p>
              </li>
            ))}
          </ul>
        </SubSection>
      </Section>

      <Section title="8. Vendor questions">
        {Array.from(groupBy(content.vendor_questions, (q) => q.category)).map(([cat, qs]) => (
          <SubSection key={cat} title={cat}>
            <Bullets items={qs.map((q) => q.question)} />
          </SubSection>
        ))}
      </Section>

      <Section title="9. Evaluation criteria">
        <div className="overflow-x-auto rounded border border-border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-3 py-2 text-left font-medium">Criterion</th>
                <th className="px-3 py-2 text-left font-medium">Weight</th>
                <th className="px-3 py-2 text-left font-medium">Notes</th>
              </tr>
            </thead>
            <tbody>
              {content.evaluation_criteria.map((c, i) => (
                <tr key={i} className="border-t border-border">
                  <td className="px-3 py-2 font-medium">{c.criterion}</td>
                  <td className="px-3 py-2">{c.weight_pct}%</td>
                  <td className="px-3 py-2 text-muted-foreground">{c.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section title="10. Submission process">
        <SubSection title="Response format"><p className="text-sm">{content.submission_process.response_format}</p></SubSection>
        <SubSection title="Contact"><p className="text-sm">{content.submission_process.contact}</p></SubSection>
        <SubSection title="Questions deadline"><p className="text-sm">{content.submission_process.questions_deadline}</p></SubSection>
        <SubSection title="Additional instructions"><p className="text-sm">{content.submission_process.additional_instructions}</p></SubSection>
      </Section>

      <Section title="11. Assumptions & constraints">
        <Bullets items={content.assumptions_and_constraints} />
      </Section>
    </article>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="border-b border-border pb-1.5 text-lg font-semibold">{title}</h2>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

function SubSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
      {children}
    </div>
  );
}

function Bullets({ items }: { items: string[] }) {
  return (
    <ul className="ml-5 list-disc space-y-1 text-sm">
      {items.map((it, i) => (
        <li key={i}>{it}</li>
      ))}
    </ul>
  );
}

function groupBy<T, K>(arr: T[], keyFn: (t: T) => K) {
  const m = new Map<K, T[]>();
  arr.forEach((it) => {
    const k = keyFn(it);
    if (!m.has(k)) m.set(k, []);
    m.get(k)!.push(it);
  });
  return m;
}

function slug(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 60) || 'rfp';
}
