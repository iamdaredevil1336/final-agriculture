// js/soils.js — Soil guide page
// toggleMenu() is defined in api.js (shared)
// stopCropSpeech() / currentAudio are shared globals from api.js

// ── Hindi soil type translations (actual Devanagari text for TTS) ─────────────
const _hindiSoilData = {
  alluvial: {
    name:        'जलोढ़ मिट्टी',
    description: 'जलोढ़ मिट्टी नदी के मैदानों में पाई जाती है और अत्यंत उपजाऊ होती है। इसमें रेत, मिट्टी और कार्बनिक पदार्थों का अच्छा संतुलन होता है। यह मिट्टी गेहूं, धान, गन्ना, दलहन और सब्जियों सहित अधिकांश फसलों के लिए सर्वोत्तम मानी जाती है।'
  },
  black: {
    name:        'काली मिट्टी',
    description: 'काली मिट्टी में चिकनी मिट्टी की मात्रा अधिक होती है और यह नमी को बहुत अच्छे से बनाए रखती है। गर्मियों में यह फट जाती है और ठंड में फूल जाती है। यह कपास की खेती के लिए आदर्श मानी जाती है। इसे रेगुर मिट्टी भी कहते हैं।'
  },
  loamy: {
    name:        'दोमट मिट्टी',
    description: 'दोमट मिट्टी की बनावट संतुलित होती है जिसमें रेत, मिट्टी और सिल्ट का उचित अनुपात होता है। यह जल निकासी और जल धारण क्षमता दोनों में उत्तम होती है। यह कई कृषि फसलों के लिए उपयुक्त है और सर्वश्रेष्ठ सर्वोद्देशीय कृषि मिट्टी मानी जाती है।'
  },
  'sandy-loam': {
    name:        'बलुई दोमट मिट्टी',
    description: 'बलुई दोमट मिट्टी में जल निकासी बहुत अच्छी होती है। इसमें रेत की मात्रा अधिक होती है। यह जड़ वाली सब्जियों, दलहनों, मूंगफली और ऐसी फसलों के लिए उपयुक्त है जिन्हें जलभराव से हानि होती है।'
  },
  clay: {
    name:        'चिकनी मिट्टी',
    description: 'चिकनी मिट्टी भारी होती है और पानी को लंबे समय तक बनाए रखने में सक्षम होती है। यह धान और गन्ने की खेती के लिए उत्तम मानी जाती है। हालांकि इसमें जल निकासी कम होती है और इसे जोतना कठिन हो सकता है।'
  },
  laterite: {
    name:        'लेटराइट मिट्टी',
    description: 'लेटराइट मिट्टी में लोहे और एल्यूमीनियम की मात्रा अधिक होती है और यह अम्लीय प्रकृति की होती है। यह मुख्यतः उष्णकटिबंधीय क्षेत्रों में पाई जाती है। यह आम, काजू, नारियल और चाय जैसी फसलों के लिए उपयुक्त है।'
  }
};

// ── Gujarati soil type translations ───────────────────────────────────────────
const _gujaratiSoilData = {
  alluvial: {
    name:        'કાંપવાળી જમીન',
    description: 'કાંપવાળી જમીન નદીના મેદાનોમાં જોવા મળે છે અને ખૂબ જ ફળદ્રુપ હોય છે. તેમાં રેતી, માટી અને સેન્દ્રીય તત્વોનું સંતુલન હોય છે. તે ઘઉં, ડાંગર, શેરડી, કઠોળ અને શાકભાજી માટે ઉત્તમ ગણાય છે.'
  },
  black: {
    name:        'કાળી જમીન',
    description: 'કાળી જમીનમાં ચીકણી માટી વધુ હોય છે અને તે ભેજસંગ્રહ શક્તિ ખૂબ સારી ધરાવે છે. ઉનાળામાં તેમાં તિરાડો પડે છે. તે કપાસના પાક માટે સૌથી અનુકૂળ છે. તેને રેગુર જમીન પણ કહેવાય છે.'
  },
  loamy: {
    name:        'ગોરાડુ જમીન',
    description: 'ગોરાડુ જમીનમાં રેતી, માટી અને કાંપનું યોગ્ય પ્રમાણ હોય છે. તેનો નિતાર અને ભેજ સંગ્રહ બંને ઉત્તમ હોય છે. તે મોટાભાગના ખેતી પાકો માટે સર્વોત્તમ જમીન માનવામાં આવે છે.'
  },
  'sandy-loam': {
    name:        'રેતાળ ગોરાડુ જમીન',
    description: 'રેતાળ ગોરાડુ જમીનમાં પાણીનો નિતાર ઝડપી થાય છે. તે કંદમૂળ શાકભાજી, મગફળી અને કઠોળ જેવા પાકો માટે શ્રેષ્ઠ છે જેને પાણી ભરાઈ રહેવાથી નુકસાન થાય છે.'
  },
  clay: {
    name:        'ચીકણી જમીન',
    description: 'ચીકણી જમીન ભારે હોય છે અને લાંબા સમય સુધી પાણી ભરી રાખે છે. તે ડાંગર અને શેરડીની ખેતી માટે ઉત્તમ છે.'
  },
  laterite: {
    name:        'પડખાઉ (લેટેરાઇટ) જમીન',
    description: 'પડખાઉ જમીનમાં લોહતત્વ અને એલ્યુમિનિયમ વધારે હોય છે અને તે એસિડિક હોય છે. તે કેરી, કાજુ, નાળિયેર અને ચાના પાક માટે અનુકૂળ છે.'
  }
};

