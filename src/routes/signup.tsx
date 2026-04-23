import { createFileRoute, Link, useRouter } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/use-auth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Activity, Check } from 'lucide-react';

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

function SignupPage() {
  const { user, loading, signUp } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [plan, setPlan] = useState<'starter' | 'pro' | 'team'>('team');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user && !loading) router.navigate({ to: '/dashboard' });
  }, [user, loading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await signUp(email, password);
      toast.success('Account created! Check your email to verify.');
      // After confirmation user can sign in. Try to redirect — works if email auto-confirm is on.
      router.navigate({ to: '/dashboard' });
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
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-10 bg-grid">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center">
          <Link to="/" className="mb-4 flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-brand text-brand-foreground">
              <Activity className="h-4 w-4" />
            </div>
            <span className="text-lg font-semibold">Rexxon AI</span>
          </Link>
          <h1 className="text-2xl font-semibold">Start your free trial</h1>
          <p className="mt-1 text-sm text-muted-foreground">14 days free · No credit card</p>
        </div>

        <div className="rounded-xl border border-border bg-card p-6">
          {/* Plan picker */}
          <div className="mb-6">
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">Choose your plan</Label>
            <div className="mt-2 grid grid-cols-3 gap-2">
              {PLANS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setPlan(p.id)}
                  className={`relative rounded-lg border p-3 text-left transition-colors ${plan === p.id ? 'border-brand bg-brand/10' : 'border-border hover:border-foreground/30'}`}
                >
                  {plan === p.id && (
                    <Check className="absolute right-2 top-2 h-3.5 w-3.5 text-brand" />
                  )}
                  <div className="text-xs font-medium">{p.name}</div>
                  <div className="mt-1 text-sm font-bold">${p.price}<span className="text-xs font-normal text-muted-foreground">/mo</span></div>
                  <div className="mt-1 text-[10px] text-muted-foreground">{p.accounts}</div>
                </button>
              ))}
            </div>
          </div>

          <Button variant="outline" className="w-full" type="button" disabled={submitting} onClick={handleGoogle}>
            <GoogleIcon />
            Continue with Google
          </Button>

          <div className="my-5 flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs uppercase tracking-wider text-muted-foreground">or</span>
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
            <Button type="submit" className="w-full bg-brand text-brand-foreground hover:opacity-90" disabled={submitting}>
              {submitting ? 'Creating account…' : 'Start 14-day free trial'}
            </Button>
            <p className="text-center text-xs text-muted-foreground">
              No charges until day 15 · Cancel anytime · Setup in 10 minutes
            </p>
          </form>
        </div>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-brand hover:underline">Sign in</Link>
        </p>
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
