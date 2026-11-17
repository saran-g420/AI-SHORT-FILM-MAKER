require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const dbService = require('./services/database');
const { generateSceneData, answerFilmmakingDoubt } = require('./services/aiEngine');
const { generateShotPlan } = require('./services/cinematography');
const { formatScreenplayText, formatFountain, formatShotListCSV } = require('./services/exporter');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'frame_ai_super_secret_jwt_key_2026_cinematic';

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// Simple Auth Middleware
function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded;
      return next();
    } catch (e) {
      // Token invalid or expired, continue as guest
    }
  }
  // Default guest/demo user
  req.user = { id: 'usr_filmmaker', role: 'creator', name: 'Alex Rivera' };
  next();
}

// ==========================================
// AUTHENTICATION ROUTES
// ==========================================

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const user = dbService.db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (!user) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const valid = bcrypt.compareSync(password, user.passwordHash);
  if (!valid) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const token = jwt.sign(
    { id: user.id, email: user.email, name: user.name, role: user.role },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  res.json({
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      experienceLevel: user.experienceLevel,
      avatar: user.avatar
    }
  });
});

app.post('/api/auth/register', (req, res) => {
  const { name, email, password, experienceLevel } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email and password are required' });
  }

  const existing = dbService.db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    return res.status(400).json({ error: 'Account with this email already exists' });
  }

  const salt = bcrypt.genSaltSync(10);
  const passwordHash = bcrypt.hashSync(password, salt);
  const newUser = {
    id: 'usr_' + Date.now().toString(36),
    name,
    email,
    passwordHash,
    role: 'creator',
    experienceLevel: experienceLevel || 'Indie Filmmaker',
    avatar: '🎬',
    createdAt: new Date().toISOString()
  };

  dbService.db.users.push(newUser);
  dbService.saveDatabase();

  const token = jwt.sign(
    { id: newUser.id, email: newUser.email, name: newUser.name, role: newUser.role },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  res.status(201).json({
    token,
    user: {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      experienceLevel: newUser.experienceLevel,
      avatar: newUser.avatar
    }
  });
});

app.get('/api/auth/me', authMiddleware, (req, res) => {
  const user = dbService.db.users.find(u => u.id === req.user.id) || {
    id: req.user.id,
    name: req.user.name,
    email: req.user.email || 'alex@frameai.studio',
    role: req.user.role || 'creator',
    experienceLevel: 'Indie Filmmaker',
    avatar: '🎬'
  };
  res.json({ user });
});

// ==========================================
// PROJECTS ROUTES
// ==========================================

app.get('/api/projects', authMiddleware, (req, res) => {
  const projects = dbService.getProjects(req.user.id);
  // Attach scene count to each project
  const enriched = projects.map(p => {
    const scenes = dbService.getScenesByProjectId(p.id);
    return {
      ...p,
      sceneCount: scenes.length,
      latestScene: scenes[0] || null
    };
  });
  res.json({ projects: enriched });
});

app.post('/api/projects', authMiddleware, (req, res) => {
  const { title, tagline, genre, mood, targetAudience } = req.body;
  if (!title) {
    return res.status(400).json({ error: 'Project title is required' });
  }

  const project = dbService.createProject({
    userId: req.user.id,
    title,
    tagline,
    genre,
    mood,
    targetAudience
  });

  res.status(201).json({ project });
});

app.get('/api/projects/:id', authMiddleware, (req, res) => {
  const project = dbService.getProjectById(req.params.id);
  if (!project) {
    return res.status(404).json({ error: 'Project not found' });
  }
  const scenes = dbService.getScenesByProjectId(project.id);
  res.json({ project, scenes });
});

app.put('/api/projects/:id', authMiddleware, (req, res) => {
  const updated = dbService.updateProject(req.params.id, req.body);
  if (!updated) {
    return res.status(404).json({ error: 'Project not found' });
  }
  res.json({ project: updated });
});

app.delete('/api/projects/:id', authMiddleware, (req, res) => {
  const success = dbService.deleteProject(req.params.id);
  res.json({ success });
});

// ==========================================
// SCENES & AI SCRIPT GENERATION ROUTES
// ==========================================

