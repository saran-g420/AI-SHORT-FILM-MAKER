/**
 * FRAME AI - Full Verification Test Suite
 */

const BASE_URL = 'http://localhost:3000';

async function runTests() {
  console.log('--- Starting FRAME AI Test Suite ---');
  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`✓ PASS: ${message}`);
      passed++;
    } else {
      console.error(`✗ FAIL: ${message}`);
      failed++;
    }
  }

  try {
    // 1. Projects API
    console.log('\n[1] Testing GET /api/projects...');
    const projRes = await fetch(`${BASE_URL}/api/projects`);
    assert(projRes.ok, 'GET /api/projects returns 200 OK');
    const projData = await projRes.json();
    assert(Array.isArray(projData.projects) && projData.projects.length >= 2, 'Returns pre-seeded projects');
    const defaultProj = projData.projects[0];

    // 2. Project Details & Scenes
    console.log('\n[2] Testing GET /api/projects/:id...');
    const detRes = await fetch(`${BASE_URL}/api/projects/${defaultProj.id}`);
    assert(detRes.ok, 'GET /api/projects/:id returns 200 OK');
    const detData = await detRes.json();
    assert(detData.project && Array.isArray(detData.scenes), 'Returns project with scenes array');
    const showcaseScene = detData.scenes[0];
    assert(showcaseScene && showcaseScene.variations && showcaseScene.variations.length === 3, 'Scene has exactly 3 script variations preloaded');

    // 3. AI Scene Generation with prompt
    console.log('\n[3] Testing POST /api/scenes/generate (User Prompt: Two friends meet after many years)...');
    const userPrompt = 'Two friends meet after many years. One friend asks where he has been, and the other explains that he went abroad.';
    const genRes = await fetch(`${BASE_URL}/api/scenes/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt: userPrompt,
        genre: 'Drama',
        mood: 'Tense & Grounded',
        charactersCount: 2,
        language: 'English',
        scriptLength: 'Standard Scene (6-8 beats)',
        experienceLevel: 'Indie Filmmaker'
      })
    });
    assert(genRes.ok, 'POST /api/scenes/generate returns 201 Created');
    const genData = await genRes.json();
    const newScene = genData.scene;
    assert(newScene && newScene.id, 'New scene created with unique ID');

    // Verify 3 distinct variations
    assert(Array.isArray(newScene.variations) && newScene.variations.length === 3, 'Generated exactly three script variations');
    assert(newScene.variations[0].type === 'natural', 'Variation 1 is Original / Natural Version');
    assert(newScene.variations[1].type === 'cinematic', 'Variation 2 is Cinematic Version');
    assert(newScene.variations[2].type === 'creative', 'Variation 3 is Creative / Unexpected Version');

    // Verify character dialogue
    const var1Dialogues = newScene.variations[0].dialogues;
    assert(Array.isArray(var1Dialogues) && var1Dialogues.length >= 4, 'Variation 1 has character-wise dialogue progression');
    assert(var1Dialogues[0].character && var1Dialogues[0].line, 'First dialogue has assigned character name and line');

    // Verify Cinematography & Reverse Shots
    console.log('\n[4] Testing Cinematography Plan & Reverse Shots...');
    const shotPlan = newScene.cinematographyPlan;
    assert(Array.isArray(shotPlan) && shotPlan.length >= 4, 'Cinematography plan contains shot-by-shot breakdown');
    
    // Check 12 parameters on shot 1
    const s1 = shotPlan[0];
    const has12Params = (
      s1.shotNumber !== undefined &&
      s1.correspondingDialogue !== undefined &&
      s1.character !== undefined &&
      s1.cameraAngle !== undefined &&
      s1.cameraPosition !== undefined &&
      s1.cameraHeight !== undefined &&
      s1.cameraMovement !== undefined &&
      s1.lensRecommendation !== undefined &&
      s1.framingComposition !== undefined &&
      s1.lightingSuggestions !== undefined &&
      s1.shootingInstructions !== undefined &&
      s1.reasonForSelection !== undefined
    );
    assert(has12Params, 'Shots contain all 12 industry cinematography parameters');

    // Check Reverse Shot connection
    const reverseShots = shotPlan.filter(s => s.isReverseShot || s.cameraAngle.toLowerCase().includes('reverse'));
    assert(reverseShots.length >= 1, 'Cinematography plan includes reverse shots correlated to dialogue replies');

    // Verify AI Script Improvements (Section 4)
    console.log('\n[5] Testing AI Script Improvement Suggestions...');
    const imps = newScene.scriptImprovements;
    assert(Array.isArray(imps) && imps.length >= 2, 'Scene contains script improvement suggestions');
    const imp1 = imps[0];
    assert(imp1.what && imp1.why && imp1.how && imp1.example, 'Improvement has 4-part breakdown (What, Why, How, Example)');

    // Verify Creative Ideas (Section 5)
    console.log('\n[6] Testing AI Creative Story Ideas...');
    const ideas = newScene.creativeIdeas;
    assert(Array.isArray(ideas) && ideas.length >= 2, 'Scene contains proactive creative additions');
    assert(ideas[0].title && ideas[0].description && ideas[0].narrativeImpact, 'Creative ideas include title, description, and narrative justification');

    // Verify AI Director Mode (Section 7)
    console.log('\n[7] Testing AI Director Mode Guide...');
    const guide = newScene.directorGuide;
    assert(guide && Array.isArray(guide.blockingInstructions), 'Director guide contains blocking instructions');
    assert(Array.isArray(guide.soundAndFoleyCueSheet), 'Director guide contains sound & foley cue sheet');

    // 8. AI Doubt Assistant (Section 9)
    console.log('\n[8] Testing POST /api/ai/doubt...');
    const doubtRes = await fetch(`${BASE_URL}/api/ai/doubt`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        question: 'How can I shoot this scene with a smartphone on a low budget?',
        sceneId: newScene.id
      })
    });
    assert(doubtRes.ok, 'POST /api/ai/doubt returns 200 OK');
    const doubtData = await doubtRes.json();
    assert(doubtData.answer && doubtData.answer.length > 50, 'Doubt assistant returns concrete filmmaking advice');

    // 9. Apply Improvements (Section 4)
    console.log('\n[9] Testing POST /api/scenes/:id/apply-improvement...');
    const applyRes = await fetch(`${BASE_URL}/api/scenes/${newScene.id}/apply-improvement`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ applyAll: true, variationIndex: 0 })
    });
    assert(applyRes.ok, 'POST /api/scenes/:id/apply-improvement returns 200 OK');

    // 10. Script Expansion (Section 3)
    console.log('\n[10] Testing POST /api/scenes/:id/expand-variation...');
    const expRes = await fetch(`${BASE_URL}/api/scenes/${newScene.id}/expand-variation`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ variationIndex: 0 })
    });
    assert(expRes.ok, 'POST /api/scenes/:id/expand-variation returns 200 OK');

    // 11. Screenplay & Shotlist Exports (Section 11)
    console.log('\n[11] Testing Screenplay & Shotlist Export Endpoints...');
    const txtRes = await fetch(`${BASE_URL}/api/export/text/${newScene.id}/0`);
    assert(txtRes.ok, 'GET /api/export/text/:sceneId/0 returns 200 OK');
    const txt = await txtRes.text();
    assert(txt.includes('FRAME AI SCREENPLAY'), 'Exported TXT contains standard screenplay header');

    const fountainRes = await fetch(`${BASE_URL}/api/export/fountain/${newScene.id}/0`);
    assert(fountainRes.ok, 'GET /api/export/fountain/:sceneId/0 returns 200 OK');

    const csvRes = await fetch(`${BASE_URL}/api/export/shotlist/${newScene.id}`);
    assert(csvRes.ok, 'GET /api/export/shotlist/:sceneId returns 200 OK');
    const csv = await csvRes.text();
    assert(csv.includes('Shot #') && csv.includes('Angle'), 'Exported CSV contains shotlist headers');

    // 12. Admin Stats
    console.log('\n[12] Testing GET /api/admin/stats...');
    const adminRes = await fetch(`${BASE_URL}/api/admin/stats`);
    assert(adminRes.ok, 'GET /api/admin/stats returns 200 OK');
    const adminData = await adminRes.json();
    assert(adminData.stats && adminData.stats.totalGenerations > 0, 'Admin analytics returns real system metrics');

    console.log(`\n===========================================`);
    console.log(`TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
    console.log(`===========================================`);

    if (failed === 0) {
      console.log('🎉 ALL FRAME AI REQUIREMENTS VERIFIED SUCCESSFULLY!');
      process.exit(0);
    } else {
      process.exit(1);
    }
  } catch (err) {
    console.error('Test execution error:', err);
    process.exit(1);
  }
}

runTests();
