// Generate an AI research brief for a company. Cached on companies.brief.
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY')!;

    const sb = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Verify caller
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    const token = authHeader.replace('Bearer ', '');
    const { data: userData, error: uErr } = await sb.auth.getUser(token);
    if (uErr || !userData.user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { companyId, force } = await req.json().catch(() => ({}));
    if (!companyId) {
      return new Response(JSON.stringify({ error: 'companyId required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { data: company, error: cErr } = await sb
      .from('companies')
      .select('*')
      .eq('id', companyId)
      .maybeSingle();
    if (cErr) throw cErr;
    if (!company) {
      return new Response(JSON.stringify({ error: 'Company not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (company.brief && !force) {
      return new Response(JSON.stringify({ brief: company.brief, cached: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Recent signals for context
    const { data: signals } = await sb
      .from('signals')
      .select('signal_type,title,ai_insight,published_at')
      .eq('company_id', companyId)
      .order('published_at', { ascending: false })
      .limit(5);

    const aiResp = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content:
              'You are a senior B2B account researcher and revenue strategist. Produce a tight, sales-actionable brief on a company. Use only the provided context — do not invent specific facts. Be concrete and concise. Pay special attention to recent signals (especially hiring, funding, leadership, tech expansion): explain what they reveal about the company\'s priorities, what they are likely building or scaling, and what products/services would be most sellable into them right now.',
          },
          {
            role: 'user',
            content: `Company: ${company.name}\nDomain: ${company.domain}\nIndustry: ${company.industry ?? 'unknown'}\nSize: ${company.employee_range ?? 'unknown'}\nFunding: ${company.funding_stage ?? 'unknown'}\nHQ: ${company.hq_city ?? ''} ${company.hq_country ?? ''}\nDescription: ${company.description ?? 'n/a'}\nTech stack: ${(company.tech_stack ?? []).join(', ') || 'unknown'}\n\nRecent signals:\n${(signals ?? []).map((s, i) => `${i + 1}. [${s.signal_type}] ${s.title} — ${s.ai_insight}`).join('\n') || 'None on file.'}`,
          },
        ],
        tools: [
          {
            type: 'function',
            function: {
              name: 'emit_brief',
              description: 'Emit a structured account research brief.',
              parameters: {
                type: 'object',
                properties: {
                  summary: { type: 'string', description: '2–3 sentence positioning summary.' },
                  why_now: { type: 'string', description: 'Why this is a good moment to engage.' },
                  signal_interpretation: {
                    type: 'string',
                    description:
                      'A 2–4 sentence narrative explaining what the recent signals (hiring, funding, leadership, tech expansion) reveal about the company\'s strategic direction. Connect the dots: e.g. "They\'re hiring 8 backend engineers and a new VP of Engineering — they\'re scaling their core platform and likely need observability, dev tooling, and infra spend." If no signals are on file, say so.',
                  },
                  what_they_are_building: {
                    type: 'array',
                    items: { type: 'string' },
                    minItems: 2,
                    maxItems: 5,
                    description: 'Concrete initiatives, capabilities, or teams the company is investing in based on the signals (e.g. "Scaling data platform team", "Standing up an enterprise security function", "Expanding into EMEA").',
                  },
                  sellable_products: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        category: { type: 'string', description: 'Product/service category they would buy (e.g. "Observability platform", "Sales enablement tooling", "GRC software").' },
                        rationale: { type: 'string', description: 'One-sentence reason this fits the signals.' },
                      },
                      required: ['category', 'rationale'],
                      additionalProperties: false,
                    },
                    minItems: 3,
                    maxItems: 6,
                    description: 'Specific product/service categories that would be sellable into this account right now, each tied to a signal-driven rationale.',
                  },
                  budget_signals: {
                    type: 'array',
                    items: { type: 'string' },
                    minItems: 1,
                    maxItems: 4,
                    description: 'Evidence the company has budget or hiring/spending headroom (e.g. "Series C raised 4 months ago", "12 open engineering roles", "New CFO from PE-backed firm").',
                  },
                  urgency: {
                    type: 'string',
                    enum: ['HIGH', 'MEDIUM', 'LOW'],
                    description: 'How urgent it is to engage right now based on the signals.',
                  },
                  urgency_reason: { type: 'string', description: 'One sentence justifying the urgency level.' },
                  pain_points: { type: 'array', items: { type: 'string' }, minItems: 2, maxItems: 5 },
                  buying_committee: { type: 'array', items: { type: 'string' }, minItems: 2, maxItems: 5 },
                  conversation_starters: { type: 'array', items: { type: 'string' }, minItems: 2, maxItems: 5 },
                  competitive_risks: { type: 'array', items: { type: 'string' }, minItems: 1, maxItems: 4 },
                },
                required: [
                  'summary',
                  'why_now',
                  'signal_interpretation',
                  'what_they_are_building',
                  'sellable_products',
                  'budget_signals',
                  'urgency',
                  'urgency_reason',
                  'pain_points',
                  'buying_committee',
                  'conversation_starters',
                  'competitive_risks',
                ],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: 'function', function: { name: 'emit_brief' } },
      }),
    });

    if (!aiResp.ok) {
      const status = aiResp.status;
      const txt = await aiResp.text();
      console.error('AI brief error', status, txt);
      return new Response(JSON.stringify({ error: 'AI gateway error', detail: txt }), {
        status: status === 429 || status === 402 ? status : 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const aiJson = await aiResp.json();
    const tc = aiJson.choices?.[0]?.message?.tool_calls?.[0];
    if (!tc?.function?.arguments) throw new Error('AI did not return a brief');
    const brief = { ...JSON.parse(tc.function.arguments), generated_at: new Date().toISOString() };

    await sb.from('companies').update({ brief }).eq('id', companyId);

    return new Response(JSON.stringify({ brief, cached: false }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('generate-brief error:', err);
    return new Response(JSON.stringify({ error: err instanceof Error ? err.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
