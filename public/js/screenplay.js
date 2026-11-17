/**
 * FRAME AI - Screenplay Variations & Character Dialogue Editor
 * Handles:
 * - 3 Distinct Script Variations with independent copy/edit/regenerate/improve/expand actions
 * - Individual copy for each variation without combining
 * - Interactive screenplay editor: rename characters, add/remove characters, inline edit dialogues
 */

window.ScreenplayManager = (function() {
  let currentScene = null;
  let activeVariationIndex = 0;
  let editingVariationIndex = 0;

  function setScene(scene) {
    currentScene = scene;
    renderVariations();
    renderCharacterPills();
  }

  function getScene() {
    return currentScene;
  }

  function getActiveVariation() {
    if (!currentScene || !currentScene.variations) return null;
    return currentScene.variations[activeVariationIndex] || currentScene.variations[0];
  }

  /**
   * Render the Three Separate Script Cards
   */
  function renderVariations() {
    const container = document.getElementById('script-variations-container');
    if (!container || !currentScene || !currentScene.variations) return;

    const variations = currentScene.variations;
    let html = '';

    variations.forEach((v, index) => {
      const isSelected = index === activeVariationIndex;
      const typeBadge = index === 0 
        ? '<span class="px-2.5 py-0.5 rounded text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">ORIGINAL / NATURAL</span>'
        : index === 1 
        ? '<span class="px-2.5 py-0.5 rounded text-xs font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/30">CINEMATIC VERSION</span>'
        : '<span class="px-2.5 py-0.5 rounded text-xs font-semibold bg-purple-500/15 text-purple-400 border border-purple-500/30">CREATIVE / UNEXPECTED</span>';

      html += `
        <div class="film-card p-5 flex flex-col justify-between ${isSelected ? 'film-card-active' : ''}" id="variation-card-${index}">
          <div>
            <!-- Card Header -->
            <div class="flex items-start justify-between gap-3 mb-3">
              <div>
                ${typeBadge}
                <h3 class="text-lg font-bold text-white mt-2">${v.title}</h3>
                <p class="text-xs text-amber-400/80 font-medium">${v.subtitle || ''}</p>
              </div>
              <button onclick="ScreenplayManager.selectVariation(${index})" class="px-3 py-1 rounded text-xs font-semibold ${isSelected ? 'bg-amber-500 text-black' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'} transition">
                ${isSelected ? 'Active Script' : 'Select'}
              </button>
            </div>

            <!-- Scene Description & Character List -->
            <p class="text-xs text-slate-300 mb-3 leading-relaxed">${v.summary}</p>
            
            <div class="flex items-center gap-2 mb-4 flex-wrap">
              <span class="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">Characters:</span>
              ${(v.characters || []).map(c => `
                <span class="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-200 border border-slate-700">${c}</span>
              `).join('')}
            </div>

            <!-- Screenplay Preview Box (Character-wise Dialogues) -->
            <div class="screenplay-sheet p-4 max-h-[360px] overflow-y-auto mb-4 text-xs">
              <div class="screenplay-slugline">${currentScene.heading || 'INT. SCENE - DAY'}</div>
              
              ${(v.dialogues || []).map((dlg, dIdx) => `
                <div class="mb-3 hover:bg-white/5 p-1.5 rounded transition">
                  ${dlg.action ? `<div class="screenplay-action">${dlg.action}</div>` : ''}
                  <div class="screenplay-character flex items-center justify-center gap-1">
                    <span>${dlg.character}</span>
                  </div>
                  ${dlg.parenthetical ? `<div class="screenplay-parenthetical">(${dlg.parenthetical})</div>` : ''}
                  <div class="screenplay-dialogue">"${dlg.line}"</div>
                </div>
              `).join('')}

              <div class="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-400">
                <span class="text-amber-400 font-semibold">Cinematography Brief:</span> ${v.cinematographyBrief || 'Standard coverage'}
              </div>
            </div>
          </div>

          <!-- INDEPENDENT CONTROLS FOR THIS VARIATION (Mandatory Section 3 Requirement) -->
          <div class="pt-3 border-t border-slate-800/80 flex flex-wrap gap-2">
            <!-- 1. Copy Script (Strictly copies only this variation!) -->
            <button onclick="ScreenplayManager.copyVariation(${index})" class="btn-subtle px-3 py-1.5 text-xs flex items-center gap-1.5 text-amber-300 hover:text-white" title="Copy this complete script variation">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2"></path></svg>
              <span>Copy Script</span>
            </button>

            <!-- 2. Edit Script -->
            <button onclick="ScreenplayManager.openEditor(${index})" class="btn-subtle px-3 py-1.5 text-xs flex items-center gap-1.5" title="Edit characters & dialogue lines">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
              <span>Edit Script</span>
            </button>

            <!-- 3. Regenerate -->
            <button onclick="ScreenplayManager.regenerateVariation(${index})" class="btn-subtle px-2.5 py-1.5 text-xs flex items-center gap-1" title="Regenerate this variation">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
              <span>Regenerate</span>
            </button>

            <!-- 4. Improve Script -->
            <button onclick="ScreenplayManager.improveVariation(${index})" class="btn-subtle px-2.5 py-1.5 text-xs flex items-center gap-1 text-cyan-300" title="Apply AI script suggestions">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
              <span>Improve</span>
            </button>

            <!-- 5. Expand Script -->
            <button onclick="ScreenplayManager.expandVariation(${index})" class="btn-subtle px-2.5 py-1.5 text-xs flex items-center gap-1 text-purple-300" title="Add 2 deeper beats to this scene">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
              <span>Expand</span>
            </button>
          </div>
        </div>
      `;
    });

    container.innerHTML = html;
  }

  /**
   * Switch the active variation and update shot plan and blocking visualizer
   */
  function selectVariation(index) {
    activeVariationIndex = index;
    renderVariations();
    if (window.CinematographyManager) {
      window.CinematographyManager.updateForVariation(index);
    }
    showToast(`Switched to ${currentScene.variations[index].title}`);
  }

  /**
   * Copy the Selected Script independently
   */
  function copyVariation(index) {
    if (!currentScene || !currentScene.variations[index]) return;
    const v = currentScene.variations[index];

    let scriptText = `FRAME AI - SCREENPLAY EXPORT\n`;
    scriptText += `Scene: ${currentScene.heading || 'UNTITLED SCENE'}\n`;
    scriptText += `Script Variation: ${v.title}\n`;
    scriptText += `Concept: ${currentScene.improvedConcept || currentScene.originalIdea}\n`;
    scriptText += `Characters: ${(v.characters || []).join(', ')}\n\n`;
    scriptText += `${currentScene.heading || 'INT. SCENE - DAY'}\n\n`;

    (v.dialogues || []).forEach(dlg => {
      if (dlg.action) {
        scriptText += `${dlg.action}\n\n`;
      }
      scriptText += `          ${dlg.character.toUpperCase()}\n`;
      if (dlg.parenthetical) {
        scriptText += `     (${dlg.parenthetical})\n`;
      }
      scriptText += `"${dlg.line}"\n\n`;
    });

    scriptText += `[END OF SCENE]\n`;
    scriptText += `Cinematography Recommendation: ${v.cinematographyBrief || 'Standard natural coverage'}\n`;

    navigator.clipboard.writeText(scriptText).then(() => {
      showToast(`✓ Copied "${v.title}" to clipboard!`);
    }).catch(err => {
      console.error('Clipboard copy failed:', err);
      // Fallback
      const ta = document.createElement('textarea');
      ta.value = scriptText;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      showToast(`✓ Copied "${v.title}" to clipboard!`);
    });
  }

  /**
   * Open the Full Interactive Screenplay & Character Editor Modal
   */
  function openEditor(variationIndex) {
    editingVariationIndex = variationIndex;
    const modal = document.getElementById('screenplay-editor-modal');
    if (!modal || !currentScene) return;

    renderEditorModalContent();
    modal.classList.remove('hidden');
  }

  function closeEditor() {
    const modal = document.getElementById('screenplay-editor-modal');
    if (modal) modal.classList.add('hidden');
  }

  function renderEditorModalContent() {
    const v = currentScene.variations[editingVariationIndex];
    const container = document.getElementById('editor-modal-body');
    if (!container || !v) return;

    let html = `
      <div class="space-y-6">
        <!-- Scene Heading & Title -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-semibold text-slate-300 uppercase mb-1">Scene Heading (Slugline)</label>
            <input type="text" id="edit-scene-heading" value="${currentScene.heading || 'INT. SCENE - DAY'}" class="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-mono focus:border-amber-500 focus:outline-none">
          </div>
          <div>
            <label class="block text-xs font-semibold text-slate-300 uppercase mb-1">Variation Title</label>
            <input type="text" id="edit-variation-title" value="${v.title}" class="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:border-amber-500 focus:outline-none">
          </div>
        </div>

        <!-- Character Manager Bar: Add, Remove, Rename -->
        <div class="bg-slate-900/80 border border-slate-800 rounded-lg p-4">
          <div class="flex items-center justify-between mb-3">
            <h4 class="text-sm font-bold text-amber-400 flex items-center gap-2">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
              Character Manager (Rename, Add, Remove)
            </h4>
            <button onclick="ScreenplayManager.addNewCharacterPrompt()" class="px-2.5 py-1 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-semibold hover:bg-amber-500/30 flex items-center gap-1">
              + Add Character
            </button>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-3" id="characters-editor-list">
            ${(currentScene.characters || []).map((char, cIdx) => `
              <div class="flex items-center gap-2 bg-slate-800/80 p-2.5 rounded border border-slate-700">
                <div class="w-3 h-3 rounded-full" style="background-color: ${char.color || '#F59E0B'}"></div>
                <input type="text" value="${char.name}" onchange="ScreenplayManager.renameCharacter('${char.name}', this.value)" class="bg-slate-900 border border-slate-600 rounded px-2 py-1 text-xs text-white flex-1 font-semibold focus:border-amber-400">
                <span class="text-[10px] text-slate-400">${char.role || 'Character'}</span>
                ${currentScene.characters.length > 2 ? `
                  <button onclick="ScreenplayManager.removeCharacter('${char.name}')" class="text-red-400 hover:text-red-300 text-xs p-1" title="Remove character">✕</button>
                ` : ''}
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Dialogues List Editor -->
        <div>
          <div class="flex items-center justify-between mb-3">
            <h4 class="text-sm font-bold text-white flex items-center gap-2">
              <svg class="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
              Character Dialogue Lines (${v.dialogues.length} beats)
            </h4>
            <button onclick="ScreenplayManager.addNewDialogueBeat()" class="px-2.5 py-1 rounded bg-slate-800 text-slate-200 border border-slate-700 text-xs font-semibold hover:bg-slate-700">
              + Insert Dialogue Beat
            </button>
          </div>

          <div class="space-y-4" id="editor-dialogue-beats">
            ${v.dialogues.map((dlg, dIdx) => `
              <div class="bg-slate-900 border border-slate-800 rounded-lg p-3 hover:border-slate-700 transition" data-dlg-index="${dIdx}">
                <div class="flex items-center justify-between gap-3 mb-2">
                  <div class="flex items-center gap-2">
                    <span class="text-xs font-mono text-slate-500 font-bold">#${dIdx + 1}</span>
                    <select onchange="ScreenplayManager.updateDialogueSpeaker(${dIdx}, this.value)" class="bg-slate-800 border border-slate-700 text-amber-400 text-xs font-bold rounded px-2 py-1">
                      ${(currentScene.characters || []).map(c => `
                        <option value="${c.name}" ${c.name === dlg.character ? 'selected' : ''}>${c.name.toUpperCase()}</option>
                      `).join('')}
                    </select>
                  </div>
                  <div class="flex items-center gap-1">
                    <button onclick="ScreenplayManager.deleteDialogueBeat(${dIdx})" class="text-red-400/80 hover:text-red-400 text-xs px-2 py-0.5" title="Delete beat">Delete</button>
                  </div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-2 mb-2">
                  <div>
                    <label class="block text-[10px] text-slate-400 uppercase font-mono">Emotion / Delivery (Parenthetical)</label>
                    <input type="text" value="${dlg.parenthetical || ''}" onchange="ScreenplayManager.updateDialogueField(${dIdx}, 'parenthetical', this.value)" placeholder="e.g. whispering, looking away" class="w-full bg-slate-800 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-slate-200 italic focus:border-amber-500 focus:outline-none">
                  </div>
                  <div>
                    <label class="block text-[10px] text-slate-400 uppercase font-mono">Action / Physical Reaction</label>
                    <input type="text" value="${dlg.action || ''}" onchange="ScreenplayManager.updateDialogueField(${dIdx}, 'action', this.value)" placeholder="e.g. sets down cup, turns to face window" class="w-full bg-slate-800 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-slate-300 focus:border-amber-500 focus:outline-none">
                  </div>
                </div>

                <div>
                  <label class="block text-[10px] text-slate-400 uppercase font-mono">Spoken Dialogue</label>
                  <textarea rows="2" onchange="ScreenplayManager.updateDialogueField(${dIdx}, 'line', this.value)" class="w-full bg-slate-800 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-white font-mono focus:border-amber-500 focus:outline-none">${dlg.line}</textarea>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;

    container.innerHTML = html;
  }

  function renameCharacter(oldName, newName) {
    if (!newName || newName.trim() === '' || oldName === newName) return;
    const trimmed = newName.trim();

    // Update in characters list
    const char = currentScene.characters.find(c => c.name.toLowerCase() === oldName.toLowerCase());
    if (char) char.name = trimmed;

    // Update in all variations
    currentScene.variations.forEach(v => {
      v.characters = (v.characters || []).map(c => c.toLowerCase() === oldName.toLowerCase() ? trimmed : c);
      (v.dialogues || []).forEach(dlg => {
        if (dlg.character && dlg.character.toLowerCase() === oldName.toLowerCase()) {
          dlg.character = trimmed;
        }
      });
    });

    renderEditorModalContent();
    renderVariations();
    renderCharacterPills();
    saveSceneToBackend();
    showToast(`Renamed "${oldName}" to "${trimmed}"`);
  }

  function addNewCharacterPrompt() {
    const name = prompt('Enter new character name:');
    if (!name || name.trim() === '') return;
    const trimmed = name.trim();

    const colors = ['#10B981', '#EC4899', '#8B5CF6', '#06B6D4', '#F97316'];
    const chosenColor = colors[currentScene.characters.length % colors.length];

    currentScene.characters.push({
      id: 'char_' + Date.now().toString(36),
      name: trimmed,
      role: 'New Supporting Character',
      bio: 'Introduced into the scene dynamics',
      color: chosenColor
    });

    currentScene.variations.forEach(v => {
      if (!v.characters.includes(trimmed)) {
        v.characters.push(trimmed);
      }
    });

    renderEditorModalContent();
    renderVariations();
    renderCharacterPills();
    saveSceneToBackend();
    showToast(`Added character: ${trimmed}`);
  }

  function removeCharacter(name) {
    if (!confirm(`Are you sure you want to remove ${name} from this scene?`)) return;
    currentScene.characters = currentScene.characters.filter(c => c.name !== name);
    currentScene.variations.forEach(v => {
      v.characters = v.characters.filter(c => c !== name);
    });

    renderEditorModalContent();
    renderVariations();
    renderCharacterPills();
    saveSceneToBackend();
    showToast(`Removed character: ${name}`);
  }

  function updateDialogueField(dialogueIndex, field, value) {
    const v = currentScene.variations[editingVariationIndex];
    if (v && v.dialogues[dialogueIndex]) {
      v.dialogues[dialogueIndex][field] = value;
    }
  }

  function updateDialogueSpeaker(dialogueIndex, newSpeaker) {
    const v = currentScene.variations[editingVariationIndex];
    if (v && v.dialogues[dialogueIndex]) {
      v.dialogues[dialogueIndex].character = newSpeaker;
    }
  }

  function addNewDialogueBeat() {
    const v = currentScene.variations[editingVariationIndex];
    const defaultSpeaker = currentScene.characters[0]?.name || 'Speaker';
    v.dialogues.push({
      id: 'd_' + Date.now().toString(36),
      character: defaultSpeaker,
      parenthetical: 'speaking with intention',
      line: 'Enter new dialogue line here...',
      action: 'Actor takes a breath.'
    });
    renderEditorModalContent();
  }

  function deleteDialogueBeat(index) {
    const v = currentScene.variations[editingVariationIndex];
    if (v && v.dialogues.length > 1) {
      v.dialogues.splice(index, 1);
      renderEditorModalContent();
    }
  }

  function saveEditorChanges() {
    const headingInput = document.getElementById('edit-scene-heading');
    const titleInput = document.getElementById('edit-variation-title');
    if (headingInput) currentScene.heading = headingInput.value;
    if (titleInput) currentScene.variations[editingVariationIndex].title = titleInput.value;

    saveSceneToBackend();
    renderVariations();
    closeEditor();

    // Recompute cinematography plan to align camera angles to edited lines
    if (window.CinematographyManager) {
      window.CinematographyManager.regenerateShotPlan(editingVariationIndex);
    }
    showToast('✓ Script changes saved successfully!');
  }

  function saveSceneToBackend() {
    if (!currentScene || !currentScene.id) return;
    fetch(`/api/scenes/${currentScene.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(currentScene)
    }).catch(err => console.error('Error saving scene:', err));
  }

  function regenerateVariation(index) {
    showToast(`Regenerating ${currentScene.variations[index].title}...`);
    fetch(`/api/scenes/${currentScene.id}/expand-variation`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ variationIndex: index })
    })
    .then(r => r.json())
    .then(data => {
      if (data.scene) {
        currentScene = data.scene;
        renderVariations();
        if (window.CinematographyManager) window.CinematographyManager.renderShots();
        showToast('✓ Variation refreshed with new dynamic beats!');
      }
    })
    .catch(err => {
      console.error(err);
      showToast('Error refreshing variation');
    });
  }

  function improveVariation(index) {
    // Switch to improvements tab and pre-select this variation
    window.App.switchView('improvements');
    showToast(`Viewing improvements for ${currentScene.variations[index].title}`);
  }

  function expandVariation(index) {
    showToast(`Expanding ${currentScene.variations[index].title} with deeper conflict...`);
    fetch(`/api/scenes/${currentScene.id}/expand-variation`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ variationIndex: index })
    })
    .then(r => r.json())
    .then(data => {
      if (data.scene) {
        currentScene = data.scene;
        renderVariations();
        if (window.CinematographyManager) window.CinematographyManager.renderShots();
        showToast('✓ Scene expanded with 2 climactic beats!');
      }
    })
    .catch(err => {
      console.error(err);
      showToast('Error expanding scene');
    });
  }

  function renderCharacterPills() {
    const container = document.getElementById('scene-characters-bar');
    if (!container || !currentScene) return;

    const chars = currentScene.characters || [];
    container.innerHTML = `
      <div class="flex items-center gap-2 flex-wrap">
        <span class="text-xs text-slate-400 uppercase font-semibold">Scene Characters:</span>
        ${chars.map(c => `
          <div class="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800 text-xs text-white border border-slate-700">
            <span class="w-2 h-2 rounded-full" style="background-color: ${c.color || '#F59E0B'}"></span>
            <span class="font-bold">${c.name}</span>
            <span class="text-slate-400 text-[10px]">(${c.role})</span>
          </div>
        `).join('')}
      </div>
    `;
  }

  return {
    setScene,
    getScene,
    getActiveVariation,
    renderVariations,
    selectVariation,
    copyVariation,
    openEditor,
    closeEditor,
    saveEditorChanges,
    renameCharacter,
    addNewCharacterPrompt,
    removeCharacter,
    updateDialogueField,
    updateDialogueSpeaker,
    addNewDialogueBeat,
    deleteDialogueBeat,
    regenerateVariation,
    improveVariation,
    expandVariation
  };
})();
