// @ts-nocheck
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { createRemoteJWKSet, jwtVerify } from 'https://esm.sh/jose@5';

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
const ADMIN_EMAIL = Deno.env.get('ADMIN_EMAIL');
const RESEND_FROM_EMAIL = Deno.env.get('RESEND_FROM_EMAIL');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

// JWKS endpoint supports ES256 (asymmetric), unlike the gateway's built-in
// JWT verification which only handles legacy HS256.
const JWKS = createRemoteJWKSet(new URL(`${SUPABASE_URL}/auth/v1/.well-known/jwks.json`));

interface TransactionNotificationPayload {
  transaction_id: string;
  user_id: string;
  type: 'deposit' | 'withdrawal';
  amount: number;
  currency: string;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { status: 200, headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405, headers: corsHeaders });
  }

  // Manual JWT verification using JWKS (supports ES256 used by newer Supabase projects)
  const authHeader = req.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return json({ error: 'Missing authorization header' }, 401);
  }

  try {
    await jwtVerify(authHeader.replace('Bearer ', ''), JWKS);
  } catch {
    return json({ error: 'Invalid or expired token' }, 401);
  }

  if (!RESEND_API_KEY || !ADMIN_EMAIL || !RESEND_FROM_EMAIL) {
    return json(
      { error: 'Missing required secrets: RESEND_API_KEY, ADMIN_EMAIL or RESEND_FROM_EMAIL' },
      500,
    );
  }

  try {
    const payload: TransactionNotificationPayload = await req.json();

    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const { data: profile } = await supabaseAdmin
      .from('user_profiles')
      .select('full_name, email')
      .eq('user_id', payload.user_id)
      .single();

    const userName = profile?.full_name ?? 'Usuario desconocido';
    const typeLabel = payload.type === 'deposit' ? 'Depósito' : 'Retiro';
    const formattedAmount = new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: payload.currency,
    }).format(payload.amount);

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
        <h2 style="color: #1a1a1a; margin-bottom: 8px;">Nueva solicitud de ${typeLabel}</h2>
        <p style="color: #666; margin-bottom: 24px;">Se ha registrado una nueva solicitud pendiente de revisión.</p>

        <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
          <tr>
            <td style="padding: 12px; background: #f5f5f5; font-weight: bold; width: 40%; border-radius: 4px 0 0 4px;">Usuario</td>
            <td style="padding: 12px; background: #f5f5f5; border-radius: 0 4px 4px 0;">${userName}</td>
          </tr>
          <tr>
            <td style="padding: 12px; font-weight: bold; width: 40%;">Tipo de solicitud</td>
            <td style="padding: 12px;">${typeLabel}</td>
          </tr>
          <tr>
            <td style="padding: 12px; background: #f5f5f5; font-weight: bold; width: 40%;">Monto</td>
            <td style="padding: 12px; background: #f5f5f5;">${formattedAmount}</td>
          </tr>
          <tr>
            <td style="padding: 12px; font-weight: bold; width: 40%;">ID de transacción</td>
            <td style="padding: 12px; font-size: 12px; color: #888;">${payload.transaction_id}</td>
          </tr>
        </table>

        <p style="color: #888; font-size: 12px; margin-top: 32px;">
          Este es un mensaje automático generado por Lasu Financial.
        </p>
      </div>
    `;

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: RESEND_FROM_EMAIL,
        to: ADMIN_EMAIL,
        subject: `Nueva solicitud de ${typeLabel} — ${userName}`,
        html: emailHtml,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      console.error('Resend error:', JSON.stringify(data));
    }

    return json(data, res.status);
  } catch (error) {
    return json({ error: (error as Error).message }, 500);
  }
});
