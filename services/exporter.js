/**
 * FRAME AI - Screenplay & Shotlist Export Service
 * Supports: Plain Text, Fountain Screenplay Format, CSV Shot List, Printable HTML
 */

function formatScreenplayText(scene, variationIndex = 0) {
  const variation = scene.variations?.[variationIndex] || scene.variations?.[0];
  if (!variation) return 'No script available';

  let output = '';
  output += `======================================================================\n`;
  output += `FRAME AI SCREENPLAY: ${scene.heading || 'UNTITLED SCENE'}\n`;
  output += `Project: ${scene.title || 'FRAME AI Studio Project'}\n`;
  output += `Variation: ${variation.title} (${variation.subtitle || ''})\n`;
  output += `======================================================================\n\n`;

  output += `${scene.heading || 'INT. SCENE - DAY'}\n\n`;

  if (scene.improvedConcept) {
    output += `SCENE CONTEXT:\n${scene.improvedConcept}\n\n`;
  }

  output += `CHARACTERS IN SCENE:\n`;
  (variation.characters || []).forEach(c => {
    output += ` - ${c.toUpperCase()}\n`;
  });
  output += `\n----------------------------------------------------------------------\n\n`;

  (variation.dialogues || []).forEach(dlg => {
    if (dlg.action) {
      output += `${dlg.action}\n\n`;
    }
    output += `                ${dlg.character.toUpperCase()}\n`;
    if (dlg.parenthetical) {
      output += `          (${dlg.parenthetical})\n`;
    }
    output += `     ${dlg.line}\n\n`;
  });

  output += `\n[END OF SCENE]\n`;
  return output;
}

function formatFountain(scene, variationIndex = 0) {
  const variation = scene.variations?.[variationIndex] || scene.variations?.[0];
  if (!variation) return '';

  let out = `Title: ${scene.heading || 'UNTITLED SCENE'}\nCredit: Written with FRAME AI\nAuthor: FRAME AI Film Director\nDraft date: ${new Date().toLocaleDateString()}\n\n`;
  out += `${scene.heading || 'INT. SCENE - DAY'}\n\n`;

  if (scene.improvedConcept) {
    out += `/* Scene Concept:\n${scene.improvedConcept}\n*/\n\n`;
  }

  (variation.dialogues || []).forEach(dlg => {
    if (dlg.action) {
      out += `${dlg.action}\n\n`;
    }
    out += `${dlg.character.toUpperCase()}\n`;
    if (dlg.parenthetical) {
      out += `(${dlg.parenthetical})\n`;
    }
    out += `${dlg.line}\n\n`;
  });

  return out;
}

function formatShotListCSV(shotPlan = []) {
  const headers = [
    'Shot #',
    'Angle',
    'Subject / Character',
    'Corresponding Dialogue / Action',
    'Position',
    'Height',
    'Movement',
    'Lens',
    'Framing',
    'Lighting',
    'Shooting Instructions',
    'Director Purpose'
  ];

  let csv = headers.map(h => `"${h}"`).join(',') + '\n';

  shotPlan.forEach(shot => {
    const row = [
      shot.shotNumber,
      shot.cameraAngle,
      shot.character,
      shot.correspondingDialogue ? shot.correspondingDialogue.replace(/"/g, '""') : '',
      shot.cameraPosition ? shot.cameraPosition.replace(/"/g, '""') : '',
      shot.cameraHeight || '',
      shot.cameraMovement ? shot.cameraMovement.replace(/"/g, '""') : '',
      shot.lensRecommendation ? shot.lensRecommendation.replace(/"/g, '""') : '',
      shot.framingComposition ? shot.framingComposition.replace(/"/g, '""') : '',
      shot.lightingSuggestions ? shot.lightingSuggestions.replace(/"/g, '""') : '',
      shot.shootingInstructions ? shot.shootingInstructions.replace(/"/g, '""') : '',
      shot.reasonForSelection ? shot.reasonForSelection.replace(/"/g, '""') : ''
    ];
    csv += row.map(val => `"${val}"`).join(',') + '\n';
  });

  return csv;
}

module.exports = {
  formatScreenplayText,
  formatFountain,
  formatShotListCSV
};
