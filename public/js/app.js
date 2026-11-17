/**
 * FRAME AI - Master Application Controller
 * Coordinates SPA navigation, state, views, and initial data loading.
 */

window.App = (function() {
  let currentUser = {
    id: 'usr_filmmaker',
    name: 'Alex Rivera',
    email: 'alex@frameai.studio',
    role: 'creator'
  };

  let currentView = 'landing';
  let currentResultsTab = 'variations';

  function init() {
    // Check auth session
    fetch('/api/auth/me')
      .then(r => r.json())
      .then(data => {
        if (data.user) currentUser = data.user;
        updateUserUI();
      })
      .catch(e => console.log('Guest session active'));

    // Initialize submodules
    if (window.GeneratorManager) window.GeneratorManager.init();
    if (window.SettingsManager) window.SettingsManager.init();
    if (window.ProjectsManager) window.ProjectsManager.loadProjects();

    // Load initial showcase project and scene
    loadInitialShowcaseScene();
  }

  function loadInitialShowcaseScene() {
    fetch('/api/projects/proj_reunion_arun_kumar')
      .then(r => r.json())
      .then(data => {
        if (data.scenes && data.scenes.length > 0) {
          loadScene(data.scenes[0]);
        }
      })
      .catch(err => {
        console.warn('Loading default database project:', err);
      });
  }

  function loadScene(scene) {
    if (!scene) return;

    // 1. Screenplay & 3 Variations
    if (window.ScreenplayManager) {
      window.ScreenplayManager.setScene(scene);
    }

    // 2. Cinematography Plan
    if (window.CinematographyManager) {
      window.CinematographyManager.setShotPlan(scene.cinematographyPlan);
    }

    // 3. Visualizer
    if (window.Visualizer) {
      window.Visualizer.init();
      if (scene.cinematographyPlan && scene.cinematographyPlan.length > 0) {
        window.Visualizer.setActiveShot(scene.cinematographyPlan[0]);
      }
    }

    // 4. Director Mode
    if (window.DirectorManager) {
      window.DirectorManager.setDirectorGuide(scene.directorGuide);
    }

    // 5. Script Improvements
    if (window.ImprovementManager) {
      window.ImprovementManager.setSuggestions(scene.scriptImprovements);
    }

    // 6. Creative Ideas
    if (window.CreativeManager) {
      window.CreativeManager.setIdeas(scene.creativeIdeas);
    }

    // 7. Doubt Assistant
    if (window.DoubtAssistant) {
      window.DoubtAssistant.init(scene.doubtsHistory);
    }

    // 8. Storyboard
    if (window.StoryboardManager) {
      window.StoryboardManager.renderStoryboard();
    }

    // Update Scene Header elements in Results View
    const headingEl = document.getElementById('scene-active-heading');
    if (headingEl) headingEl.textContent = scene.heading || 'INT. SCENE - DAY';

    const origEl = document.getElementById('scene-original-idea-display');
    if (origEl) origEl.textContent = `"${scene.originalIdea}"`;

    const impEl = document.getElementById('scene-improved-concept-display');
    if (impEl) impEl.textContent = scene.improvedConcept || '';
  }

  function switchView(viewName) {
    currentView = viewName;

    // List of major views
    const views = ['landing', 'dashboard', 'create', 'results', 'projects', 'learning', 'admin'];
    views.forEach(v => {
      const el = document.getElementById(`view-${v}`);
      if (el) {
        if (v === viewName) {
          el.classList.remove('hidden');
        } else {
          el.classList.add('hidden');
        }
      }
    });

    // Update active nav indicators
    document.querySelectorAll('.nav-link').forEach(btn => {
      if (btn.getAttribute('data-view') === viewName) {
        btn.classList.add('text-amber-400', 'border-b-2', 'border-amber-400');
        btn.classList.remove('text-slate-300');
      } else {
        btn.classList.remove('text-amber-400', 'border-b-2', 'border-amber-400');
        btn.classList.add('text-slate-300');
      }
    });

    // Specific triggers
    if (viewName === 'projects' && window.ProjectsManager) {
      window.ProjectsManager.loadProjects();
    } else if (viewName === 'learning' && window.LearningCenter) {
      window.LearningCenter.renderLearning();
    } else if (viewName === 'admin' && window.AdminDashboard) {
      window.AdminDashboard.renderAdmin();
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function switchResultsTab(tabName) {
    currentResultsTab = tabName;

    const tabs = ['variations', 'cinematography', 'visualizer', 'director', 'improvements', 'creative', 'storyboard', 'doubts'];
    tabs.forEach(t => {
      const section = document.getElementById(`tab-content-${t}`);
      const btn = document.getElementById(`tab-btn-${t}`);
      if (section) {
        if (t === tabName) {
          section.classList.remove('hidden');
        } else {
          section.classList.add('hidden');
        }
      }
      if (btn) {
        if (t === tabName) {
          btn.classList.add('bg-amber-500', 'text-black', 'font-bold');
          btn.classList.remove('bg-slate-800', 'text-slate-300');
        } else {
          btn.classList.remove('bg-amber-500', 'text-black', 'font-bold');
          btn.classList.add('bg-slate-800', 'text-slate-300');
        }
      }
    });

    // Trigger visualizer resize when opened
    if (tabName === 'visualizer' && window.Visualizer) {
      setTimeout(() => window.Visualizer.init(), 50);
    }
  }

  function updateUserUI() {
    const userLabel = document.getElementById('user-profile-name');
    if (userLabel) userLabel.textContent = currentUser.name || 'Filmmaker';
  }

  function quickDemoLogin() {
    showToast('Logged in as Executive Director (Demo Mode)');
    currentUser = {
      id: 'usr_admin',
      name: 'Executive Director',
      email: 'admin@frameai.studio',
      role: 'admin'
    };
    updateUserUI();
    switchView('dashboard');
  }

  return {
    init,
    loadScene,
    switchView,
    switchResultsTab,
    quickDemoLogin
  };
})();

// Global Toast Notification Helper
function showToast(message) {
  let toast = document.getElementById('global-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'global-toast';
    toast.className = 'fixed bottom-5 right-5 z-50 bg-slate-900 border border-amber-500/80 text-white text-xs px-4 py-2.5 rounded-lg shadow-2xl flex items-center gap-2 transform translate-y-20 opacity-0 transition-all duration-300 font-medium';
    document.body.appendChild(toast);
  }
  toast.innerHTML = `<span class="text-amber-400">🎬</span> ${message}`;
  toast.classList.remove('translate-y-20', 'opacity-0');
  toast.classList.add('translate-y-0', 'opacity-100');

  clearTimeout(toast._timeout);
  toast._timeout = setTimeout(() => {
    toast.classList.add('translate-y-20', 'opacity-0');
    toast.classList.remove('translate-y-0', 'opacity-100');
  }, 3500);
}

// Bootstrap on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  window.App.init();
});
