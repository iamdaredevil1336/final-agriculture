// js/seasons.js — Season calendar page
// toggleMenu() is defined in api.js (shared)
// stopCropSpeech() / currentAudio are shared globals from api.js

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

// ── Hindi season translations (actual Devanagari text for TTS) ────────────────
const _hindiSeasonData = {
  kharif: {
    name:        'खरीफ',
    months:      'जून से अक्टूबर',
    description: 'खरीफ फसलें मानसून की शुरुआत पर बोई जाती हैं। यह वर्षा ऋतु की प्रमुख कृषि मौसम है। इस मौसम में धान, मक्का, कपास, ज्वार, बाजरा और सोयाबीन जैसी फसलें उगाई जाती हैं।'
  },
  rabi: {
    name:        'रबी',
    months:      'अक्टूबर से मार्च',
    description: 'रबी फसलें मानसून समाप्त होने के बाद शीतकाल में बोई जाती हैं। इन फसलों को सिंचाई की आवश्यकता होती है। इस मौसम में गेहूं, जौ, चना, सरसों और मटर प्रमुख फसलें हैं।'
  },
  summer: {
    name:        'ग्रीष्मकालीन',
    months:      'फरवरी से जून',
    description: 'ग्रीष्मकालीन फसलें गर्म मौसम में उगाई जाने वाली कम अवधि की फसलें हैं। इस मौसम में मूंग, उड़द, तरबूज, खरबूजा और सूरजमुखी जैसी फसलें उगाई जाती हैं।'
  },
  annual: {
    name:        'वार्षिक',
    months:      'पूरे वर्ष',
    description: 'वार्षिक फसलें पूरे एक वर्ष या उससे अधिक समय की अवधि में उगाई जाती हैं। गन्ना इसका सबसे प्रमुख उदाहरण है जो लगभग 10 से 12 महीने में तैयार होता है।'
  },
  perennial: {
    name:        'बहुवर्षीय',
    months:      'बहु-वर्षीय',
    description: 'बहुवर्षीय फसलें पेड़ और दीर्घकालिक बागवानी फसलें हैं जो कई वर्षों तक उत्पादन देती हैं। आम, केला, नारियल, अमरूद, पपीता और अन्य फल इसी श्रेणी में आते हैं।'
  }
};

// ── Gujarati season translations ─────────────────────────────────────────────
const _gujaratiSeasonData = {
  kharif: {
    name:        'ખરીફ',
    months:      'જૂન થી ઓક્ટોબર',
    description: 'ખરીફ પાકો ચોમાસાની શરૂઆત સાથે વાવવામાં આવે છે. આ વરસાદ આધારિત મુખ્ય કૃષિ ઋતુ છે. આ ઋતુમાં ડાંગર, મકાઈ, કપાસ, જુવાર, બાજરી અને સોયાબીન જેવા પાકો લેવામાં આવે છે.'
  },
  rabi: {
    name:        'રવિ',
    months:      'ઓક્ટોબર થી માર્ચ',
    description: 'રવિ પાકો ચોમાસું પૂરું થયા પછી શિયાળામાં વાવવામાં આવે છે. આ પાકોને પિયતની જરૂર પડે છે. આ ઋતુમાં ઘઉં, જવ, ચણા, રાયડો અને વટાણા મુખ્ય પાક છે.'
  },
  summer: {
    name:        'ઉનાળુ',
    months:      'ફેબ્રુઆરી થી જૂન',
    description: 'ઉનાળુ પાક ગરમ ઋતુમાં લેવાતો ટૂંકા ગાળાનો પાક છે. આ ઋતુમાં મગ, અડદ, તરબૂચ, ટેટી અને સૂર્યમુખી જેવા પાકો લેવાય છે.'
  },
  annual: {
    name:        'વાર્ષિક',
    months:      'આખું વર્ષ',
    description: 'વાર્ષિક પાક આખું વર્ષ કે તેથી વધુ સમય માટે જમીનમાં ઊભો રહે છે. શેરડી તેનું મુખ્ય ઉદાહરણ છે જે ૧૦ થી ૧૨ મહિનામાં તૈયાર થાય છે.'
  },
  perennial: {
    name:        'બારમાસી',
    months:      'બહુ-વાર્ષિક',
    description: 'બારમાસી પાકો વૃક્ષો અને દીર્ઘકાલીન બાગાયતી પાક છે જે ઘણા વર્ષો સુધી ઉત્પાદન આપે છે. કેરી, કેળાં, નાળિયેર, જામફળ, પપૈયું આ શ્રેણીમાં આવે છે.'
  }
};

