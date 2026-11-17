/**
 * FRAME AI - AI Director Mode
 * Provides complete, professional, practical filmmaking guidance:
 * Scene introductions, actor blocking, vocal delivery, camera transitions,
 * lighting design, foley sound cue sheet, and scene climax transitions.
 */

window.DirectorManager = (function() {
  let guide = null;

  function setDirectorGuide(data) {
    guide = data;
    renderGuide();
  }

  function renderGuide() {
    const container = document.getElementById('director-mode-container');
    if (!container) return;

    if (!guide) {
      container.innerHTML = `
        <div class="p-8 text-center text-slate-400">
          <p>No director instructions available. Generate a scene to view complete blocking, lighting, and sound cue sheets.</p>
        </div>
      `;
      return;
    }

    const html = `
      <!-- Director Header -->
      <div class="flex items-center justify-between gap-4 mb-6 flex-wrap pb-4 border-b border-slate-800">
        <div>
          <div class="flex items-center gap-2">
            <span class="w-3 h-3 rounded-full bg-amber-500 animate-pulse"></span>
            <h3 class="text-xl font-bold text-white font-cinematic uppercase tracking-wider">AI Director's Master Binder</h3>
          </div>
          <p class="text-xs text-amber-400/90 font-medium mt-1">Tone: ${guide.sceneTone || 'Dramatic Realism'}</p>
        </div>

        <div class="flex items-center gap-2">
          <button onclick="window.print()" class="btn-subtle px-3 py-1.5 text-xs flex items-center gap-1.5">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg>
            Print Director's Sheet
          </button>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- 1. Blocking & Staging Instructions -->
        <div class="film-card p-5">
          <div class="flex items-center gap-2 mb-3 pb-2 border-b border-slate-800">
            <span class="text-amber-400 text-lg">🚶</span>
            <h4 class="text-sm font-bold text-white uppercase tracking-wider">1. Spatial Blocking & Character Movement</h4>
          </div>
          <p class="text-xs text-slate-400 mb-3">Where actors enter, stand, and move across the scene geometry:</p>
          <ul class="space-y-2.5 text-xs text-slate-200">
            ${(guide.blockingInstructions || []).map((step, i) => `
              <li class="flex items-start gap-2.5 bg-slate-900/60 p-2.5 rounded border border-slate-800">
                <span class="font-bold font-mono text-amber-400">#${i + 1}</span>
                <span class="leading-relaxed">${step}</span>
              </li>
            `).join('')}
          </ul>
        </div>

        <!-- 2. Actor Delivery & Emotional Cues -->
        <div class="film-card p-5">
          <div class="flex items-center gap-2 mb-3 pb-2 border-b border-slate-800">
            <span class="text-cyan-400 text-lg">🎭</span>
            <h4 class="text-sm font-bold text-white uppercase tracking-wider">2. Actor Performance & Subtext Coaching</h4>
          </div>
          <p class="text-xs text-slate-400 mb-3">Vocal inflection, micro-expressions, and physical behavior:</p>
          <div class="space-y-3 text-xs">
            ${(guide.actingPerformanceNotes || []).map(note => `
              <div class="bg-slate-900/60 p-3 rounded border border-slate-800 text-slate-200 leading-relaxed">
                ${note}
              </div>
            `).join('')}
          </div>
        </div>

        <!-- 3. Camera Pacing & Cutting Rhythm -->
        <div class="film-card p-5">
          <div class="flex items-center gap-2 mb-3 pb-2 border-b border-slate-800">
            <span class="text-emerald-400 text-lg">⏱️</span>
            <h4 class="text-sm font-bold text-white uppercase tracking-wider">3. Camera Pacing & Cutting Strategy</h4>
          </div>
          <p class="text-xs text-slate-300 leading-relaxed bg-slate-900/60 p-3 rounded border border-slate-800 mb-4">
            ${guide.cameraPacing || 'Start wide to orient space, accelerate cuts to close-ups as emotional conflict mounts.'}
          </p>

          <div class="grid grid-cols-2 gap-3 text-[11px] text-slate-300">
            <div class="bg-black/40 p-2 rounded border border-slate-800">
              <span class="text-emerald-400 font-bold block mb-1">When to Use Wide:</span>
              <span>Scene opening, spatial shifts, character arrivals and departures.</span>
            </div>
            <div class="bg-black/40 p-2 rounded border border-slate-800">
              <span class="text-amber-400 font-bold block mb-1">When to Use Close-Up:</span>
              <span>Lies, confessions, revelations, tears, or withholding eye contact.</span>
            </div>
          </div>
        </div>

        <!-- 4. Lighting & Color Temperature -->
        <div class="film-card p-5">
          <div class="flex items-center gap-2 mb-3 pb-2 border-b border-slate-800">
            <span class="text-yellow-400 text-lg">💡</span>
            <h4 class="text-sm font-bold text-white uppercase tracking-wider">4. Lighting Setup & Atmospheric Mood</h4>
          </div>
          <p class="text-xs text-slate-300 leading-relaxed bg-slate-900/60 p-3 rounded border border-slate-800 mb-3">
            ${guide.lightingAndAtmosphere || 'Warm 3200K key light with 5600K exterior ambient window daylight.'}
          </p>
          <div class="text-[11px] text-slate-400">
            <span class="text-amber-400 font-semibold">Director Pro Tip:</span> Use practical table lamps within the frame to justify where your cinematic key light originates.
          </div>
        </div>

        <!-- 5. Sound & Foley Cue Sheet -->
        <div class="film-card p-5 lg:col-span-2">
          <div class="flex items-center gap-2 mb-3 pb-2 border-b border-slate-800">
            <span class="text-purple-400 text-lg">🎧</span>
            <h4 class="text-sm font-bold text-white uppercase tracking-wider">5. Foley Sound Design & Musical Score Cue Sheet</h4>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            ${(guide.soundAndFoleyCueSheet || []).map(cue => `
              <div class="flex items-start gap-2 bg-slate-900/70 p-2.5 rounded border border-slate-800 text-xs text-slate-200">
                <span class="text-purple-400 font-bold">♪</span>
                <span class="leading-relaxed">${cue}</span>
              </div>
            `).join('')}
          </div>

          <!-- Scene Ending Transition -->
          <div class="mt-4 pt-3 border-t border-slate-800 text-xs flex items-center justify-between flex-wrap gap-2">
            <span class="text-slate-400"><strong class="text-white">Scene Climax & Outro:</strong> ${guide.sceneEndingTransition || 'Slow dissolve to black with lingering sound.'}</span>
            <span class="badge-reverse">SCENE WRAP</span>
          </div>
        </div>
      </div>
    `;

    container.innerHTML = html;
  }

  return {
    setDirectorGuide,
    renderGuide
  };
})();
