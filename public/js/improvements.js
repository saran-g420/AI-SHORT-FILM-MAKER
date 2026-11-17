/**
 * FRAME AI - Script Improvement Center
 * Displays the 4-part AI Suggestions breakdown:
 * 1. What can be improved?
 * 2. Why should it be improved?
 * 3. How can it be improved?
 * 4. Example of the improved version
 * With Apply Individual, Apply All, and Side-by-Side Comparison Diff!
 */

window.ImprovementManager = (function() {
  let suggestions = [];
  let isComparing = false;

  function setSuggestions(list) {
    suggestions = list || [];
    renderSuggestions();
  }

  function renderSuggestions() {
    const container = document.getElementById('improvements-container');
    if (!container) return;

    if (!suggestions || suggestions.length === 0) {
      container.innerHTML = `
        <div class="p-8 text-center text-slate-400">
          <p>No improvement suggestions available. Generate a scene to analyze script pacing and dialogue realism.</p>
        </div>
      `;
      return;
    }

    let html = `
      <!-- Header & Global Actions -->
      <div class="flex items-center justify-between gap-4 mb-6 flex-wrap">
        <div>
          <h3 class="text-lg font-bold text-white flex items-center gap-2">
            <svg class="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path></svg>
            AI Suggestions to Make Your Scene Better
          </h3>
          <p class="text-xs text-slate-400 mt-1">Review concrete improvements to elevate emotional subtext, realistic pauses, and visual behavior.</p>
        </div>

        <div class="flex items-center gap-2">
          <button onclick="ImprovementManager.toggleComparison()" class="btn-subtle px-3 py-1.5 text-xs text-cyan-300 flex items-center gap-1.5">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"></path></svg>
            <span>Compare Original vs Improved</span>
          </button>
          <button onclick="ImprovementManager.applyAll()" class="btn-gold px-4 py-1.5 text-xs flex items-center gap-1.5">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
            <span>Apply All Selected Improvements</span>
          </button>
        </div>
      </div>

      <!-- Side-by-Side Comparison Container (if active) -->
      ${isComparing ? renderComparisonView() : ''}

      <!-- 4-Part Structured Improvement Cards -->
      <div class="space-y-5">
    `;

    suggestions.forEach((imp, idx) => {
      html += `
        <div class="film-card p-5 border-l-4 border-l-amber-500">
          <div class="flex items-start justify-between gap-4 mb-3">
            <div>
              <span class="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30">
                Focus Area: ${imp.area || 'Dialogue & Pacing'}
              </span>
              <h4 class="text-base font-bold text-white mt-1.5">${imp.what}</h4>
            </div>
            <button onclick="ImprovementManager.applyOne('${imp.id}')" class="btn-subtle px-3 py-1.5 text-xs text-amber-300 hover:text-white flex items-center gap-1">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
              Apply Suggestion
            </button>
          </div>

          <!-- 4-Part Detailed Explanation (Strict User Requirement) -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 my-3 text-xs">
            <div class="bg-slate-900/60 p-3 rounded border border-slate-800">
              <span class="text-[10px] font-bold text-amber-400 uppercase tracking-wider block mb-1">1. What Can Be Improved?</span>
              <p class="text-slate-300 leading-relaxed">${imp.what}</p>
            </div>
            <div class="bg-slate-900/60 p-3 rounded border border-slate-800">
              <span class="text-[10px] font-bold text-cyan-400 uppercase tracking-wider block mb-1">2. Why Should It Be Improved?</span>
              <p class="text-slate-300 leading-relaxed">${imp.why}</p>
            </div>
            <div class="bg-slate-900/60 p-3 rounded border border-slate-800">
              <span class="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block mb-1">3. How Can It Be Improved?</span>
              <p class="text-slate-300 leading-relaxed">${imp.how}</p>
            </div>
          </div>

          <!-- 4. Example of the improved version -->
          <div class="mt-3">
            <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">4. Improved Dialogue / Screenplay Example:</span>
            <div class="screenplay-sheet p-3 text-xs bg-black/50 border border-slate-700/80 rounded font-mono text-amber-200 whitespace-pre-line leading-relaxed">
${imp.example}
            </div>
          </div>
        </div>
      `;
    });

    html += `</div>`;
    container.innerHTML = html;
  }

  function renderComparisonView() {
    const scene = window.ScreenplayManager.getScene();
    if (!scene) return '';

    const orig = scene.variations?.[0] || {};
    const cinematic = scene.variations?.[1] || {};

    return `
      <div class="bg-slate-950 border border-cyan-500/40 rounded-xl p-5 mb-6 shadow-2xl">
        <div class="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
          <div class="flex items-center gap-2">
            <span class="w-3 h-3 rounded-full bg-cyan-400 animate-pulse"></span>
            <h4 class="text-sm font-bold text-white uppercase tracking-wider">Side-By-Side Script Comparison</h4>
          </div>
          <button onclick="ImprovementManager.toggleComparison()" class="text-xs text-slate-400 hover:text-white">✕ Close Comparison</button>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
          <!-- Original Version Column -->
          <div class="bg-slate-900/80 p-3 rounded border border-slate-800">
            <div class="text-emerald-400 font-bold mb-2 pb-1 border-b border-slate-800 uppercase flex items-center justify-between">
              <span>Original / Natural Version</span>
              <span class="text-[10px] text-slate-500">Unfiltered Input</span>
            </div>
            <div class="space-y-3 max-h-72 overflow-y-auto">
              ${(orig.dialogues || []).map(d => `
                <div>
                  <div class="text-amber-400 font-bold text-[11px]">${d.character} (${d.parenthetical || ''})</div>
                  <div class="text-slate-300">"${d.line}"</div>
                </div>
              `).join('')}
            </div>
          </div>

          <!-- Cinematic / Improved Column -->
          <div class="bg-slate-900/80 p-3 rounded border border-amber-500/40">
            <div class="text-amber-400 font-bold mb-2 pb-1 border-b border-slate-800 uppercase flex items-center justify-between">
              <span>Cinematic / Improved Version</span>
              <span class="text-[10px] text-amber-500/80">Enhanced Subtext</span>
            </div>
            <div class="space-y-3 max-h-72 overflow-y-auto">
              ${(cinematic.dialogues || []).map(d => `
                <div>
                  <div class="text-amber-400 font-bold text-[11px]">${d.character} (${d.parenthetical || ''})</div>
                  <div class="text-slate-200 font-semibold">"${d.line}"</div>
                  ${d.action ? `<div class="text-slate-500 text-[10px] italic mt-0.5">${d.action}</div>` : ''}
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      </div>
    `;
  }

  function toggleComparison() {
    isComparing = !isComparing;
    renderSuggestions();
  }

  function applyOne(id) {
    const scene = window.ScreenplayManager.getScene();
    if (!scene || !scene.id) return;

    fetch(`/api/scenes/${scene.id}/apply-improvement`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ improvementId: id, variationIndex: 0 })
    })
    .then(r => r.json())
    .then(data => {
      showToast('✓ Suggestion applied to active screenplay!');
      if (data.scene) {
        window.ScreenplayManager.setScene(data.scene);
      }
    })
    .catch(err => {
      console.error(err);
      showToast('Error applying suggestion');
    });
  }

  function applyAll() {
    const scene = window.ScreenplayManager.getScene();
    if (!scene || !scene.id) return;

    fetch(`/api/scenes/${scene.id}/apply-improvement`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ applyAll: true, variationIndex: 0 })
    })
    .then(r => r.json())
    .then(data => {
      showToast('✓ All director improvements applied to screenplay!');
      if (data.scene) {
        window.ScreenplayManager.setScene(data.scene);
      }
    })
    .catch(err => {
      console.error(err);
      showToast('Error applying all improvements');
    });
  }

  return {
    setSuggestions,
    renderSuggestions,
    toggleComparison,
    applyOne,
    applyAll
  };
})();
