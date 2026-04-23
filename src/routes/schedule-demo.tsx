import { createFileRoute, Link, useRouter } from '@tanstack/react-router';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import {
  ArrowLeft,
  CalendarCheck,
  Check,
  Clock,
  ShieldCheck,
  Sparkles,
  Star,
  Users,
} from 'lucide-react';
import { RexxonLogo } from '@/components/rexxon-logo';
import testimonial1 from '@/assets/testimonial-1.jpg';
import testimonial2 from '@/assets/testimonial-2.jpg';
import testimonial3 from '@/assets/testimonial-3.jpg';
import avatar1 from '@/assets/avatar-1.jpg';
import avatar2 from '@/assets/avatar-2.jpg';
import avatar3 from '@/assets/avatar-3.jpg';
import avatar4 from '@/assets/avatar-4.jpg';

export const Route = createFileRoute('/schedule-demo')({
  head: () => ({
    meta: [
      { title: 'Book a 15-min demo — Rexxon AI' },
      { name: 'description', content: 'See Rexxon live in 15 minutes. Real signals from your ICP, your verified contacts, and a draft email — on the call.' },
      { name: 'robots', content: 'noindex, follow' },
    ],
  }),
  component: ScheduleDemoPage,
});

const TIME_SLOTS = ['9:00 AM', '10:30 AM', '12:00 PM', '1:30 PM', '3:00 PM', '4:30 PM'];

function getNext7Days() {
  const days: { date: Date; label: string; sub: string; iso: string }[] = [];
  const base = new Date();
  for (let i = 1; i <= 7; i++) {
    const d = new Date(base);
    d.setDate(base.getDate() + i);
    days.push({
      date: d,
      label: d.toLocaleDateString('en-US', { weekday: 'short' }),
      sub: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      iso: d.toISOString().slice(0, 10),
    });
  }
  return days;
}

