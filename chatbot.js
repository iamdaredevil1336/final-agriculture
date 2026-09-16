// ============================================================
//  AgriSystem — AgriBot Chatbot Widget (EN / HI / GU)
//  Floating chat bubble — works on all pages
// ============================================================

(function () {
  'use strict';

  // ── i18n strings ──────────────────────────────────────────
  const i18nBot = {
    en: {
      title:       'AgriBot 🌾',
      subtitle:    'Ask me anything about farming!',
      placeholder: 'Ask about crops, seeds, prices…',
      send:        'Send',
      typing:      'AgriBot is thinking…',
      welcome:     "Hello! 👋 I'm AgriBot, your agricultural assistant. Ask me anything about crops, seeds, fertilizers, market prices, or government schemes!",
      error:       'Sorry, I could not connect. Please try again.',
      lang_label:  'Language:'
    },
    hi: {
      title:       'AgriBot 🌾',
      subtitle:    'खेती के बारे में कुछ भी पूछें!',
      placeholder: 'फसल, बीज, कीमतें पूछें…',
      send:        'भेजें',
      typing:      'AgriBot सोच रहा है…',
      welcome:     'नमस्ते! 👋 मैं AgriBot हूं, आपका कृषि सहायक। फसल, बीज, खाद, बाजार भाव या सरकारी योजनाओं के बारे में कुछ भी पूछें!',
      error:       'माफ करें, कनेक्ट नहीं हो पाया। फिर कोशिश करें।',
      lang_label:  'भाषा:'
    },
    gu: {
      title:       'AgriBot 🌾',
      subtitle:    'ખેતી વિશે કંઈ પણ પૂછો!',
      placeholder: 'પાક, બીજ, ભાવ પૂછો…',
      send:        'મોકલો',
      typing:      'AgriBot વિચારી રહ્યો છે…',
      welcome:     'નમસ્તે! 👋 હું AgriBot છું, તમારો કૃષિ સહાયક. પાક, બીજ, ખાતર, બજાર ભાવ અથવા સરકારી યોજનાઓ વિશે કંઈ પણ પૂછો!',
      error:       'માફ કરો, કનેક્ટ થઈ શક્યા નથી. ફરી પ્રયાસ કરો.',
      lang_label:  'ભાષા:'
    }
  };

  // ── State ─────────────────────────────────────────────────
  let chatHistory = [];
  let currentLang = localStorage.getItem('agribot_lang') || 'en';
  let isOpen = false;
  let isTyping = false;
  let welcomeSent = false;
  const API_BASE = (typeof USE_LIVE_API !== 'undefined' && USE_LIVE_API)
    ? (typeof API_BASE_URL !== 'undefined' ? API_BASE_URL.replace(/\/+$/, '') : '') : '';

  // ── Build HTML ─────────────────────────────────────────────
  function buildWidget() {
    const div = document.createElement('div');
    div.id = 'agribot-root';
    div.innerHTML = `
      <button class="agribot-fab" id="agribot-fab" onclick="agriBotToggle()" aria-label="Open AgriBot">
        <span class="agribot-fab-icon">💬</span>
        <span class="agribot-fab-close" style="display:none">✕</span>
        <span class="agribot-notif" id="agribot-notif"></span>
      </button>

      <div class="agribot-window" id="agribot-window">
        <div class="agribot-header">
          <div class="agribot-header-info">
            <div class="agribot-avatar">🤖</div>
            <div>
              <div class="agribot-title" id="agribot-title">AgriBot 🌾</div>
              <div class="agribot-subtitle" id="agribot-subtitle">Ask me anything about farming!</div>
            </div>
          </div>
          <div class="agribot-header-actions">
            <div class="agribot-lang-wrap">
              <label class="agribot-lang-label" id="agribot-lang-label">Lang:</label>
              <select class="agribot-lang-select" id="agribot-lang-select" onchange="agriBotChangeLang(this.value)">
                <option value="en">EN</option>
                <option value="hi">हि</option>
                <option value="gu">ગુ</option>
              </select>
            </div>
            <button class="agribot-close-btn" onclick="agriBotToggle()" aria-label="Close">✕</button>
          </div>
        </div>

        <div class="agribot-messages" id="agribot-messages"></div>

        <div class="agribot-input-wrap">
          <button class="agribot-mic" id="agribot-mic" onclick="agriBotToggleMic()" title="Speak in EN / हिंदी / ગુજરાતી" aria-label="Voice input">
            <span id="agribot-mic-icon">🎙️</span>
          </button>
          <textarea class="agribot-input" id="agribot-input"
            placeholder="Ask about crops, seeds, prices…"
            rows="1"
            onkeydown="agriBotKeyDown(event)"
            oninput="agriBotAutoResize(this)"></textarea>
          <button class="agribot-send" id="agribot-send" onclick="agriBotSend()" aria-label="Send">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
          </button>
        </div>

        <div class="agribot-footer">Powered by Gemini · AgriSystem</div>
      </div>`;
    document.body.appendChild(div);
  }

  // ── Toggle open/close ──────────────────────────────────────
  window.agriBotToggle = function () {
    isOpen = !isOpen;
    const win = document.getElementById('agribot-window');
    const fab = document.getElementById('agribot-fab');
    const fabIcon = fab.querySelector('.agribot-fab-icon');
    const fabClose = fab.querySelector('.agribot-fab-close');
    const notif = document.getElementById('agribot-notif');

    win.classList.toggle('open', isOpen);
    fabIcon.style.display = isOpen ? 'none' : '';
    fabClose.style.display = isOpen ? '' : 'none';
    if (notif) {
      notif.textContent = '';
      notif.style.display = 'none';
    }

    if (isOpen && !welcomeSent) {
      welcomeSent = true;
      appendMessage('bot', i18nBot[currentLang].welcome);
      addSuggestions();
    }
    if (isOpen) {
      setTimeout(() => document.getElementById('agribot-input')?.focus(), 300);
      applyLang(currentLang);
    }
  };

  // ── Speech-to-Text (Voice Recognition) ──────────────────────
  let recognition = null;
  let isListening = false;

  function initSpeechRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn('[AgriBot] Web Speech API not supported by browser.');
      return null;
    }
    const recog = new SpeechRecognition();
    recog.continuous = false;
    recog.interimResults = true;

    // Map language code
    const langMap = { en: 'en-IN', hi: 'hi-IN', gu: 'gu-IN' };
    recog.lang = langMap[currentLang] || 'en-IN';

    recog.onstart = () => {
      isListening = true;
      const micBtn = document.getElementById('agribot-mic');
      if (micBtn) micBtn.classList.add('recording');
      const inp = document.getElementById('agribot-input');
      if (inp) inp.placeholder = (currentLang === 'gu') ? 'સાંભળી રહ્યા છીએ… બોલો' : (currentLang === 'hi') ? 'सुन रहे हैं… बोलिए' : 'Listening… speak now';
    };

    recog.onresult = (event) => {
      let transcript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        transcript += event.results[i][0].transcript;
      }
      const inp = document.getElementById('agribot-input');
      if (inp && transcript) {
        inp.value = transcript;
        agriBotAutoResize(inp);
      }
    };

    recog.onerror = (e) => {
      console.warn('[AgriBot STT Error]', e.error);
      stopListening();
    };

    recog.onend = () => {
      stopListening();
      const inp = document.getElementById('agribot-input');
      if (inp && inp.value.trim()) {
        setTimeout(() => agriBotSend(), 300);
      }
    };

    return recog;
  }

  function stopListening() {
    isListening = false;
    const micBtn = document.getElementById('agribot-mic');
    if (micBtn) micBtn.classList.remove('recording');
    const inp = document.getElementById('agribot-input');
    const t = i18nBot[currentLang] || i18nBot.en;
    if (inp) inp.placeholder = t.placeholder;
  }

  window.agriBotToggleMic = function () {
    if (isListening) {
      recognition?.stop();
      stopListening();
      return;
    }
    recognition = initSpeechRecognition();
    if (!recognition) {
      alert(currentLang === 'gu' ? 'તમારું બ્રાઉઝર વોઈસ રેકગ્નિશન સપોર્ટ કરતું નથી. Chrome વાપરો.' : currentLang === 'hi' ? 'आपका ब्राउज़र वॉइस इनपुट का समर्थन नहीं करता। कृपया Chrome का उपयोग करें।' : 'Voice input is not supported by your browser. Please use Chrome.');
      return;
    }
    try {
      recognition.start();
    } catch (e) {
      console.error(e);
      stopListening();
    }
  };

  // ── Language change ────────────────────────────────────────
  window.agriBotChangeLang = function (lang) {
    currentLang = lang;
    localStorage.setItem('agribot_lang', lang);
    applyLang(lang);
    // Clear + re-show welcome in new language
    const msgs = document.getElementById('agribot-messages');
    if (msgs) msgs.innerHTML = '';
    chatHistory = [];
    welcomeSent = false;
    appendMessage('bot', i18nBot[lang].welcome);
    addSuggestions();
    welcomeSent = true;
  };

  function applyLang(lang) {
    const t = i18nBot[lang] || i18nBot.en;
    setText('agribot-title', t.title);
    setText('agribot-subtitle', t.subtitle);
    setText('agribot-lang-label', t.lang_label);
    const inp = document.getElementById('agribot-input');
    if (inp) inp.placeholder = t.placeholder;
    const sel = document.getElementById('agribot-lang-select');
    if (sel) sel.value = lang;
  }

  function setText(id, text) {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
  }

  // ── Keyboard handler ───────────────────────────────────────
  window.agriBotKeyDown = function (e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      agriBotSend();
    }
  };

  window.agriBotAutoResize = function (el) {
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 120) + 'px';
  };

  // ── Send message ───────────────────────────────────────────
  window.agriBotSend = async function () {
    const input = document.getElementById('agribot-input');
    const msg = (input?.value || '').trim();
    if (!msg || isTyping) return;

    input.value = '';
    input.style.height = 'auto';
    appendMessage('user', msg);
    setTyping(true);

    try {
      const endpoint = API_BASE ? `${API_BASE}/api/chat` : '/api/chat';
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: msg, lang: currentLang, history: chatHistory.slice(-8) })
      });
      const data = await response.json();
      const reply = data?.data?.reply || i18nBot[currentLang].error;
      setTyping(false);
      appendMessage('bot', reply);
      chatHistory.push({ user: msg, bot: reply });
      if (chatHistory.length > 20) chatHistory = chatHistory.slice(-20);
    } catch {
      setTyping(false);
      appendMessage('bot', i18nBot[currentLang].error);
    }
  };

  // ── Audio Speech (TTS) for Bot Responses ──────────────────
  let botAudio = null;
  let activeSpeakBtn = null;

  function stopBotAudio() {
    if (botAudio) {
      botAudio.pause();
      botAudio = null;
    }
    if (activeSpeakBtn) {
      activeSpeakBtn.classList.remove('playing');
      activeSpeakBtn.innerHTML = '🔊 Read Aloud';
      activeSpeakBtn = null;
    }
  }

  window.agriBotSpeak = async function (btn, text, lang) {
    if (activeSpeakBtn === btn && botAudio && !botAudio.paused) {
      stopBotAudio();
      return;
    }
    stopBotAudio();

    btn.classList.add('playing');
    btn.innerHTML = '⏳ Loading…';
    activeSpeakBtn = btn;

    try {
      const cleanText = text.replace(/[*_#`]/g, '').trim().slice(0, 500);
      const endpoint = API_BASE ? `${API_BASE}/api/tts` : '/api/tts';
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: cleanText, lang })
      });

      if (!res.ok) throw new Error('TTS server error');

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      botAudio = new Audio(url);

      botAudio.onplay = () => {
        btn.innerHTML = '⏹️ Stop';
      };
      botAudio.onended = () => {
        stopBotAudio();
      };
      botAudio.onerror = () => {
        stopBotAudio();
      };

      await botAudio.play();
    } catch (err) {
      console.warn('[AgriBot TTS Error]', err);
      // Fallback to browser SpeechSynthesis
      if ('speechSynthesis' in window) {
        const utter = new SpeechSynthesisUtterance(text.slice(0, 300));
        utter.lang = lang === 'gu' ? 'gu-IN' : lang === 'hi' ? 'hi-IN' : 'en-US';
        btn.innerHTML = '⏹️ Stop';
        utter.onend = () => stopBotAudio();
        utter.onerror = () => stopBotAudio();
        window.speechSynthesis.speak(utter);
      } else {
        stopBotAudio();
      }
    }
  };

  // ── Render helpers ─────────────────────────────────────────
  function appendMessage(role, text) {
    const msgs = document.getElementById('agribot-messages');
    if (!msgs) return;

    const bubble = document.createElement('div');
    bubble.className = `agribot-bubble agribot-bubble--${role}`;
    // Convert markdown-like **bold** and \n to HTML
    const formatted = escapeHtml(text)
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br>');
    
    if (role === 'bot') {
      const speechBtnText = currentLang === 'gu' ? '🔊 સાંભળો' : currentLang === 'hi' ? '🔊 सुनें' : '🔊 Listen';
      const escapedRaw = encodeURIComponent(text);
      bubble.innerHTML = `
        <div>${formatted}</div>
        <button class="agribot-speech-btn" onclick="agriBotSpeak(this, decodeURIComponent('${escapedRaw}'), '${currentLang}')">
          ${speechBtnText}
        </button>
      `;
    } else {
      bubble.innerHTML = formatted;
    }

    msgs.appendChild(bubble);
    msgs.scrollTop = msgs.scrollHeight;
  }

  function setTyping(state) {
    isTyping = state;
    const send = document.getElementById('agribot-send');
    if (send) send.disabled = state;
    let indicator = document.getElementById('agribot-typing');
    if (state) {
      if (!indicator) {
        indicator = document.createElement('div');
        indicator.id = 'agribot-typing';
        indicator.className = 'agribot-typing';
        indicator.innerHTML = '<span></span><span></span><span></span>';
        document.getElementById('agribot-messages')?.appendChild(indicator);
      }
      document.getElementById('agribot-messages').scrollTop = 99999;
    } else {
      indicator?.remove();
    }
  }

  function escapeHtml(str) {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  // ── Suggested quick questions ──────────────────────────────
  function addSuggestions() {
    const suggestions = {
      en: ['Best crops for Kharif?', 'Wheat fertilizer guide', 'MSP for rice 2024', 'How to control pests?'],
      hi: ['खरीफ की बेस्ट फसलें?', 'गेहूं में खाद कब डालें?', 'धान का MSP 2024', 'कीट नियंत्रण कैसे करें?'],
      gu: ['ખરીફ ઋતુ માટે પાક?', 'ઘઉં માટે ખાતર ક્યારે?', 'ડાંગરનો MSP 2024', 'જીવાત નિયંત્રણ કેવી રીતે?']
    };
    const msgs = document.getElementById('agribot-messages');
    if (!msgs) return;
    const wrap = document.createElement('div');
    wrap.className = 'agribot-suggestions';
    wrap.id = 'agribot-suggestions';
    (suggestions[currentLang] || suggestions.en).forEach(q => {
      const btn = document.createElement('button');
      btn.className = 'agribot-suggestion-btn';
      btn.textContent = q;
      btn.onclick = () => {
        document.getElementById('agribot-input').value = q;
        wrap.remove();
        agriBotSend();
      };
      wrap.appendChild(btn);
    });
    msgs.appendChild(wrap);
    msgs.scrollTop = msgs.scrollHeight;
  }

  // ── Init ───────────────────────────────────────────────────
  function init() {
    buildWidget();
    // Set saved language
    const sel = document.getElementById('agribot-lang-select');
    if (sel) sel.value = currentLang;
    applyLang(currentLang);
    // Show notification badge after 3s
    setTimeout(() => {
      if (!isOpen) {
        const notif = document.getElementById('agribot-notif');
        if (notif) {
          notif.textContent = '1';
          notif.style.display = 'flex';
        }
      }
    }, 3000);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
