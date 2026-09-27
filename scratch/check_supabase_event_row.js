const { supabaseAdmin } = require('../src/lib/supabase');

async function main() {
  const { data, error } = await supabaseAdmin.from('event_state').select('*');
  console.log('SUPABASE EVENT_STATE ROWS:', data, 'ERROR:', error);
}

main().catch(console.error);