// ── Soil speech text generators ───────────────────────────────────────────────

function generateSoilEnglishText(soil) {
  const parts = [];
  parts.push(`${soil.label}.`);
  parts.push(`${soil.description}`);
  parts.push(`Suitable for ${soil.crops.length} crops including: ${soil.crops.slice(0, 5).map(c => c.name).join(', ')}${soil.crops.length > 5 ? ' and more' : ''}.`);
  return parts.join(' ');
}

function generateSoilHindiText(soil) {
  const hi = _hindiSoilData[soil.id];
  if (!hi) return generateSoilEnglishText(soil);
  const parts = [];
  parts.push(`${hi.name}।`);
  parts.push(`${hi.description}`);
  parts.push(`यह मिट्टी ${soil.crops.length} फसलों के लिए उपयुक्त है।`);
  return parts.join(' ');
}

function generateSoilGujaratiText(soil) {
  const gu = _gujaratiSoilData[soil.id];
  if (!gu) return generateSoilEnglishText(soil);
  const parts = [];
  parts.push(`${gu.name}.`);
  parts.push(`${gu.description}`);
  parts.push(`આ જમીન ${soil.crops.length} પાકો માટે અનુકૂળ છે.`);
  return parts.join(' ');
}

// ── Soil Read Aloud buttons ───────────────────────────────────────────────────

function soilReadAloudButtons(soilId) {
  return `
    <div class="read-aloud-group soil-read-aloud" onclick="event.stopPropagation()">
      <button class="btn-read-aloud-en" data-soil-id="${soilId}"
        onclick="handleSoilReadAloudClick(event,'${soilId}','en')" title="Read in English">
        🔊 EN
      </button>
      <button class="btn-read-aloud-hi" data-soil-id="${soilId}"
        onclick="handleSoilReadAloudClick(event,'${soilId}','hi')" title="हिंदी में सुनें">
        🔊 हि
      </button>
      <button class="btn-read-aloud-gu" data-soil-id="${soilId}"
        onclick="handleSoilReadAloudClick(event,'${soilId}','gu')" title="ગુજરાતીમાં સાંભળો">
        🔊 ગુ
      </button>
      <button class="btn-stop-reading" data-soil-id="${soilId}" style="display:none"
        onclick="handleSoilStopClick(event)" title="Stop reading">
        ⏹ Stop
      </button>
    </div>`;
}

// ── Shared audio state for soils ─────────────────────────────────────────────
let _activeSoilId   = null;
let _activeSoilLang = null;
let _allSoilData    = [];  // populated after apiGetSoils()

