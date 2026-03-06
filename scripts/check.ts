import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  const { data: users } = await supabase.auth.admin.listUsers();
  const latestUser = users.users.sort(
    (a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  )[0];

  if (!latestUser) return console.log('No users found');

  console.log('User:', latestUser.id, latestUser.email);

  const { data: balance, error: err1 } = await supabase
    .from('user_balances')
    .select('*')
    .eq('user_id', latestUser.id);
  console.log('Balance:', balance, err1);

  const { data: transactions, error: err2 } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', latestUser.id);
  console.log('Transactions:', transactions, err2);
}
check();
