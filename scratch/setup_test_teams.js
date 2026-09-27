const { db } = require('../src/lib/db');
const { getCanonicalCaseId } = require('../src/lib/questions-engine');

async function main() {
  console.log('Setting up 4 test teams for Round 1 & Round 2 browser verification...');

  // Reset event state to Round 1 ACTIVE
  await db.updateEventState({
    round1_status: 'ACTIVE',
    round2_status: 'IDLE',
    current_round: 1
  });

  const teamsToCreate = [
    { team_code: 'TEAM-CF-01', name: 'Cloudflare Team', case_r1: 'CASE-R1-CF', case_r2: 'CASE-R2-CF' },
    { team_code: 'TEAM-HY-01', name: 'Hyundai Team', case_r1: 'CASE-R1-HYUNDAI', case_r2: 'CASE-R2-HYUNDAI' },
    { team_code: 'TEAM-DI-01', name: 'Dior Team', case_r1: 'CASE-R1-DIOR', case_r2: 'CASE-R2-DIOR' },
    { team_code: 'TEAM-ET-01', name: 'Eternal Team', case_r1: 'CASE-R1-ETERNAL', case_r2: 'CASE-R2-ETERNAL' }
  ];

  for (const t of teamsToCreate) {
    let existing = await db.getTeamByCode(t.team_code);
    if (!existing) {
      existing = await db.createTeam({
        team_code: t.team_code,
        name: t.name,
        passcode: '123456',
        member1_name: 'Member 1',
        member1_email: `m1_${t.team_code.toLowerCase()}@zodiac.com`,
        member2_name: 'Member 2',
        member2_email: `m2_${t.team_code.toLowerCase()}@zodiac.com`,
        assigned_case_id_r1: t.case_r1,
        assigned_case_id_r2: t.case_r2
      });
      console.log(`Created team ${t.team_code} assigned to R1: ${t.case_r1}, R2: ${t.case_r2}`);
    } else {
      await db.updateTeam(existing.id, {
        assigned_case_id_r1: t.case_r1,
        assigned_case_id_r2: t.case_r2
      });
      console.log(`Updated team ${t.team_code} assigned to R1: ${t.case_r1}, R2: ${t.case_r2}`);
    }
  }

  console.log('Test teams setup completed successfully.');
  process.exit(0);
}

main().catch(err => {
  console.error('Setup failed:', err);
  process.exit(1);
});
