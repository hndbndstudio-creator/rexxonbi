// Generate a fresh AI buying signal for a random company in the database.
// Uses Lovable AI Gateway (Gemini Flash) with tool-calling for structured output.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const SIGNAL_TYPES = ['GROWTH', 'COMPLIANCE', 'TECH_EXPANSION', 'SALES_OPS', 'LEADERSHIP', 'FUNDING', 'EARNINGS'];
const SOURCES = ['LINKEDIN', 'GREENHOUSE', 'LEVER', 'CRUNCHBASE', 'BUSINESS_WIRE', 'GOOGLE_NEWS', 'INDEED'];
const SENIORITIES = ['C_LEVEL', 'VP', 'DIRECTOR', 'MANAGER'];

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY')!;

    const sb = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Pick a random company
    const { data: companies, error: cErr } = await sb
      .from('companies')
      .select('id,name,domain,industry,employee_range,description');
    if (cErr) throw cErr;
    if (!companies || companies.length === 0) {
      return new Response(JSON.stringify({ error: 'No companies in database' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    const company = companies[Math.floor(Math.random() * companies.length)];

    // Ask the model for a plausible signal
    const aiResp = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-3-flash-preview',
        messages: [
          {
            role: 'system',
            content:
              'You are a B2B sales intelligence engine. Invent a single plausible buying signal for a real company based on a public hire, news, funding event, or earnings note. Be specific, actionable, and grounded. Never invent compromising or sensitive data.',
          },
          {
            role: 'user',
            content: `Company: ${company.name}\nDomain: ${company.domain}\nIndustry: ${company.industry ?? 'unknown'}\nSize: ${company.employee_range ?? 'unknown'}\nAbout: ${company.description ?? 'n/a'}\n\nGenerate one buying signal for this company.`,
          },
        ],
        tools: [
          {
            type: 'function',
            function: {
              name: 'emit_signal',
              description: 'Return a structured B2B buying signal.',
              parameters: {
                type: 'object',
                properties: {
                  signal_type: { type: 'string', enum: SIGNAL_TYPES },
                  source: { type: 'string', enum: SOURCES },
                  title: { type: 'string', description: 'Short headline, e.g. "VP Engineering hire posted"' },
                  ai_insight: {
                    type: 'string',
                    description:
                      'One paragraph on what this means for buying intent and the likely 60–90 day window.',
                  },
                  spend_categories: { type: 'array', items: { type: 'string' }, minItems: 1, maxItems: 4 },
                  vendor_suggestions: { type: 'array', items: { type: 'string' }, minItems: 1, maxItems: 4 },
                  confidence_score: { type: 'integer', minimum: 60, maximum: 95 },
                  seniority_level: { type: 'string', enum: SENIORITIES },
                  role_category: { type: 'string' },
                },
                required: [
                  'signal_type',
                  'source',
                  'title',
                  'ai_insight',
                  'spend_categories',
                  'vendor_suggestions',
                  'confidence_score',
                ],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: 'function', function: { name: 'emit_signal' } },
      }),
    });

    if (!aiResp.ok) {
      if (aiResp.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limit reached' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (aiResp.status === 402) {
        return new Response(JSON.stringify({ error: 'AI credits exhausted' }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      const txt = await aiResp.text();
      console.error('AI gateway error', aiResp.status, txt);
      return new Response(JSON.stringify({ error: 'AI gateway error', detail: txt }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const aiJson = await aiResp.json();
    const toolCall = aiJson.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall?.function?.arguments) {
      throw new Error('AI did not return a tool call');
    }
    const args = JSON.parse(toolCall.function.arguments);

    // Optionally create a contact for this signal
    const firstNames = ['Sarah', 'James', 'Priya', 'Marcus', 'Elena', 'David', 'Aisha', 'Tom', 'Lina', 'Carlos'];
    const lastNames = ['Chen', 'Patel', 'Williams', 'Garcia', 'Nguyen', 'Smith', 'Khan', 'Brown', 'Park', 'Rivera'];
    const fn = firstNames[Math.floor(Math.random() * firstNames.length)];
    const ln = lastNames[Math.floor(Math.random() * lastNames.length)];

    const { data: contact, error: ctErr } = await sb
      .from('contacts')
      .insert({
        company_id: company.id,
        first_name: fn,
        last_name: ln,
        title: args.role_category ? `${args.seniority_level === 'C_LEVEL' ? 'Chief' : args.seniority_level} ${args.role_category}` : 'Hiring Manager',
        email: `${fn.toLowerCase()}.${ln.toLowerCase()}@${company.domain}`,
        phone: `+1-415-555-${1000 + Math.floor(Math.random() * 8999)}`,
        linkedin_url: `https://linkedin.com/in/${fn.toLowerCase()}-${ln.toLowerCase()}`,
        is_enriched: true,
      })
      .select()
      .single();
    if (ctErr) console.error('contact insert failed', ctErr);

    // Insert the signal
    const { data: signal, error: sErr } = await sb
      .from('signals')
      .insert({
        company_id: company.id,
        signal_type: args.signal_type,
        source: args.source,
        title: args.title,
        ai_insight: args.ai_insight,
        spend_categories: args.spend_categories ?? [],
        vendor_suggestions: args.vendor_suggestions ?? [],
        confidence_score: args.confidence_score ?? 75,
        seniority_level: args.seniority_level ?? null,
        role_category: args.role_category ?? null,
        hiring_manager_contact_id: contact?.id ?? null,
        is_read: false,
        status: 'NEW',
        published_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (sErr) throw sErr;

    return new Response(JSON.stringify({ signal, company: company.name }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('generate-signal error:', err);
    return new Response(JSON.stringify({ error: err instanceof Error ? err.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
