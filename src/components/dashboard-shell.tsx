import { ReactNode, useEffect, useState } from 'react';
import { Link, useRouter, useLocation } from '@tanstack/react-router';
import { useAuth } from '@/lib/use-auth';
import {
  Building2,
  CalendarDays,
  Eye,
  FileText,
  LogOut,
  Menu,
  Radio,
  Settings,
  Target,
  TrendingUp,
  Users,
  Mail,
  ShieldCheck,
  BookOpen,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { OnboardingTour } from '@/components/onboarding-tour';
import { useIsAdmin } from '@/lib/use-admin';
import { RexxonLogo } from '@/components/rexxon-logo';

type NavItem = {
  to: '/birdseye' | '/dashboard' | '/today' | '/campaigns' | '/accounts' | '/contacts' | '/outreach' | '/proposals' | '/knowledge' | '/territory' | '/analytics' | '/settings' | '/admin';
  label: string;
  icon: typeof Radio;
  tourId?: string;
  adminOnly?: boolean;
};

type NavSection = { label?: string; items: NavItem[] };

const NAV_SECTIONS: NavSection[] = [
  {
    label: 'Today',
    items: [
      { to: '/birdseye', label: "Bird's-eye", icon: Eye, tourId: 'nav-birdseye' },
      { to: '/today', label: 'Today', icon: CalendarDays, tourId: 'nav-today' },
    ],
  },
  {
    label: 'Prospect',
    items: [
      { to: '/dashboard', label: 'Signals', icon: Radio, tourId: 'nav-dashboard' },
      { to: '/campaigns', label: 'Campaigns', icon: Target, tourId: 'nav-campaigns' },
      { to: '/accounts', label: 'Accounts', icon: Building2, tourId: 'nav-accounts' },
      { to: '/contacts', label: 'Contacts', icon: Users, tourId: 'nav-contacts' },
    ],
  },
  {
    label: 'Engage',
    items: [
      { to: '/outreach', label: 'Outreach', icon: Mail, tourId: 'nav-outreach' },
      { to: '/proposals', label: 'Proposals', icon: FileText, tourId: 'nav-proposals' },
      { to: '/knowledge', label: 'Knowledge', icon: BookOpen, tourId: 'nav-knowledge' },
    ],
  },
  {
    label: 'Measure',
    items: [
      { to: '/territory', label: 'Territory', icon: Target, tourId: 'nav-territory' },
      { to: '/analytics', label: 'Analytics', icon: TrendingUp },
    ],
  },
  {
    items: [
      { to: '/settings', label: 'Settings', icon: Settings },
      { to: '/admin', label: 'Admin', icon: ShieldCheck, adminOnly: true },
    ],
  },
];

export function DashboardShell({ children }: { children: ReactNode }) {
  const { user, loading, signOut } = useAuth();
  const { isAdmin } = useIsAdmin();
  const router = useRouter();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.navigate({ to: '/login' });
  }, [user, loading, router]);

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const handleSignOut = async () => {
    try {
      await signOut();
      router.navigate({ to: '/' });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Sign out failed');
    }
  };

  // While auth is resolving, render the shell chrome (sidebar + empty main) so
  // the layout doesn't flash a centered spinner before swapping to the page.
  // If unauthenticated, the effect above redirects to /login.

  const renderNav = (onItemClick?: () => void) => (
    <nav className="flex-1 space-y-3 overflow-y-auto p-2">
      {NAV_SECTIONS.map((section, sIdx) => {
        const items = section.items.filter((i) => !i.adminOnly || isAdmin);
        if (items.length === 0) return null;
        return (
          <div key={sIdx} className="space-y-0.5">
            {section.label && (
              <div className="px-2.5 pb-1 pt-1 font-mono text-[9px] font-semibold uppercase tracking-[0.18em] text-muted-foreground/70">
                {section.label}
              </div>
            )}
            {items.map((item) => {
              const active = location.pathname === item.to ||
                (item.to !== '/dashboard' && location.pathname.startsWith(item.to));
              const Icon = item.icon;
              return (
                <Link key={item.to} to={item.to as any} onClick={onItemClick}>
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
          </div>
        );
      })}
    </nav>
  );

  const renderUserPanel = () => (
    <div className="space-y-2 border-t border-border p-3">
      <div className="flex items-center gap-2.5 rounded-md p-1.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand/20 text-xs font-semibold text-brand">
          {(user?.email || 'U').slice(0, 2).toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate text-xs font-medium">{user?.email ?? '\u00a0'}</div>
          <div className="text-[11px] text-muted-foreground">Team plan · Trial</div>
        </div>
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={handleSignOut}
        disabled={!user}
        className="w-full justify-center gap-2"
      >
        <LogOut className="h-3.5 w-3.5" />
        Sign out
      </Button>
    </div>
  );

  return (
    <div className="flex min-h-screen w-full bg-background">
      {/* Desktop Sidebar */}
      <aside className="hidden w-60 shrink-0 flex-col border-r border-border bg-sidebar md:flex">
        <Link to="/dashboard" className="flex items-center justify-center border-b border-border px-2 py-3">
          <RexxonLogo size="sm" />
        </Link>
        {renderNav()}
        {renderUserPanel()}
      </aside>

      {/* Mobile top bar */}
      <div className="fixed inset-x-0 top-0 z-40 flex h-14 items-center justify-between border-b border-border bg-sidebar/95 px-3 backdrop-blur md:hidden">
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="h-9 w-9" aria-label="Open menu">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="flex w-64 flex-col bg-sidebar p-0">
            <SheetTitle className="sr-only">Navigation menu</SheetTitle>
            <div className="flex items-center justify-center border-b border-border px-2 py-3">
              <RexxonLogo size="sm" />
            </div>
            {renderNav(() => setMobileOpen(false))}
            {renderUserPanel()}
          </SheetContent>
        </Sheet>
        <Link to="/dashboard" className="flex items-center">
          <RexxonLogo size="sm" />
        </Link>
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand/20 text-[11px] font-semibold text-brand">
          {(user.email || 'U').slice(0, 2).toUpperCase()}
        </div>
      </div>

      {/* Main */}
      <main key={location.pathname} className="page-transition min-w-0 flex-1 pt-14 md:pt-0">{children}</main>

      {/* Onboarding tour overlay */}
      <OnboardingTour />
    </div>
  );
}
