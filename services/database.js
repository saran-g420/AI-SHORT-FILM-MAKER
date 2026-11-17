const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const DATA_DIR = path.join(__dirname, '..', 'data');
const DB_FILE = path.join(DATA_DIR, 'frame_ai_db.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// In-memory cache + persistent store
let db = {
  users: [],
  projects: [],
  scenes: [],
  doubts: [],
  analytics: {
    totalGenerations: 0,
    totalShotsPlanned: 0,
    totalScriptsExported: 0,
    activeSessions: 0
  }
};

function loadDatabase() {
  try {
    if (fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, 'utf8');
      db = JSON.parse(raw);
    } else {
      seedInitialData();
      saveDatabase();
    }
  } catch (err) {
    console.error('Error reading database file, initializing fresh:', err.message);
    seedInitialData();
    saveDatabase();
  }
}

function saveDatabase() {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf8');
  } catch (err) {
    console.error('Error persisting database:', err.message);
  }
}

function seedInitialData() {
  const salt = bcrypt.genSaltSync(10);
  const adminHash = bcrypt.hashSync('director2026', salt);
  const userHash = bcrypt.hashSync('cinema123', salt);

  db.users = [
    {
      id: 'usr_admin',
      name: 'Executive Director',
      email: 'admin@frameai.studio',
      passwordHash: adminHash,
      role: 'admin',
      experienceLevel: 'Professional Cinematographer',
      avatar: '🎬',
      createdAt: new Date().toISOString()
    },
    {
      id: 'usr_filmmaker',
      name: 'Alex Rivera',
      email: 'alex@frameai.studio',
      passwordHash: userHash,
      role: 'creator',
      experienceLevel: 'Indie Filmmaker',
      avatar: '🎥',
      createdAt: new Date().toISOString()
    }
  ];

  // Seed sample showcase project: "The Reunion: Arun & Kumar"
  const projectId1 = 'proj_reunion_arun_kumar';
  const sceneId1 = 'scene_coffee_shop_reunion';

  db.projects = [
    {
      id: projectId1,
      userId: 'usr_filmmaker',
      title: 'The Reunion: Arun & Kumar',
      tagline: 'When old memories resurface in a forgotten cafe',
      genre: 'Drama / Mystery',
      mood: 'Tense & Nostalgic',
      targetAudience: 'Film Students & Indie Cinema',
      favorite: true,
      createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'proj_last_signal',
      userId: 'usr_filmmaker',
      title: 'The Last Signal',
      tagline: 'An isolated radio operator picks up an impossible frequency',
      genre: 'Sci-Fi / Thriller',
      mood: 'Claustrophobic & Suspenseful',
      targetAudience: 'Festival Short Film',
      favorite: false,
      createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
      updatedAt: new Date(Date.now() - 86400000 * 3).toISOString()
    }
  ];

  db.scenes = [
    {
      id: sceneId1,
      projectId: projectId1,
      sceneNumber: 1,
      heading: 'INT. CORNER CAFE - RAINY AFTERNOON',
      originalIdea: 'Two friends meet after many years. One friend asks where he has been, and the other explains that he went abroad.',
      improvedConcept: 'Arun sits alone nursing cold coffee. The brass bells above the door chime as Kumar steps in—drenched, wearing an expensive tailored coat that clashes with their modest past. What begins as a polite catch-up quickly turns into a subtle battle of withheld secrets regarding Kumar\'s sudden disappearance three years ago.',
      characters: [
        {
          id: 'char_arun',
          name: 'Arun',
          role: 'The Grounded Friend',
          bio: 'Stayed back in their hometown, running his father’s bookstore. Observant, slightly wounded by Kumar’s silence, observant of micro-expressions.',
          color: '#3B82F6'
        },
        {
          id: 'char_kumar',
          name: 'Kumar',
          role: 'The Mysterious Returnee',
          bio: 'Disappeared without a trace 3 years ago. Dressed sharp, charismatic exterior, but subtly checks his vintage watch and avoids direct eye contact.',
          color: '#F59E0B'
        }
      ],
      variations: [
        {
          id: 'var_1',
          type: 'natural',
          title: 'Variation 1 – Original / Natural Version',
          subtitle: 'Grounded Realism & Conversational Warmth',
          summary: 'A heartfelt, organic conversation focused on nostalgic reunion, lingering awkwardness, and the gentle awkward laughter of lost time.',
          characters: ['Arun', 'Kumar'],
          dialogues: [
            {
              id: 'dlg_1',
              character: 'Arun',
              parenthetical: 'standing up, eyes widening in disbelief',
              line: 'Hey! It’s been such a long time. Where have you been?',
              action: 'Arun knocks his spoon against the porcelain cup as he stands up to embrace Kumar.'
            },
            {
              id: 'dlg_2',
              character: 'Kumar',
              parenthetical: 'warm smile, shaking wet umbrella',
              line: 'Hello, Arun! I’ve been living abroad for the past three years.',
              action: 'Kumar takes off his wet overcoat and hangs it on the wooden rack.'
            },
            {
              id: 'dlg_3',
              character: 'Arun',
              parenthetical: 'half-laugh, crossing his arms',
              line: 'Really? That’s amazing! Why didn’t you tell me?',
              action: 'Arun pulls out a chair for Kumar, searching his old friend’s face.'
            },
            {
              id: 'dlg_4',
              character: 'Kumar',
              parenthetical: 'lowering his voice, a hint of vulnerability',
              line: 'I wanted to surprise everyone when I returned.',
              action: 'Kumar slides into the wooden booth, glancing out through the rain-streaked window.'
            },
            {
              id: 'dlg_5',
              character: 'Arun',
              parenthetical: 'softening his tone',
              line: 'Well, you certainly succeeded. You haven’t changed a bit, Kumar.',
              action: 'Arun smiles, sliding the sugar bowl toward him.'
            },
            {
              id: 'dlg_6',
              character: 'Kumar',
              parenthetical: 'staring into his hands',
              line: 'Maybe on the outside, brother. But the world outside changes a man.',
              action: 'Kumar taps his fingers softly against the table.'
            }
          ],
          cinematographyBrief: 'Warm 3200K tungsten interior lighting against cool blue rain exterior. Soft 50mm f/2.0 portrait lenses emphasizing intimacy and honest facial expressions.'
        },
        {
          id: 'var_2',
          type: 'cinematic',
          title: 'Variation 2 – Cinematic Version',
          subtitle: 'High Dramatic Stakes, Subtext & Deep Tension',
          summary: 'Heightened cinematic atmosphere. Kumar’s success looks glossy, but Arun detects nervousness. Every line carries double meaning.',
          characters: ['Arun', 'Kumar'],
          dialogues: [
            {
              id: 'dlg_201',
              character: 'Arun',
              parenthetical: 'unmoving, fingers tightening around his mug',
              line: 'Three birthdays, Kumar. No phone call. No postcard. Just a ghost walking back in.',
              action: 'Steam rises between them like a fading screen. Arun does not stand.'
            },
            {
              id: 'dlg_202',
              character: 'Kumar',
              parenthetical: 'buttoning his Italian blazer, controlled smile',
              line: 'Geneva wasn’t exactly tourist season, Arun. Some contracts require total radio silence.',
              action: 'Kumar drops heavy brass keys onto the scratched teak table. They ring like a bell.'
            },
            {
              id: 'dlg_203',
              character: 'Arun',
              parenthetical: 'leaning forward into the shaft of window light',
              line: 'Contracts? Your mother spent six months visiting hospitals thinking you were in a morgue.',
              action: 'Arun’s voice drops to a lethal whisper. The café chatter around them seems to mute.'
            },
            {
              id: 'dlg_204',
              character: 'Kumar',
              parenthetical: 'eyes flickering toward a dark sedan parked across the street',
              line: 'She was safe. That was the only thing that mattered. And now... I’m back to set things right.',
              action: 'Kumar touches his inner breast pocket where an envelope outline bulges.'
            },
            {
              id: 'dlg_205',
              character: 'Arun',
              parenthetical: 'eyes tracking Kumar’s gaze to the street outside',
              line: 'Set things right? Or are you running from whatever followed you from Europe?',
              action: 'A streak of lightning illuminates Kumar’s pale jawline.'
            },
            {
              id: 'dlg_206',
              character: 'Kumar',
              parenthetical: 'leaning across the table, dead serious',
              line: 'Finish your coffee, Arun. We need to leave before that car turns its headlights on.',
              action: 'Kumar slides a thick unmarked passport across the dark wood.'
            }
          ],
          cinematographyBrief: 'High contrast film noir lighting. Low key with 4:1 lighting ratio. Anamorphic 2.39:1 aspect ratio, 85mm telephoto close-ups isolating characters with deep bokeh.'
        },
        {
          id: 'var_3',
          type: 'creative',
          title: 'Variation 3 – Creative / Unexpected Twist',
          subtitle: 'Psychological Thriller & Reality Shift',
          summary: 'A startling twist: Arun realizes Kumar has arrived with memories of an event that Arun knows never actually took place.',
          characters: ['Arun', 'Kumar'],
          dialogues: [
            {
              id: 'dlg_301',
              character: 'Arun',
              parenthetical: 'squinting through the condensation',
              line: 'You’re early. You told me three o’clock on the radio broadcast.',
              action: 'Arun pulls a battery-powered shortwave tuner closer to his elbow.'
            },
            {
              id: 'dlg_302',
              character: 'Kumar',
              parenthetical: 'dry laugh, brushing rain from shoulders that are bone-dry',
              line: 'Time doesn’t tick at the same rate across the border, Arun. I’ve lived three years in twelve minutes.',
              action: 'Kumar sits down. His coat doesn’t drip water despite the deluge outside.'
            },
            {
              id: 'dlg_303',
              character: 'Arun',
              parenthetical: 'voice trembling, staring at Kumar’s reflection in the glass',
              line: 'Kumar... I buried your empty locker two summers ago. Who sent you to this table?',
              action: 'Arun’s hands tremble as he looks at the mirror behind the counter: Kumar has no reflection.'
            },
            {
              id: 'dlg_304',
              character: 'Kumar',
              parenthetical: 'smiling with haunting serenity',
              line: 'You called me, Arun. Every night you sat in this booth, you rewrote this conversation.',
              action: 'Kumar reaches over and gently taps Arun’s spiral notebook lying open on the table.'
            },
            {
              id: 'dlg_305',
              character: 'Arun',
              parenthetical: 'looking down at the handwritten script in front of him',
              line: 'I... I just wanted to ask where you went.',
              action: 'The ink on the page matches the dialogue they just spoke verbatim.'
            },
            {
              id: 'dlg_306',
              character: 'Kumar',
              parenthetical: 'whispering as the lights in the café begin to flicker',
              line: 'Then write the ending, Arun. Before the coffee goes cold.',
              action: 'Kumar slowly fades as Arun picks up his pen.'
            }
          ],
          cinematographyBrief: 'Surrealist palette. Desaturated greens and cold cyan tones. Wide-angle 24mm lens with subtle Dutch angles creating vertigo and psychological disorientation.'
        }
      ],
      cinematographyPlan: [
        {
          shotNumber: 1,
          correspondingDialogue: 'Arun: "Hey! It’s been such a long time. Where have you been?"',
          character: 'Arun',
          cameraAngle: 'Medium Shot (MS)',
          cameraPosition: 'Front 3/4 angle, seated opposite Kumar',
          cameraHeight: 'Eye-level (seated, 110cm)',
          cameraMovement: 'Subtle slow dolly-in (push-in 20cm)',
          lensRecommendation: '50mm Prime f/2.2 (natural human vision perspective)',
          framingComposition: 'Rule of thirds: Arun framed left, doorway visible in soft background blur right',
          lightingSuggestions: 'Key light: Soft 45° daylight from cafe window; Fill: Gold bounce reflector camera-left',
          shootingInstructions: 'Start as a static medium shot; slowly push in as Arun rises to accentuate his surprise.',
          reasonForSelection: 'Establishes Arun’s emotional baseline and grounds the audience in his personal vulnerability.'
        },
        {
          shotNumber: 2,
          correspondingDialogue: 'Kumar: "Hello, Arun! I’ve been living abroad for the past three years."',
          character: 'Kumar',
          cameraAngle: 'Over-The-Shoulder (OTS) Reverse Shot',
          cameraPosition: 'Reverse angle behind Arun’s right shoulder looking directly at Kumar',
          cameraHeight: 'Eye-level matching Shot 1 (110cm)',
          cameraMovement: 'Static tripod',
          lensRecommendation: '85mm Portrait Prime f/2.0 (compresses background, emphasizes Kumar’s facial micro-cues)',
          framingComposition: 'Arun’s dark shoulder framing bottom-left corner; Kumar framed center-right with rain on window behind him',
          lightingSuggestions: 'Key light: Cool rim light from rear window on Kumar’s rain-slicked hair; soft tungsten fill on face',
          shootingInstructions: 'MAINTAIN 180° LINE: Camera placed strictly camera-left of the imaginary line between both actors. Do not cross the line.',
          reasonForSelection: 'Direct conversational reverse shot connecting the viewer to Kumar’s polished yet guarded response.'
        },
        {
          shotNumber: 3,
          correspondingDialogue: 'Arun: "Really? That’s amazing! Why didn’t you tell me?"',
          character: 'Arun',
          cameraAngle: 'Medium Close-Up (MCU) Reverse Shot',
          cameraPosition: 'Over Kumar’s left shoulder facing Arun',
          cameraHeight: 'Eye-level (110cm)',
          cameraMovement: 'Static with subtle handheld organic breathing',
          lensRecommendation: '85mm Portrait Prime f/2.8',
          framingComposition: 'Centered with tight headroom; Kumar’s collar acts as foreground anchor',
          lightingSuggestions: 'Warm amber key light catchlights in Arun’s eyes to show genuine emotional hurt underneath the smile',
          shootingInstructions: 'Cut immediately on Arun’s first word to preserve the rhythmic cadence of the conversation.',
          reasonForSelection: 'Punches in tighter than Shot 1 to signal rising personal intimacy and mild confrontation.'
        },
        {
          shotNumber: 4,
          correspondingDialogue: 'Kumar: "I wanted to surprise everyone when I returned."',
          character: 'Kumar',
          cameraAngle: 'Close-Up (CU) Tight Shot',
          cameraPosition: 'Direct eye-level punch-in on Kumar',
          cameraHeight: 'Eye-level (110cm)',
          cameraMovement: 'Slow creep-in (dolly in 10cm)',
          lensRecommendation: '100mm Macro / Telephoto f/2.0',
          framingComposition: 'Tight choker: chin to forehead; eyes positioned on upper third guideline',
          lightingSuggestions: 'Split lighting: Left cheek illuminated by street lamp outside, right cheek falling into soft shadow',
          shootingInstructions: 'Capture the subtle hesitation before Kumar delivers the line. Let his eyes reveal the unspoken truth.',
          reasonForSelection: 'A close-up forces the audience to question Kumar’s honesty. The visual weight shifts from dialogue to subtext.'
        },
        {
          shotNumber: 5,
          correspondingDialogue: 'Kumar taps his fingers softly against the table; Arun slides the sugar bowl.',
          character: 'Both / In-Between',
          cameraAngle: 'Extreme Close-Up (ECU) Insert Shot',
          cameraPosition: 'High 45° angle looking down at table surface',
          cameraHeight: 'Tabletop level (85cm)',
          cameraMovement: 'Static',
          lensRecommendation: '50mm Macro f/2.8',
          framingComposition: 'Porcelain coffee cup, trembling spoon, and Kumar’s nervous finger tapping',
          lightingSuggestions: 'Glint of overhead pendant lamp reflecting off the polished spoon',
          shootingInstructions: 'Insert cutaway for pacing transition. Sync the finger tap sound with ambient cafe jazz in the score.',
          reasonForSelection: 'Bridges emotional pause, allowing the audience to digest the unresolved tension.'
        },
        {
          shotNumber: 6,
          correspondingDialogue: 'Kumar: "Maybe on the outside, brother. But the world outside changes a man."',
          character: 'Both (Two-Shot Profile)',
          cameraAngle: 'Wide Two-Shot (WS)',
          cameraPosition: 'Perpendicular side profile from aisle',
          cameraHeight: 'Eye-level (110cm)',
          cameraMovement: 'Slow tracking pull-back through cafe window raindrops',
          lensRecommendation: '35mm Wide Cinema Lens f/2.0',
          framingComposition: 'Balanced symmetry: Arun seated left in profile, Kumar seated right in profile, rain streaks dividing them',
          lightingSuggestions: 'Silhouette lighting: Warm cafe interior glow balanced against rainy dusk blue exterior',
          shootingInstructions: 'Pull camera back through the rain glass. The rain droplets distort their figures as the scene fades.',
          reasonForSelection: 'Cinematic resolution shot visually symbolizing the emotional barrier that now permanently separates them.'
        }
      ],
      directorGuide: {
        sceneTone: 'Melancholic, bittersweet reunion with an undercurrent of unspoken distance.',
        blockingInstructions: [
          'Arun should already be seated in Booth 4 when the scene starts, shoulders slouched, playing with a sugar packet.',
          'Kumar should enter from frame-right, pauses at the doorway to shake his umbrella for 3 seconds before making eye contact.',
          'Physical contact: Arun stands for a full hug, but Kumar meets him with a formal handshake before pivoting into a quick shoulder pat. This immediately signals physical and emotional detachment.'
        ],
        actingPerformanceNotes: [
          'For Arun: Play the initial greeting with genuine joy, but let the smile fade by line 3 as you realize Kumar’s clothes and mannerisms are foreign.',
          'For Kumar: Maintain a calm, executive demeanor. Don’t look guilty; look like someone who is managing a controlled crisis with practiced charm.'
        ],
        cameraPacing: 'Begin with longer takes (6-8 seconds) on Shot 1 and 2 to simulate natural conversation. Accelerate cutting speed to 2-3 seconds as the question of his disappearance arises, then hold on the final two-shot for 10 seconds.',
        lightingAndAtmosphere: 'High color-contrast aesthetic. 2800K warm interior practical sconces contrasted with 5600K overcast slate blue light streaming from the street window.',
        soundAndFoleyCueSheet: [
          'Foley: Brass cafe bell ringing (sharp, reverberant) at entrance.',
          'Foley: Umbrella shaking water droplets onto wooden floorboards.',
          'Ambience: Low coffee machine hiss, murmur of distant patrons, steady rain against glass.',
          'Score: Solo cello enters softly in A-minor on line 4 ("I wanted to surprise everyone"), sustaining a low pedal tone until scene fade.'
        ],
        sceneEndingTransition: 'Slow dissolve through the rain-spotted window into the next location, audio of the rain carrying over into Scene 2.'
      },
      scriptImprovements: [
        {
          id: 'imp_1',
          area: 'Subtext & Conflict in Line 2',
          what: 'Replace Kumar’s generic declaration "I’ve been living abroad" with a more specific, evasive answer.',
          why: 'In real life, people who disappear for 3 years don’t casually say "I went abroad". Giving a specific yet incomplete answer creates instant narrative intrigue.',
          how: 'Add a city and a hesitance before answering, making Arun work for the truth.',
          example: 'Kumar: "Berlin, mostly. A little bit of Prague. Things moved fast, Arun... faster than I could write."'
        },
        {
          id: 'imp_2',
          area: 'Character Physicality & Props',
          what: 'Introduce a physical prop that Kumar interacts with during Arun’s questioning.',
          why: 'Characters who are concealing something need displacement activity (checking a watch, turning a ring, arranging cutlery). It makes the dialogue visually dynamic.',
          how: 'Have Kumar constantly rotate an expensive signet ring on his finger that Arun doesn’t recognize.',
          example: 'Kumar twirls a silver signet ring on his pinky. Arun’s gaze drops to it: "Since when do you wear family heirlooms?"'
        },
        {
          id: 'imp_3',
          area: 'Pacing & Micro-Silence',
          what: 'Insert a 3-second beat of silence between Arun asking "Why didn’t you tell me?" and Kumar answering.',
          why: 'Immediate answers sound scripted. A pause allows the audience to see Kumar calculating how much truth he can afford to share.',
          how: 'Add a parenthetical [A long beat. The cafe espresso steam hisses in the silence.]',
          example: 'Arun: "Why didn’t you tell me?"\n[A heavy silence falls. Kumar watches the sugar dissolve in his cup before looking up.]\nKumar: "Because you would have tried to stop me."'
        }
      ],
      creativeIdeas: [
        {
          id: 'crt_1',
          category: 'New Character Introduction',
          title: 'The Silent Driver Outside',
          description: 'A third character sits inside a idling black sedan parked right outside the cafe window. Kumar periodically checks the rearview mirror reflection. This raises the stakes from a personal drama to an external thriller.',
          narrativeImpact: 'Injects ticking-clock tension without requiring any extra dialogue lines.'
        },
        {
          id: 'crt_2',
          category: 'Visual Storytelling Element',
          title: 'The Unfinished Childhood Sketchbook',
          description: 'Arun is carrying an old sketchbook they both drew in as teenagers. When Kumar sits down, Arun doesn’t show it to him—instead, he quietly closes it and slides it under the table.',
          narrativeImpact: 'Demonstrates Arun’s protective grief through pure visual blocking.'
        },
        {
          id: 'crt_3',
          category: 'Unexpected Plot Twist',
          title: 'Kumar Brings Arun’s Lost Passport',
          description: 'Before standing up to leave, Kumar doesn’t pay for coffee. He leaves an international flight ticket and Arun’s newly issued passport on the saucer. "Our flight departs at midnight."',
          narrativeImpact: 'Flips the scene from looking backwards to propelling the story into an unexpected journey.'
        }
      ],
      doubtsHistory: [
        {
          id: 'dbt_1',
          question: 'Why should I use an Over-The-Shoulder (OTS) reverse shot instead of two separate profile shots?',
          answer: 'An Over-The-Shoulder shot keeps the listener\'s physical presence in the frame (their shoulder and neck). This subconscious spatial anchor reminds the viewer that the dialogue is happening *to* someone, creating an emotional bridge. Two pure profile shots feel disconnected and flat, like two people in separate rooms.',
          category: 'Cinematography',
          timestamp: new Date(Date.now() - 3600000).toISOString()
        },
        {
          id: 'dbt_2',
          question: 'How can I shoot this two-person cafe scene if I only have one camera and one smartphone?',
          answer: 'Shoot in "Master & Coverage" order: First, shoot the entire scene 2 times with your main camera on Shot 1 (Arun). Then, move your camera to Shot 2 (Kumar reverse angle) and shoot the entire scene again 2 times. Finally, shoot the hand close-ups and table inserts. In editing, intercut between Arun and Kumar using the continuous audio track! You don\'t need two cameras running simultaneously.',
          category: 'Shooting Strategy',
          timestamp: new Date(Date.now() - 1800000).toISOString()
        }
      ]
    }
  ];

  db.analytics = {
    totalGenerations: 42,
    totalShotsPlanned: 256,
    totalScriptsExported: 18,
    activeSessions: 7
  };
}

