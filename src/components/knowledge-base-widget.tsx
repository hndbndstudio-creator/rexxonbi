import { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/use-auth';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { extractFile } from '@/lib/rfp-intake';
import { BookOpen, Upload, Trash2, Loader2, Send, FileText, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';

type Msg = { role: 'user' | 'assistant'; content: string };

export function KnowledgeBaseWidget() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Msg[]>([]);
  const [asking, setAsking] = useState(false);
  const chatRef = useRef<HTMLDivElement>(null);

  const { data: docs = [] } = useQuery({
    queryKey: ['knowledge_docs', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('knowledge_docs')
        .select('id, name, size, created_at')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!user,
  });

  useEffect(() => {
    chatRef.current?.scrollTo({ top: chatRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, asking]);

  const deleteDoc = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('knowledge_docs').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['knowledge_docs'] });
      toast.success('Document removed');
    },
  });

  async function handleFiles(files: FileList | null) {
    if (!files || !user) return;
    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        try {
          const extracted = await extractFile(file, 'COMPANY');
          const { error } = await supabase.from('knowledge_docs').insert({
            user_id: user.id,
            name: extracted.name,
            content: extracted.text,
            size: extracted.size,
          });
          if (error) throw error;
          toast.success(`Added ${extracted.name}`);
        } catch (err) {
          toast.error(err instanceof Error ? err.message : `Failed: ${file.name}`);
        }
      }
      qc.invalidateQueries({ queryKey: ['knowledge_docs'] });
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  }

  async function send() {
    const q = input.trim();
    if (!q || asking) return;
    const next = [...messages, { role: 'user' as const, content: q }];
    setMessages(next);
    setInput('');
    setAsking(true);
    try {
      const { data, error } = await supabase.functions.invoke('chat-knowledge', {
        body: { messages: next },
      });
      if (error) throw error;
      setMessages([...next, { role: 'assistant', content: data.reply || '(no response)' }]);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Chat failed');
      setMessages([...next, { role: 'assistant', content: 'Sorry, something went wrong.' }]);
    } finally {
      setAsking(false);
    }
  }

  return (
    <div className="rounded-2xl border border-border surface-2 overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-3 p-5 text-left transition-colors hover:bg-accent/40"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand/10 text-brand">
            <BookOpen className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold">Knowledge base</h3>
            <p className="text-xs text-muted-foreground">
              {docs.length} {docs.length === 1 ? 'document' : 'documents'} · chat grounded in your company docs
            </p>
          </div>
        </div>
        <span className="text-xs text-muted-foreground">{open ? 'Hide' : 'Open'}</span>
      </button>

      {open && (
        <div className="grid gap-5 border-t border-border p-5 md:grid-cols-[280px_1fr]">
          {/* Docs */}
          <div className="flex flex-col gap-3">
            <input
              ref={fileRef}
              type="file"
              multiple
              accept=".pdf,.docx,.txt,.md"
              className="hidden"
              onChange={(e) => handleFiles(e.target.files)}
            />
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
            >
              {uploading ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Uploading…</>
              ) : (
                <><Upload className="mr-2 h-4 w-4" /> Upload docs</>
              )}
            </Button>
            <div className="flex-1 space-y-1.5 overflow-y-auto max-h-64">
              {docs.length === 0 && (
                <p className="rounded-lg border border-dashed border-border p-3 text-xs text-muted-foreground">
                  PDF, DOCX, TXT, MD. Sales playbooks, product one-pagers, case studies, pricing.
                </p>
              )}
              {docs.map((d) => (
                <div
                  key={d.id}
                  className="group flex items-center gap-2 rounded-lg border border-border bg-background p-2 text-xs"
                >
                  <FileText className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-medium">{d.name}</div>
                    <div className="text-muted-foreground">
                      {Math.round(d.size / 1000)}k chars · {formatDistanceToNow(new Date(d.created_at), { addSuffix: true })}
                    </div>
                  </div>
                  <button
                    onClick={() => deleteDoc.mutate(d.id)}
                    className="opacity-0 transition-opacity group-hover:opacity-100"
                    aria-label="Remove document"
                  >
                    <Trash2 className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Chat */}
          <div className="flex min-h-[320px] flex-col rounded-lg border border-border bg-background">
            <div ref={chatRef} className="flex-1 space-y-3 overflow-y-auto p-4 max-h-[340px]">
              {messages.length === 0 && (
                <div className="flex h-full flex-col items-center justify-center gap-2 text-center text-xs text-muted-foreground">
                  <Sparkles className="h-5 w-5 text-brand" />
                  <p>Ask anything about your uploaded docs.</p>
                  <p className="text-[11px]">e.g. "What's our pricing for mid-market?" or "Summarise the security FAQ."</p>
                </div>
              )}
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={`max-w-[90%] rounded-lg px-3 py-2 text-sm ${
                    m.role === 'user'
                      ? 'ml-auto bg-brand/10 text-foreground'
                      : 'bg-muted text-foreground'
                  }`}
                >
                  <div className="whitespace-pre-wrap leading-relaxed">{m.content}</div>
                </div>
              ))}
              {asking && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" /> Thinking…
                </div>
              )}
            </div>
            <div className="flex gap-2 border-t border-border p-2">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    send();
                  }
                }}
                rows={1}
                placeholder="Ask your knowledge base…"
                className="min-h-[40px] resize-none"
              />
              <Button onClick={send} disabled={asking || !input.trim()} size="icon">
                {asking ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
