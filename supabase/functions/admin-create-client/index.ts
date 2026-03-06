// @ts-nocheck
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { createRemoteJWKSet, jwtVerify } from 'https://esm.sh/jose@5';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const JWKS = createRemoteJWKSet(new URL(`${SUPABASE_URL}/auth/v1/.well-known/jwks.json`));

interface CreateClientPayload {
  email: string;
  password: string;
  full_name: string;
  phone?: string;
  country?: string;
  date_of_birth?: string;
  role?: 'admin' | 'viewer';
  initial_balance?: number;
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

  // Verify JWT
  const authHeader = req.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return json({ error: 'Missing authorization header' }, 401);
  }

  let callerUserId: string;
  try {
    const { payload } = await jwtVerify(authHeader.replace('Bearer ', ''), JWKS);
    callerUserId = payload.sub as string;
  } catch {
    return json({ error: 'Invalid or expired token' }, 401);
  }

  const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  // Verify the caller is an active admin
  const { data: adminRole, error: adminError } = await supabaseAdmin
    .from('admin_roles')
    .select('role')
    .eq('user_id', callerUserId)
    .in('role', ['super_admin', 'admin'])
    .is('revoked_at', null)
    .maybeSingle();

  if (adminError || !adminRole) {
    return json({ error: 'Acceso denegado. Se requieren permisos de administrador.' }, 403);
  }

  // Parse and validate payload
  let payload: CreateClientPayload;
  try {
    payload = await req.json();
  } catch {
    return json({ error: 'Cuerpo de solicitud inválido' }, 400);
  }

  const { email, password, full_name, phone, country, date_of_birth, role, initial_balance } =
    payload;

  if (!email || !password || !full_name) {
    return json({ error: 'Faltan campos requeridos: email, password, full_name' }, 400);
  }

  if (password.length < 8) {
    return json({ error: 'La contraseña debe tener al menos 8 caracteres' }, 400);
  }

  // Create auth user with admin API (email is pre-confirmed)
  const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
    email: email.trim().toLowerCase(),
    password,
    email_confirm: true,
    user_metadata: {
      full_name: full_name.trim(),
    },
  });

  if (createError) {
    const msg = createError.message.toLowerCase();
    if (msg.includes('already registered') || msg.includes('already exists')) {
      return json({ error: 'Ya existe una cuenta con ese correo electrónico.' }, 409);
    }
    return json({ error: `Error al crear usuario: ${createError.message}` }, 500);
  }

  const userId = newUser.user.id;

  // Patch optional profile fields that the trigger may not set
  const profileUpdates: Record<string, string> = {};
  if (phone?.trim()) profileUpdates.phone = phone.trim();
  if (country?.trim()) profileUpdates.country = country.trim();
  if (date_of_birth) profileUpdates.date_of_birth = date_of_birth;

  if (Object.keys(profileUpdates).length > 0) {
    await supabaseAdmin.from('user_profiles').update(profileUpdates).eq('user_id', userId);
  }

  // Assign admin role if requested
  if (role === 'admin' || role === 'viewer') {
    const { error: roleError } = await supabaseAdmin.from('admin_roles').insert({
      user_id: userId,
      role,
      granted_by: callerUserId,
    });

    if (roleError) {
      // User was created — return partial success with a warning
      return json(
        {
          user_id: userId,
          warning: `Usuario creado pero no se pudo asignar el rol: ${roleError.message}`,
        },
        201,
      );
    }
  }

  // Register initial balance as a deposit transaction
  if (initial_balance && initial_balance > 0) {
    const { data: trx, error: trxInsertError } = await supabaseAdmin
      .from('transactions')
      .insert({
        user_id: userId,
        type: 'deposit',
        amount: initial_balance,
        currency: 'USD',
        status: 'pending',
        description: 'Balance inicial',
      })
      .select('id')
      .single();

    if (trxInsertError) {
      return json(
        {
          user_id: userId,
          warning: `Usuario creado pero no se pudo registrar el balance inicial: ${trxInsertError.message}`,
        },
        201,
      );
    }

    const { error: trxUpdateError } = await supabaseAdmin
      .from('transactions')
      .update({ status: 'completed', approved_by: callerUserId })
      .eq('id', trx.id);

    if (trxUpdateError) {
      return json(
        {
          user_id: userId,
          warning: `Usuario creado pero no se pudo activar el balance inicial: ${trxUpdateError.message}`,
        },
        201,
      );
    }
  }

  return json({ user_id: userId }, 201);
});