// ── Season speech text generators ─────────────────────────────────────────────

function generateSeasonEnglishText(season) {
  const parts = [];
  parts.push(`${season.label} Season.`);
  parts.push(`Months: ${season.months}.`);
  parts.push(`${season.description}.`);
  parts.push(`Total crops grown in this season: ${season.crops_count}.`);
  return parts.join(' ');
}

function generateSeasonHindiText(season) {
  const hi = _hindiSeasonData[season.id];
  if (!hi) return generateSeasonEnglishText(season);
  const parts = [];
  parts.push(`${hi.name} मौसम।`);
  parts.push(`इस मौसम की अवधि ${hi.months} है।`);
  parts.push(`${hi.description}`);
  parts.push(`इस मौसम में कुल ${season.crops_count} फसलें उगाई जाती हैं।`);
  return parts.join(' ');
}

function generateSeasonGujaratiText(season) {
  const gu = _gujaratiSeasonData[season.id];
  if (!gu) return generateSeasonEnglishText(season);
  const parts = [];
  parts.push(`${gu.name} ઋતુ.`);
  parts.push(`આ ઋતુનો સમયગાળો ${gu.months} છે.`);
  parts.push(`${gu.description}`);
  parts.push(`આ ઋતુમાં કુલ ${season.crops_count} પાકો લેવામાં આવે છે.`);
  return parts.join(' ');
}

// ── Season Read Aloud buttons ─────────────────────────────────────────────────

function seasonReadAloudButtons(seasonId) {
  return `
    <div class="read-aloud-group season-read-aloud" onclick="event.stopPropagation()">
      <button class="btn-read-aloud-en" data-season-id="${seasonId}"
        onclick="handleSeasonReadAloudClick(event,'${seasonId}','en')" title="Read in English">
        🔊 EN
      </button>
      <button class="btn-read-aloud-hi" data-season-id="${seasonId}"
        onclick="handleSeasonReadAloudClick(event,'${seasonId}','hi')" title="हिंदी में सुनें">
        🔊 हि
      </button>
      <button class="btn-read-aloud-gu" data-season-id="${seasonId}"
        onclick="handleSeasonReadAloudClick(event,'${seasonId}','gu')" title="ગુજરાતીમાં સાંભળો">
        🔊 ગુ
      </button>
      <button class="btn-stop-reading" data-season-id="${seasonId}" style="display:none"
        onclick="handleSeasonStopClick(event)" title="Stop reading">
        ⏹ Stop
      </button>
    </div>`;
}

// ── Shared audio state for seasons ───────────────────────────────────────────
let _activeSeasonId   = null;
let _activeSeasonLang = null;
let _allSeasonData    = [];  // populated after apiGetSeasons()

