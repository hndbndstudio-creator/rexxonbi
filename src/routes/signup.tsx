import { createFileRoute, Link, useRouter } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/use-auth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Check, ShieldCheck, Star } from 'lucide-react';
import { RexxonLogo } from '@/components/rexxon-logo';
import avatar1 from '@/assets/avatar-1.jpg';
import avatar2 from '@/assets/avatar-2.jpg';
import avatar3 from '@/assets/avatar-3.jpg';
import avatar4 from '@/assets/avatar-4.jpg';

export const Route = createFileRoute('/signup')({
  head: () => ({
    meta: [
      { title: "Create your Rexxon AI account — start free" },
      { name: "description", content: "Create a Rexxon AI account and start receiving real-time B2B buying signals in minutes." },
      { name: "robots", content: "noindex, follow" },
    ],
  }),
  component: SignupPage,
});

const PLANS = [
  { id: 'starter', name: 'Starter', price: 79, accounts: '75 accounts', seats: '1 user' },
  { id: 'pro', name: 'Pro', price: 199, accounts: '250 accounts', seats: '3 users' },
  { id: 'team', name: 'Team', price: 349, accounts: '750 accounts', seats: '10 users' },
] as const;

const HERO_AVATARS = [avatar1, avatar2, avatar3, avatar4];

function SignupPage() {
  const { user, loading, signUp } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [plan, setPlan] = useState<'starter' | 'pro' | 'team'>('pro');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user && !loading) router.navigate({ to: '/birdseye' });
  }, [user, loading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await signUp(email, password);
      toast.success('Account created! Check your email to verify.');
      router.navigate({ to: '/birdseye' });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Signup failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogle = async () => {
    setSubmitting(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: typeof window !== 'undefined' ? `${window.location.origin}/dashboard` : undefined },
      });
      if (error) throw error;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Google sign up failed');
      setSubmitting(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-aurora px-4 py-12">
      {/* Ambient orbs */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="orb-drift absolute -top-32 -left-24 h-[420px] w-[420px] rounded-full bg-brand/25 blur-[120px]" />
        <div className="orb-drift absolute -bottom-32 right-0 h-[360px] w-[360px] rounded-full bg-brand-glow/20 blur-[120px]" style={{ animationDelay: '-4s' }} />
        <div className="absolute inset-0 bg-grid opacity-[0.08]" />
      </div>

      <div className="relative z-10 w-full max-w-md animate-fade-up">
        <div className="mb-7 flex flex-col items-center">
          <Link to="/" className="mb-5 flex items-center">
            <RexxonLogo size="sm" />
          </Link>
          <h1 className="text-2xl font-bold tracking-tight">Start your free trial</h1>
          <p className="mt-1 text-sm text-muted-foreground">7 days free · No credit card · Live in 10 min</p>
        </div>

        {/* Glow wrapper */}
        <div className="relative">
          <div className="absolute -inset-4 rounded-[2rem] bg-gradient-to-br from-brand/20 via-brand/10 to-brand-glow/20 blur-3xl" />
          <div className="glow-conic relative overflow-hidden rounded-2xl border border-border bg-card/85 p-6 shadow-elevated backdrop-blur-2xl">
            {/* Plan picker */}
            <div className="mb-6">
              <Label className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Choose your plan</Label>
              <div className="mt-2 grid grid-cols-3 gap-2">
                {PLANS.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setPlan(p.id)}
                    className={`btn-press relative rounded-lg border p-3 text-left transition-colors ${plan === p.id ? 'border-hairline-brand bg-brand/10 shadow-inset-glow' : 'border-border bg-card/50 hover:border-brand/40'}`}
                  >
                    {plan === p.id && (
                      <Check className="absolute right-2 top-2 h-3.5 w-3.5 text-brand" />
                    )}
                    <div className="text-xs font-semibold">{p.name}</div>
                    <div className="mt-1 text-sm font-bold">${p.price}<span className="text-[10px] font-normal text-muted-foreground">/mo</span></div>
                    <div className="mt-1 text-[10px] text-muted-foreground">{p.accounts}</div>
                  </button>
                ))}
              </div>
            </div>

            <Button variant="outline" className="btn-press w-full bg-card/50" type="button" disabled={submitting} onClick={handleGoogle}>
              <GoogleIcon />
              Continue with Google
            </Button>

            <div className="my-5 flex items-center gap-3">
              <div className="h-px flex-1 bg-border" />
              <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">or</span>
              <div className="h-px flex-1 bg-border" />
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Work email</Label>
                <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 6 characters" />
              </div>
              <Button type="submit" className="btn-press w-full bg-brand text-brand-foreground shadow-inset-glow" disabled={submitting}>
                {submitting ? 'Creating account…' : 'Start 7-day free trial'}
              </Button>
              <p className="text-center text-xs text-muted-foreground">
                No charges until day 15 · Cancel anytime · Setup in 10 minutes
              </p>
            </form>
          </div>
        </div>

        {/* Mini trust strip */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3 text-xs text-muted-foreground">
          <div className="flex -space-x-2">
            {HERO_AVATARS.map((src, i) => (
              <img key={i} src={src} alt="" width={20} height={20} loading="lazy" className="h-5 w-5 rounded-full border border-background object-cover" />
            ))}
          </div>
          <div className="flex items-center gap-0.5">
            {[0,1,2,3,4].map((i) => <Star key={i} className="h-3 w-3 fill-amber-400 text-amber-400" />)}
          </div>
          <span><span className="font-semibold text-foreground">1,240+</span> revenue teams</span>
        </div>

        <p className="mt-5 text-center text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-brand hover:underline">Sign in</Link>
        </p>

        <div className="mt-4 flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground">
          <ShieldCheck className="h-3 w-3 text-brand" />
          SOC 2 Type II · 256-bit encryption · No credit card
        </div>
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
      <path fill="#EA4335" d="M12 5c1.6 0 3 .55 4.1 1.45L19.4 3.5C17.4 1.7 14.9.5 12 .5 7.4.5 3.4 3.1 1.4 6.9l3.7 2.9C6.1 6.8 8.8 5 12 5z" />
      <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.4h6.5c-.3 1.5-1.2 2.7-2.5 3.5l3.6 2.8c2.1-2 3.4-4.9 3.4-8.4z" />
      <path fill="#FBBC05" d="M5.1 14.2c-.3-.8-.5-1.6-.5-2.5s.2-1.7.5-2.5L1.4 6.3C.5 8 0 9.9 0 11.7s.5 3.7 1.4 5.4l3.7-2.9z" />
      <path fill="#34A853" d="M12 23c3.2 0 5.9-1.1 7.9-2.9l-3.6-2.8c-1 .7-2.3 1.1-4.3 1.1-3.2 0-5.9-2.1-6.9-5l-3.7 2.9C3.4 19.9 7.4 23 12 23z" />
    </svg>
  );
}
