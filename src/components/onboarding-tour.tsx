import { useEffect, useState, useRef, useLayoutEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { X, ArrowRight, Check, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type Step = {
  id: string;
  anchor: string; // data-tour attribute value
  title: string;
  body: string;
  cta?: { label: string; to?: string };
};

const STEPS: Step[] = [
  {
    id: 'feed',
    anchor: 'nav-dashboard',
    title: '1. Your Signal Feed',
    body: 'This is mission control. Every buying signal we surface — funding rounds, key hires, tech expansions — lands here in real time. Filter by type and confidence to focus on what matters.',
  },
  {
    id: 'accounts',
    anchor: 'nav-accounts',
    title: '2. Track target accounts',
    body: 'Add companies you care about. We monitor them 24/7 and generate AI research briefs so you walk into every conversation prepared.',
    cta: { label: 'Open Accounts', to: '/accounts' },
  },
  {
    id: 'contacts',
    anchor: 'nav-contacts',
    title: '3. Find the right people',
    body: 'Reveal verified emails and direct dials for decision-makers tied to each signal. Export to CSV or push straight to your CRM.',
    cta: { label: 'Open Contacts', to: '/contacts' },
  },
  {
    id: 'outreach',
    anchor: 'nav-outreach',
    title: '4. Send your first outreach',
    body: 'Generate personalized emails and multi-step sequences from any signal. Edit, approve, and ship — your AI agent drafts in seconds.',
    cta: { label: 'Open Outreach', to: '/outreach' },
  },
  {
    id: 'territory',
    anchor: 'nav-territory',
    title: '5. Define your territory',
    body: 'Tell the Signal Agent your ICP — industries, geographies, deal size, and signal types — so the feed only shows what you can actually close.',
    cta: { label: 'Configure Territory', to: '/territory' },
  },
];

const STORAGE_KEY = 'rexxon.onboarding.v1';

type Status = { completed: string[]; dismissed: boolean; welcomed: boolean };

function loadStatus(): Status {
  if (typeof window === 'undefined') return { completed: [], dismissed: false, welcomed: false };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { completed: [], dismissed: false, welcomed: false };
    const parsed = JSON.parse(raw);
    return { welcomed: false, ...parsed };
  } catch {
    return { completed: [], dismissed: false, welcomed: false };
  }
}

function saveStatus(s: Status) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
}

export function OnboardingTour() {
  const [status, setStatus] = useState<Status>({ completed: [], dismissed: false, welcomed: false });
  const [activeIdx, setActiveIdx] = useState<number | null>(null);
  const [showWelcome, setShowWelcome] = useState(false);
  const [mounted, setMounted] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setMounted(true);
    const s = loadStatus();
    setStatus(s);
    if (!s.welcomed && !s.dismissed) {
      // small delay so layout settles
      const t = setTimeout(() => setShowWelcome(true), 400);
      return () => clearTimeout(t);
    }
  }, []);

  if (!mounted || status.dismissed) return null;

  const allDone = STEPS.every((s) => status.completed.includes(s.id));
  if (allDone && !showWelcome) return null;

  const startTour = () => {
    const next = { ...status, welcomed: true };
    setStatus(next);
    saveStatus(next);
    setShowWelcome(false);
    setActiveIdx(0);
  };

  const skipWelcome = () => {
    const next = { ...status, welcomed: true };
    setStatus(next);
    saveStatus(next);
    setShowWelcome(false);
  };

  const dismiss = () => {
    const next = { ...status, dismissed: true };
    setStatus(next);
    saveStatus(next);
    setActiveIdx(null);
  };

  const completeStep = (id: string) => {
    const next = {
      ...status,
      completed: status.completed.includes(id) ? status.completed : [...status.completed, id],
    };
    setStatus(next);
    saveStatus(next);
  };

  const handleNext = () => {
    if (activeIdx === null) return;
    const step = STEPS[activeIdx];
    completeStep(step.id);
    const nextIdx = activeIdx + 1;
    if (nextIdx >= STEPS.length) {
      setActiveIdx(null);
      return;
    }
    setActiveIdx(nextIdx);
  };

  const completedCount = status.completed.length;

  return (
    <>
      {/* Welcome modal */}
      {showWelcome && (
        <WelcomeModal onStart={startTour} onSkip={skipWelcome} totalSteps={STEPS.length} />
      )}

      {/* Pulsing dots on nav items */}
      {STEPS.map((step, idx) => (
        <PulseDot
          key={step.id}
          anchorId={step.anchor}
          done={status.completed.includes(step.id)}
          stepNumber={idx + 1}
          onClick={() => setActiveIdx(idx)}
        />
      ))}

      {/* Active popover */}
      {activeIdx !== null && (
        <TourPopover
          key={STEPS[activeIdx].id}
          step={STEPS[activeIdx]}
          stepIdx={activeIdx}
          total={STEPS.length}
          onClose={() => setActiveIdx(null)}
          onNext={handleNext}
          onCta={() => {
            const step = STEPS[activeIdx];
            completeStep(step.id);
            if (step.cta?.to) {
              navigate({ to: step.cta.to as any });
            }
            setActiveIdx(null);
          }}
        />
      )}

      {/* Floating progress chip */}
      {activeIdx === null && (
        <button
          onClick={() => {
            const firstIncomplete = STEPS.findIndex((s) => !status.completed.includes(s.id));
            setActiveIdx(firstIncomplete === -1 ? 0 : firstIncomplete);
          }}
          className="fixed bottom-5 right-5 z-40 flex items-center gap-2.5 rounded-full border border-border bg-card/95 px-4 py-2.5 text-xs font-medium shadow-lg backdrop-blur transition-all hover:scale-105 hover:border-brand/50"
        >
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-brand" />
          </span>
          <Sparkles className="h-3.5 w-3.5 text-brand" />
          Get started · {completedCount}/{STEPS.length}
          <button
            onClick={(e) => {
              e.stopPropagation();
              dismiss();
            }}
            className="ml-1 rounded-full p-0.5 text-muted-foreground hover:bg-muted hover:text-foreground"
            aria-label="Dismiss tour"
          >
            <X className="h-3 w-3" />
          </button>
        </button>
      )}
    </>
  );
}

