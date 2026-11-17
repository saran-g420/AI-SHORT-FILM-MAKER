/**
 * FRAME AI - Scene Generator Wizard & Input Handler
 * Supports:
 * - Natural language text
 * - Voice Input (Speech-to-Text via Web Speech API)
 * - Reference image upload / mood preview
 * - Genre, Mood, Character Count, Language, Script Length, and Experience Level filters
 */

window.GeneratorManager = (function() {
  let isRecording = false;
  let recognition = null;

  function init() {
    setupSpeechRecognition();
  }

  function setupSpeechRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.log('Web Speech API not supported on this browser');
      return;
    }

    recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = function(event) {
      let interim = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          const textarea = document.getElementById('scene-prompt-input');
          if (textarea) {
            textarea.value = (textarea.value + ' ' + event.results[i][0].transcript).trim();
          }
        }
      }
    };

    recognition.onerror = function(event) {
      console.error('Speech recognition error:', event.error);
      stopRecording();
    };

    recognition.onend = function() {
      if (isRecording) {
        stopRecording();
      }
    };
  }

  function toggleVoiceInput() {
    if (!recognition) {
      alert('Speech Recognition is not supported in this browser. Please type your scene idea.');
      return;
    }

    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  }

  function startRecording() {
    try {
      recognition.start();
      isRecording = true;
      const btn = document.getElementById('mic-button');
      if (btn) {
        btn.classList.add('bg-red-500', 'recording-pulse', 'text-white');
        btn.classList.remove('bg-slate-800', 'text-slate-300');
        btn.title = 'Listening... Click to stop';
      }
      showToast('🎙️ Listening... Speak your scene idea naturally');
    } catch (e) {
      console.error(e);
    }
  }

  function stopRecording() {
    try {
      recognition.stop();
    } catch (e) {}
    isRecording = false;
    const btn = document.getElementById('mic-button');
    if (btn) {
      btn.classList.remove('bg-red-500', 'recording-pulse', 'text-white');
      btn.classList.add('bg-slate-800', 'text-slate-300');
      btn.title = 'Start Voice Dictation';
    }
    showToast('Voice recording stopped');
  }

  function handleImageUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
      const preview = document.getElementById('image-mood-preview');
      if (preview) {
        preview.src = e.target.result;
        preview.classList.remove('hidden');
      }
      showToast('✓ Reference visual loaded into scene context');
    };
    reader.readAsDataURL(file);
  }

  function setPresetPrompt(text, genre = 'Drama', mood = 'Tense & Nostalgic') {
    const textarea = document.getElementById('scene-prompt-input');
    if (textarea) textarea.value = text;
    
    const genreSelect = document.getElementById('genre-select');
    if (genreSelect) genreSelect.value = genre;

    const moodSelect = document.getElementById('mood-select');
    if (moodSelect) moodSelect.value = mood;

    showToast('Loaded preset scene idea');
  }

  function generateScene() {
    const textarea = document.getElementById('scene-prompt-input');
    const prompt = textarea ? textarea.value.trim() : '';

    if (!prompt) {
      alert('Please enter or dictate a scene idea first!');
      return;
    }

    const genre = document.getElementById('genre-select')?.value || 'Drama';
    const mood = document.getElementById('mood-select')?.value || 'Tense & Grounded';
    const charactersCount = document.getElementById('characters-count-select')?.value || 2;
    const language = document.getElementById('language-select')?.value || 'English';
    const scriptLength = document.getElementById('script-length-select')?.value || 'Standard Scene (6-8 beats)';
    const experienceLevel = document.getElementById('experience-level-select')?.value || 'Beginner to Indie';

    // Show loading overlay
    showGenerationLoading(true);

    fetch('/api/scenes/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt,
        genre,
        mood,
        charactersCount,
        language,
        scriptLength,
        experienceLevel
      })
    })
    .then(r => r.json())
    .then(data => {
      showGenerationLoading(false);
      if (data.error) {
        alert(data.error);
        return;
      }

      if (data.scene) {
        window.App.loadScene(data.scene);
        window.App.switchView('results');
        showToast('🎬 Master screenplay & cinematography plan generated!');
      }
    })
    .catch(err => {
      showGenerationLoading(false);
      console.error(err);
      alert('Generation error: ' + err.message);
    });
  }

  function showGenerationLoading(show) {
    const overlay = document.getElementById('generation-loading-overlay');
    if (!overlay) return;
    if (show) {
      overlay.classList.remove('hidden');
    } else {
      overlay.classList.add('hidden');
    }
  }

  return {
    init,
    toggleVoiceInput,
    handleImageUpload,
    setPresetPrompt,
    generateScene
  };
})();
