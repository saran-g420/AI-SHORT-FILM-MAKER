/**
 * FRAME AI - Dedicated AI Doubt Clearing Assistant
 * Context-aware Q&A chat for directors, scriptwriters, and cinematographers.
 */

window.DoubtAssistant = (function() {
  let chatHistory = [];
  let isSending = false;

  function init(initialHistory) {
    if (initialHistory && initialHistory.length > 0) {
      chatHistory = initialHistory.map(h => ({
        sender: 'user',
        text: h.question,
        answer: h.answer
      }));
    } else {
      chatHistory = [
        {
          sender: 'ai',
          answer: `Hello Director! I am your FRAME AI Cinematography & Filmmaking Mentor. I am fully aware of your active scene and characters. Ask me anything about shot choices, shooting on a budget/smartphone, actor blocking, or how to heighten emotional stakes.`
        }
      ];
    }
    renderChat();
  }

  function renderChat() {
    const container = document.getElementById('doubt-chat-messages');
    if (!container) return;

    let html = '';
    chatHistory.forEach((msg, i) => {
      if (msg.sender === 'user') {
        html += `
          <div class="flex justify-end mb-4">
            <div class="bg-amber-500/20 border border-amber-500/40 text-amber-200 p-3.5 rounded-2xl rounded-tr-none max-w-[85%] text-xs font-medium shadow-md">
              <span class="text-[10px] text-amber-400/80 font-bold block mb-1 uppercase tracking-wider">You Asked:</span>
              ${msg.text}
            </div>
          </div>
        `;
      }
      if (msg.answer) {
        html += `
          <div class="flex justify-start mb-5">
            <div class="bg-slate-900 border border-slate-800 text-slate-200 p-4 rounded-2xl rounded-tl-none max-w-[90%] text-xs shadow-xl leading-relaxed">
              <div class="flex items-center gap-2 mb-2 pb-1.5 border-b border-slate-800">
                <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span class="text-[11px] font-bold text-white font-cinematic uppercase tracking-wider">FRAME AI Director Advice</span>
              </div>
              <div class="prose prose-invert max-w-none text-xs text-slate-300 space-y-2 whitespace-pre-line">
${msg.answer}
              </div>
            </div>
          </div>
        `;
      }
    });

    if (isSending) {
      html += `
        <div class="flex justify-start mb-4">
          <div class="bg-slate-900/80 border border-slate-800 text-amber-400 p-3 rounded-2xl rounded-tl-none text-xs flex items-center gap-2">
            <div class="w-4 h-4 border-2 border-amber-400 border-t-transparent rounded-full animate-spin"></div>
            <span>Analyzing scene context and formulating director response...</span>
          </div>
        </div>
      `;
    }

    container.innerHTML = html;
    container.scrollTop = container.scrollHeight;
  }

  function askQuestion(text) {
    if (!text || text.trim() === '' || isSending) return;
    const question = text.trim();

    // Add user message to history
    chatHistory.push({
      sender: 'user',
      text: question
    });

    isSending = true;
    renderChat();

    const scene = window.ScreenplayManager.getScene();
    const sceneId = scene ? scene.id : null;

    fetch('/api/ai/doubt', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        question,
        sceneId
      })
    })
    .then(r => r.json())
    .then(data => {
      isSending = false;
      const last = chatHistory[chatHistory.length - 1];
      if (last) {
        last.answer = data.answer || 'No response generated.';
      }
      renderChat();
    })
    .catch(err => {
      isSending = false;
      chatHistory.push({
        sender: 'ai',
        answer: 'Sorry, I encountered an issue retrieving an answer. Please verify your connection.'
      });
      renderChat();
    });
  }

  function askPreset(promptText) {
    const input = document.getElementById('doubt-input');
    if (input) input.value = promptText;
    askQuestion(promptText);
  }

  function handleInputSubmit(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      const input = document.getElementById('doubt-input');
      if (input && input.value.trim()) {
        const val = input.value;
        input.value = '';
        askQuestion(val);
      }
    }
  }

  return {
    init,
    askQuestion,
    askPreset,
    handleInputSubmit
  };
})();