function PulseDot({
  anchorId,
  done,
  stepNumber,
  onClick,
}: {
  anchorId: string;
  done: boolean;
  stepNumber: number;
  onClick: () => void;
}) {
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);

  useLayoutEffect(() => {
    const update = () => {
      const el = document.querySelector(`[data-tour="${anchorId}"]`) as HTMLElement | null;
      if (!el) {
        setPos(null);
        return;
      }
      const r = el.getBoundingClientRect();
      setPos({ top: r.top + r.height / 2, left: r.right - 8 });
    };
    update();
    const ro = new ResizeObserver(update);
    document.querySelectorAll(`[data-tour="${anchorId}"]`).forEach((n) => ro.observe(n));
    window.addEventListener('resize', update);
    window.addEventListener('scroll', update, true);
    const interval = setInterval(update, 1000);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', update);
      window.removeEventListener('scroll', update, true);
      clearInterval(interval);
    };
  }, [anchorId]);

  if (!pos) return null;

  return (
    <button
      onClick={onClick}
      className="fixed z-30 -translate-x-1/2 -translate-y-1/2"
      style={{ top: pos.top, left: pos.left }}
      aria-label={`Onboarding step ${stepNumber}`}
    >
      {done ? (
        <span className="flex h-4 w-4 items-center justify-center rounded-full bg-brand text-brand-foreground shadow-md ring-2 ring-background">
          <Check className="h-2.5 w-2.5" strokeWidth={3} />
        </span>
      ) : (
        <span className="relative flex h-3 w-3">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand opacity-75" />
          <span className="relative inline-flex h-3 w-3 rounded-full bg-brand ring-2 ring-background" />
        </span>
      )}
    </button>
  );
}

