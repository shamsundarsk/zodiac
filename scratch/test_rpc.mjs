import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';

const adminClient = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });

async function testRpc() {
  const { data, error } = await adminClient.rpc('exec_sql', { sql: 'SELECT 1;' });
  console.log("RPC exec_sql:", data, error?.message);
}

testRpc();
