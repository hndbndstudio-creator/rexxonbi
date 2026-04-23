// Generate a 3-step outreach sequence (Day 0 / Day 3 / Day 7) from a signal.
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

    // Verify caller
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    const userClient = createClient(SUPABASE_URL, Deno.env.get('SUPABASE_ANON_KEY')!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData } = await userClient.auth.getUser();
    const userId = userData.user?.id;
    if (!userId) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const sb = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const { signalId, contactId } = await req.json().catch(() => ({}));
    if (!signalId) {
      return new Response(JSON.stringify({ error: 'signalId required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { data: signal, error: sErr } = await sb
      .from('signals')
      .select('*, company:companies!signals_company_id_fkey(name,domain,industry)')
      .eq('id', signalId)
      .maybeSingle();
    if (sErr) throw sErr;
    if (!signal) {
      return new Response(JSON.stringify({ error: 'Signal not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    let contact: any = null;
    if (contactId) {
      const { data: c } = await sb.from('contacts').select('*').eq('id', contactId).maybeSingle();
      contact = c;
    }

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
              'You write three-step B2B cold email cadences. Step 1 (Day 0): hook on the signal. Step 2 (Day 3): value reframe with a specific stat or example. Step 3 (Day 7): short break-up. All emails under 90 words, no fluff, no emojis.',
          },
          {
            role: 'user',
            content: `Signal: ${signal.title}\nWhy it matters: ${signal.ai_insight}\nCompany: ${(signal as any).company?.name}\nIndustry: ${(signal as any).company?.industry ?? 'n/a'}\nContact: ${contact ? `${contact.first_name} ${contact.last_name}, ${contact.title ?? 'unknown role'}` : 'unknown'}`,
          },
        ],
        tools: [
          {
            type: 'function',
            function: {
              name: 'emit_sequence',
              description: 'Emit a 3-step email sequence.',
              parameters: {
                type: 'object',
                properties: {
                  steps: {
                    type: 'array',
                    minItems: 3,
                    maxItems: 3,
                    items: {
                      type: 'object',
                      properties: {
                        day_offset: { type: 'integer', minimum: 0, maximum: 14 },
                        subject: { type: 'string' },
                        body: { type: 'string' },
                      },
                      required: ['day_offset', 'subject', 'body'],
                      additionalProperties: false,
                    },
                  },
                },
                required: ['steps'],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: 'function', function: { name: 'emit_sequence' } },
      }),
    });

    if (!aiResp.ok) {
      const status = aiResp.status;
      const txt = await aiResp.text();
      return new Response(JSON.stringify({ error: 'AI gateway error', detail: txt }), {
        status: status === 429 || status === 402 ? status : 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const aiJson = await aiResp.json();
    const tc = aiJson.choices?.[0]?.message?.tool_calls?.[0];
    if (!tc?.function?.arguments) throw new Error('AI did not return a sequence');
    const args = JSON.parse(tc.function.arguments);

    const { data: seq, error: insErr } = await sb
      .from('outreach_sequences')
      .insert({
        user_id: userId,
        name: `Cadence — ${(signal as any).company?.name ?? 'Account'}`,
        signal_id: signalId,
        contact_id: contactId ?? null,
        steps: args.steps,
        status: 'DRAFT',
      })
      .select()
      .single();
    if (insErr) throw insErr;

    return new Response(JSON.stringify({ sequence: seq }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('generate-sequence error:', err);
    return new Response(JSON.stringify({ error: err instanceof Error ? err.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