function ScheduleDemoPage() {
  const router = useRouter();
  const [days] = useState(getNext7Days);
  const [selectedDay, setSelectedDay] = useState(days[0].iso);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [team, setTeam] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTime) {
      toast.error('Pick a time slot first');
      return;
    }
    setSubmitting(true);
    // Simulate booking — replace with real scheduler integration when ready
    await new Promise((r) => setTimeout(r, 700));
    toast.success(`Demo booked for ${selectedDay} at ${selectedTime}. Check your inbox for the calendar invite.`);
    setSubmitting(false);
    router.navigate({ to: '/' });
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

      <main className="relative z-10 mx-auto max-w-7xl px-4 md:px-6 py-14 lg:py-12 md:py-20">
        <div className="grid gap-10 lg:grid-cols-[1.05fr_1fr] lg:gap-14">
          {/* LEFT — Context */}
          <div className="animate-fade-up">
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-3 py-1 text-xs font-medium text-muted-foreground shadow-soft backdrop-blur-sm">
              <CalendarCheck className="h-3.5 w-3.5 text-brand" />
              15-minute live walkthrough
            </div>

            <h1 className="mt-5 text-4xl font-bold leading-[1.05] tracking-tight md:text-5xl">
              See your pipeline of <span className="text-gradient-brand">tomorrow</span>{' '}
              <span className="text-foreground/90">today.</span>
            </h1>

            <p className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground md:text-lg">
              On the call, we'll plug in your ICP and show you the live signals firing right now — with verified buyers and a draft email per signal. No slides. No fluff.
            </p>

            {/* What you'll see */}
            <div className="mt-8 surface-2 rounded-2xl border border-border p-6">
              <div className="text-xs font-semibold uppercase tracking-[0.2em] text-brand">What you'll see</div>
              <ul className="mt-4 space-y-3">
                {[
                  { i: <Sparkles className="h-4 w-4 text-brand" />, t: 'Live signals firing inside your ICP', s: 'Hiring, funding, leadership, compliance — all weighted to your fit' },
                  { i: <Users className="h-4 w-4 text-brand" />, t: 'Verified buyer contacts', s: 'Email + phone + role + signal context' },
                  { i: <ShieldCheck className="h-4 w-4 text-brand" />, t: 'Full ROI breakdown for your team', s: 'How fast you replace 2–4 tools and 2× meetings' },
                ].map((row) => (
                  <li key={row.t} className="flex items-start gap-3">
                    <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-brand/10 ring-1 ring-brand/20">{row.i}</span>
                    <div>
                      <div className="text-sm font-medium">{row.t}</div>
                      <div className="text-xs text-muted-foreground">{row.s}</div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* Social proof */}
            <div className="mt-8 flex flex-wrap items-center gap-4 border-t border-border pt-6">
              <div className="flex -space-x-2">
                {[avatar1, avatar2, avatar3, avatar4].map((src, i) => (
                  <img
                    key={i}
                    src={src}
                    alt=""
                    width={32}
                    height={32}
                    loading="lazy"
                    className="h-8 w-8 rounded-full border-2 border-background object-cover shadow-soft"
                  />
                ))}
              </div>
              <div className="flex items-center gap-1">
                {[0, 1, 2, 3, 4].map((i) => (
                  <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                ))}
                <span className="ml-1.5 text-sm font-semibold">4.9/5</span>
              </div>
              <div className="text-sm text-muted-foreground">
                <span className="font-semibold text-foreground">1,240+</span> revenue teams trust Rexxon
              </div>
            </div>

            {/* Mini testimonial */}
            <div className="mt-6 surface-2 rounded-2xl border border-border p-5">
              <div className="flex items-center gap-3">
                <img src={testimonial1} alt="Maya Patel" width={40} height={40} loading="lazy" className="h-10 w-10 rounded-full object-cover ring-1 ring-brand/30" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1">
                    {[0,1,2,3,4].map((i) => <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />)}
                  </div>
                  <p className="mt-1.5 text-sm text-foreground/85">"30 minutes after the demo my AE booked her first signal-driven meeting. We signed in 4 days."</p>
                  <div className="mt-1.5 text-xs text-muted-foreground">Maya Patel · VP Sales, Helio Cloud</div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT — Booking form */}
          <div className="animate-fade-up [animation-delay:120ms]">
            <div className="relative">
              <div className="absolute -inset-6 rounded-[2rem] bg-gradient-to-br from-brand/20 via-brand/10 to-brand-glow/20 blur-3xl" />
              <div className="glow-conic relative overflow-hidden rounded-2xl border border-border bg-card/85 p-6 shadow-elevated backdrop-blur-2xl md:p-8">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-brand" />
                  <span className="text-sm font-semibold">Pick a time</span>
                  <span className="ml-auto font-mono text-[10px] text-muted-foreground">all times shown in your timezone</span>
                </div>

                {/* Days */}
                <div className="mt-4 grid grid-cols-7 gap-2">
                  {days.map((d) => {
                    const active = d.iso === selectedDay;
                    return (
                      <button
                        key={d.iso}
                        type="button"
                        onClick={() => { setSelectedDay(d.iso); setSelectedTime(null); }}
                        className={`btn-press rounded-lg border p-2 text-center transition-colors ${active ? 'border-hairline-brand bg-brand/10 text-foreground shadow-inset-glow' : 'border-border bg-card/50 text-muted-foreground hover:text-foreground'}`}
                      >
                        <div className="text-[10px] font-mono uppercase tracking-wider">{d.label}</div>
                        <div className="mt-0.5 text-sm font-semibold">{d.sub}</div>
                      </button>
                    );
                  })}
                </div>

                {/* Times */}
                <div className="mt-5 grid grid-cols-3 gap-2">
                  {TIME_SLOTS.map((t) => {
                    const active = t === selectedTime;
                    return (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setSelectedTime(t)}
                        className={`btn-press rounded-lg border px-2 py-2.5 text-sm font-medium transition-colors ${active ? 'border-hairline-brand bg-brand text-brand-foreground shadow-inset-glow' : 'border-border bg-card/50 text-foreground/80 hover:border-brand/40 hover:text-foreground'}`}
                      >
                        {t}
                      </button>
                    );
                  })}
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="mt-6 space-y-4 border-t border-border pt-6">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full name</Label>
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
                    <Label htmlFor="team">Team size</Label>
                    <select
                      id="team"
                      value={team}
                      onChange={(e) => setTeam(e.target.value)}
                      className="flex h-9 w-full rounded-md border border-input bg-card px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    >
                      <option value="">Select…</option>
                      <option>1–5 reps</option>
                      <option>6–25 reps</option>
                      <option>26–100 reps</option>
                      <option>100+ reps</option>
                    </select>
                  </div>

                  <Button
                    type="submit"
                    size="lg"
                    disabled={submitting}
                    className="btn-press w-full bg-brand text-brand-foreground shadow-inset-glow"
                  >
                    {submitting ? 'Booking…' : selectedTime ? `Confirm ${selectedTime}` : 'Pick a time above'}
                  </Button>

                  <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-brand" /> 15 min</span>
                    <span className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-brand" /> No sales pitch</span>
                    <span className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-brand" /> Calendar invite emailed</span>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
