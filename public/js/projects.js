/**
 * FRAME AI - Project & Saved Scripts Manager
 * Handles project library, opening saved scenes, export modal, and favorites.
 */

window.ProjectsManager = (function() {
  let projects = [];

  function loadProjects() {
    fetch('/api/projects')
      .then(r => r.json())
      .then(data => {
        projects = data.projects || [];
        renderProjectList();
        renderDashboardRecent();
      })
      .catch(err => console.error('Error fetching projects:', err));
  }

  function renderProjectList() {
    const container = document.getElementById('projects-grid');
    if (!container) return;

    if (projects.length === 0) {
      container.innerHTML = `
        <div class="col-span-full p-12 text-center text-slate-400">
          <p>No film projects found. Click "Create New Project" to begin writing your vision.</p>
        </div>
      `;
      return;
    }

    let html = '';
    projects.forEach(p => {
      html += `
        <div class="film-card p-5 flex flex-col justify-between hover:border-amber-500/50 transition">
          <div>
            <div class="flex items-start justify-between gap-3 mb-2">
              <span class="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-amber-400 border border-slate-700">
                ${p.genre || 'Drama'} • ${p.mood || 'Cinematic'}
              </span>
              <span class="text-xs text-slate-500">${new Date(p.createdAt).toLocaleDateString()}</span>
            </div>

            <h3 class="text-lg font-bold text-white mb-1.5">${p.title}</h3>
            <p class="text-xs text-slate-300 leading-relaxed mb-4">${p.tagline || 'A FRAME AI film project'}</p>

            <div class="flex items-center gap-3 text-xs text-slate-400 mb-4">
              <span>🎬 <strong>${p.sceneCount || 1}</strong> Scenes</span>
              <span>👁️ <strong>${p.targetAudience || 'Indie'}</strong></span>
            </div>
          </div>

          <div class="pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
            <button onclick="ProjectsManager.openProject('${p.id}')" class="btn-gold px-3.5 py-1.5 text-xs font-semibold flex items-center gap-1.5">
              <span>Open Project</span>
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
            </button>
            <div class="flex items-center gap-1">
              <button onclick="ProjectsManager.openExportModal('${p.id}')" class="btn-subtle p-1.5 text-xs text-slate-300 hover:text-white" title="Export Screenplay & Shotlist">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
              </button>
              <button onclick="ProjectsManager.deleteProjectPrompt('${p.id}')" class="btn-subtle p-1.5 text-xs text-red-400 hover:text-red-300" title="Delete Project">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
              </button>
            </div>
          </div>
        </div>
      `;
    });

    container.innerHTML = html;
  }

  function renderDashboardRecent() {
    const container = document.getElementById('dashboard-recent-projects');
    if (!container) return;

    const recent = projects.slice(0, 3);
    if (recent.length === 0) {
      container.innerHTML = `<p class="text-xs text-slate-400 p-4">No recent projects yet.</p>`;
      return;
    }

    container.innerHTML = recent.map(p => `
      <div class="flex items-center justify-between p-3 rounded-lg bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition">
        <div>
          <h4 class="text-sm font-bold text-white">${p.title}</h4>
          <span class="text-[11px] text-amber-400">${p.genre} • ${p.sceneCount || 1} Scene(s)</span>
        </div>
        <button onclick="ProjectsManager.openProject('${p.id}')" class="btn-subtle px-3 py-1 text-xs text-amber-300">
          Open
        </button>
      </div>
    `).join('');
  }

  function openProject(projectId) {
    fetch(`/api/projects/${projectId}`)
      .then(r => r.json())
      .then(data => {
        if (data.scenes && data.scenes.length > 0) {
          window.App.loadScene(data.scenes[0]);
          window.App.switchView('results');
          showToast(`Opened project: ${data.project.title}`);
        } else {
          // No scene yet, open creator wizard
          window.App.switchView('create');
          showToast(`Opened project: ${data.project.title}. Ready to write Scene #1.`);
        }
      })
      .catch(err => console.error(err));
  }

  function createNewProjectPrompt() {
    const title = prompt('Enter film project title:');
    if (!title || !title.trim()) return;

    fetch('/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: title.trim(),
        tagline: 'A new cinematic narrative',
        genre: 'Drama',
        mood: 'Cinematic'
      })
    })
    .then(r => r.json())
    .then(data => {
      loadProjects();
      showToast(`✓ Project "${title}" created!`);
    })
    .catch(err => console.error(err));
  }

  function deleteProjectPrompt(projectId) {
    if (!confirm('Are you sure you want to delete this project and its scenes?')) return;

    fetch(`/api/projects/${projectId}`, { method: 'DELETE' })
      .then(r => r.json())
      .then(data => {
        loadProjects();
        showToast('Project deleted');
      });
  }

  function openExportModal(projectId) {
    const modal = document.getElementById('export-modal');
    if (!modal) return;

    const scene = window.ScreenplayManager.getScene();
    const sceneId = scene ? scene.id : 'scene_coffee_shop_reunion';

    const body = document.getElementById('export-modal-body');
    if (body) {
      body.innerHTML = `
        <div class="space-y-4 text-xs">
          <p class="text-slate-300">Choose your desired cinematic export format for this project:</p>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <!-- 1. Text Screenplay -->
            <div class="bg-slate-900 p-4 rounded-lg border border-slate-800 flex flex-col justify-between">
              <div>
                <span class="text-amber-400 font-bold block mb-1">Standard Screenplay (.TXT)</span>
                <p class="text-slate-400 text-[11px] leading-relaxed">Formatted with Hollywood margins, character sluglines, and parentheticals.</p>
              </div>
              <a href="/api/export/text/${sceneId}/0" download class="btn-subtle mt-4 py-1.5 text-center block text-amber-300 font-semibold">
                Download .TXT
              </a>
            </div>

            <!-- 2. Fountain Screenplay -->
            <div class="bg-slate-900 p-4 rounded-lg border border-slate-800 flex flex-col justify-between">
              <div>
                <span class="text-cyan-400 font-bold block mb-1">Fountain Format (.FOUNTAIN)</span>
                <p class="text-slate-400 text-[11px] leading-relaxed">Industry standard screenplay format compatible with Final Draft, Highland, and WriterDuet.</p>
              </div>
              <a href="/api/export/fountain/${sceneId}/0" download class="btn-subtle mt-4 py-1.5 text-center block text-cyan-300 font-semibold">
                Download .FOUNTAIN
              </a>
            </div>

            <!-- 3. Shot List CSV -->
            <div class="bg-slate-900 p-4 rounded-lg border border-slate-800 flex flex-col justify-between">
              <div>
                <span class="text-emerald-400 font-bold block mb-1">Cinematography Shotlist (.CSV)</span>
                <p class="text-slate-400 text-[11px] leading-relaxed">Includes shot numbers, 13 camera angles, reverse shot indicators, lens focal lengths, and lighting.</p>
              </div>
              <a href="/api/export/shotlist/${sceneId}" download class="btn-subtle mt-4 py-1.5 text-center block text-emerald-300 font-semibold">
                Download .CSV
              </a>
            </div>
          </div>

          <div class="pt-4 border-t border-slate-800 flex items-center justify-between">
            <button onclick="window.print()" class="btn-gold px-4 py-2 text-xs flex items-center gap-1.5">
              <span>Print to PDF (Director's Binder)</span>
            </button>
            <button onclick="document.getElementById('export-modal').classList.add('hidden')" class="btn-subtle px-4 py-2 text-xs">
              Close
            </button>
          </div>
        </div>
      `;
    }

    modal.classList.remove('hidden');
  }

  return {
    loadProjects,
    renderProjectList,
    openProject,
    createNewProjectPrompt,
    deleteProjectPrompt,
    openExportModal
  };
})();
