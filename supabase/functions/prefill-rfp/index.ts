// Prefill an RFP wizard from uploaded company docs + (optional) inbound RFP + notes.
// Stateless: receives extracted text only, returns structured wizard inputs +
// extracted requirements/questions (vendor mode). Nothing is persisted server-side.
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const MAX_CHARS = 60_000; // hard cap on combined corpus we send to the model

interface SourceDoc {
  name: string;
  kind: 'COMPANY' | 'INBOUND_RFP' | 'NOTES';
  text: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
    const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!;
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY')!;

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return json({ error: 'Unauthorized' }, 401);
    }
    const sb = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: u, error: uErr } = await sb.auth.getUser();
    if (uErr || !u.user) return json({ error: 'Unauthorized' }, 401);

    const body = await req.json().catch(() => ({}));
    const mode: 'BUYER' | 'VENDOR_RESPONSE' = body.mode ?? 'BUYER';
    const industry: 'IT' | 'SOFTWARE' | 'AI' = body.industry ?? 'SOFTWARE';
    const title: string = (body.title ?? '').toString().slice(0, 300);
    const docs: SourceDoc[] = Array.isArray(body.docs) ? body.docs : [];

    if (!docs.length) return json({ error: 'At least one document or note is required' }, 400);

    // Build a clean corpus, capped
    let corpus = '';
    for (const d of docs) {
      const header = `\n\n===== ${d.kind} :: ${d.name} =====\n`;
      const remaining = MAX_CHARS - corpus.length - header.length;
      if (remaining <= 200) break;
      corpus += header + (d.text ?? '').slice(0, remaining);
    }
    corpus = corpus.trim();
    if (!corpus) return json({ error: 'No usable text in uploads' }, 400);

    const isVendor = mode === 'VENDOR_RESPONSE';

    const systemPrompt = isVendor
      ? `You are a senior proposal writer helping a ${industry} vendor respond to an inbound RFP. From the provided source material (company capabilities + the inbound RFP + any notes) you will (a) extract the buyer's requirements and questions verbatim where possible, and (b) draft every wizard field for a vendor response. Use only what is in the sources — flag invented details with [ASSUMPTION].`
      : `You are an experienced procurement / IT sourcing lead helping a buyer issue a ${industry} RFP. From the provided source material (company background docs + any notes) you will draft every wizard field. Use only what is in the sources — flag invented details with [ASSUMPTION]. Be concrete and concise.`;

    const userPrompt = `Working RFP title: ${title || '(none yet)'}
Mode: ${mode}
Industry: ${industry}

SOURCE MATERIAL (truncated to ${MAX_CHARS.toLocaleString()} chars):
${corpus}

Task:
1. Draft every wizard field. Each "lines" field should be a newline-separated list (3–7 items). Each prose field 1–4 sentences.
2. ${isVendor ? "From the INBOUND_RFP source(s), extract the buyer's discrete requirements and any questions they ask vendors. If no inbound RFP is present, leave those arrays empty." : 'Leave extracted_requirements and extracted_questions empty.'}
3. Suggest a short title if the user did not provide one.`;

    const aiResp = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        tools: [
          {
            type: 'function',
            function: {
              name: 'emit_prefill',
              description: 'Emit AI-prefilled RFP wizard inputs.',
              parameters: {
                type: 'object',
                properties: {
                  suggested_title: { type: 'string' },
                  organization: { type: 'string' },
                  background: { type: 'string' },
                  objectives: { type: 'string', description: 'One per line.' },
                  in_scope: { type: 'string', description: 'One per line.' },
                  out_of_scope: { type: 'string', description: 'One per line.' },
                  deliverables: { type: 'string', description: 'One per line.' },
                  functional: { type: 'string', description: 'One per line.' },
                  technical: { type: 'string', description: 'One per line.' },
                  integrations: { type: 'string', description: 'Comma- or newline-separated.' },
                  security: { type: 'string' },
                  sla: { type: 'string' },
                  budget: { type: 'string' },
                  pricing_model: { type: 'string' },
                  evaluation_focus: { type: 'string' },
                  notes: { type: 'string', description: 'Synthesised notes for the AI generator.' },
                  extracted_requirements: {
                    type: 'array',
                    items: { type: 'string' },
                    description: 'Discrete requirements pulled verbatim from the inbound RFP.',
                  },
                  extracted_questions: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        category: { type: 'string' },
                        question: { type: 'string' },
                      },
                      required: ['category', 'question'],
                      additionalProperties: false,
                    },
                    description: 'Questions the buyer asks vendors in the inbound RFP.',
                  },
                  source_summary: { type: 'string', description: '2-4 sentence summary of what was in the sources.' },
                },
                required: [
                  'suggested_title',
                  'organization',
                  'background',
                  'objectives',
                  'in_scope',
                  'out_of_scope',
                  'deliverables',
                  'functional',
                  'technical',
                  'integrations',
                  'security',
                  'sla',
                  'budget',
                  'pricing_model',
                  'evaluation_focus',
                  'notes',
                  'extracted_requirements',
                  'extracted_questions',
                  'source_summary',
                ],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: 'function', function: { name: 'emit_prefill' } },
      }),
    });

    if (!aiResp.ok) {
      const status = aiResp.status;
      const txt = await aiResp.text();
      console.error('AI prefill error', status, txt);
      if (status === 429) return json({ error: 'Rate limit exceeded, please try again in a moment.' }, 429);
      if (status === 402) return json({ error: 'AI credits exhausted. Add funds in Settings → Workspace → Usage.' }, 402);
      return json({ error: 'AI gateway error', detail: txt }, 500);
    }

    const aiJson = await aiResp.json();
    const tc = aiJson.choices?.[0]?.message?.tool_calls?.[0];
    if (!tc?.function?.arguments) throw new Error('AI did not return prefill content');
    const prefill = JSON.parse(tc.function.arguments);

    return json({ prefill });
  } catch (err) {
    console.error('prefill-rfp error:', err);
    return json({ error: err instanceof Error ? err.message : 'Unknown error' }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}