function TourPopover({
  step,
  stepIdx,
  total,
  onClose,
  onNext,
  onCta,
}: {
  step: Step;
  stepIdx: number;
  total: number;
  onClose: () => void;
  onNext: () => void;
  onCta: () => void;
}) {
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  const [ready, setReady] = useState(false);
  const popRef = useRef<HTMLDivElement>(null);

  // Scroll the anchor into view when the step changes, then mark ready.
  useEffect(() => {
    setReady(false);
    setPos(null);
    const el = document.querySelector(`[data-tour="${step.anchor}"]`) as HTMLElement | null;
    if (!el) {
      // Anchor may not be mounted yet — retry briefly.
      const retry = setTimeout(() => setReady(true), 250);
      return () => clearTimeout(retry);
    }

    const rect = el.getBoundingClientRect();
    const inView =
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= window.innerHeight &&
      rect.right <= window.innerWidth;

    if (inView) {
      setReady(true);
      return;
    }

    el.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });

    // Wait for smooth scroll to settle before showing the popover.
    let stableFrames = 0;
    let lastTop = el.getBoundingClientRect().top;
    let raf = 0;
    const tick = () => {
      const t = el.getBoundingClientRect().top;
      if (Math.abs(t - lastTop) < 0.5) {
        stableFrames += 1;
      } else {
        stableFrames = 0;
        lastTop = t;
      }
      if (stableFrames > 4) {
        setReady(true);
        return;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    // Hard fallback in case scroll never settles.
    const fallback = setTimeout(() => setReady(true), 800);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(fallback);
    };
  }, [step.anchor]);

  useLayoutEffect(() => {
    if (!ready) return;
    const update = () => {
      const el = document.querySelector(`[data-tour="${step.anchor}"]`) as HTMLElement | null;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const popW = 340;
      let left = r.right + 16;
      let top = r.top;
      if (left + popW > window.innerWidth - 16) {
        left = Math.max(16, r.left - popW - 16);
      }
      top = Math.max(16, Math.min(top, window.innerHeight - 240));
      setPos({ top, left });
    };
    update();
    window.addEventListener('resize', update);
    window.addEventListener('scroll', update, true);
    return () => {
      window.removeEventListener('resize', update);
      window.removeEventListener('scroll', update, true);
    };
  }, [step.anchor, ready]);

  if (!pos) return null;

  const isLast = stepIdx === total - 1;

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-background/40 backdrop-blur-[2px] animate-in fade-in"
        onClick={onClose}
      />
      <div
        ref={popRef}
        className="fixed z-50 w-[340px] animate-in fade-in zoom-in-95 rounded-xl border border-border bg-card p-5 shadow-2xl"
        style={{ top: pos.top, left: pos.left }}
      >
        <button
          onClick={onClose}
          className="absolute right-3 top-3 rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
          aria-label="Close"
        >
          <X className="h-3.5 w-3.5" />
        </button>

        <div className="mb-2 flex items-center gap-1.5">
          {Array.from({ length: total }).map((_, i) => (
            <span
              key={i}
              className={cn(
                'h-1 flex-1 rounded-full transition-colors',
                i <= stepIdx ? 'bg-brand' : 'bg-muted'
              )}
            />
          ))}
        </div>

        <div className="mb-1 text-[10px] font-mono uppercase tracking-wider text-brand">
          Step {stepIdx + 1} of {total}
        </div>
        <h3 className="text-base font-semibold">{step.title}</h3>
        <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{step.body}</p>

        <div className="mt-4 flex items-center justify-between gap-2">
          <button
            onClick={onClose}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            Skip tour
          </button>
          <div className="flex gap-2">
            {step.cta && (
              <Button size="sm" variant="outline" onClick={onCta}>
                {step.cta.label}
              </Button>
            )}
            <Button size="sm" onClick={onNext}>
              {isLast ? 'Finish' : 'Next'}
              {!isLast && <ArrowRight className="ml-1 h-3 w-3" />}
              {isLast && <Check className="ml-1 h-3 w-3" />}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}

function WelcomeModal({
  onStart,
  onSkip,
  totalSteps,
}: {
  onStart: () => void;
  onSkip: () => void;
  totalSteps: number;
}) {
  return (
    <>
      <div
        className="fixed inset-0 z-[60] bg-background/70 backdrop-blur-sm animate-in fade-in"
        onClick={onSkip}
      />
      <div
        role="dialog"
        aria-modal="true"
        className="fixed left-1/2 top-1/2 z-[70] w-[92vw] max-w-md -translate-x-1/2 -translate-y-1/2 animate-in fade-in zoom-in-95 rounded-2xl border border-border bg-card p-7 shadow-2xl"
      >
        <button
          onClick={onSkip}
          className="absolute right-3 top-3 rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-brand/15 text-brand ring-1 ring-brand/30">
          <Sparkles className="h-5 w-5" />
        </div>

        <h2 className="text-xl font-semibold">Welcome to Rexxon AI</h2>
        <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
          Your AI-powered sales intelligence platform. Let's take a quick {totalSteps}-step tour so
          you know exactly where to find your signals, accounts, contacts, and outreach tools.
        </p>

        <ul className="mt-4 space-y-2 text-sm">
          {[
            'Spot real-time buying signals',
            'Track target accounts on autopilot',
            'Reach decision-makers in seconds',
          ].map((item) => (
            <li key={item} className="flex items-center gap-2">
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-brand/15 text-brand">
                <Check className="h-2.5 w-2.5" strokeWidth={3} />
              </span>
              <span className="text-muted-foreground">{item}</span>
            </li>
          ))}
        </ul>

        <div className="mt-6 flex items-center justify-between gap-3">
          <button
            onClick={onSkip}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            Skip for now
          </button>
          <Button onClick={onStart} className="bg-brand text-brand-foreground hover:opacity-90">
            Show me around
            <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </>
  );
}