app.post('/api/scenes/generate', authMiddleware, async (req, res) => {
  try {
    const {
      projectId,
      prompt,
      genre,
      mood,
      charactersCount,
      language,
      scriptLength,
      experienceLevel,
      customApiKey
    } = req.body;

    if (!prompt || prompt.trim().length === 0) {
      return res.status(400).json({ error: 'Please enter a story idea, scene description, or conversation prompt.' });
    }

    // Determine target project or create quick project
    let targetProjectId = projectId;
    if (!targetProjectId) {
      const quickProj = dbService.createProject({
        userId: req.user.id,
        title: prompt.slice(0, 35) + (prompt.length > 35 ? '...' : ''),
        tagline: 'Generated scene project',
        genre: genre || 'Drama',
        mood: mood || 'Cinematic'
      });
      targetProjectId = quickProj.id;
    }

    // Run AI generation (Gemini or Autonomous Engine)
    const generated = await generateSceneData(prompt, {
      genre,
      mood,
      charactersCount: parseInt(charactersCount) || 2,
      language: language || 'English',
      scriptLength: scriptLength || 'Standard Scene (6-8 beats)',
      experienceLevel: experienceLevel || 'Beginner to Indie',
      geminiApiKey: customApiKey || process.env.GEMINI_API_KEY
    });

    // Save scene to database
    const savedScene = dbService.saveScene({
      projectId: targetProjectId,
      heading: generated.heading || 'INT. SCENE - DAY',
      originalIdea: prompt,
      improvedConcept: generated.improvedConcept,
      characters: generated.characters,
      variations: generated.variations,
      cinematographyPlan: generated.cinematographyPlan,
      directorGuide: generated.directorGuide,
      scriptImprovements: generated.scriptImprovements,
      creativeIdeas: generated.creativeIdeas,
      doubtsHistory: []
    });

    res.status(201).json({
      scene: savedScene,
      projectId: targetProjectId
    });
  } catch (err) {
    console.error('Scene generation error:', err);
    res.status(500).json({ error: 'Failed to generate scene: ' + err.message });
  }
});

app.get('/api/scenes/:id', (req, res) => {
  const scene = dbService.getSceneById(req.params.id);
  if (!scene) {
    return res.status(404).json({ error: 'Scene not found' });
  }
  res.json({ scene });
});

app.put('/api/scenes/:id', authMiddleware, (req, res) => {
  const existing = dbService.getSceneById(req.params.id);
  if (!existing) {
    return res.status(404).json({ error: 'Scene not found' });
  }

  const updated = dbService.saveScene({
    ...existing,
    ...req.body,
    id: req.params.id
  });

  res.json({ scene: updated });
});

app.delete('/api/scenes/:id', authMiddleware, (req, res) => {
  const success = dbService.deleteScene(req.params.id);
  res.json({ success });
});

// Recompute Shot Plan for a Scene's Variation
app.post('/api/scenes/:id/regenerate-shotplan', authMiddleware, (req, res) => {
  const scene = dbService.getSceneById(req.params.id);
  if (!scene) {
    return res.status(404).json({ error: 'Scene not found' });
  }

  const variationIndex = parseInt(req.body.variationIndex) || 0;
  const variation = scene.variations?.[variationIndex] || scene.variations?.[0];
  if (!variation) {
    return res.status(400).json({ error: 'Variation not found' });
  }

  const newShotPlan = generateShotPlan(variation.dialogues || [], scene.characters || [], {
    heading: scene.heading,
    mood: req.body.mood || 'Dramatic',
    genre: req.body.genre || 'Drama'
  });

  scene.cinematographyPlan = newShotPlan;
  dbService.saveScene(scene);

  res.json({ cinematographyPlan: newShotPlan });
});

// Apply Improvement Suggestion
app.post('/api/scenes/:id/apply-improvement', authMiddleware, (req, res) => {
  const scene = dbService.getSceneById(req.params.id);
  if (!scene) {
    return res.status(404).json({ error: 'Scene not found' });
  }

  const { improvementId, variationIndex = 0, applyAll = false } = req.body;
  const targetVar = scene.variations[variationIndex];
  if (!targetVar) {
    return res.status(400).json({ error: 'Target script variation not found' });
  }

  if (applyAll) {
    // Apply all suggestions by enhancing dialogues with sensory descriptions & micro-pauses
    targetVar.dialogues.forEach((dlg, i) => {
      if (i === 1 && !dlg.action.includes('pause')) {
        dlg.parenthetical = 'long pause, holding the gaze with restrained gravity';
        dlg.action = dlg.action + ' A heavy silence settles in the room.';
      }
      if (i === 3) {
        dlg.parenthetical = 'eyes narrowing, voice dropping to a low octave';
      }
    });
    scene.improvedConcept += ' (Refined with all recommended director improvements).';
  } else {
    const imp = (scene.scriptImprovements || []).find(i => i.id === improvementId);
    if (imp) {
      // Inject improvement example into variation
      if (targetVar.dialogues.length >= 2) {
        targetVar.dialogues[1].parenthetical = 'eyes searching, holding back an unspoken truth';
        targetVar.dialogues[1].action = 'Displacement action: quietly sets down their cup, rotating it slowly.';
      }
    }
  }

  dbService.saveScene(scene);
  res.json({ scene, message: applyAll ? 'All improvements applied' : 'Improvement applied' });
});

