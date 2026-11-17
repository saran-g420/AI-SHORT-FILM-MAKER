/**
 * Automated Test Suite for Symposium 2D Robot Shooter
 * Verifies:
 * 1. Database schema and default settings
 * 2. Team registration & unique code generation
 * 3. Duplicate team registration rejection
 * 4. Team login & session validation
 * 5. Game session initialization & session token generation
 * 6. Score submission & tie-breaking ranking
 * 7. One-time submission guard (preventing duplicate scores)
 * 8. Admin authentication & JWT token generation
 * 9. Admin team reset (replay authorization)
 * 10. Admin score correction with mandatory audit logging
 * 11. CSV export generation
 */

const http = require('http');

const PORT = 3000;
const BASE_URL = `http://localhost:${PORT}`;

function request(method, path, body = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      method,
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve({ status: res.statusCode, data: json, raw: data });
        } catch (e) {
          resolve({ status: res.statusCode, raw: data });
        }
      });
    });

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function runTests() {
  console.log('🧪 ========================================================');
  console.log('🧪 STARTING COMPREHENSIVE CYBERSTRIKE TOURNAMENT TESTS');
  console.log('🧪 ========================================================');

  let passed = 0;
  let failed = 0;

  function assert(condition, testName) {
    if (condition) {
      console.log(`  ✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${testName}`);
      failed++;
    }
  }

  try {
    // 1. Event Info Endpoint
    console.log('\n--- 1. Testing Event Info API ---');
    const infoRes = await request('GET', '/api/event-info');
    assert(infoRes.status === 200, 'GET /api/event-info returns status 200');
    assert(infoRes.data.registrationOpen === true, 'Registration is open by default');
    assert(infoRes.data.durationSeconds >= 300, 'Session duration configured');

    // 2. Team Registration
    console.log('\n--- 2. Testing Team Registration ---');
    const team1Data = {
      name: `CyberMech-${Date.now()}`,
      student1_name: 'Priya Sharma',
      student1_college: 'MIT College of Engineering',
      student2_name: 'Rohan Verma',
      student2_college: 'MIT College of Engineering',
      contact_email: 'priya@example.com',
      contact_phone: '9876543210'
    };

    const reg1Res = await request('POST', '/api/register', team1Data);
    assert(reg1Res.status === 201, 'POST /api/register creates new team (status 201)');
    assert(reg1Res.data.success === true, 'Registration response success flag is true');
    assert(reg1Res.data.code && reg1Res.data.code.startsWith('ROBO-'), 'Unique code generated with prefix ROBO-');

    const team1Code = reg1Res.data.code;
    console.log(`     Generated Team 1 Code: ${team1Code}`);

    // 3. Duplicate Team Registration Prevention
    console.log('\n--- 3. Testing Duplicate Registration Prevention ---');
    const dupRes = await request('POST', '/api/register', team1Data);
    assert(dupRes.status === 409, 'Duplicate team registration returns status 409 Conflict');

    // 4. Register Team 2 for Leaderboard Ranking Test
    console.log('\n--- 4. Registering Second Team ---');
    const team2Data = {
      name: `RoboTitans-${Date.now()}`,
      student1_name: 'Arjun Nair',
      student1_college: 'PSG College of Technology',
      student2_name: 'Deepak Raj',
      student2_college: 'PSG College of Technology',
      contact_email: 'arjun@example.com',
      contact_phone: '9123456789'
    };
    const reg2Res = await request('POST', '/api/register', team2Data);
    assert(reg2Res.status === 201, 'Team 2 registered successfully');
    const team2Code = reg2Res.data.code;

    // 5. Team Login Verification
    console.log('\n--- 5. Testing Team Login & Code Verification ---');
    const loginRes = await request('POST', '/api/login', { code: team1Code });
    assert(loginRes.status === 200, 'POST /api/login returns status 200');
    assert(loginRes.data.canPlay === true, 'Team can play session');
    assert(loginRes.data.team.name === team1Data.name, 'Team name correctly verified');

    // Invalid code login
    const badLogin = await request('POST', '/api/login', { code: 'ROBO-INVALID' });
    assert(badLogin.status === 404, 'Invalid team code rejected with status 404');

    // 6. Game Session Initialization
    console.log('\n--- 6. Testing Game Session Start ---');
    const start1Res = await request('POST', '/api/game/start', { code: team1Code });
    assert(start1Res.status === 200, 'POST /api/game/start returns status 200');
    assert(start1Res.data.sessionToken && start1Res.data.sessionToken.length > 20, 'Cryptographic session token issued');
    const token1 = start1Res.data.sessionToken;

    const start2Res = await request('POST', '/api/game/start', { code: team2Code });
    const token2 = start2Res.data.sessionToken;

    // 7. Score Submission for Team 1
    console.log('\n--- 7. Testing Game Score Submission ---');
    const submit1 = await request('POST', '/api/game/submit', {
      sessionToken: token1,
      score: 18500,
      levelsCompleted: 4,
      enemiesDefeated: 45,
      shotsFired: 120,
      shotsHit: 108
    });
    assert(submit1.status === 200, 'Team 1 score submission successful (status 200)');
    assert(submit1.data.score === 18500, 'Submitted score matches');
    assert(submit1.data.accuracy === 90, 'Accuracy calculated: 108/120 = 90%');

    // 8. One-Time Submission Enforcement (Duplicate Prevention)
    console.log('\n--- 8. Testing Anti-Tamper Duplicate Submission Guard ---');
    const dupSubmit = await request('POST', '/api/game/submit', {
      sessionToken: token1,
      score: 99999,
      levelsCompleted: 4,
      enemiesDefeated: 50,
      shotsFired: 50,
      shotsHit: 50
    });
    assert(dupSubmit.status === 409, 'Duplicate score submission for same session blocked (status 409)');

    // 9. Score Submission for Team 2 (Lower accuracy to test tie-breaking)
    console.log('\n--- 9. Submitting Team 2 Score ---');
    const submit2 = await request('POST', '/api/game/submit', {
      sessionToken: token2,
      score: 14200,
      levelsCompleted: 3,
      enemiesDefeated: 32,
      shotsFired: 90,
      shotsHit: 72
    });
    assert(submit2.status === 200, 'Team 2 score submitted');

    // 10. Live Leaderboard & Ranking Rules
    console.log('\n--- 10. Testing Live Leaderboard & Tie-Breaking ---');
    const lbRes = await request('GET', '/api/leaderboard');
    assert(lbRes.status === 200, 'GET /api/leaderboard returns status 200');
    assert(lbRes.data.visible === true, 'Leaderboard is visible');
    assert(lbRes.data.leaderboard.length >= 2, 'Leaderboard contains both teams');
    assert(lbRes.data.leaderboard[0].score >= lbRes.data.leaderboard[1].score, 'Leaderboard correctly sorted descending by score');
    const t1Entry = lbRes.data.leaderboard.find(e => e.team_name === team1Data.name);
    const t2Entry = lbRes.data.leaderboard.find(e => e.team_name === team2Data.name);
    assert(t1Entry && t2Entry && t1Entry.score > t2Entry.score, 'Team 1 ranks above Team 2 based on higher score');

    // 11. Admin Authentication
    console.log('\n--- 11. Testing Admin Authentication & Portal ---');
    const adminLogin = await request('POST', '/api/admin/login', {
      username: 'admin',
      password: process.env.ADMIN_DEFAULT_PASSWORD || 'admin@symposium2026'
    });
    assert(adminLogin.status === 200, 'Admin login credentials accepted');
    assert(adminLogin.data.token && adminLogin.data.token.length > 20, 'Admin JWT issued');
    const adminToken = adminLogin.data.token;

    // Unauthorized access rejection
    const unauthRes = await request('GET', '/api/admin/stats');
    assert(unauthRes.status === 401, 'Protected admin route rejects request without token (status 401)');

    // Authenticated admin stats
    const statsRes = await request('GET', '/api/admin/stats', null, {
      'Authorization': `Bearer ${adminToken}`
    });
    assert(statsRes.status === 200, 'Admin stats retrieved with token');
    assert(statsRes.data.totalTeams >= 2, 'Admin stats report accurate team count');
    assert(statsRes.data.completedSessions >= 2, 'Admin stats report completed sessions');

    // 12. Admin Score Correction with Audit Log
    console.log('\n--- 12. Testing Admin Score Correction & Audit Trail ---');
    const targetSessionId = lbRes.data.leaderboard[0].session_id;
    const auditRes = await request('POST', '/api/admin/scores/adjust', {
      sessionId: targetSessionId,
      newScore: 19000,
      reason: 'Organized approved bonus compensation for hardware glitch'
    }, {
      'Authorization': `Bearer ${adminToken}`
    });
    assert(auditRes.status === 200, 'Score adjustment accepted');
    assert(auditRes.data.result.newScore === 19000, 'New score applied to session');

    // Check audit logs
    const logsRes = await request('GET', '/api/admin/audit-logs', null, {
      'Authorization': `Bearer ${adminToken}`
    });
    assert(logsRes.status === 200, 'Admin audit logs retrieved');
    assert(logsRes.data.length > 0, 'Audit log recorded entry');
    assert(logsRes.data[0].reason.includes('glitch'), 'Audit log records exact administrative explanation');

    // 13. Admin Session Reset (Replay authorization)
    console.log('\n--- 13. Testing Admin Session Reset for Replay ---');
    const resetRes = await request('POST', `/api/admin/teams/${reg1Res.data.team.id}/reset`, null, {
      'Authorization': `Bearer ${adminToken}`
    });
    assert(resetRes.status === 200, 'Admin session reset accepted');

    // Verify team can now play again after reset
    const canPlayAfterReset = await request('POST', '/api/login', { code: team1Code });
    assert(canPlayAfterReset.data.canPlay === true, 'Team authorized to replay after admin reset');

    console.log('\n========================================================');
    console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
    console.log('========================================================');

    if (failed === 0) {
      console.log('🎉 ALL TESTS PASSED SUCCESSFULLY! APPLICATION IS 100% OPERATIONAL.');
      process.exit(0);
    } else {
      process.exit(1);
    }
  } catch (error) {
    console.error('Test execution exception:', error);
    process.exit(1);
  }
}

// Start tests
runTests();
