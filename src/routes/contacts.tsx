import { createFileRoute, Link } from '@tanstack/react-router';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/lib/use-auth';
import { DashboardShell } from '@/components/dashboard-shell';
import { fetchContacts, fetchRevealedFields, revealField } from '@/lib/queries';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Eye, Linkedin, Search, Users } from 'lucide-react';
import { maskEmail, maskPhone, getInitials } from '@/lib/types';
import { toast } from 'sonner';

export const Route = createFileRoute('/contacts')({
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
      toast.success('Revealed');
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : 'Failed'),
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 md:px-8">
      <div className="mb-6 flex items-end justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
            <Users className="h-5 w-5 text-brand" />
            Contacts
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">{contacts.length} contacts</p>
        </div>
        <div className="relative w-full max-w-xs">
          <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name…"
            className="pl-8"
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-card/40">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-[10px] font-mono uppercase text-muted-foreground">
              <tr>
                <th className="px-4 py-2.5 text-left font-medium">Name</th>
                <th className="px-4 py-2.5 text-left font-medium">Title</th>
                <th className="px-4 py-2.5 text-left font-medium">Company</th>
                <th className="px-4 py-2.5 text-left font-medium">Email</th>
                <th className="px-4 py-2.5 text-left font-medium">Phone</th>
                <th className="px-4 py-2.5 text-left font-medium">LinkedIn</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">
                    Loading contacts…
                  </td>
                </tr>
              )}
              {!isLoading && contacts.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">
                    No contacts found.
                  </td>
                </tr>
              )}
              {contacts.map((c: any) => {
                const revs = revealed.get(c.id) ?? new Set();
                const emailRev = revs.has('email');
                const phoneRev = revs.has('phone');
                return (
                  <tr key={c.id} className="border-t border-border hover:bg-muted/20">
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-2">
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-muted text-[10px] font-semibold">
                          {getInitials(`${c.first_name} ${c.last_name}`)}
                        </div>
                        <span className="font-medium">
                          {c.first_name} {c.last_name}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-2.5 text-muted-foreground">{c.title ?? '—'}</td>
                    <td className="px-4 py-2.5">
                      {c.company ? (
                        <Link
                          to="/accounts/$id"
                          params={{ id: c.company.id }}
                          className="hover:text-brand"
                        >
                          {c.company.name}
                        </Link>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="px-4 py-2.5 font-mono text-xs">
                      <div className="flex items-center gap-2">
                        <span className={emailRev ? '' : 'text-muted-foreground'}>
                          {emailRev ? c.email ?? '—' : maskEmail(c.email)}
                        </span>
                        {!emailRev && c.email && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-5 px-1 text-[10px]"
                            onClick={() => revealMut.mutate({ contactId: c.id, field: 'email' })}
                          >
                            <Eye className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-2.5 font-mono text-xs">
                      <div className="flex items-center gap-2">
                        <span className={phoneRev ? '' : 'text-muted-foreground'}>
                          {phoneRev ? c.phone ?? '—' : maskPhone(c.phone)}
                        </span>
                        {!phoneRev && c.phone && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-5 px-1 text-[10px]"
                            onClick={() => revealMut.mutate({ contactId: c.id, field: 'phone' })}
                          >
                            <Eye className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-2.5">
                      {c.linkedin_url ? (
                        <a
                          href={c.linkedin_url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center text-muted-foreground hover:text-brand"
                        >
                          <Linkedin className="h-4 w-4" />
                        </a>
                      ) : (
                        '—'
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
