/**
 * FRAME AI - Creative Idea Generator
 * Recommends proactive creative narrative additions:
 * New character, unexpected events, suspense moments, visual symbolism, environment.
 * Labeled clearly as optional suggestions with narrative rationale.
 */

window.CreativeManager = (function() {
  let ideas = [];

  function setIdeas(list) {
    ideas = list || [];
    renderIdeas();
  }

  function renderIdeas() {
    const container = document.getElementById('creative-ideas-container');
    if (!container) return;

    if (!ideas || ideas.length === 0) {
      container.innerHTML = `
        <div class="p-8 text-center text-slate-400">
          <p>No creative ideas generated yet. Generate a scene to explore narrative twists and visual storytelling.</p>
        </div>
      `;
      return;
    }

    let html = `
      <div class="mb-5">
        <h3 class="text-lg font-bold text-white flex items-center gap-2">
          <svg class="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path></svg>
          AI Creative Ideas & Story Additions
        </h3>
        <p class="text-xs text-slate-400 mt-1">Optional creative suggestions to expand world-building, introduce dramatic irony, or enhance visual symbolism.</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
    `;

    ideas.forEach((idea, idx) => {
      html += `
        <div class="film-card p-5 flex flex-col justify-between border-t-2 border-t-purple-500">
          <div>
            <div class="flex items-center justify-between gap-2 mb-2">
              <span class="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                ${idea.category || 'Optional Creative Element'}
              </span>
              <span class="text-[10px] text-slate-500 font-mono">IDEA #${idx + 1}</span>
            </div>

            <h4 class="text-base font-bold text-white mt-1 mb-2">${idea.title}</h4>
            <p class="text-xs text-slate-300 leading-relaxed mb-4">${idea.description}</p>
          </div>

          <div class="pt-3 border-t border-slate-800">
            <span class="text-[10px] font-bold text-amber-400 uppercase tracking-wider block mb-1">How This Supports The Story:</span>
            <p class="text-[11px] text-slate-400 italic mb-4 leading-relaxed">${idea.narrativeImpact}</p>

            <button onclick="CreativeManager.adoptIdea('${idea.title.replace(/'/g, "\\'")}', '${idea.description.replace(/'/g, "\\'")}')" class="w-full btn-subtle py-2 text-xs text-purple-300 hover:text-white flex items-center justify-center gap-1.5 font-semibold">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
              Adopt Into Scene Concept
            </button>
          </div>
        </div>
      `;
    });

    html += `</div>`;
    container.innerHTML = html;
  }

  function adoptIdea(title, desc) {
    const scene = window.ScreenplayManager.getScene();
    if (!scene) return;

    scene.improvedConcept += `\n[Director Creative Addition - ${title}: ${desc}]`;
    showToast(`✓ Adopted "${title}" into scene concept!`);
  }

  return {
    setIdeas,
    renderIdeas,
    adoptIdea
  };
})();
