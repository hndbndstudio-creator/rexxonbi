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
import { OnboardingTour } from '@/components/onboarding-tour';

type NavItem = {
  to: '/dashboard' | '/accounts' | '/contacts' | '/outreach' | '/territory' | '/analytics' | '/settings';
  label: string;
  icon: typeof Radio;
  tourId?: string;
};

const NAV: NavItem[] = [
  { to: '/dashboard', label: 'Signal Feed', icon: Radio, tourId: 'nav-dashboard' },
  { to: '/accounts', label: 'Accounts', icon: Building2, tourId: 'nav-accounts' },
  { to: '/contacts', label: 'Contacts', icon: Users, tourId: 'nav-contacts' },
  { to: '/outreach', label: 'Outreach', icon: Mail, tourId: 'nav-outreach' },
  { to: '/territory', label: 'Territory', icon: Target, tourId: 'nav-territory' },
  { to: '/analytics', label: 'Analytics', icon: TrendingUp },
  { to: '/settings', label: 'Settings', icon: Settings },
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
        <Link to="/dashboard" className="flex h-16 items-center gap-2.5 border-b border-border px-4">
          <div className="logo-badge relative flex h-8 w-8 items-center justify-center rounded-md text-brand-foreground">
            <Activity className="relative z-10 h-4 w-4 drop-shadow-[0_1px_1px_rgba(0,0,0,0.4)]" strokeWidth={2.5} />
          </div>
          <span className="text-base font-semibold tracking-tight">Rexxon AI</span>
        </Link>

        <nav className="flex-1 space-y-0.5 p-2">
          {NAV.map((item) => {
            const active = location.pathname === item.to ||
              (item.to !== '/dashboard' && location.pathname.startsWith(item.to));
            const Icon = item.icon;
            return (
              <Link key={item.to} to={item.to}>
                <div
                  data-tour={item.tourId}
                  data-active={active ? 'true' : 'false'}
                  className={cn(
                    'nav-link group flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm',
                    active
                      ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                      : 'text-sidebar-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground'
                  )}
                >
                  <Icon className={cn('nav-icon h-4 w-4', active && 'text-brand')} />
                  <span className="flex-1">{item.label}</span>
                </div>
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

      {/* Onboarding tour overlay */}
      <OnboardingTour />
    </div>
  );
}