async function handleSeasonReadAloudClick(event, seasonId, lang) {
  if (event) event.stopPropagation();

  // If same season + same lang is playing, stop it (toggle off)
  if (_activeSeasonId === seasonId && _activeSeasonLang === lang &&
      typeof currentAudio !== 'undefined' && currentAudio && !currentAudio.paused) {
    stopCropSpeech();
    _activeSeasonId = null;
    _activeSeasonLang = null;
    return;
  }

  // Stop whatever is currently playing (crops, seeds, or another season)
  stopCropSpeech();

  const season = _allSeasonData.find(s => s.id === seasonId);
  if (!season) return;

  let text = '';
  if (lang === 'gu') {
    text = generateSeasonGujaratiText(season);
  } else if (lang === 'hi') {
    text = generateSeasonHindiText(season);
  } else {
    text = generateSeasonEnglishText(season);
  }

  _activeSeasonId   = seasonId;
  _activeSeasonLang = lang;

  // Update button states
  const enBtns   = document.querySelectorAll(`.btn-read-aloud-en[data-season-id="${seasonId}"]`);
  const hiBtns   = document.querySelectorAll(`.btn-read-aloud-hi[data-season-id="${seasonId}"]`);
  const guBtns   = document.querySelectorAll(`.btn-read-aloud-gu[data-season-id="${seasonId}"]`);
  const stopBtns = document.querySelectorAll(`.btn-stop-reading[data-season-id="${seasonId}"]`);

  enBtns.forEach(b   => { b.classList.toggle('reading', lang === 'en'); b.disabled = (lang !== 'en'); });
  hiBtns.forEach(b   => { b.classList.toggle('reading', lang === 'hi'); b.disabled = (lang !== 'hi'); });
  guBtns.forEach(b   => { b.classList.toggle('reading', lang === 'gu'); b.disabled = (lang !== 'gu'); });
  stopBtns.forEach(b => { b.style.display = 'inline-flex'; b.classList.add('reading'); });

  let activeBtn = enBtns[0];
  if (lang === 'hi') activeBtn = hiBtns[0];
  if (lang === 'gu') activeBtn = guBtns[0];
  const originalText = activeBtn ? activeBtn.innerHTML : '';
  if (activeBtn) activeBtn.innerHTML = '⏳ Loading...';

  try {
    const endpoint = (typeof USE_LIVE_API !== 'undefined' && USE_LIVE_API)
      ? `${API_BASE_URL}api/tts` : '/api/tts';

    const response = await fetch(endpoint, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ text, lang })
    });

    if (!response.ok) throw new Error(`TTS API failed: ${response.status}`);

    const blob     = await response.blob();
    const audioUrl = URL.createObjectURL(blob);

    // Guard: user may have clicked stop while we were loading
    if (_activeSeasonId !== seasonId || _activeSeasonLang !== lang) {
      URL.revokeObjectURL(audioUrl);
      return;
    }

    currentAudio = new Audio(audioUrl);
    if (activeBtn) activeBtn.innerHTML = originalText;

    currentAudio.onended = () => {
      stopCropSpeech();
      _activeSeasonId = null;
      _activeSeasonLang = null;
      URL.revokeObjectURL(audioUrl);
    };
    currentAudio.onerror = () => {
      stopCropSpeech();
      _activeSeasonId = null;
      _activeSeasonLang = null;
      URL.revokeObjectURL(audioUrl);
    };

    await currentAudio.play();

  } catch (err) {
    console.error('[Season ReadAloud] TTS error:', err);
    if (activeBtn) activeBtn.innerHTML = originalText;
    stopCropSpeech();
    _activeSeasonId = null;
    _activeSeasonLang = null;
  }
}

function handleSeasonStopClick(event) {
  if (event) event.stopPropagation();
  stopCropSpeech();
  _activeSeasonId   = null;
  _activeSeasonLang = null;
}

// ── Season card rendering ─────────────────────────────────────────────────────

async function loadSeasons() {
  const seasons = await apiGetSeasons();
  _allSeasonData = seasons;
  renderSeasonCards(seasons);
  renderCalendar();
}

