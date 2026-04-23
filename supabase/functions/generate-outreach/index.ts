// Generate or regenerate an AI outreach draft for a signal.
// Saves the draft to outreach_drafts. Uses the user's JWT so RLS applies.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const TONE_GUIDE: Record<string, string> = {
  PROFESSIONAL: 'Polished, executive-friendly, no slang. 110–140 words.',
  DIRECT: 'Punchy, bullet-driven, no fluff. 70–90 words.',
  CASUAL: 'Warm, first-person, conversational, lightly informal. 90–120 words.',
  FOLLOWUP: 'Reference a prior touchpoint, restate value, ask for a 15-min call. 60–90 words.',
};

const PERSONA_GUIDE: Record<string, string> = {
  AE: 'You are an Account Executive selling enterprise software.',
  SDR: 'You are a Sales Development Rep prospecting for meetings.',
  VP_SALES: 'You are a VP of Sales reaching out peer-to-peer.',
  AGENCY: 'You are an agency partner offering a tailored service engagement.',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
    const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!;
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY')!;
    const authHeader = req.headers.get('Authorization') ?? '';

    const sb = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: userRes } = await sb.auth.getUser();
    const user = userRes?.user;
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const body = await req.json();
    const {
      signalId,
      contactId = null,
      tone = 'PROFESSIONAL',
      persona = 'AE',
      draftId = null,
    } = body ?? {};

    if (!signalId) {
      return new Response(JSON.stringify({ error: 'signalId required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Load signal + company
    const { data: signal, error: sErr } = await sb
      .from('signals')
      .select(`*, company:companies!signals_company_id_fkey(name,domain,industry)`)
      .eq('id', signalId)
      .maybeSingle();
    if (sErr) throw sErr;
    if (!signal) throw new Error('Signal not found');

    let contactName = 'there';
    if (contactId) {
      const { data: c } = await sb.from('contacts').select('first_name,title').eq('id', contactId).maybeSingle();
      if (c) contactName = c.first_name;
    }

    // Generate via AI gateway
    const aiResp = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'google/gemini-3-flash-preview',
        messages: [
          {
            role: 'system',
            content: `${PERSONA_GUIDE[persona] ?? PERSONA_GUIDE.AE} You write cold outreach grounded in real buying signals. Tone: ${TONE_GUIDE[tone] ?? TONE_GUIDE.PROFESSIONAL} Never invent stats. Reference the signal naturally. Always end with one clear ask.`,
          },
          {
            role: 'user',
            content: `Company: ${(signal as any).company?.name}\nDomain: ${(signal as any).company?.domain}\nIndustry: ${(signal as any).company?.industry ?? 'unknown'}\nSignal: ${signal.title}\nInsight: ${signal.ai_insight}\nSpend categories: ${(signal.spend_categories ?? []).join(', ')}\nVendor mentions: ${(signal.vendor_suggestions ?? []).join(', ')}\nRecipient first name: ${contactName}\n\nWrite a cold email. Return JSON only.`,
          },
        ],
        tools: [
          {
            type: 'function',
            function: {
              name: 'emit_email',
              description: 'Return the cold outreach email.',
              parameters: {
                type: 'object',
                properties: {
                  subject: { type: 'string', description: 'Subject line under 60 chars.' },
                  body: { type: 'string', description: 'Email body, plain text, with greeting and signature placeholder.' },
                },
                required: ['subject', 'body'],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: 'function', function: { name: 'emit_email' } },
      }),
    });

    if (!aiResp.ok) {
      if (aiResp.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limit reached' }), {
          status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (aiResp.status === 402) {
        return new Response(JSON.stringify({ error: 'AI credits exhausted' }), {
          status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      const txt = await aiResp.text();
      console.error('AI gateway', aiResp.status, txt);
      return new Response(JSON.stringify({ error: 'AI gateway error', detail: txt }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const aiJson = await aiResp.json();
    const tc = aiJson.choices?.[0]?.message?.tool_calls?.[0];
    if (!tc?.function?.arguments) throw new Error('No tool call returned');
    const { subject, body: emailBody } = JSON.parse(tc.function.arguments);

    // Upsert draft
    if (draftId) {
      const { data, error } = await sb
        .from('outreach_drafts')
        .update({ subject, body: emailBody, tone, persona, status: 'PENDING' as const })
        .eq('id', draftId)
        .select()
        .single();
      if (error) throw error;
      return new Response(JSON.stringify({ draft: data }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } else {
      const { data, error } = await sb
        .from('outreach_drafts')
        .insert({
          user_id: user.id,
          signal_id: signalId,
          contact_id: contactId,
          subject,
          body: emailBody,
          tone,
          persona,
          status: 'PENDING' as const,
        })
        .select()
        .single();
      if (error) throw error;
      return new Response(JSON.stringify({ draft: data }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  } catch (err) {
    console.error('generate-outreach error:', err);
    return new Response(JSON.stringify({ error: err instanceof Error ? err.message : 'Unknown' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