// Initialize on module load
loadDatabase();

module.exports = {
  db,
  saveDatabase,
  getProjects: (userId) => {
    return db.projects.filter(p => !userId || p.userId === userId || p.userId === 'usr_filmmaker');
  },
  getProjectById: (id) => {
    return db.projects.find(p => p.id === id);
  },
  createProject: (data) => {
    const project = {
      id: 'proj_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 5),
      userId: data.userId || 'usr_filmmaker',
      title: data.title || 'Untitled Film Project',
      tagline: data.tagline || 'A new cinematic vision',
      genre: data.genre || 'Drama',
      mood: data.mood || 'Dramatic',
      targetAudience: data.targetAudience || 'Indie Filmmakers',
      favorite: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    db.projects.unshift(project);
    saveDatabase();
    return project;
  },
  updateProject: (id, updates) => {
    const proj = db.projects.find(p => p.id === id);
    if (!proj) return null;
    Object.assign(proj, updates, { updatedAt: new Date().toISOString() });
    saveDatabase();
    return proj;
  },
  deleteProject: (id) => {
    db.projects = db.projects.filter(p => p.id !== id);
    db.scenes = db.scenes.filter(s => s.projectId !== id);
    saveDatabase();
    return true;
  },
  getScenesByProjectId: (projectId) => {
    return db.scenes.filter(s => s.projectId === projectId);
  },
  getSceneById: (id) => {
    return db.scenes.find(s => s.id === id);
  },
  saveScene: (sceneData) => {
    let existingIndex = db.scenes.findIndex(s => s.id === sceneData.id);
    if (existingIndex >= 0) {
      db.scenes[existingIndex] = {
        ...db.scenes[existingIndex],
        ...sceneData,
        updatedAt: new Date().toISOString()
      };
      saveDatabase();
      return db.scenes[existingIndex];
    } else {
      const newScene = {
        id: sceneData.id || 'scene_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 5),
        projectId: sceneData.projectId,
        sceneNumber: db.scenes.filter(s => s.projectId === sceneData.projectId).length + 1,
        ...sceneData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      db.scenes.unshift(newScene);
      db.analytics.totalGenerations++;
      if (newScene.cinematographyPlan) {
        db.analytics.totalShotsPlanned += newScene.cinematographyPlan.length;
      }
      saveDatabase();
      return newScene;
    }
  },
  deleteScene: (id) => {
    db.scenes = db.scenes.filter(s => s.id !== id);
    saveDatabase();
    return true;
  },
  addDoubtRecord: (sceneId, question, answer, category) => {
    const record = {
      id: 'dbt_' + Date.now().toString(36),
      sceneId,
      question,
      answer,
      category: category || 'General Directing',
      timestamp: new Date().toISOString()
    };
    const scene = db.scenes.find(s => s.id === sceneId);
    if (scene) {
      if (!scene.doubtsHistory) scene.doubtsHistory = [];
      scene.doubtsHistory.unshift(record);
    }
    db.doubts.unshift(record);
    saveDatabase();
    return record;
  },
  getAnalytics: () => {
    return {
      ...db.analytics,
      totalProjects: db.projects.length,
      totalScenes: db.scenes.length,
      totalUsers: db.users.length
    };
  }
};
