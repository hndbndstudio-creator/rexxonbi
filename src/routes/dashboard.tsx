import { createFileRoute, Link, useRouter } from '@tanstack/react-router';
import { useEffect } from 'react';
import { useAuth } from '@/lib/use-auth';
import { Button } from '@/components/ui/button';
import { Activity, LogOut } from 'lucide-react';
import { toast } from 'sonner';

export const Route = createFileRoute('/dashboard')({
  component: DashboardPage,
});

function DashboardPage() {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.navigate({ to: '/login' });
  }, [user, loading, router]);

  const handleSignOut = async () => {
    try {
      await signOut();
      router.navigate({ to: '/' });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Sign out failed');
    }
  };

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background bg-grid">
      <header className="border-b border-border bg-card/40 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-6">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-brand text-brand-foreground">
              <Activity className="h-4 w-4" />
            </div>
            <span className="font-semibold">Rexxon AI</span>
          </Link>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">{user.email}</span>
            <Button size="sm" variant="ghost" onClick={handleSignOut}>
              <LogOut className="mr-1.5 h-4 w-4" /> Sign out
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-20 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-brand/30 bg-brand/10 px-3 py-1 text-xs text-brand">
          <span className="h-1.5 w-1.5 rounded-full bg-brand" />
          Phase 1 foundation ready
        </div>
        <h1 className="mt-6 text-4xl font-bold tracking-tight">Welcome to Rexxon AI</h1>
        <p className="mt-3 text-muted-foreground">
          Auth, dark theme, landing page, and the full Rexxon database (companies, signals, contacts, outreach, territory) are live.
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          Next up: signal feed UI, AI signal generator, accounts list, account detail, and contacts table.
        </p>
        <div className="mt-8 grid gap-3 sm:grid-cols-3 text-left">
          {['Signal Feed', 'Accounts', 'Contacts'].map((label) => (
            <div key={label} className="rounded-xl border border-border bg-card/60 p-4">
              <div className="text-sm font-medium">{label}</div>
              <div className="mt-1 text-xs text-muted-foreground">Coming in next iteration</div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
