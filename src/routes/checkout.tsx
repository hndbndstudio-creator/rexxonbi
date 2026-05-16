import { createFileRoute, Link, useRouter, useSearch } from '@tanstack/react-router';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import {
  ArrowLeft,
  Check,
  CreditCard,
  Lock,
  ShieldCheck,
  Sparkles,
  Star,
} from 'lucide-react';
import { RexxonLogo } from '@/components/rexxon-logo';
import testimonial1 from '@/assets/testimonial-1.jpg';

type PlanId = 'starter' | 'pro' | 'team';

const PLANS: Record<PlanId, { name: string; price: number; accounts: string; seats: string; features: string[] }> = {
  starter: {
    name: 'Starter',
    price: 99,
    accounts: '75 accounts',
    seats: '1 user',
    features: ['Real-time signal feed', 'AI outreach drafts', 'Verified contacts', 'Slack alerts'],
  },
  pro: {
    name: 'Pro',
    price: 279,
    accounts: '250 accounts',
    seats: '3 users',
    features: ['Everything in Starter', 'Knowledge base (500 docs)', 'CRM push (Salesforce, HubSpot)', 'Outreach.io / Salesloft', 'Custom signal weighting', 'Priority support'],
  },
  team: {
    name: 'Team',
    price: 879,
    accounts: '750 accounts',
    seats: '10 users',
    features: ['Everything in Pro', 'Knowledge base (unlimited)', 'Territory routing', 'Win/loss feedback loop', 'Dedicated CSM', 'SAML SSO'],
  },
};

export const Route = createFileRoute('/checkout')({
  head: () => ({
    meta: [
      { title: 'Checkout — Rexxon AI' },
      { name: 'description', content: 'Activate your Rexxon plan. Cancel anytime. 30-day money-back guarantee.' },
      { name: 'robots', content: 'noindex, follow' },
    ],
  }),
  validateSearch: (search): { plan?: PlanId; billing?: 'monthly' | 'annual' } => ({
    plan: (['starter', 'pro', 'team'] as const).includes(search.plan as PlanId) ? (search.plan as PlanId) : 'pro',
    billing: search.billing === 'monthly' ? 'monthly' : 'annual',
  }),
  component: CheckoutPage,
});

