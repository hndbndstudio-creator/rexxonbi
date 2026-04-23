import { createFileRoute, Link } from '@tanstack/react-router';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/lib/use-auth';
import { DashboardShell } from '@/components/dashboard-shell';
import { PageHeader } from '@/components/page-header';
import { fetchContacts, fetchRevealedFields, revealField } from '@/lib/queries';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Eye,
  Linkedin,
  Search,
  Users,
  FileDown,
  Mail,
  Phone,
  Building2,
} from 'lucide-react';
import { maskEmail, maskPhone, getInitials } from '@/lib/types';
import { toast } from 'sonner';
import { downloadCSV, toCSV } from '@/lib/csv';
import { logActivity } from '@/lib/activity';

export const Route = createFileRoute('/contacts')({
  head: () => ({
    meta: [
      { title: 'Contacts — Rexxon AI' },
      { name: 'robots', content: 'noindex, nofollow, noarchive, noimageindex' },
    ],
  }),
  component: ContactsPage,
});

function ContactsPage() {
  return (
    <DashboardShell>
      <Contacts />
    </DashboardShell>
  );
}

function Contacts() {
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const qc = useQueryClient();

  const { data: contacts = [], isLoading } = useQuery({
    queryKey: ['contacts', 'all', search],
    queryFn: () => fetchContacts({ search, limit: 200 }),
  });

  const { data: revealed = new Map<string, Set<string>>() } = useQuery({
    queryKey: ['revealed', user?.id],
    queryFn: () => fetchRevealedFields(user!.id),
    enabled: !!user,
  });

  const revealMut = useMutation({
    mutationFn: ({ contactId, field }: { contactId: string; field: 'email' | 'phone' }) =>
      revealField(user!.id, contactId, field),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['revealed'] });
      toast.success('Contact details revealed');
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : 'Failed'),
  });

  const totalRevealed = Array.from(revealed.values()).reduce((acc, set) => acc + set.size, 0);
  const withEmail = contacts.filter((c: any) => !!c.email).length;
  const withLinkedIn = contacts.filter((c: any) => !!c.linkedin_url).length;

  const exportCsv = () => {
    if (contacts.length === 0) return toast.info('Nothing to export');
    const csv = toCSV(
      contacts.map((c: any) => ({
        first_name: c.first_name,
        last_name: c.last_name,
        title: c.title ?? '',
        company: c.company?.name ?? '',
        email: c.email ?? '',
        phone: c.phone ?? '',
        linkedin: c.linkedin_url ?? '',
      })),
      [
        { key: 'first_name', header: 'First name' },
        { key: 'last_name', header: 'Last name' },
        { key: 'title', header: 'Title' },
        { key: 'company', header: 'Company' },
        { key: 'email', header: 'Email' },
        { key: 'phone', header: 'Phone' },
        { key: 'linkedin', header: 'LinkedIn' },
      ]
    );
    downloadCSV('rexxon-contacts.csv', csv);
    if (user)
      logActivity(user.id, 'CSV_EXPORTED', {
        metadata: { kind: 'contacts', count: contacts.length },
      });
  };

  return (
    <>
      <PageHeader
        icon={Users}
        eyebrow="Buying committee"
        title="Contacts"
        subtitle="Verified decision-makers, ready when you are. One click to reveal email or phone."
        stats={[
          { label: 'Contacts', value: contacts.length, icon: Users },
          { label: 'Revealed', value: totalRevealed, accent: 'brand', icon: Eye },
          { label: 'With email', value: withEmail, accent: 'green', icon: Mail },
          { label: 'On LinkedIn', value: withLinkedIn, accent: 'cyan', icon: Linkedin },
        ]}
        actions={
          <Button size="sm" variant="outline" className="btn-press" onClick={exportCsv}>
            <FileDown className="mr-1.5 h-3.5 w-3.5" /> Export CSV
          </Button>
        }
      />

      <div className="mx-auto max-w-7xl px-4 py-6 md:px-8">
        {/* Search */}
        <div
          className="mb-5 animate-rise"
          style={{ animationDelay: '160ms' }}
        >
          <div className="relative max-w-md">
            <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name…"
              className="pl-8"
            />
          </div>
        </div>

        {/* Table */}
        <div
          className="overflow-hidden rounded-xl border border-border bg-card shadow-soft animate-rise"
          style={{ animationDelay: '200ms' }}
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-muted/30 text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 text-left font-medium">Name</th>
                  <th className="px-4 py-3 text-left font-medium">Title</th>
                  <th className="px-4 py-3 text-left font-medium">Company</th>
                  <th className="px-4 py-3 text-left font-medium">Email</th>
                  <th className="px-4 py-3 text-left font-medium">Phone</th>
                  <th className="px-4 py-3 text-center font-medium">Links</th>
                </tr>
              </thead>
              <tbody>
                {isLoading && (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 md:py-12 text-center">
                      <div className="mx-auto h-5 w-5 animate-spin rounded-full border-2 border-brand border-t-transparent" />
                      <p className="mt-2 text-xs text-muted-foreground">Loading contacts…</p>
                    </td>
                  </tr>
                )}
                {!isLoading && contacts.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-10 md:py-16 text-center">
                      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand/10">
                        <Users className="h-6 w-6 text-brand" />
                      </div>
                      <h3 className="mt-3 font-semibold">No contacts found</h3>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {search ? 'Try a different search.' : 'Contacts will appear here as signals fire.'}
                      </p>
                    </td>
                  </tr>
                )}
                {contacts.map((c: any) => {
                  const revs = revealed.get(c.id) ?? new Set();
                  const emailRev = revs.has('email');
                  const phoneRev = revs.has('phone');
                  return (
                    <tr
                      key={c.id}
                      className="border-t border-border transition-colors hover:bg-accent/30"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand/30 to-brand/10 text-[10px] font-semibold text-brand">
                            {getInitials(`${c.first_name} ${c.last_name}`)}
                          </div>
                          <span className="font-medium">
                            {c.first_name} {c.last_name}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{c.title ?? '—'}</td>
                      <td className="px-4 py-3">
                        {c.company ? (
                          <Link
                            to="/accounts/$id"
                            params={{ id: c.company.id }}
                            className="inline-flex items-center gap-1.5 transition-colors hover:text-brand"
                          >
                            <Building2 className="h-3 w-3 text-muted-foreground" />
                            {c.company.name}
                          </Link>
                        ) : (
                          '—'
                        )}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs">
                        <div className="flex items-center gap-2">
                          <span className={emailRev ? 'text-foreground' : 'text-muted-foreground'}>
                            {emailRev ? c.email ?? '—' : maskEmail(c.email)}
                          </span>
                          {!emailRev && c.email && (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-6 px-1.5 text-[10px] text-brand hover:bg-brand/10"
                              onClick={() => revealMut.mutate({ contactId: c.id, field: 'email' })}
                            >
                              <Eye className="mr-0.5 h-3 w-3" />
                              Reveal
                            </Button>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs">
                        <div className="flex items-center gap-2">
                          <span className={phoneRev ? 'text-foreground' : 'text-muted-foreground'}>
                            {phoneRev ? c.phone ?? '—' : maskPhone(c.phone)}
                          </span>
                          {!phoneRev && c.phone && (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-6 px-1.5 text-[10px] text-brand hover:bg-brand/10"
                              onClick={() => revealMut.mutate({ contactId: c.id, field: 'phone' })}
                            >
                              <Eye className="mr-0.5 h-3 w-3" />
                              Reveal
                            </Button>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-2">
                          {c.email && (
                            <a
                              href={`mailto:${c.email}`}
                              className="text-muted-foreground transition-colors hover:text-brand"
                              aria-label="Email"
                            >
                              <Mail className="h-4 w-4" />
                            </a>
                          )}
                          {c.phone && (
                            <a
                              href={`tel:${c.phone}`}
                              className="text-muted-foreground transition-colors hover:text-brand"
                              aria-label="Call"
                            >
                              <Phone className="h-4 w-4" />
                            </a>
                          )}
                          {c.linkedin_url && (
                            <a
                              href={c.linkedin_url}
                              target="_blank"
                              rel="noreferrer"
                              className="text-muted-foreground transition-colors hover:text-brand"
                              aria-label="LinkedIn"
                            >
                              <Linkedin className="h-4 w-4" />
                            </a>
                          )}
                          {!c.email && !c.phone && !c.linkedin_url && (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
