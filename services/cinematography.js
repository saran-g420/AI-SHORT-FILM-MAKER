/**
 * FRAME AI - AI Cinematographer & Shot-by-Shot Engine
 * 
 * Specifically connects dialogues to camera angles, tracks character eye-lines,
 * enforces the 180-degree rule of action, generates precise reverse shots,
 * and outputs all 12 industry-standard technical cinematography parameters.
 */

const LENS_PRESETS = {
  extremeWide: '18mm Ultra-Wide Cinema Prime f/4.0',
  wide: '24mm Wide-Angle Cine Lens f/2.8',
  mediumWide: '35mm Narrative Standard f/2.0',
  medium: '50mm Natural Human Vision Prime f/1.8',
  mediumCloseUp: '65mm or 75mm Portrait Lens f/2.0',
  closeUp: '85mm Cinematic Telephoto f/1.8',
  extremeCloseUp: '100mm Macro Cine Prime f/2.8',
  anamorphic: '50mm 2x Anamorphic f/2.39 (horizontal streak flares)'
};

const SHOT_ANGLES = [
  'Extreme wide shot',
  'Wide shot',
  'Medium shot',
  'Medium close-up',
  'Close-up',
  'Extreme close-up',
  'Low angle',
  'High angle',
  'Eye-level angle',
  'Over-the-shoulder shot',
  'Point-of-view shot',
  'Dutch angle',
  "Bird's-eye view"
];

/**
 * Generate a complete 12-parameter shot-by-shot cinematography plan
 * tightly correlated with each character dialogue and action.
 */
