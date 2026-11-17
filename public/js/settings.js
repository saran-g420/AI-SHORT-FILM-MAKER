/**
 * FRAME AI - Profile & Settings Manager
 * Manages API keys (Gemini, OpenAI), filmmaker experience level, and export preferences.
 */

window.SettingsManager = (function() {
  function init() {
    loadSettings();
  }

  function loadSettings() {
    const key = localStorage.getItem('frameai_gemini_key') || '';
    const input = document.getElementById('setting-gemini-key');
    if (input) input.value = key;

    const level = localStorage.getItem('frameai_exp_level') || 'Indie Filmmaker';
    const select = document.getElementById('setting-exp-level');
    if (select) select.value = level;
  }

  function saveSettings() {
    const key = document.getElementById('setting-gemini-key')?.value.trim() || '';
    localStorage.setItem('frameai_gemini_key', key);

    const level = document.getElementById('setting-exp-level')?.value || 'Indie Filmmaker';
    localStorage.setItem('frameai_exp_level', level);

    showToast('✓ Settings and API configurations saved!');
    const modal = document.getElementById('settings-modal');
    if (modal) modal.classList.add('hidden');
  }

  function openSettingsModal() {
    loadSettings();
    const modal = document.getElementById('settings-modal');
    if (modal) modal.classList.remove('hidden');
  }

  function closeSettingsModal() {
    const modal = document.getElementById('settings-modal');
    if (modal) modal.classList.add('hidden');
  }

  return {
    init,
    saveSettings,
    openSettingsModal,
    closeSettingsModal
  };
})();
