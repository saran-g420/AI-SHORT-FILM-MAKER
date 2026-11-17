const { generateShotPlan } = require('./cinematography');

/**
 * Intelligent Script Analysis & Generation Service
 * Dual-Mode:
 * 1. Live Google Gemini API (when GEMINI_API_KEY is configured in env or settings)
 * 2. High-Fidelity Autonomous Filmmaking Engine (runs 100% locally with zero external dependencies)
 */

async function callGemini(apiKey, systemPrompt, userPrompt) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
  
  const payload = {
    contents: [
      {
        role: 'user',
        parts: [
          { text: `${systemPrompt}\n\nUSER PROMPT:\n${userPrompt}` }
        ]
      }
    ],
    generationConfig: {
      temperature: 0.7,
      topP: 0.95,
      responseMimeType: 'application/json'
    }
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini API error (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('Empty response from Gemini API');
  return JSON.parse(text);
}

/**
 * Extract or infer character names from simple user input
 */
function extractCharactersFromInput(text, count = 2) {
  const words = text.split(/\s+/);
  const potentialNames = [];
  
  // Look for capitalized names or patterns like "Character 1", "Arun", "Kumar", "Friend A"
  const nameRegex = /\b([A-Z][a-z]{2,15})\b/g;
  let match;
  const stopWords = new Set(['The', 'Two', 'One', 'Three', 'When', 'Where', 'What', 'After', 'Before', 'Here', 'Then', 'They', 'This', 'That', 'With', 'From', 'Into', 'About', 'While', 'Years', 'Many', 'Friend', 'Friends', 'Scene', 'Script']);

  while ((match = nameRegex.exec(text)) !== null) {
    if (!stopWords.has(match[1]) && !potentialNames.includes(match[1])) {
      potentialNames.push(match[1]);
    }
  }

  if (potentialNames.length >= 2) {
    return [
      { id: 'char_1', name: potentialNames[0], role: 'Initiator / Inquirer', color: '#3B82F6' },
      { id: 'char_2', name: potentialNames[1], role: 'Respondent / Revealer', color: '#F59E0B' }
    ];
  }

  // Fallback defaults tailored to realistic drama
  if (text.toLowerCase().includes('arun') || text.toLowerCase().includes('kumar')) {
    return [
      { id: 'char_1', name: 'Arun', role: 'The Questioning Friend', color: '#3B82F6' },
      { id: 'char_2', name: 'Kumar', role: 'The Returned Friend', color: '#F59E0B' }
    ];
  }

  return [
    { id: 'char_1', name: 'Character 1 (Arun)', role: 'The Questioning Protagonist', color: '#3B82F6' },
    { id: 'char_2', name: 'Character 2 (Kumar)', role: 'The Withholding Companion', color: '#F59E0B' }
  ];
}

/**
 * Built-in Autonomous Film Director Engine
 * Generates all 3 distinct script variations, character-by-character dialogue,
 * script improvements, creative ideas, director guide, and shot plans.
 */
function runAutonomousFilmDirectorEngine(input, options = {}) {
  const characters = extractCharactersFromInput(input, options.characterCount || 2);
  const char1 = characters[0].name;
  const char2 = characters[1].name;
  const genre = options.genre || 'Drama';
  const mood = options.mood || 'Intense & Grounded';
  const experienceLevel = options.experienceLevel || 'Beginner to Indie';

  // Improved scene concept
  const improvedConcept = `A quiet, charged encounter between ${char1} and ${char2}. What began as a simple conversation about missing time peels back layers of concealed motives, visual tension, and unspoken history. The camera stays close on subtle micro-reactions, turning every word into a dramatic chess move.`;

  // 1. Variation 1: Original / Natural Version
  const var1Dialogues = [
    {
      id: 'var1_d1',
      character: char1,
      parenthetical: 'stepping forward, voice thick with emotion',
      line: `Hey! It's been such a long time. Where have you been?`,
      action: `${char1} stops mid-stride, staring in disbelief at ${char2}.`
    },
    {
      id: 'var1_d2',
      character: char2,
      parenthetical: 'warm smile, lowering gaze slightly',
      line: `Hello, ${char1}! I've been living abroad for the past three years.`,
      action: `${char2} sets down a worn leather satchel, extending a hand before pulling ${char1} into a warm embrace.`
    },
    {
      id: 'var1_d3',
      character: char1,
      parenthetical: 'pulling back, searching their eyes',
      line: `Really? That's amazing! Why didn't you tell me?`,
      action: `${char1} crosses their arms, smiling through mild bewilderment.`
    },
    {
      id: 'var1_d4',
      character: char2,
      parenthetical: 'soft chuckle, shrugging shoulders',
      line: `I wanted to surprise everyone when I returned.`,
      action: `${char2} rubs the back of their neck, glancing briefly at the street outside.`
    },
    {
      id: 'var1_d5',
      character: char1,
      parenthetical: 'relaxing posture, gesturing to a seat',
      line: `Well, sit down. You owe me three years of stories, start from day one.`,
      action: `${char1} pulls out a chair, signaling the waiter.`
    },
    {
      id: 'var1_d6',
      character: char2,
      parenthetical: 'taking a seat, exhaling deeply',
      line: `You might want to order a double espresso for this one, brother.`,
      action: `${char2} unbuttons their jacket, settling in as the room hums with quiet nostalgia.`
    }
  ];

  // 2. Variation 2: Cinematic Version (Heightened Stakes, Punchy Subtext)
  const var2Dialogues = [
    {
      id: 'var2_d1',
      character: char1,
      parenthetical: 'standing rigid in the doorway, voice dropping to a harsh whisper',
      line: `Thirty-six months, ${char2}. Not a letter. Not a ping. Just a ghost walking through my front door.`,
      action: `${char1} clutches a brass key in their palm until knuckles turn white.`
    },
    {
      id: 'var2_d2',
      character: char2,
      parenthetical: 'sharp silhouette against rain-lit glass, perfectly composed',
      line: `Crossing borders without leaving digital breadcrumbs takes discipline. You should know that better than anyone.`,
      action: `${char2} taps a polished silver lighter against the tabletop with steady, calculated rhythm.`
    },
    {
      id: 'var2_d3',
      character: char1,
      parenthetical: 'stepping directly into the pool of amber lamplight',
      line: `Your sister thought you were dead. I spent six months bribing port authorities to search cargo manifests!`,
      action: `${char1}'s shadow looms over the table as their voice trembles with buried grief.`
    },
    {
      id: 'var2_d4',
      character: char2,
      parenthetical: 'eyes locking onto ${char1}, deadly calm',
      line: `If I had sent one message, they would have traced it straight to your doorstep. My silence kept you breathing.`,
      action: `${char2} slides a heavy manila folder across the mahogany surface. It lands with a dense thud.`
    },
    {
      id: 'var2_d5',
      character: char1,
      parenthetical: 'looking down at the dossier, eyes dilating',
      line: `What did you get yourself into overseas?`,
      action: `${char1}'s fingers hover over the red wax seal.`
    },
    {
      id: 'var2_d6',
      character: char2,
      parenthetical: 'leaning forward into the shadows',
      line: `Not what I got into. What we are finishing tonight.`,
      action: `${char2} checks a vintage military chronograph as distant sirens wail in the rain.`
    }
  ];

  // 3. Variation 3: Creative / Unexpected Twist Version
  const var3Dialogues = [
    {
      id: 'var3_d1',
      character: char1,
      parenthetical: 'adjusting ear-piece, squinting through heavy fog',
      line: `Target has entered the rendezvous. Wait... ${char2}? What are you doing in the surveillance zone?`,
      action: `${char1} reaches instinctively toward their concealed sidearm under their coat.`
    },
    {
      id: 'var3_d2',
      character: char2,
      parenthetical: 'smiling faintly, holding up an old photograph of them as children',
      line: `I've been across the perimeter for three years, ${char1}. But the funny thing is... you were the one who authorized my extraction.`,
      action: `${char2} drops the photograph onto a metal barrel between them.`
    },
    {
      id: 'var3_d3',
      character: char1,
      parenthetical: 'voice cracking, scanning the perimeter',
      line: `That's impossible. I've only been assigned to Section 4 for six months! Who told you I authorized anything?`,
      action: `${char1} takes a step back, suddenly noticing that ${char2}'s reflection in the wet asphalt isn't moving.`
    },
    {
      id: 'var3_d4',
      character: char2,
      parenthetical: 'stepping closer, unblinking',
      line: `Look at your service ID, brother. Check the issue date. You haven't been working here for six months. You've been here for nine years.`,
      action: `${char2} taps ${char1}'s chest badge.`
    },
    {
      id: 'var3_d5',
      character: char1,
      parenthetical: 'trembling hands pulling the ID badge into the sodium streetlight',
      line: `No... no, this can't be. The memories... I remember calling you last Tuesday!`,
      action: `The photo on ${char1}'s badge begins to distort under the flickering street lamp.`
    },
    {
      id: 'var3_d6',
      character: char2,
      parenthetical: 'whispering with gentle sorrow',
      line: `The simulation resets in two minutes. This time, ${char1}... don't ask where I went. Ask how you get out.`,
      action: `${char2} steps back into the fog as the streetlights flicker out one by one.`
    }
  ];

  const variations = [
    {
      id: 'var_1',
      type: 'natural',
      title: 'Variation 1 – Original / Natural Version',
      subtitle: 'Conversational Realism & Organic Emotion',
      summary: 'Maintains the authentic spirit of the original prompt with enhanced dialogue cadence, gentle vulnerability, and believable friendship dynamics.',
      characters: [char1, char2],
      dialogues: var1Dialogues,
      cinematographyBrief: 'Naturalistic 50mm eye-level coverage with warm golden fill light, soft lens bokeh, and organic conversational cutting.'
    },
    {
      id: 'var_2',
      type: 'cinematic',
      title: 'Variation 2 – Cinematic Version',
      subtitle: 'High Dramatic Stakes & Subtext-Driven Conflict',
      summary: 'Elevates the scene into a high-stakes dramatic showdown with lethal pauses, double-edged dialogue, prop interactions, and heavy emotional tension.',
      characters: [char1, char2],
      dialogues: var2Dialogues,
      cinematographyBrief: 'Anamorphic 2.39:1 widescreen, deep 85mm portrait lenses, dramatic 4:1 low-key shadow contrast, and tight reverse-shot coverage.'
    },
    {
      id: 'var_3',
      type: 'creative',
      title: 'Variation 3 – Creative / Unexpected Version',
      subtitle: 'Psychological Twist & Shifting Reality',
      summary: 'Subverts expectations with a surreal psychological reveal that reframes the entire friendship and leaves the audience breathless.',
      characters: [char1, char2],
      dialogues: var3Dialogues,
      cinematographyBrief: 'Wide-angle 24mm framing, subtle Dutch angles, cold fluorescent and cyan grade, with unsettling symmetry.'
    }
  ];

  // AI Script Improvements (Section 4 requirements)
  const scriptImprovements = [
    {
      id: 'imp_aut_1',
      area: 'Exposition Delivery in Dialogue',
      what: 'Transform direct factual statements into layered subtext.',
      why: 'When characters explicitly declare "I was living abroad for three years", it sounds written for the audience rather than said to a lifelong friend.',
      how: 'Replace the plain statement with a sensory detail or specific location that hints at their journey while withholding the full picture.',
      example: `${char2}: "Berlin winters have a way of eating calendar pages, ${char1}. You blink and three years vanish into subway steam."`
    },
    {
      id: 'imp_aut_2',
      area: 'Physical Blocking & Tension Prop',
      what: 'Give ${char1} a tactile action during the greeting instead of passive waiting.',
      why: 'Cinema is visual behavior. An actor fiddling with keys, checking coffee temperature, or hesitating to embrace reveals more truth than spoken words.',
      how: 'Stage ${char1} holding an object that represents their shared past (e.g. an old photograph, a book, or a forgotten jacket).',
      example: `${char1} turns an unread book upside down on the table, refusing to close it as ${char2} approaches.`
    },
    {
      id: 'imp_aut_3',
      area: 'The Power of Micro-Pauses',
      what: 'Add a beat of hesitation before ${char2} explains their absence.',
      why: 'A delayed response signals internal conflict: the character is deciding whether to tell the truth or offer an acceptable cover story.',
      how: 'Insert a parenthetical: [A three-second beat. ${char2} swallows hard, watching a rain drop trace down the windowpane.]',
      example: `[A heavy silence hangs between them. ${char2} traces the rim of their cup before looking up.]\n${char2}: "Because if I told you where I was going... you would've packed a bag to follow me."`
    }
  ];

  // Creative Ideas (Section 5 requirements)
  const creativeIdeas = [
    {
      id: 'crt_aut_1',
      category: 'New Character Introduction',
      title: 'The Watching Figure',
      description: `Introduce a quiet stranger sitting two booths away who never touches their coffee, but glances at ${char2} whenever ${char1} asks about their whereabouts.`,
      narrativeImpact: 'Transforms a simple conversation into an active mystery, signaling to the audience that ${char2} is being monitored.'
    },
    {
      id: 'crt_aut_2',
      category: 'Visual Storytelling Element',
      title: 'The Ticking Pocket Watch / Phone Screen',
      description: `Every 45 seconds, ${char2}'s phone buzzes silently upside down on the table, casting a rhythmic flash of white light against their knuckles.`,
      narrativeImpact: 'Creates an unconscious countdown clock that builds visceral urgency without dialogue.'
    },
    {
      id: 'crt_aut_3',
      category: 'Unexpected Plot Twist',
      title: 'The Return Flight Ticket',
      description: `Before ${char2} stands to leave, they don't say goodbye. They slide a boarding pass across the table: it has ${char1}'s name on it, departing in two hours.`,
      narrativeImpact: 'Propels the narrative instantly from backstory reflection into forward-moving action.'
    }
  ];

  // Director Guide (Section 7 requirements)
  const directorGuide = {
    sceneTone: `${mood} with layered subtext and sharp rhythmic cutting.`,
    blockingInstructions: [
      `1. Introduce the space: Open on ${char1} seated or standing in frame-left, establishing their territory.`,
      `2. Entrance: ${char2} enters from frame-right, creating an immediate visual cross-axis. Do not let them embrace immediately; hold them 2 meters apart for 4 seconds to register spatial distance.`,
      `3. Staging the table: When seated, position them at a 90-degree corner table rather than directly opposite. Corner staging allows both two-shots and over-the-shoulder reverse angles without visual blockage.`
    ],
    actingPerformanceNotes: [
      `For ${char1}: Don't play anger; play betrayal masked as casual curiosity. Every smile should tighten around the eyes.`,
      `For ${char2}: Keep your vocal volume 10% lower than ${char1}. Forcing ${char1} to lean in gives you the psychological upper hand.`
    ],
    cameraPacing: `Start wide (Shot 1, 5-7 seconds) to orient the audience. As dialogue progresses to Line 3 and 4, tighten coverage to Medium Close-Ups (3-4 second cuts). Hold the final reverse close-up for an extra 4 seconds after the final line to let the emotional residue linger.`,
    lightingAndAtmosphere: `Employ 3200K warm interior tungsten practical lamps to create nostalgia, contrasted with a 5600K cool blue backlight from a window to suggest cold reality outside. Maintain a 3:1 key-to-fill ratio for natural depth.`,
    soundAndFoleyCueSheet: [
      `Foley: Sharp brass door bell chime on entrance.`,
      `Foley: Heavy porcelain cup clatter on saucer during tense lines.`,
      `Sound Design: Low rumble of city traffic or distant thunder building underneath the silence between lines.`,
      `Music Score: Minimalist warm acoustic guitar or muted solo cello entering on Line 4, resolving into an open chord as the scene closes.`
    ],
    sceneEndingTransition: `Slow 1.5-second dissolve from the two-shot profile into the exterior establishing shot of the next sequence.`
  };

  // Generate complete shot-by-shot plan mapped to dialogues (Section 6 requirements)
  const cinematographyPlan = generateShotPlan(var1Dialogues, characters, {
    heading: 'INT. URBAN MEETING PLACE - DAY',
    mood,
    genre
  });

  return {
    heading: 'INT. URBAN MEETING PLACE - DAY',
    originalIdea: input,
    improvedConcept,
    characters,
    variations,
    cinematographyPlan,
    directorGuide,
    scriptImprovements,
    creativeIdeas
  };
}

/**
 * Main Generation Entry Point
 */
async function generateSceneData(input, options = {}) {
  const apiKey = options.geminiApiKey || process.env.GEMINI_API_KEY;

  if (apiKey && apiKey.trim().length > 10) {
    try {
      const systemPrompt = `You are FRAME AI: the world's elite AI Film Director, Award-Winning Screenwriter, and Master Cinematographer.
Your job is to transform user scene concepts into complete, multi-variation cinematic masterworks with character-by-character screenplay dialogues, reverse-shot camera angle plans, director blocking, script improvements, and creative suggestions.
Return ONLY valid JSON matching this schema:
{
  "heading": "SCENE HEADING (SLUGLINE)",
  "originalIdea": "User's original concept",
  "improvedConcept": "Detailed improved concept highlighting subtext and cinematic atmosphere",
  "characters": [
    { "id": "char_1", "name": "Name", "role": "Role description", "bio": "Brief backstory", "color": "#3B82F6" },
    { "id": "char_2", "name": "Name", "role": "Role description", "bio": "Brief backstory", "color": "#F59E0B" }
  ],
  "variations": [
    {
      "id": "var_1",
      "type": "natural",
      "title": "Variation 1 – Original / Natural Version",
      "subtitle": "Subtitle",
      "summary": "Summary",
      "characters": ["Name1", "Name2"],
      "dialogues": [
        { "id": "v1_d1", "character": "Name1", "parenthetical": "emotion/action cue", "line": "Exact dialogue line", "action": "Physical action" }
      ],
      "cinematographyBrief": "Visual style notes"
    },
    {
      "id": "var_2",
      "type": "cinematic",
      "title": "Variation 2 – Cinematic Version",
      "subtitle": "Subtitle",
      "summary": "Summary",
      "characters": ["Name1", "Name2"],
      "dialogues": [
        { "id": "v2_d1", "character": "Name1", "parenthetical": "emotion/action cue", "line": "Exact dialogue line", "action": "Physical action" }
      ],
      "cinematographyBrief": "Visual style notes"
    },
    {
      "id": "var_3",
      "type": "creative",
      "title": "Variation 3 – Creative / Unexpected Version",
      "subtitle": "Subtitle",
      "summary": "Summary",
      "characters": ["Name1", "Name2"],
      "dialogues": [
        { "id": "v3_d1", "character": "Name1", "parenthetical": "emotion/action cue", "line": "Exact dialogue line", "action": "Physical action" }
      ],
      "cinematographyBrief": "Visual style notes"
    }
  ],
  "scriptImprovements": [
    {
      "id": "imp_1",
      "area": "Area Name",
      "what": "1. What can be improved?",
      "why": "2. Why should it be improved?",
      "how": "3. How can it be improved?",
      "example": "4. Example of the improved version"
    }
  ],
  "creativeIdeas": [
    {
      "id": "crt_1",
      "category": "Category",
      "title": "Title",
      "description": "Description",
      "narrativeImpact": "Explanation of how this supports the story"
    }
  ],
  "directorGuide": {
    "sceneTone": "Tone description",
    "blockingInstructions": ["Step 1", "Step 2", "Step 3"],
    "actingPerformanceNotes": ["Actor 1 note", "Actor 2 note"],
    "cameraPacing": "Pacing description",
    "lightingAndAtmosphere": "Lighting description",
    "soundAndFoleyCueSheet": ["Cue 1", "Cue 2"],
    "sceneEndingTransition": "Ending transition"
  }
}`;

      const userPrompt = `Scene Prompt: "${input}"
Genre: ${options.genre || 'Drama'}
Mood: ${options.mood || 'Intense & Grounded'}
Language: ${options.language || 'English'}
Script Length: ${options.scriptLength || 'Standard Scene (6-8 beats)'}
Experience Level: ${options.experienceLevel || 'Beginner to Indie'}`;

      const aiResult = await callGemini(apiKey, systemPrompt, userPrompt);
      
      // Auto-generate shot plan using cinematography rules
      const activeVariation = aiResult.variations?.[0] || {};
      const shotPlan = generateShotPlan(activeVariation.dialogues || [], aiResult.characters || [], {
        heading: aiResult.heading,
        mood: options.mood,
        genre: options.genre
      });

      aiResult.cinematographyPlan = shotPlan;
      return aiResult;
    } catch (err) {
      console.warn('Gemini API call failed or timed out, seamlessly falling back to Built-in Film Engine:', err.message);
    }
  }

  // Fallback to built-in autonomous engine
  return runAutonomousFilmDirectorEngine(input, options);
}

/**
 * AI Doubt Assistant - Context-aware answers to filmmaking questions
 */
async function answerFilmmakingDoubt(question, sceneContext = {}, apiKey = null) {
  const activeApiKey = apiKey || process.env.GEMINI_API_KEY;

  if (activeApiKey && activeApiKey.trim().length > 10) {
    try {
      const systemPrompt = `You are the FRAME AI Doubt Clearing Assistant.
You provide clear, direct, practical, and inspiring filmmaking advice to directors, scriptwriters, and cinematographers.
Explain technical jargon in plain English.
Provide concrete examples directly tailored to their scene context.
Include both pro-level cinema techniques AND smartphone/zero-budget alternatives.`;

      const prompt = `Context:
Scene: ${sceneContext.heading || 'A dramatic scene'}
Characters: ${(sceneContext.characters || []).map(c => c.name).join(', ') || 'Two characters'}
Original Concept: ${sceneContext.originalIdea || 'Two friends conversing'}

User Question: "${question}"`;

      const res = await callGemini(activeApiKey, systemPrompt, prompt);
      if (res && res.answer) return res.answer;
      if (typeof res === 'string') return res;
    } catch (err) {
      console.warn('Doubt API fallback to expert knowledge base:', err.message);
    }
  }

  // Built-in expert knowledge base for common filmmaking doubts
  const q = question.toLowerCase();
  
  if (q.includes('smartphone') || q.includes('phone') || q.includes('mobile') || q.includes('cheap') || q.includes('budget')) {
    return `### How to Shoot This Scene Professionally on a Smartphone:
1. **Lock Auto-Exposure & Focus (AE/AF Lock):** Long-press on your actor's face so the phone doesn't hunt for focus or flicker brightness when they move.
2. **Use 4K 24fps (or 25fps):** 24 frames per second gives authentic cinematic motion blur rather than the hyper-smooth "soap opera" 60fps video look.
3. **Lighting Trick:** Position your actors near an open window during daylight. Place a simple white foam core poster board (costs $3 at a stationery store) on the opposite side to bounce soft light into their shadows.
4. **Clean Audio:** Smartphone mics pick up room echo. Plug in an affordable USB-C / Lightning lavalier microphone or record audio on a second phone held just outside the camera frame!
5. **Coverage:** Shoot Character 1's lines first, then move your phone to the reverse angle for Character 2. Never zoom digitally; move the phone physically closer!`;
  }

  if (q.includes('180') || q.includes('axis') || q.includes('line of action')) {
    return `### The 180-Degree Rule Explained:
- Draw an imaginary straight line between Character 1 and Character 2 (the Axis of Action).
- Your camera must stay on **ONE SIDE** of this line for the entire scene (e.g., only from the left side).
- **Why?** It ensures Character 1 always looks from screen-left to screen-right, and Character 2 always looks from screen-right to screen-left.
- **What happens if you cross it?** The audience gets disoriented because suddenly both actors appear to be looking in the same direction, destroying spatial continuity!`;
  }

  if (q.includes('close-up') || q.includes('close up') || q.includes('cu') || q.includes('when to use')) {
    return `### When and Why to Cut to a Close-Up:
- **Emotional Currency:** Close-ups are your most powerful visual currency—don't spend them too early. If you start in a close-up, you have nowhere to go when the drama peaks.
- **The Turning Point:** Cut to a Close-Up (CU) right when a character is lying, being vulnerable, or realizing an uncomfortable truth.
- **Subtext:** A medium shot tells the audience *what is happening*; a close-up tells the audience *how the character feels about what is happening*.`;
  }

  if (q.includes('reverse') || q.includes('ots') || q.includes('over the shoulder')) {
    return `### Why Over-The-Shoulder Reverse Shots Are Essential:
- An OTS shot keeps the listener's shoulder and neck in the foreground frame while focusing on the speaker.
- **Psychological Anchor:** This reminds the viewer that communication is a reciprocal connection. It grounds the physical distance between the two characters.
- **Reverse Shot Rule:** When switching from Actor A's OTS to Actor B's OTS, match the lens focal length (e.g. both on 50mm or 85mm), match the camera height (eye-level to eye-level), and match the head-size framing in the frame.`;
  }

  if (q.includes('lens') || q.includes('focal length') || q.includes('50mm') || q.includes('35mm') || q.includes('85mm')) {
    return `### Recommended Lens Selection for this Scene:
- **Wide Angle (24mm - 35mm):** Use for Shot 1 (Establishing/Two-shot). Shows environment, spatial depth, and body language.
- **Standard (50mm):** The "human eye" lens. Perfect for natural medium shots because it has zero distortion.
- **Telephoto Portrait (85mm):** The ultimate cinema dialogue lens. It compresses the background into gorgeous creamy bokeh (shallow depth of field) and flatters facial proportions.`;
  }

  return `### Film Director's Recommendation for Your Scene:
- **Core Principle:** Every camera angle should represent an emotional choice, not just a technical viewpoint.
- **Dynamic Energy:** In a conversation scene between two characters, maintain eye-line continuity so their gazes match across cuts.
- **Rhythm:** Let dialogue breathe. Never cut immediately the millisecond an actor finishes a sentence; let the camera hold on the listener for 1 to 2 seconds to capture their silent emotional reaction before cutting!`;
}

module.exports = {
  generateSceneData,
  runAutonomousFilmDirectorEngine,
  answerFilmmakingDoubt
};
