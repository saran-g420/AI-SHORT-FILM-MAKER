/**
 * FRAME AI - Storyboard Builder
 * Visual shot cards with framing guides, camera metadata, and exportable storyboard sheet.
 */

window.StoryboardManager = (function() {
  function renderStoryboard() {
    const container = document.getElementById('storyboard-grid');
    if (!container) return;

    const scene = window.ScreenplayManager.getScene();
    const shots = scene?.cinematographyPlan || [];

    if (shots.length === 0) {
      container.innerHTML = `
        <div class="col-span-full p-8 text-center text-slate-400">
          <p>No shots available for storyboard. Generate a scene to view the visual boards.</p>
        </div>
      `;
      return;
    }

    let html = '';
    shots.forEach((shot, i) => {
      const isReverse = shot.isReverseShot || shot.cameraAngle?.toLowerCase().includes('reverse');
      const angle = (shot.cameraAngle || '').toLowerCase();
      
      // Select appropriate visual SVG frame thumbnail
      let visualGraphic = '';
      if (angle.includes('close-up')) {
        visualGraphic = `
          <div class="w-full h-full flex items-center justify-center bg-gradient-to-b from-slate-900 to-black">
            <div class="w-20 h-24 rounded-[45%] bg-amber-500/20 border-2 border-amber-500/60 flex items-center justify-center">
              <span class="text-[10px] font-mono text-amber-300">CLOSE-UP</span>
            </div>
          </div>
        `;
      } else if (angle.includes('wide')) {
        visualGraphic = `
          <div class="w-full h-full flex items-end justify-center pb-4 bg-gradient-to-b from-slate-900 via-slate-950 to-black">
            <div class="flex gap-12">
              <div class="w-4 h-10 bg-blue-500/40 rounded-t border border-blue-400/60"></div>
              <div class="w-4 h-10 bg-amber-500/40 rounded-t border border-amber-400/60"></div>
            </div>
          </div>
        `;
      } else if (angle.includes('over-the-shoulder') || angle.includes('ots')) {
        visualGraphic = `
          <div class="w-full h-full relative bg-gradient-to-b from-slate-900 to-black overflow-hidden flex items-center justify-center">
            <div class="absolute -bottom-6 -left-6 w-24 h-24 rounded-full bg-slate-700/80 border border-slate-500/40"></div>
            <div class="w-14 h-18 rounded-[40%] bg-amber-500/30 border border-amber-400 translate-x-4 flex items-center justify-center">
              <span class="text-[9px] font-mono text-amber-300">OTS</span>
            </div>
          </div>
        `;
      } else {
        visualGraphic = `
          <div class="w-full h-full flex items-center justify-center bg-gradient-to-b from-slate-900 to-black">
            <div class="w-12 h-16 rounded-[40%] bg-slate-700/40 border border-slate-500 flex items-center justify-center">
              <span class="text-[9px] font-mono text-slate-300">MEDIUM</span>
            </div>
          </div>
        `;
      }

      html += `
        <div class="film-card overflow-hidden flex flex-col justify-between">
          <!-- Storyboard Frame Preview -->
          <div class="relative w-full aspect-[2.39/1] border-b border-slate-800 bg-black">
            ${visualGraphic}
            <div class="absolute top-2 left-2 flex items-center gap-1.5">
              <span class="px-2 py-0.5 rounded bg-black/80 text-[10px] font-bold text-amber-400 border border-amber-500/40 font-mono">
                SHOT #${shot.shotNumber}
              </span>
              ${isReverse ? '<span class="badge-reverse text-[9px]">REVERSE</span>' : ''}
            </div>
            <div class="absolute bottom-1 right-2 text-[10px] font-mono text-cyan-400 bg-black/80 px-1.5 rounded">
              ${shot.lensRecommendation?.split(' ')[0] || '50mm'}
            </div>
          </div>

          <!-- Storyboard Shot Details -->
          <div class="p-3.5 text-xs flex-1 flex flex-col justify-between">
            <div>
              <div class="flex items-center justify-between text-slate-400 text-[11px] mb-1">
                <span class="font-bold text-white">${shot.cameraAngle}</span>
                <span class="font-mono text-slate-400">${shot.character}</span>
              </div>
              <p class="text-slate-300 text-[11px] font-mono line-clamp-2 my-1.5 bg-black/30 p-1.5 rounded border border-slate-800">
                ${shot.correspondingDialogue}
              </p>
            </div>

            <div class="mt-2 pt-2 border-t border-slate-800 text-[10px] text-slate-400 flex items-center justify-between">
              <span>MOVE: <strong class="text-slate-200">${shot.cameraMovement.split(' ')[0]}</strong></span>
              <span>LIGHT: <strong class="text-amber-400">${shot.lightingSuggestions.slice(0, 20)}...</strong></span>
            </div>
          </div>
        </div>
      `;
    });

    container.innerHTML = html;
  }

  return {
    renderStoryboard
  };
})();