function CheckoutPage() {
  const router = useRouter();
  const search = useSearch({ from: '/checkout' });
  const planId: PlanId = (search.plan ?? 'pro') as PlanId;
  const [billing, setBilling] = useState<'monthly' | 'annual'>(search.billing ?? 'annual');
  const [plan, setPlan] = useState<PlanId>(planId);

  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [card, setCard] = useState('');
  const [exp, setExp] = useState('');
  const [cvc, setCvc] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const selected = PLANS[plan];
  const monthly = selected.price;
  const annualDiscountPct = plan === 'starter' ? 0 : 10;
  const monthlyEffective = billing === 'annual' ? Math.round(monthly * (1 - annualDiscountPct / 100)) : monthly;
  const dueToday = monthlyEffective;
  const annualSavings = (monthly - monthlyEffective) * 12;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 800));
    toast.success('Subscription activated! Redirecting to your dashboard…');
    setSubmitting(false);
    router.navigate({ to: '/birdseye' });
  };

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-aurora">
      {/* Ambient orbs */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="orb-drift absolute -top-32 -left-24 h-[420px] w-[420px] rounded-full bg-brand/25 blur-[120px]" />
        <div className="orb-drift absolute -top-10 right-0 h-[360px] w-[360px] rounded-full bg-brand-glow/20 blur-[120px]" style={{ animationDelay: '-4s' }} />
        <div className="absolute inset-0 bg-grid opacity-[0.08]" />
      </div>

      {/* Top bar */}
      <header className="relative z-10 border-b border-border/40 bg-background/40 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <Link to="/" className="flex items-center">
            <RexxonLogo size="sm" />
          </Link>
          <Link to="/" className="flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground">
            <ArrowLeft className="h-4 w-4" />
            Back to home
          </Link>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-6xl px-4 md:px-6 py-14 lg:py-12 md:py-20">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.05fr] lg:gap-14">
          {/* LEFT — Order summary */}
          <div className="animate-fade-up">
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-3 py-1 text-xs font-medium text-muted-foreground shadow-soft backdrop-blur-sm">
              <Sparkles className="h-3.5 w-3.5 text-brand" />
              Cancel anytime · 30-day money-back
            </div>

            <h1 className="mt-5 text-3xl font-bold tracking-tight md:text-4xl">
              Activate your <span className="text-gradient-brand">{selected.name}</span> plan
            </h1>
            <p className="mt-3 text-muted-foreground">
              Cancel anytime. 30-day money-back guarantee. Most teams replace 2–4 tools and book 2× more meetings in their first 30 days.
            </p>

            {/* Plan switcher */}
            <div className="mt-6 surface-2 rounded-2xl border border-border p-5">
              <div className="flex items-center justify-between">
                <div className="text-xs font-semibold uppercase tracking-[0.2em] text-brand">Plan</div>
                <div className="inline-flex items-center rounded-full border border-border bg-card p-0.5 text-xs">
                  <button
                    type="button"
                    onClick={() => setBilling('monthly')}
                    className={`btn-press rounded-full px-3 py-1 transition-colors ${billing === 'monthly' ? 'bg-brand text-brand-foreground shadow-inset-glow' : 'text-muted-foreground'}`}
                  >
                    Monthly
                  </button>
                  <button
                    type="button"
                    onClick={() => setBilling('annual')}
                    className={`btn-press rounded-full px-3 py-1 transition-colors ${billing === 'annual' ? 'bg-brand text-brand-foreground shadow-inset-glow' : 'text-muted-foreground'}`}
                  >
                    Annual <span className="ml-0.5 opacity-80">−20%</span>
                  </button>
                </div>
              </div>

              <div className="mt-3 grid grid-cols-3 gap-2">
                {(Object.keys(PLANS) as PlanId[]).map((id) => {
                  const p = PLANS[id];
                  const active = id === plan;
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setPlan(id)}
                      className={`btn-press relative rounded-lg border p-3 text-left transition-colors ${active ? 'border-hairline-brand bg-brand/10 shadow-inset-glow' : 'border-border bg-card/50 hover:border-brand/40'}`}
                    >
                      {active && <Check className="absolute right-2 top-2 h-3.5 w-3.5 text-brand" />}
                      <div className="text-xs font-semibold">{p.name}</div>
                      <div className="mt-1 text-sm font-bold">
                        ${billing === 'annual' ? Math.round(p.price * 0.8) : p.price}
                        <span className="text-[10px] font-normal text-muted-foreground">/mo</span>
                      </div>
                      <div className="mt-1 text-[10px] text-muted-foreground">{p.accounts}</div>
                    </button>
                  );
                })}
              </div>

              <ul className="mt-5 space-y-2 border-t border-border pt-4">
                {selected.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
                    <span className="text-foreground/90">{f}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Total */}
            <div className="mt-6 surface-2 rounded-2xl border border-border p-5">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{selected.name} · {billing === 'annual' ? 'Annual' : 'Monthly'}</span>
                <span className="font-mono">${monthlyEffective}/mo</span>
              </div>
              {billing === 'annual' && (
                <div className="mt-2 flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Annual savings</span>
                  <span className="font-mono text-brand">−${annualSavings}/yr</span>
                </div>
              )}
              <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
                <span className="text-sm font-semibold">Due today</span>
                <span className="text-2xl font-bold tracking-tight">${dueToday.toFixed(2)}</span>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                Billed {billing === 'annual' ? 'annually' : 'monthly'}. Cancel anytime · 30-day money-back guarantee.
              </p>
            </div>

            {/* Trust */}
            <div className="mt-6 surface-2 rounded-2xl border border-border p-5">
              <div className="flex items-center gap-3">
                <img src={testimonial1} alt="Maya Patel" width={40} height={40} loading="lazy" className="h-10 w-10 rounded-full object-cover ring-1 ring-brand/30" />
                <div>
                  <div className="flex items-center gap-1">
                    {[0,1,2,3,4].map((i) => <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />)}
                  </div>
                  <p className="mt-1 text-sm text-foreground/85">"Best $200/mo we've ever spent. Period."</p>
                  <div className="mt-0.5 text-xs text-muted-foreground">Maya Patel · VP Sales, Helio Cloud</div>
                </div>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5 text-brand" /> SOC 2 Type II</span>
              <span className="flex items-center gap-1.5"><Lock className="h-3.5 w-3.5 text-brand" /> 256-bit TLS</span>
              <span className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-brand" /> 30-day money-back</span>
            </div>
          </div>

          {/* RIGHT — Payment */}
          <div className="animate-fade-up [animation-delay:120ms]">
            <div className="relative">
              <div className="absolute -inset-6 rounded-[2rem] bg-gradient-to-br from-brand/20 via-brand/10 to-brand-glow/20 blur-3xl" />
              <div className="glow-conic relative overflow-hidden rounded-2xl border border-border bg-card/85 p-6 shadow-elevated backdrop-blur-2xl md:p-8">
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-brand" />
                  <h2 className="text-sm font-semibold">Payment details</h2>
                  <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-green-500/15 px-2 py-0.5 font-mono text-[10px] text-green-300">
                    <Lock className="h-3 w-3" /> secure
                  </span>
                </div>

                <form onSubmit={handleSubmit} className="mt-5 space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="name">Cardholder name</Label>
                      <Input id="name" required value={name} onChange={(e) => setName(e.target.value)} placeholder="Jane Doe" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="company">Company</Label>
                      <Input id="company" required value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Acme Inc." />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Work email</Label>
                    <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="card">Card number</Label>
                    <Input
                      id="card"
                      required
                      value={card}
                      onChange={(e) => setCard(e.target.value)}
                      placeholder="1234 1234 1234 1234"
                      inputMode="numeric"
                      autoComplete="cc-number"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="exp">Expiration</Label>
                      <Input id="exp" required value={exp} onChange={(e) => setExp(e.target.value)} placeholder="MM / YY" autoComplete="cc-exp" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cvc">CVC</Label>
                      <Input id="cvc" required value={cvc} onChange={(e) => setCvc(e.target.value)} placeholder="123" inputMode="numeric" autoComplete="cc-csc" />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    size="lg"
                    disabled={submitting}
                    className="btn-press w-full bg-brand text-brand-foreground shadow-inset-glow"
                  >
                    {submitting ? 'Activating…' : `Get started · $${dueToday}/mo`}
                  </Button>

                  <p className="text-center text-xs text-muted-foreground">
                    By continuing you agree to our Terms and Privacy. Cancel anytime · 30-day money-back guarantee.
                  </p>
                </form>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
