// Chat with the user's knowledge base (mini RAG).
// Stuffs all user docs (truncated) into a system prompt and answers via Lovable AI Gateway.
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const MAX_DOC_CHARS = 8000;
const MAX_TOTAL_CONTEXT = 60000;

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY')!;
    const sb = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    const token = authHeader.replace('Bearer ', '');
    const { data: userData, error: uErr } = await sb.auth.getUser(token);
    if (uErr || !userData.user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    const userId = userData.user.id;

    const { messages } = await req.json();
    if (!Array.isArray(messages) || messages.length === 0) {
      return new Response(JSON.stringify({ error: 'messages required' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { data: docs } = await sb
      .from('knowledge_docs')
      .select('name, content')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    let context = '';
    const sources: string[] = [];
    for (const d of docs ?? []) {
      const snippet = (d.content as string).slice(0, MAX_DOC_CHARS);
      const block = `\n\n=== DOCUMENT: ${d.name} ===\n${snippet}`;
      if ((context + block).length > MAX_TOTAL_CONTEXT) break;
      context += block;
      sources.push(d.name as string);
    }

    const systemPrompt = context
      ? `You are an assistant for an account-based sales team. Answer the user's question USING ONLY the company knowledge base below. Cite the source document name in parentheses after each fact. If the answer isn't in the docs, say so plainly and suggest what to upload.\n\nKNOWLEDGE BASE:${context}`
      : `You are an assistant for an account-based sales team. The user has not uploaded any company documents yet. Politely ask them to upload PDFs, DOCX, or text files (sales playbooks, product one-pagers, case studies, pricing, security docs) so you can answer questions grounded in their content.`;

    const aiResp = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [{ role: 'system', content: systemPrompt }, ...messages],
      }),
    });

    if (!aiResp.ok) {
      const status = aiResp.status;
      const txt = await aiResp.text();
      console.error('chat-knowledge AI error', status, txt);
      if (status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limit exceeded. Try again shortly.' }), {
          status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (status === 402) {
        return new Response(JSON.stringify({ error: 'AI credits exhausted. Add funds in Settings → Workspace → Usage.' }), {
          status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      return new Response(JSON.stringify({ error: 'AI gateway error' }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const aiJson = await aiResp.json();
    const reply = aiJson.choices?.[0]?.message?.content ?? '';

    return new Response(JSON.stringify({ reply, sources }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('chat-knowledge error:', err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
