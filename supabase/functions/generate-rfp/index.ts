// Generate an RFP (or vendor response to an RFP) for IT, Software, or AI projects.
// Uses Lovable AI Gateway with structured tool-calling output.
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
    const userId = userData.user.id;

    const { rfpId } = await req.json().catch(() => ({}));
    if (!rfpId) {
      return new Response(JSON.stringify({ error: 'rfpId required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { data: rfp, error: rErr } = await sb
      .from('rfps')
      .select('*')
      .eq('id', rfpId)
      .eq('user_id', userId)
      .maybeSingle();
    if (rErr) throw rErr;
    if (!rfp) {
      return new Response(JSON.stringify({ error: 'RFP not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const inputs = (rfp.inputs ?? {}) as Record<string, any>;
    const isVendorResponse = rfp.mode === 'VENDOR_RESPONSE';

    const systemPrompt = isVendorResponse
      ? `You are a senior proposal writer for a ${rfp.industry} services / software / AI vendor. You craft winning, specific RFP responses that demonstrate domain expertise. Avoid generic boilerplate. Use ONLY the context provided — do not invent metrics, customer names, or certifications that were not given.`
      : `You are an experienced procurement and IT sourcing lead. You write rigorous, vendor-friendly RFPs for the ${rfp.industry} category (IT, software, or AI). Output is precise, scope is unambiguous, evaluation is objective, and timelines are realistic.`;

    const userPrompt = `Mode: ${isVendorResponse ? 'VENDOR RESPONSE to an inbound RFP' : 'BUYER issuing an RFP'}
Industry: ${rfp.industry}
Title: ${rfp.title}

Wizard inputs (JSON):
${JSON.stringify(inputs, null, 2)}

Produce a complete, professional document. Be concrete. Pull verbatim phrasing from the inputs where it makes sense. If a field is missing, make a reasonable, conservative assumption and flag it as [ASSUMPTION].`;

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
              name: 'emit_rfp',
              description: 'Emit a complete, structured RFP document.',
              parameters: {
                type: 'object',
                properties: {
                  executive_summary: {
                    type: 'string',
                    description: '4-6 sentences setting context: who the buyer is, what they need, the strategic outcome, and why now.',
                  },
                  background: {
                    type: 'string',
                    description: '1-2 paragraphs of organizational background, current state, and the business problem.',
                  },
                  objectives: {
                    type: 'array',
                    items: { type: 'string' },
                    minItems: 3,
                    maxItems: 6,
                    description: 'Concrete, measurable project objectives.',
                  },
                  scope_of_work: {
                    type: 'object',
                    properties: {
                      in_scope: { type: 'array', items: { type: 'string' }, minItems: 3 },
                      out_of_scope: { type: 'array', items: { type: 'string' }, minItems: 1 },
                      deliverables: { type: 'array', items: { type: 'string' }, minItems: 3 },
                    },
                    required: ['in_scope', 'out_of_scope', 'deliverables'],
                    additionalProperties: false,
                  },
                  requirements: {
                    type: 'object',
                    properties: {
                      functional: { type: 'array', items: { type: 'string' }, minItems: 4 },
                      technical: { type: 'array', items: { type: 'string' }, minItems: 3 },
                      integrations: { type: 'array', items: { type: 'string' } },
                      security_compliance: { type: 'array', items: { type: 'string' }, minItems: 2 },
                      sla: { type: 'array', items: { type: 'string' }, minItems: 2 },
                    },
                    required: ['functional', 'technical', 'integrations', 'security_compliance', 'sla'],
                    additionalProperties: false,
                  },
                  cost: {
                    type: 'object',
                    properties: {
                      pricing_model: { type: 'string', description: 'Recommended pricing structure (fixed, T&M, subscription, usage-based, etc.).' },
                      budget_range: { type: 'string', description: 'Stated or estimated budget band.' },
                      cost_breakdown: {
                        type: 'array',
                        items: {
                          type: 'object',
                          properties: {
                            line_item: { type: 'string' },
                            description: { type: 'string' },
                            estimated_cost: { type: 'string' },
                          },
                          required: ['line_item', 'description', 'estimated_cost'],
                          additionalProperties: false,
                        },
                        minItems: 3,
                        maxItems: 8,
                      },
                      payment_terms: { type: 'string' },
                    },
                    required: ['pricing_model', 'budget_range', 'cost_breakdown', 'payment_terms'],
                    additionalProperties: false,
                  },
                  timeline: {
                    type: 'object',
                    properties: {
                      milestones: {
                        type: 'array',
                        items: {
                          type: 'object',
                          properties: {
                            name: { type: 'string' },
                            target_date: { type: 'string', description: 'Relative or absolute date (e.g. "Week 4", "2025-08-15").' },
                            description: { type: 'string' },
                          },
                          required: ['name', 'target_date', 'description'],
                          additionalProperties: false,
                        },
                        minItems: 4,
                        maxItems: 8,
                      },
                      submission_deadline: { type: 'string' },
                      decision_date: { type: 'string' },
                    },
                    required: ['milestones', 'submission_deadline', 'decision_date'],
                    additionalProperties: false,
                  },
                  vendor_questions: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        category: { type: 'string', description: 'e.g. Company, Experience, Technical, Security, Pricing, References.' },
                        question: { type: 'string' },
                      },
                      required: ['category', 'question'],
                      additionalProperties: false,
                    },
                    minItems: 8,
                    maxItems: 16,
                  },
                  evaluation_criteria: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        criterion: { type: 'string' },
                        weight_pct: { type: 'number', description: 'Weight as a percentage (0-100). All weights should sum to 100.' },
                        notes: { type: 'string' },
                      },
                      required: ['criterion', 'weight_pct', 'notes'],
                      additionalProperties: false,
                    },
                    minItems: 4,
                    maxItems: 7,
                  },
                  submission_process: {
                    type: 'object',
                    properties: {
                      response_format: { type: 'string', description: 'How responses must be structured and submitted.' },
                      contact: { type: 'string', description: 'Primary point of contact and channel.' },
                      questions_deadline: { type: 'string' },
                      additional_instructions: { type: 'string' },
                    },
                    required: ['response_format', 'contact', 'questions_deadline', 'additional_instructions'],
                    additionalProperties: false,
                  },
                  assumptions_and_constraints: {
                    type: 'array',
                    items: { type: 'string' },
                    minItems: 2,
                  },
                },
                required: [
                  'executive_summary',
                  'background',
                  'objectives',
                  'scope_of_work',
                  'requirements',
                  'cost',
                  'timeline',
                  'vendor_questions',
                  'evaluation_criteria',
                  'submission_process',
                  'assumptions_and_constraints',
                ],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: 'function', function: { name: 'emit_rfp' } },
      }),
    });

    if (!aiResp.ok) {
      const status = aiResp.status;
      const txt = await aiResp.text();
      console.error('AI rfp error', status, txt);
      if (status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limit exceeded, please try again in a moment.' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (status === 402) {
        return new Response(JSON.stringify({ error: 'AI credits exhausted. Add funds in Settings → Workspace → Usage.' }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      return new Response(JSON.stringify({ error: 'AI gateway error', detail: txt }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const aiJson = await aiResp.json();
    const tc = aiJson.choices?.[0]?.message?.tool_calls?.[0];
    if (!tc?.function?.arguments) throw new Error('AI did not return RFP content');
    const content = JSON.parse(tc.function.arguments);

    await sb
      .from('rfps')
      .update({
        content,
        generated_at: new Date().toISOString(),
        status: 'GENERATED',
      })
      .eq('id', rfpId);

    return new Response(JSON.stringify({ content }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('generate-rfp error:', err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
