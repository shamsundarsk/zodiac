const { db } = require('../src/lib/db');

async function main() {
  const result = await db.updateEventState({
    round1_status: 'ACTIVE',
    round2_status: 'LOCKED',
    round2_start_time: null
  });
  console.log('Update result:', result);
}

main().catch(console.error);