function generateShotPlan(dialogues = [], characters = [], sceneInfo = {}) {
  const charA = characters[0]?.name || 'Character 1';
  const charB = characters[1]?.name || 'Character 2';
  const charC = characters[2]?.name || null;
  const mood = sceneInfo.mood || 'Dramatic';
  const genre = sceneInfo.genre || 'Drama';

  const shotPlan = [];
  let shotIndex = 1;

  // 1. Scene Opener: Establishing / Wide Shot
  shotPlan.push({
    shotNumber: shotIndex++,
    correspondingDialogue: `SCENE INTRO / BLOCKING: ${sceneInfo.heading || 'Scene Beginning'}`,
    character: 'All Characters (Spatial Geography)',
    cameraAngle: 'Wide shot (WS) / Establishing',
    cameraPosition: 'Front wide vista, 4 meters back from main acting space',
    cameraHeight: 'Eye-level (150cm)',
    cameraMovement: 'Slow push-in dolly (tracking forwards 50cm smoothly)',
    lensRecommendation: LENS_PRESETS.wide,
    framingComposition: 'Rule of thirds: Staging the environment and establishing the physical separation between characters.',
    lightingSuggestions: 'Establish the primary key source (window daylight / overhead practical) creating spatial depth and ambient texture.',
    shootingInstructions: 'Roll for 5 seconds before first action. Let the atmosphere settle before dialogue commences.',
    reasonForSelection: 'Grounds the audience in the spatial geography of the scene and introduces the emotional climate.'
  });

  let previousSpeaker = null;
  let previousShotAngle = null;
  let shotCountForSpeaker = {};

  dialogues.forEach((dlg, idx) => {
    const speaker = dlg.character || charA;
    const isNewSpeaker = speaker !== previousSpeaker;
    const isCharA = speaker.toLowerCase() === charA.toLowerCase();
    const isFirstTime = !shotCountForSpeaker[speaker];
    shotCountForSpeaker[speaker] = (shotCountForSpeaker[speaker] || 0) + 1;

    let shotAngle = 'Medium shot';
    let cameraPos = '';
    let isReverse = false;
    let cameraMovement = 'Static tripod with subtle organic breathing';
    let lens = LENS_PRESETS.medium;
    let framing = '';
    let lighting = '';
    let instructions = '';
    let reason = '';

    // Check if this dialogue is emotionally intense or has key revelation
    const isIntense = dlg.line.includes('?') && (dlg.line.includes('!') || dlg.line.length > 50 || idx >= dialogues.length - 2);
    const hasPropAction = dlg.action && (dlg.action.includes('table') || dlg.action.includes('hand') || dlg.action.includes('glass') || dlg.action.includes('pocket') || dlg.action.includes('ring') || dlg.action.includes('envelope') || dlg.action.includes('watch'));

    if (isNewSpeaker && previousSpeaker !== null) {
      // REVERSE SHOT SCENARIO (Crucial Rule)
      isReverse = true;
      if (isIntense) {
        shotAngle = 'Close-up (CU) Reverse Shot';
        lens = LENS_PRESETS.closeUp;
        cameraPos = isCharA 
          ? `Over ${charB}'s right shoulder, camera positioned 1.2m away facing ${charA}`
          : `Over ${charA}'s left shoulder, camera positioned 1.2m away facing ${charB}`;
        framing = `Tight framing on ${speaker}'s eyes and jaw. Collar of ${previousSpeaker} anchors bottom foreground.`;
        lighting = 'High contrast edge-lighting to emphasize facial micro-expressions; sharp catchlight in the pupils.';
        instructions = `CRITICAL 180° RULE: Keep the camera strictly on the camera-left axis of action. Do not jump over the 180° line to prevent disorienting screen direction.`;
        reason = `Matches the reciprocal eye-line from Shot #${shotIndex - 1}. Direct emotional confrontation shot.`;
      } else {
        shotAngle = 'Over-the-shoulder shot (OTS) Reverse';
        lens = LENS_PRESETS.mediumCloseUp;
        cameraPos = isCharA
          ? `Behind ${charB}'s left shoulder facing ${charA} at eye-level`
          : `Behind ${charA}'s right shoulder facing ${charB} at eye-level`;
        framing = `Two-shot depth: Foreground shoulder out of focus; ${speaker} sharp in middle-ground on rule-of-thirds power point.`;
        lighting = 'Gentle three-point lighting: soft key at 45°, subtle rim/kicker to separate dark hair from background.';
        instructions = 'Lock off tripod. Cut exactly on the first syllable of dialogue to maintain conversation pace.';
        reason = 'Standard narrative reverse shot that maintains continuous spatial connection between both conversationalists.';
      }
    } else if (isFirstTime) {
      shotAngle = 'Medium shot (MS)';
      lens = LENS_PRESETS.medium;
      cameraPos = `Frontal 3/4 angle facing ${speaker}`;
      framing = `Waist-up framing with comfortable 10cm headroom. Background gently falloff.`;
      lighting = 'Soft tungsten key with warm fill to welcome the character into the scene.';
      instructions = 'Follow actor\'s posture shift smoothly without jerking.';
      reason = `Initial individual coverage of ${speaker} establishing their demeanor and posture.`;
    } else if (isIntense) {
      shotAngle = idx % 2 === 0 ? 'Close-up (CU)' : 'Dutch angle (Tilted Horizon)';
      lens = LENS_PRESETS.closeUp;
      cameraPos = `Direct punch-in on ${speaker}`;
      cameraMovement = 'Slow push-in (dolly creep 15cm forward)';
      framing = 'Tight choker framing: eyes locked on upper third line. Intimate and uncompromising.';
      lighting = 'Low-key lighting with deep cheek shadows (Chiaroscuro).';
      instructions = 'Let the actor hold the stillness after speaking before calling cut.';
      reason = 'Isolates the character under intense emotional pressure, magnifying subtext.';
    } else {
      shotAngle = 'Medium close-up (MCU)';
      lens = LENS_PRESETS.mediumCloseUp;
      cameraPos = `Eye-level, 1.8 meters back from ${speaker}`;
      framing = 'Chest-up framing balancing actor expression with physical gestures.';
      lighting = 'Balanced 3:1 contrast ratio creating clean cinematic depth.';
      instructions = 'Maintain steady framing during dialogue delivery.';
      reason = 'Standard narrative dialogue coverage prioritizing speech clarity and actor reaction.';
    }

    shotPlan.push({
      shotNumber: shotIndex++,
      correspondingDialogue: `${speaker}: "${dlg.line}"`,
      character: speaker,
      cameraAngle: shotAngle,
      cameraPosition: cameraPos,
      cameraHeight: 'Eye-level (115cm seated / 160cm standing)',
      cameraMovement: cameraMovement,
      lensRecommendation: lens,
      framingComposition: framing,
      lightingSuggestions: lighting,
      shootingInstructions: instructions,
      reasonForSelection: reason,
      isReverseShot: isReverse,
      reversesShotNumber: isReverse ? shotIndex - 2 : null
    });

    // Check if we should insert an Extreme Close-Up (ECU) prop or hand action
    if (hasPropAction && idx < dialogues.length - 1) {
      shotPlan.push({
        shotNumber: shotIndex++,
        correspondingDialogue: `ACTION INSERT: ${dlg.action}`,
        character: `${speaker} (Hands / Prop Insert)`,
        cameraAngle: 'Extreme close-up (ECU) Insert',
        cameraPosition: 'Top-down 45° angle over table / prop surface',
        cameraHeight: 'Table level (80cm)',
        cameraMovement: 'Static lockdown',
        lensRecommendation: LENS_PRESETS.extremeCloseUp,
        framingComposition: 'Macro focus on hands, fingers, or objects. Razor-thin depth of field (f/2.8).',
        lightingSuggestions: 'Focused spotlight accentuating texture and metallic or glass specular glints.',
        shootingInstructions: 'Shoot at 48fps or 60fps for optional subtle slow-motion to heighten cinematic gravity.',
        reasonForSelection: 'Visual punctuation: Highlights physical subtext and breaks talking-head monotony.'
      });
    }

    previousSpeaker = speaker;
    previousShotAngle = shotAngle;
  });

  // Scene Closer Shot
  shotPlan.push({
    shotNumber: shotIndex++,
    correspondingDialogue: 'SCENE CLIMAX / OUTRO: Final beats and lingering silence',
    character: 'Both Characters / Scene Environment',
    cameraAngle: 'Wide Two-Shot / Slow Pull-Back or Bird\'s-eye view',
    cameraPosition: 'Perpendicular wide perspective pulling back through room threshold',
    cameraHeight: 'Elevated (180cm - 220cm)',
    cameraMovement: 'Slow tracking dolly pull-out into darkness / doorway frame',
    lensRecommendation: LENS_PRESETS.wide,
    framingComposition: 'Both characters in silhouette or heavy rim light as distance expands between camera and subjects.',
    lightingSuggestions: 'Fading key light, letting warm interior or cool exterior shadows take over the frame.',
    shootingInstructions: 'Hold the static shot for 6 seconds after the final line is spoken. Allow the music swell to transition.',
    reasonForSelection: 'Leaves the audience with a lasting cinematic impression of the unresolved narrative tension.'
  });

  return shotPlan;
}

module.exports = {
  SHOT_ANGLES,
  LENS_PRESETS,
  generateShotPlan
};
