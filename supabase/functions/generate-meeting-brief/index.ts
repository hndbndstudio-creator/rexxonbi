// Generate a pre-meeting briefing: account summary, contact background,
// talking points, and a sales script. Cached on meetings.brief.
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
    const userId = userData.user.id;

    const { meetingId, force } = await req.json().catch(() => ({}));
    if (!meetingId) {
      return new Response(JSON.stringify({ error: 'meetingId required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Load meeting (must belong to user)
    const { data: meeting, error: mErr } = await sb
      .from('meetings')
      .select('*')
      .eq('id', meetingId)
      .eq('user_id', userId)
      .maybeSingle();
    if (mErr) throw mErr;
    if (!meeting) {
      return new Response(JSON.stringify({ error: 'Meeting not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (meeting.brief && !force) {
      return new Response(JSON.stringify({ brief: meeting.brief, cached: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Load context: company, contact, recent signals
    const [companyRes, contactRes, signalsRes] = await Promise.all([
      meeting.company_id
        ? sb.from('companies').select('*').eq('id', meeting.company_id).maybeSingle()
        : Promise.resolve({ data: null, error: null }),
      meeting.contact_id
        ? sb.from('contacts').select('*').eq('id', meeting.contact_id).maybeSingle()
        : Promise.resolve({ data: null, error: null }),
      meeting.company_id
        ? sb
            .from('signals')
            .select('signal_type,title,ai_insight,published_at')
            .eq('company_id', meeting.company_id)
            .order('published_at', { ascending: false })
            .limit(5)
        : Promise.resolve({ data: [], error: null }),
    ]);

    const company = companyRes.data as any;
    const contact = contactRes.data as any;
    const signals = (signalsRes.data ?? []) as any[];

    // Profile for personalization
    const { data: profile } = await sb
      .from('profiles')
      .select('first_name,last_name,company_name,position')
      .eq('user_id', userId)
      .maybeSingle();

    const userName = [profile?.first_name, profile?.last_name].filter(Boolean).join(' ') || 'the rep';
    const userCompany = profile?.company_name || 'our company';

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
              'You are an elite B2B sales coach preparing a rep for a meeting today. Produce a tight, action-ready briefing they can read in 2 minutes. Use ONLY the provided context — do not invent specific facts (no fake numbers, names, or events). Be concrete, specific, and persuasive. The talking points and sales script must sound like a real human rep, not a template.',
          },
          {
            role: 'user',
            content: `Meeting: ${meeting.title}
Scheduled: ${meeting.scheduled_at}
Notes from rep: ${meeting.notes ?? 'none'}

Rep info: ${userName} from ${userCompany}

Company: ${company?.name ?? 'unknown'}
Domain: ${company?.domain ?? 'unknown'}
Industry: ${company?.industry ?? 'unknown'}
Size: ${company?.employee_range ?? 'unknown'}
Funding stage: ${company?.funding_stage ?? 'unknown'}
HQ: ${company?.hq_city ?? ''} ${company?.hq_country ?? ''}
Description: ${company?.description ?? 'n/a'}
Tech stack: ${(company?.tech_stack ?? []).join(', ') || 'unknown'}

Contact: ${contact ? `${contact.first_name} ${contact.last_name}` : 'unknown'}
Title: ${contact?.title ?? 'unknown'}
Signal context: ${contact?.signal_context ?? 'n/a'}

Recent buying signals (most recent first):
${signals.map((s, i) => `${i + 1}. [${s.signal_type}] ${s.title} — ${s.ai_insight}`).join('\n') || 'None on file.'}`,
          },
        ],
        tools: [
          {
            type: 'function',
            function: {
              name: 'emit_meeting_brief',
              description: 'Emit a structured pre-meeting briefing for the sales rep.',
              parameters: {
                type: 'object',
                properties: {
                  account_summary: {
                    type: 'string',
                    description: '3-4 sentence executive snapshot of the company: what they do, scale, current trajectory, and why they are worth a meeting.',
                  },
                  why_now: {
                    type: 'string',
                    description: '1-2 sentences tying the recent signals to why this meeting is well-timed.',
                  },
                  contact_background: {
                    type: 'object',
                    properties: {
                      role_summary: { type: 'string', description: 'What this person owns and cares about based on their title.' },
                      likely_priorities: {
                        type: 'array',
                        items: { type: 'string' },
                        minItems: 2,
                        maxItems: 4,
                        description: 'What is probably top-of-mind for them right now given the company signals.',
                      },
                      how_to_approach: { type: 'string', description: 'One sentence on tone and angle for this person.' },
                    },
                    required: ['role_summary', 'likely_priorities', 'how_to_approach'],
                    additionalProperties: false,
                  },
                  key_facts: {
                    type: 'array',
                    items: { type: 'string' },
                    minItems: 3,
                    maxItems: 6,
                    description: 'Bullet facts to MEMORIZE before the call (e.g. "Series B raised 6 months ago", "Hiring 12 backend engineers", "New CISO from Snowflake").',
                  },
                  talking_points: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        topic: { type: 'string', description: 'Short topic label (3-6 words).' },
                        question: { type: 'string', description: 'A specific, open-ended discovery question to ask out loud.' },
                        why_it_matters: { type: 'string', description: 'One sentence explaining what this question reveals.' },
                      },
                      required: ['topic', 'question', 'why_it_matters'],
                      additionalProperties: false,
                    },
                    minItems: 4,
                    maxItems: 6,
                    description: 'Discovery questions tailored to the signals and contact.',
                  },
                  sales_script: {
                    type: 'object',
                    properties: {
                      opener: {
                        type: 'string',
                        description: 'A 2-3 sentence opening the rep can say verbatim. Warm, specific to the company, references a recent signal naturally. No corporate fluff.',
                      },
                      value_pitch: {
                        type: 'string',
                        description: '2-3 sentence value proposition framed around what THIS company is going through right now (not generic).',
                      },
                      objection_handling: {
                        type: 'array',
                        items: {
                          type: 'object',
                          properties: {
                            objection: { type: 'string', description: 'A likely objection from this contact.' },
                            response: { type: 'string', description: 'How to handle it in 1-2 sentences.' },
                          },
                          required: ['objection', 'response'],
                          additionalProperties: false,
                        },
                        minItems: 2,
                        maxItems: 3,
                      },
                      close: {
                        type: 'string',
                        description: 'A confident next-step ask the rep can say at the end of the meeting.',
                      },
                    },
                    required: ['opener', 'value_pitch', 'objection_handling', 'close'],
                    additionalProperties: false,
                  },
                  things_to_avoid: {
                    type: 'array',
                    items: { type: 'string' },
                    minItems: 1,
                    maxItems: 3,
                    description: 'Topics, phrasing, or assumptions to avoid in this specific meeting.',
                  },
                },
                required: [
                  'account_summary',
                  'why_now',
                  'contact_background',
                  'key_facts',
                  'talking_points',
                  'sales_script',
                  'things_to_avoid',
                ],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: 'function', function: { name: 'emit_meeting_brief' } },
      }),
    });

    if (!aiResp.ok) {
      const status = aiResp.status;
      const txt = await aiResp.text();
      console.error('AI meeting brief error', status, txt);
      return new Response(JSON.stringify({ error: 'AI gateway error', detail: txt }), {
        status: status === 429 || status === 402 ? status : 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const aiJson = await aiResp.json();
    const tc = aiJson.choices?.[0]?.message?.tool_calls?.[0];
    if (!tc?.function?.arguments) throw new Error('AI did not return a brief');
    const brief = JSON.parse(tc.function.arguments);

    await sb
      .from('meetings')
      .update({ brief, brief_generated_at: new Date().toISOString() })
      .eq('id', meetingId);

    return new Response(JSON.stringify({ brief, cached: false }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('generate-meeting-brief error:', err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
