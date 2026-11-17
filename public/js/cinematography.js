/**
 * FRAME AI - Cinematography Manager & Shot-by-Shot Planner
 * Renders all 12 technical shot parameters, identifies reverse shots,
 * and links dialogue lines to camera angles and 2D visual blocking.
 */

window.CinematographyManager = (function() {
  let activeShots = [];
  let filterAngle = 'all';
  let filterCharacter = 'all';
  let selectedShotIndex = 0;

  function setShotPlan(shots) {
    activeShots = shots || [];
    selectedShotIndex = 0;
    renderShots();
    if (activeShots.length > 0 && window.Visualizer) {
      window.Visualizer.setActiveShot(activeShots[0]);
    }
  }

  function renderShots() {
    const container = document.getElementById('shot-list-container');
    if (!container) return;

    if (!activeShots || activeShots.length === 0) {
      container.innerHTML = `
        <div class="p-8 text-center text-slate-400">
          <p>No cinematography plan generated yet. Generate a scene to view the shot-by-shot breakdown.</p>
        </div>
      `;
      return;
    }

    let filtered = activeShots.filter(shot => {
      const matchAngle = filterAngle === 'all' || (shot.cameraAngle && shot.cameraAngle.toLowerCase().includes(filterAngle.toLowerCase()));
      const matchChar = filterCharacter === 'all' || (shot.character && shot.character.toLowerCase().includes(filterCharacter.toLowerCase()));
      return matchAngle && matchChar;
    });

    let html = `
      <!-- Toolbar & Export -->
      <div class="flex items-center justify-between gap-4 mb-4 flex-wrap">
        <div class="flex items-center gap-2">
          <span class="text-xs font-semibold text-slate-400 uppercase tracking-wider">Filter Angle:</span>
          <select onchange="CinematographyManager.setAngleFilter(this.value)" class="bg-slate-900 border border-slate-700 text-xs text-slate-200 rounded px-2.5 py-1">
            <option value="all">All Camera Angles</option>
            <option value="reverse">Reverse Shots Only</option>
            <option value="over-the-shoulder">Over-The-Shoulder</option>
            <option value="close-up">Close-Up</option>
            <option value="medium">Medium Shots</option>
            <option value="wide">Wide / Establishing</option>
            <option value="extreme">Extreme Close-Up</option>
          </select>
        </div>

        <div class="flex items-center gap-2">
          <button onclick="CinematographyManager.exportCSV()" class="btn-subtle px-3 py-1.5 text-xs flex items-center gap-1.5 text-amber-300">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
            Export Shotlist (CSV)
          </button>
        </div>
      </div>

      <!-- Shot Cards / Table Grid -->
      <div class="space-y-4">
    `;

    filtered.forEach((shot, index) => {
      const isSelected = shot.shotNumber === (activeShots[selectedShotIndex]?.shotNumber);
      const isReverse = shot.isReverseShot || shot.cameraAngle?.toLowerCase().includes('reverse');
      const isInsert = shot.cameraAngle?.toLowerCase().includes('insert') || shot.cameraAngle?.toLowerCase().includes('extreme close-up');

      html += `
        <div class="film-card p-4 cursor-pointer transition-all ${isSelected ? 'film-card-active ring-1 ring-amber-500' : ''}" onclick="CinematographyManager.selectShot(${shot.shotNumber - 1})">
          <div class="flex items-start justify-between gap-3 mb-2 flex-wrap">
            <div class="flex items-center gap-2">
              <span class="w-7 h-7 rounded-full bg-amber-500/20 text-amber-400 font-bold font-mono text-xs flex items-center justify-center border border-amber-500/40">
                #${shot.shotNumber}
              </span>
              <span class="text-sm font-bold text-white">${shot.cameraAngle}</span>
              ${isReverse ? `
                <span class="badge-reverse">
                  <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"></path></svg>
                  Reverse Shot ${shot.reversesShotNumber ? `(Pairs with #${shot.reversesShotNumber})` : ''}
                </span>
              ` : ''}
              ${isInsert ? '<span class="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">PROP INSERT</span>' : ''}
            </div>

            <div class="flex items-center gap-2">
              <span class="badge-lens">${shot.lensRecommendation ? shot.lensRecommendation.split(' ')[0] : '50mm'}</span>
              <span class="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">${shot.character}</span>
            </div>
          </div>

          <!-- Corresponding Dialogue / Action -->
          <div class="bg-black/40 border-l-2 border-amber-500 p-2.5 rounded-r my-2 text-xs font-mono text-slate-200">
            <span class="text-amber-400 font-bold">SCRIPT CUE:</span> ${shot.correspondingDialogue}
          </div>

          <!-- 12 Parameters Technical Grid -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3 pt-3 border-t border-slate-800 text-xs">
            <div>
              <span class="text-[10px] text-slate-400 uppercase font-semibold block">Position & Height</span>
              <p class="text-slate-300 mt-0.5">${shot.cameraPosition} <span class="text-slate-400">(${shot.cameraHeight})</span></p>
            </div>
            <div>
              <span class="text-[10px] text-slate-400 uppercase font-semibold block">Movement & Lens</span>
              <p class="text-slate-300 mt-0.5">${shot.cameraMovement} • <span class="text-cyan-400">${shot.lensRecommendation}</span></p>
            </div>
            <div>
              <span class="text-[10px] text-slate-400 uppercase font-semibold block">Framing & Composition</span>
              <p class="text-slate-300 mt-0.5">${shot.framingComposition}</p>
            </div>
          </div>

          <!-- Lighting & Director Purpose -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2 text-xs bg-slate-900/40 p-2.5 rounded border border-slate-800/60">
            <div>
              <span class="text-[10px] text-amber-400 uppercase font-semibold block">Lighting Setup</span>
              <p class="text-slate-300 mt-0.5">${shot.lightingSuggestions}</p>
            </div>
            <div>
              <span class="text-[10px] text-emerald-400 uppercase font-semibold block">Director Purpose & Subtext</span>
              <p class="text-slate-300 mt-0.5">${shot.reasonForSelection}</p>
            </div>
          </div>

          <!-- Instructions Bar -->
          <div class="mt-2 text-[11px] text-slate-400 flex items-center gap-1.5">
            <span class="text-slate-500 font-bold">SHOOTING INSTRUCTION:</span> ${shot.shootingInstructions}
          </div>
        </div>
      `;
    });

    html += `</div>`;
    container.innerHTML = html;
  }

  function selectShot(index) {
    if (activeShots[index]) {
      selectedShotIndex = index;
      renderShots();
      if (window.Visualizer) {
        window.Visualizer.setActiveShot(activeShots[index]);
      }
    }
  }

  function setAngleFilter(val) {
    filterAngle = val;
    renderShots();
  }

  function exportCSV() {
    const scene = window.ScreenplayManager.getScene();
    if (!scene || !scene.id) return;
    window.location.href = `/api/export/shotlist/${scene.id}`;
    showToast('✓ Exporting Shotlist CSV...');
  }

  function updateForVariation(variationIndex) {
    const scene = window.ScreenplayManager.getScene();
    if (!scene) return;
    regenerateShotPlan(variationIndex);
  }

  function regenerateShotPlan(variationIndex = 0) {
    const scene = window.ScreenplayManager.getScene();
    if (!scene || !scene.id) return;

    fetch(`/api/scenes/${scene.id}/regenerate-shotplan`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ variationIndex })
    })
    .then(r => r.json())
    .then(data => {
      if (data.cinematographyPlan) {
        activeShots = data.cinematographyPlan;
        scene.cinematographyPlan = activeShots;
        renderShots();
        if (window.Visualizer && activeShots[0]) {
          window.Visualizer.setActiveShot(activeShots[0]);
        }
        showToast('✓ Cinematography plan synchronized with active script');
      }
    })
    .catch(err => console.error('Failed to regenerate shot plan:', err));
  }

  return {
    setShotPlan,
    renderShots,
    selectShot,
    setAngleFilter,
    exportCSV,
    updateForVariation,
    regenerateShotPlan
  };
})();
