import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || '';
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const anonClient = createClient(supabaseUrl, anonKey, { auth: { persistSession: false } });
const adminClient = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });

async function verifyRLS() {
  console.log("==================================================");
  console.log("3. VERIFY RLS LIVE POLICY TESTS (WITH VALID FOREIGN KEY)");
  console.log("==================================================");

  // 1. Create a dummy team with service role
  const testTeamCode = 'TEST-RLS-' + Math.floor(Math.random() * 10000);
  const { data: teamCreated, error: teamErr } = await adminClient.from('teams').insert([{
    team_code: testTeamCode,
    name: 'RLS Test Team ' + testTeamCode,
    member1_name: 'Member 1',
    member2_name: 'Member 2',
    access_code: 'CODE123'
  }]).select();

  if (teamErr) {
    console.log("Error creating test team:", teamErr.message);
    return;
  }

  const teamId = teamCreated[0].id;
  console.log(`Test team created with code: ${testTeamCode} (ID: ${teamId})`);

  // 2. Try Anon INSERT into submissions using the valid team_code
  const { error: anonSubErr } = await anonClient.from('submissions').insert([{
    team_id: teamId,
    team_code: testTeamCode,
    round_number: 1,
    answers: { q1: 'hacked answer' },
    score: 100
  }]);

  console.log("Anon INSERT into submissions -> Error:", anonSubErr ? anonSubErr.message : "ALLOWED (FAILED RLS IF ALLOWED!)");

  // 3. Service Role INSERT into submissions
  const { data: adminSub, error: adminSubErr } = await adminClient.from('submissions').insert([{
    team_id: teamId,
    team_code: testTeamCode,
    round_number: 1,
    answers: { q1: 'legit answer' },
    score: 100
  }]).select();

  console.log("Service Role INSERT into submissions ->", adminSub ? "SUCCESS" : "FAILED (" + adminSubErr?.message + ")");

  // Clean up
  await adminClient.from('teams').delete().eq('id', teamId);
  console.log("Cleaned up test team.");
}

verifyRLS();