function renderSeasonCards(seasons) {
  const lang = localStorage.getItem('agribot_lang') || localStorage.getItem('agri_lang') || 'en';
  const wrap = document.getElementById('seasonCards');
  wrap.innerHTML = seasons.map(s => {
    let name = `${s.label} Season`;
    let months = s.months;
    let desc = s.description;
    let cropsLabel = 'Crops';

    if (lang === 'gu' && _gujaratiSeasonData[s.id]) {
      const g = _gujaratiSeasonData[s.id];
      name = `${g.name} ઋતુ`;
      months = g.months;
      desc = g.description;
      cropsLabel = 'પાક';
    } else if (lang === 'hi' && _hindiSeasonData[s.id]) {
      const h = _hindiSeasonData[s.id];
      name = `${h.name} मौसम`;
      months = h.months;
      desc = h.description;
      cropsLabel = 'फसलें';
    }

    return `
    <div class="season-card season-card--${s.id}" data-season="${s.id}">
      <div class="season-card-header">
        <span class="season-emoji">${s.emoji}</span>
        <div>
          <div class="season-name">${name}</div>
          <div class="season-months">${months}</div>
        </div>
        <div class="season-desc">${desc}</div>
        <div style="text-align:center;margin-left:16px">
          <div class="season-count">${s.crops_count}</div>
          <div class="season-count-label">${cropsLabel}</div>
        </div>
      </div>
      ${seasonReadAloudButtons(s.id)}
      <div class="season-crops-row">
        ${s.crops.map(c => {
          let cropName = c.name;
          if (lang === 'gu' && typeof gujaratiCropData !== 'undefined' && gujaratiCropData[c.name]) {
            cropName = gujaratiCropData[c.name].name;
          } else if (lang === 'hi' && typeof hindiCropData !== 'undefined' && hindiCropData[c.name]) {
            cropName = hindiCropData[c.name].name;
          }
          return `<span class="season-crop-pill">${(typeof renderCropVisual === 'function') ? renderCropVisual(c.name, c.image, 'pill-crop-thumb') : c.image} ${cropName}</span>`;
        }).join('')}
      </div>
    </div>`;
  }).join('');
}

async function renderCalendar() {
  const crops = await apiGetCrops();
  const grid = document.getElementById('calendarGrid');

  const legend = `<div class="cal-legend">
    <div class="cal-legend-item"><div class="cal-dot" style="background:rgba(126,200,80,0.5)"></div> Sowing months</div>
    <div class="cal-legend-item"><div class="cal-dot" style="background:rgba(212,176,96,0.5)"></div> Harvest months</div>
  </div>`;

  const header = `<div class="cal-row">
    <div class="cal-label" style="background:var(--surface); border-bottom:1px solid var(--border-h); font-family:'DM Mono',monospace; font-size:0.65rem; text-transform:uppercase; letter-spacing:0.1em; color:var(--muted);">Crop</div>
    ${MONTHS.map(m => `<div class="cal-month" style="background:var(--surface); border-bottom:1px solid var(--border-h); font-family:'DM Mono',monospace; font-size:0.65rem; text-transform:uppercase; letter-spacing:0.1em; color:var(--muted); display:flex; align-items:center; justify-content:center;">${m}</div>`).join('')}
  </div>`;

  const rows = crops.map(c => {
    const months = MONTHS.map((m, i) => {
      const isSow     = c.sowing_months.some(sm => sm.startsWith(m));
      const isHarvest = c.harvest_months.some(hm => hm.startsWith(m));
      const cls       = isSow ? 'sow' : isHarvest ? 'harvest' : '';
      return `<div class="cal-month ${cls}" title="${m}${isSow?' (sow)':isHarvest?' (harvest)':''}">${m}</div>`;
    }).join('');
    return `<div class="cal-row">
      <div class="cal-label">${(typeof renderCropVisual === 'function') ? renderCropVisual(c.name, c.image, 'pill-crop-thumb') : c.image} ${c.name}</div>
      ${months}
    </div>`;
  }).join('');

  grid.innerHTML = legend + `<div class="cal-wrap"><div class="cal-grid">${header}${rows}</div></div>`;
}

loadSeasons();
