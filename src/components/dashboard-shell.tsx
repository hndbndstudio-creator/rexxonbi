import { ReactNode, useEffect } from 'react';
import { Link, useRouter, useLocation } from '@tanstack/react-router';
import { useAuth } from '@/lib/use-auth';
import {
  Building2,
  Eye,
  LogOut,
  Radio,
  Settings,
  Target,
  TrendingUp,
  Users,
  Mail,
  ShieldCheck,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { OnboardingTour } from '@/components/onboarding-tour';
import { useIsAdmin } from '@/lib/use-admin';
import { RexxonLogo } from '@/components/rexxon-logo';

type NavItem = {
  to: '/birdseye' | '/dashboard' | '/accounts' | '/contacts' | '/outreach' | '/territory' | '/analytics' | '/settings' | '/admin';
  label: string;
  icon: typeof Radio;
  tourId?: string;
  adminOnly?: boolean;
};

const NAV: NavItem[] = [
  { to: '/birdseye', label: "Bird's-Eye", icon: Eye, tourId: 'nav-birdseye' },
  { to: '/dashboard', label: 'Signal Feed', icon: Radio, tourId: 'nav-dashboard' },
  { to: '/accounts', label: 'Accounts', icon: Building2, tourId: 'nav-accounts' },
  { to: '/contacts', label: 'Contacts', icon: Users, tourId: 'nav-contacts' },
  { to: '/outreach', label: 'Outreach', icon: Mail, tourId: 'nav-outreach' },
  { to: '/territory', label: 'Territory', icon: Target, tourId: 'nav-territory' },
  { to: '/analytics', label: 'Analytics', icon: TrendingUp },
  { to: '/settings', label: 'Settings', icon: Settings },
  { to: '/admin', label: 'Admin', icon: ShieldCheck, adminOnly: true },
];

export function DashboardShell({ children }: { children: ReactNode }) {
  const { user, loading, signOut } = useAuth();
  const { isAdmin } = useIsAdmin();
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
        <Link to="/dashboard" className="flex items-center justify-center border-b border-border px-2 py-3">
          <RexxonLogo size="sm" />
        </Link>

        <nav className="flex-1 space-y-0.5 p-2">
          {NAV.filter((i) => !i.adminOnly || isAdmin).map((item) => {
            const active = location.pathname === item.to ||
              (item.to !== '/dashboard' && location.pathname.startsWith(item.to));
            const Icon = item.icon;
            return (
              <Link key={item.to} to={item.to as any}>
                <div
                  data-tour={item.tourId}
                  data-active={active ? 'true' : 'false'}
                  className={cn(
                    'nav-link group flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm',
                    active
                      ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                      : 'text-sidebar-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground',
                    item.adminOnly && 'border border-brand/30 bg-brand/5'
                  )}
                >
                  <Icon className={cn('nav-icon h-4 w-4', active && 'text-brand', item.adminOnly && 'text-brand')} />
                  <span className="flex-1">{item.label}</span>
                  {item.adminOnly && (
                    <span className="rounded-sm bg-brand/20 px-1.5 py-0.5 text-[9px] font-mono uppercase tracking-wider text-brand">
                      Sudo
                    </span>
                  )}
                </div>
              </Link>
            );
          })}
        </nav>

        <div className="space-y-2 border-t border-border p-3">
          <div className="flex items-center gap-2.5 rounded-md p-1.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand/20 text-xs font-semibold text-brand">
              {(user.email || 'U').slice(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-xs font-medium">{user.email}</div>
              <div className="text-[11px] text-muted-foreground">Team plan · Trial</div>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleSignOut}
            className="w-full justify-center gap-2"
          >
            <LogOut className="h-3.5 w-3.5" />
            Sign out
          </Button>
        </div>
      </aside>

      {/* Main */}
      <main key={location.pathname} className="page-transition min-w-0 flex-1">{children}</main>

      {/* Onboarding tour overlay */}
      <OnboardingTour />
    </div>
  );
}