// Expand Script Variation (Add deeper beats)
app.post('/api/scenes/:id/expand-variation', authMiddleware, (req, res) => {
  const scene = dbService.getSceneById(req.params.id);
  if (!scene) {
    return res.status(404).json({ error: 'Scene not found' });
  }

  const variationIndex = parseInt(req.body.variationIndex) || 0;
  const targetVar = scene.variations[variationIndex];
  if (!targetVar) {
    return res.status(400).json({ error: 'Target variation not found' });
  }

  const char1 = scene.characters[0]?.name || 'Character 1';
  const char2 = scene.characters[1]?.name || 'Character 2';

  // Add 2 expanded climax beats
  const newBeat1 = {
    id: 'exp_' + Date.now() + '_1',
    character: char1,
    parenthetical: 'taking a step forward, stripping away all pleasantries',
    line: `Look at me, ${char2}. Whatever happened over there... you don't have to carry it alone anymore.`,
    action: `${char1} places a firm, grounding hand on ${char2}'s shoulder.`
  };

  const newBeat2 = {
    id: 'exp_' + Date.now() + '_2',
    character: char2,
    parenthetical: 'swallowing the lump in their throat, nodding slowly',
    line: `I know, brother. But some debts follow you across oceans. We have until sunrise.`,
    action: `${char2} covers ${char1}'s hand with their own, the bond renewed under fire.`
  };

  targetVar.dialogues.push(newBeat1, newBeat2);

  // Update shot plan
  const updatedPlan = generateShotPlan(targetVar.dialogues, scene.characters, {
    heading: scene.heading
  });
  scene.cinematographyPlan = updatedPlan;

  dbService.saveScene(scene);
  res.json({ scene, variation: targetVar, cinematographyPlan: updatedPlan });
});

// ==========================================
// AI DOUBT CLEARING ASSISTANT ROUTE
// ==========================================

app.post('/api/ai/doubt', authMiddleware, async (req, res) => {
  try {
    const { question, sceneId, customApiKey } = req.body;
    if (!question || question.trim().length === 0) {
      return res.status(400).json({ error: 'Question is required' });
    }

    let sceneContext = {};
    if (sceneId) {
      const scene = dbService.getSceneById(sceneId);
      if (scene) sceneContext = scene;
    }

    const answer = await answerFilmmakingDoubt(question, sceneContext, customApiKey);
    const record = dbService.addDoubtRecord(sceneId, question, answer, 'Directing & Cinematography');

    res.json({
      question,
      answer,
      record
    });
  } catch (err) {
    console.error('Doubt assistant error:', err);
    res.status(500).json({ error: 'Failed to process doubt: ' + err.message });
  }
});

// ==========================================
// EXPORT ROUTES
// ==========================================

function handleTextExport(req, res) {
  const scene = dbService.getSceneById(req.params.sceneId);
  if (!scene) return res.status(404).send('Scene not found');

  const varIndex = parseInt(req.params.varIndex || req.query.varIndex) || 0;
  const text = formatScreenplayText(scene, varIndex);

  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="FRAME_AI_${scene.heading ? scene.heading.replace(/[^a-zA-Z0-9]/g, '_') : 'Screenplay'}.txt"`);
  res.send(text);
}

app.get('/api/export/text/:sceneId', handleTextExport);
app.get('/api/export/text/:sceneId/:varIndex', handleTextExport);

function handleFountainExport(req, res) {
  const scene = dbService.getSceneById(req.params.sceneId);
  if (!scene) return res.status(404).send('Scene not found');

  const varIndex = parseInt(req.params.varIndex || req.query.varIndex) || 0;
  const fountain = formatFountain(scene, varIndex);

  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="FRAME_AI_${scene.heading ? scene.heading.replace(/[^a-zA-Z0-9]/g, '_') : 'Screenplay'}.fountain"`);
  res.send(fountain);
}

app.get('/api/export/fountain/:sceneId', handleFountainExport);
app.get('/api/export/fountain/:sceneId/:varIndex', handleFountainExport);

app.get('/api/export/shotlist/:sceneId', (req, res) => {
  const scene = dbService.getSceneById(req.params.sceneId);
  if (!scene) return res.status(404).send('Scene not found');

  const csv = formatShotListCSV(scene.cinematographyPlan || []);
  dbService.db.analytics.totalScriptsExported++;
  dbService.saveDatabase();

  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="FRAME_AI_Shotlist_${scene.heading ? scene.heading.replace(/[^a-zA-Z0-9]/g, '_') : 'Scene'}.csv"`);
  res.send(csv);
});

// ==========================================
// ADMIN & ANALYTICS ROUTE
// ==========================================

app.get('/api/admin/stats', authMiddleware, (req, res) => {
  const stats = dbService.getAnalytics();
  res.json({ stats });
});

// Single Page Application Fallback
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start Server
app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`🎬 FRAME AI Platform Online`);
  console.log(`Tagline: "Imagine It. Write It. Shoot It."`);
  console.log(`URL: http://localhost:${PORT}`);
  console.log(`AI Engine: Hybrid (Gemini API + Autonomous Film Engine)`);
  console.log(`=======================================================`);
});