async function handleSoilReadAloudClick(event, soilId, lang) {
  if (event) event.stopPropagation();

  // If same soil + same lang is playing, toggle off
  if (_activeSoilId === soilId && _activeSoilLang === lang &&
      typeof currentAudio !== 'undefined' && currentAudio && !currentAudio.paused) {
    stopCropSpeech();
    _activeSoilId = null;
    _activeSoilLang = null;
    return;
  }

  // Stop any currently playing audio
  stopCropSpeech();

  const soil = _allSoilData.find(s => s.id === soilId);
  if (!soil) return;

  let text = '';
  if (lang === 'gu') {
    text = generateSoilGujaratiText(soil);
  } else if (lang === 'hi') {
    text = generateSoilHindiText(soil);
  } else {
    text = generateSoilEnglishText(soil);
  }

  _activeSoilId   = soilId;
  _activeSoilLang = lang;

  // Update button states
  const enBtns   = document.querySelectorAll(`.btn-read-aloud-en[data-soil-id="${soilId}"]`);
  const hiBtns   = document.querySelectorAll(`.btn-read-aloud-hi[data-soil-id="${soilId}"]`);
  const guBtns   = document.querySelectorAll(`.btn-read-aloud-gu[data-soil-id="${soilId}"]`);
  const stopBtns = document.querySelectorAll(`.btn-stop-reading[data-soil-id="${soilId}"]`);

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

    // Guard: user may have clicked stop while loading
    if (_activeSoilId !== soilId || _activeSoilLang !== lang) {
      URL.revokeObjectURL(audioUrl);
      return;
    }

    currentAudio = new Audio(audioUrl);
    if (activeBtn) activeBtn.innerHTML = originalText;

    currentAudio.onended = () => {
      stopCropSpeech();
      _activeSoilId = null;
      _activeSoilLang = null;
      URL.revokeObjectURL(audioUrl);
    };
    currentAudio.onerror = () => {
      stopCropSpeech();
      _activeSoilId = null;
      _activeSoilLang = null;
      URL.revokeObjectURL(audioUrl);
    };

    await currentAudio.play();

  } catch (err) {
    console.error('[Soil ReadAloud] TTS error:', err);
    if (activeBtn) activeBtn.innerHTML = originalText;
    stopCropSpeech();
    _activeSoilId = null;
    _activeSoilLang = null;
  }
}

function handleSoilStopClick(event) {
  if (event) event.stopPropagation();
  stopCropSpeech();
  _activeSoilId   = null;
  _activeSoilLang = null;
}

function renderSoilCards(soils) {
  const lang = localStorage.getItem('agribot_lang') || localStorage.getItem('agri_lang') || 'en';
  const grid = document.getElementById('soilGrid');
  if (!grid) return;
  grid.innerHTML = soils.map((s, index) => {
    let name = s.label;
    let desc = s.description;
    let suitableLabel = `Suitable Crops (${s.crops.length})`;

    if (lang === 'gu' && _gujaratiSoilData[s.id]) {
      const g = _gujaratiSoilData[s.id];
      name = g.name;
      desc = g.description;
      suitableLabel = `અનુકૂળ પાકો (${s.crops.length})`;
    } else if (lang === 'hi' && _hindiSoilData[s.id]) {
      const h = _hindiSoilData[s.id];
      name = h.name;
      desc = h.description;
      suitableLabel = `उपयुक्त फसलें (${s.crops.length})`;
    }

    return `
    <div class="soil-card soil-card--${s.id}" data-soil="${s.id}" style="animation: fadeUp 0.6s ${index * 0.08}s ease both;">
      <div class="soil-header">
        <span class="soil-emoji">${s.emoji}</span>
        <div style="flex:1">
          <div class="soil-name">${name}</div>
          <span class="soil-badge soil-badge--${s.id}">${name}</span>
        </div>
      </div>
      <div class="soil-desc">${desc}</div>
      ${soilReadAloudButtons(s.id)}
      <div class="soil-crops-label">${suitableLabel}</div>
      <div class="soil-crops-row">
        ${s.crops.map(c => {
          let cropName = c.name;
          if (lang === 'gu' && typeof gujaratiCropData !== 'undefined' && gujaratiCropData[c.name]) {
            cropName = gujaratiCropData[c.name].name;
          } else if (lang === 'hi' && typeof hindiCropData !== 'undefined' && hindiCropData[c.name]) {
            cropName = hindiCropData[c.name].name;
          }
          return `<span class="soil-crop-chip">${(typeof renderCropVisual === 'function') ? renderCropVisual(c.name, c.image, 'pill-crop-thumb') : c.image} ${cropName}</span>`;
        }).join('')}
      </div>
    </div>`;
  }).join('');
}

async function loadSoils() {
  const soils = await apiGetSoils();
  _allSoilData = soils;
  renderSoilCards(soils);
}

loadSoils();

