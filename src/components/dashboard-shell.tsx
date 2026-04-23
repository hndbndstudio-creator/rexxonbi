import { ReactNode, useEffect } from 'react';
import { Link, useRouter, useLocation } from '@tanstack/react-router';
import { useAuth } from '@/lib/use-auth';
import {
  Activity,
  Building2,
  LogOut,
  Radio,
  Settings,
  Target,
  TrendingUp,
  Users,
  Mail,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

type NavItem =
  | { to: '/dashboard' | '/accounts' | '/contacts'; label: string; icon: typeof Radio; soon?: false }
  | { label: string; icon: typeof Radio; soon: true; to: string };

const NAV: NavItem[] = [
  { to: '/dashboard', label: 'Signal Feed', icon: Radio },
  { to: '/accounts', label: 'Accounts', icon: Building2 },
  { to: '/contacts', label: 'Contacts', icon: Users },
  { to: '/outreach', label: 'Outreach', icon: Mail, soon: true },
  { to: '/territory', label: 'Territory', icon: Target, soon: true },
  { to: '/analytics', label: 'Analytics', icon: TrendingUp, soon: true },
  { to: '/settings', label: 'Settings', icon: Settings, soon: true },
];

export function DashboardShell({ children }: { children: ReactNode }) {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();
  const location = useLocation();

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
    <div className="flex min-h-screen w-full bg-background">
      {/* Sidebar */}
      <aside className="hidden w-60 shrink-0 flex-col border-r border-border bg-sidebar md:flex">
        <Link to="/dashboard" className="flex h-14 items-center gap-2 border-b border-border px-4">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-brand text-brand-foreground">
            <Activity className="h-4 w-4" />
          </div>
          <span className="font-semibold tracking-tight">Rexxon AI</span>
        </Link>

        <nav className="flex-1 space-y-0.5 p-2">
          {NAV.map((item) => {
            const active = location.pathname === item.to ||
              (item.to !== '/dashboard' && location.pathname.startsWith(item.to));
            const Icon = item.icon;
            const node = (
              <div
                className={cn(
                  'group flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm transition-colors',
                  active
                    ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                    : 'text-sidebar-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground',
                  item.soon && 'cursor-not-allowed opacity-50'
                )}
              >
                <Icon className={cn('h-4 w-4', active && 'text-brand')} />
                <span className="flex-1">{item.label}</span>
                {item.soon && (
                  <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-mono uppercase text-muted-foreground">
                    Soon
                  </span>
                )}
              </div>
            );
            if (item.soon) {
              return <div key={item.to}>{node}</div>;
            }
            return (
              <Link key={item.to} to={item.to}>
                {node}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-border p-3">
          <div className="flex items-center gap-2.5 rounded-md p-1.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand/20 text-xs font-semibold text-brand">
              {(user.email || 'U').slice(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-xs font-medium">{user.email}</div>
              <div className="text-[11px] text-muted-foreground">Team plan · Trial</div>
            </div>
            <Button size="icon" variant="ghost" onClick={handleSignOut} className="h-7 w-7" title="Sign out">
              <LogOut className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="min-w-0 flex-1">{children}</main>
    </div>
  );
}
