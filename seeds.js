// js/seeds.js — Seed guide page
// toggleMenu() is defined in api.js (shared)

const i18n = {
  en: {
    seed_guide_title: "🌱 Seed Guide",
    seed_guide_sub: "Sowing depth, seed rates, germination time & spacing for every crop",
    search_seeds: "Search seeds…",
    th_crop: "Crop",
    th_type: "Seed Type",
    th_depth: "Sowing Depth",
    th_rate: "Seed Rate / Acre",
    th_germ: "Germination",
    th_space: "Spacing (cm)",
    th_season: "Season",
    care_tips_title: "Crop Care Tips",
    crops: {} // Default names from data
  },
  hi: {
    seed_guide_title: "🌱 बीज मार्गदर्शिका",
    seed_guide_sub: "बुवाई की गहराई, बीज दर, अंकुरण समय और हर फसल के लिए दूरी",
    search_seeds: "बीज खोजें…",
    th_crop: "फसल",
    th_type: "बीज प्रकार",
    th_depth: "बुवाई की गहराई",
    th_rate: "बीज दर / एकड़",
    th_germ: "अंकुरण",
    th_space: "दूरी (सेमी)",
    th_season: "मौसम",
    care_tips_title: "फसल देखभाल के सुझाव",
    crops: {
      "Wheat": "गेहूं", "Rice": "चावल", "Maize": "मक्का", "Cotton": "कपास",
      "Tomato": "टमाटर", "Sugarcane": "गन्ना", "Potato": "आलू", "Sunflower": "सूरजमुखी",
      "Chickpea": "चना", "Mango": "आम", "Onion": "प्याज", "Groundnut": "मूंगफली",
      "Barley": "जौ", "Sorghum": "ज्वार", "Pearl Millet": "बाजरा", "Cabbage": "पत्ता गोभी",
      "Cauliflower": "फूलगोभी", "Broccoli": "ब्रोकोली", "Spinach": "पालक", "Carrot": "गाजर",
      "Radish": "मूली", "Garlic": "लहसुन", "Ginger": "अदरक", "Turmeric": "हल्दी",
      "Chili": "मिर्च", "Brinjal": "बैंगन", "Okra": "भिंडी", "Cucumber": "खीरा",
      "Banana": "केला", "Orange": "संतरा", "Grape": "अंगूर", "Papaya": "पपीता",
      "Guava": "अमरूद", "Pineapple": "अनानास", "Watermelon": "तरबूज", "Lemon": "नींबू",
      "Coconut": "नारियल", "Mustard": "सरसों", "Soybean": "सोयाबीन", "Tea": "चाय"
    }
  },
  gu: {
    seed_guide_title: "🌱 બીજ માર્ગદર્શિકા",
    seed_guide_sub: "વાવણીની ઊંડાઈ, બીજનો દર, અંકુરણનો સમય અને દરેક પાક માટે અંતર",
    search_seeds: "બીજ શોધો…",
    th_crop: "પાક",
    th_type: "બીજનો પ્રકાર",
    th_depth: "વાવણીની ઊંડાઈ",
    th_rate: "બીજ દર / એકર",
    th_germ: "અંકુરણ",
    th_space: "અંતર (સેમી)",
    th_season: "ઋતુ",
    care_tips_title: "પાક સંભાળ માટેની ટિપ્સ",
    crops: {
      "Wheat": "ઘઉં", "Rice": "ચોખા", "Maize": "મકાઈ", "Cotton": "કપાસ",
      "Tomato": "ટમેટા", "Sugarcane": "શેરડી", "Potato": "બટાકા", "Sunflower": "સૂર્યમુખી",
      "Chickpea": "ચણા", "Mango": "કેરી", "Onion": "ડુંગળી", "Groundnut": "મગફળી",
      "Barley": "જવ", "Sorghum": "જુવાર", "Pearl Millet": "બાજરી", "Cabbage": "કોબીજ",
      "Cauliflower": "ફૂલકોબી", "Broccoli": "બ્રોકોલી", "Spinach": "પાલક", "Carrot": "ગાજર",
      "Radish": "મૂળો", "Garlic": "લસણ", "Ginger": "આદુ", "Turmeric": "હળદર",
      "Chili": "મરચું", "Brinjal": "રીંગણ", "Okra": "ભીંડા", "Cucumber": "કાકડી",
      "Banana": "કેળા", "Orange": "નારંગી", "Grape": "દ્રાક્ષ", "Papaya": "પપૈયું",
      "Guava": "જામફળ", "Pineapple": "અનાનસ", "Watermelon": "તરબૂચ", "Lemon": "લીંબુ",
      "Coconut": "નાળિયેર", "Mustard": "સરસવ", "Soybean": "સોયાબીન", "Tea": "ચા"
    }
  }
};

let currentLang = 'en';

function changeLanguage() {
  currentLang = document.getElementById('langSelect').value;
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (i18n[currentLang][key]) {
      el.textContent = i18n[currentLang][key];
    }
  });
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.getAttribute('data-i18n-placeholder');
    if (i18n[currentLang][key]) {
      el.placeholder = i18n[currentLang][key];
    }
  });
  filterSeeds(); // Re-render with new language
}

function getTranslatedName(name) {
  if (currentLang === 'en') return name;
  return i18n[currentLang].crops[name] || name;
}

let allSeeds = [];
let seedPrices = {};

async function loadSeedPrices() {
  try {
    const endpoint = (typeof USE_LIVE_API !== 'undefined' && USE_LIVE_API)
      ? (API_BASE_URL || '') + '/api/prices'
      : '/api/prices';
    const res  = await fetch(endpoint);
    const json = await res.json();
    const list = json?.data || [];
    for (const p of list) {
      if (p.crop_name) seedPrices[p.crop_name.toLowerCase()] = p;
    }
  } catch (e) {}
}

function getSeedPrice(cropName) {
  const p = seedPrices[cropName.toLowerCase()];
  return p ? '₹' + Number(p.seed_price_per_kg).toLocaleString('en-IN') + '/kg' : '—';
}

async function loadSeeds() {
  await loadSeedPrices();
  allSeeds = await apiGetSeeds();
  renderTable(allSeeds);
  renderCareCards(allSeeds);
}

function renderTable(list) {
  const tbody = document.getElementById('seedTableBody');
  if (!list.length) {
    tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;padding:40px;color:var(--muted)">No results found.</td></tr>';
    return;
  }
  tbody.innerHTML = list.map((s, index) => `
    <tr style="animation: fadeUp 0.4s ${index * 0.05}s ease both; cursor:pointer;" onclick="openSeedModal(allSeeds.find(x=>x.crop_id===${s.crop_id}))">
      <td><div class="seed-crop-cell">
        ${(typeof renderCropVisual === 'function') ? renderCropVisual(s.crop_name, s.image, 'seed-crop-thumb', 'seed-crop-emoji') : `<span class="seed-crop-emoji">${s.image}</span>`}
        <div>
          <div class="seed-crop-name">${getTranslatedName(s.crop_name)}</div>
          <div class="seed-type-tag">${s.type}</div>
        </div>
      </div></td>
      <td>${s.type}</td>
      <td class="mono">${s.sowing_depth_cm} cm</td>
      <td class="mono">${s.seed_rate_kg_per_acre}</td>
      <td class="mono">${s.germination_days} days</td>
      <td class="mono">${s.spacing_cm}</td>
      <td>${s.season.map(se=>`<span class="tag" style="font-size:0.6rem">${se}</span>`).join(' ')}</td>
      <td class="mono price-badge" style="border:none;background:none;font-size:0.75rem">${getSeedPrice(s.crop_name)}</td>
    </tr>`).join('');
}

function renderCareCards(list) {
  const grid = document.getElementById('careGrid');
  grid.innerHTML = list.map((s, index) => `
    <div class="care-card" style="animation: fadeUp 0.5s ${index * 0.05}s ease both;">
      <div class="care-card-header">
        ${(typeof renderCropVisual === 'function') ? renderCropVisual(s.crop_name, s.image, 'care-card-thumb', 'care-card-emoji') : `<span class="care-card-emoji">${s.image}</span>`}
        <div style="flex:1">
          <div class="care-card-name">${getTranslatedName(s.crop_name)}</div>
          <div class="care-card-cat">${s.category ? s.category.replace('_',' ') : ''}</div>
        </div>
        ${seedReadAloudButtons(s.crop_id)}
      </div>
      <ul class="care-tips-list-sm">
        ${(s.care_tips || []).map(t=>`<li>${t}</li>`).join('')}
      </ul>
    </div>`).join('');
}

function filterSeeds() {
  const q        = document.getElementById('seedSearch').value.toLowerCase();
  const category = document.getElementById('seedCategory').value;
  const season   = document.getElementById('seedSeason').value;
  let r = allSeeds;
  if (q)        r = r.filter(s => s.crop_name.toLowerCase().includes(q) || s.type.toLowerCase().includes(q));
  if (category) r = r.filter(s => s.category === category);
  if (season)   r = r.filter(s => s.season && s.season.includes(season));
  renderTable(r);
}

// ── SEED READ ALOUD — Bilingual TTS ──────────────────────────────────────────

function seedReadAloudButtons(cropId) {
  return `
    <div class="read-aloud-group" onclick="event.stopPropagation()">
      <button class="btn-read-aloud-en" data-crop-id="${cropId}"
        onclick="handleSeedReadAloudClick(event,${cropId},'en')" title="Read in English">
        🔊 EN
      </button>
      <button class="btn-read-aloud-hi" data-crop-id="${cropId}"
        onclick="handleSeedReadAloudClick(event,${cropId},'hi')" title="हिंदी में सुनें">
        🔊 हि
      </button>
      <button class="btn-read-aloud-gu" data-crop-id="${cropId}"
        onclick="handleSeedReadAloudClick(event,${cropId},'gu')" title="ગુજરાતીમાં સાંભળો">
        🔊 ગુ
      </button>
      <button class="btn-stop-reading" data-crop-id="${cropId}" style="display:none"
        onclick="handleSeedStopClick(event)" title="Stop reading">
        ⏹ Stop
      </button>
    </div>`;
}

function _seedToCropShape(s) {
  return {
    id:                s.crop_id,
    name:              s.crop_name,
    image:             s.image,
    category:          s.category || '',
    season:            s.season   || [],
    description:       '',
    soil_types:        [],
    climate:           [],
    water_requirement: '',
    duration_days:     '',
    sowing_months:     [],
    harvest_months:    [],
    care_tips:         s.care_tips || [],
    seeds: {
      type:                  s.type                  || '',
      sowing_depth_cm:       s.sowing_depth_cm       || '',
      seed_rate_kg_per_acre: s.seed_rate_kg_per_acre || '',
      germination_days:      s.germination_days      || '',
      spacing_cm:            s.spacing_cm            || ''
    }
  };
}

function handleSeedReadAloudClick(event, cropId, lang) {
  if (event) event.stopPropagation();
  const seed = allSeeds.find(s => s.crop_id === cropId);
  if (!seed) return;
  const cropShape = _seedToCropShape(seed);
  toggleCropSpeech(cropShape, lang, event ? event.currentTarget : null, event);
}

function handleSeedStopClick(event) {
  if (event) event.stopPropagation();
  stopCropSpeech();
}

// ── SEED DETAIL MODAL ─────────────────────────────────────────────────────────

function openSeedModal(s) {
  if (!s) return;
  stopCropSpeech();

  const seasonTags = (s.season || [])
    .map(se => `<span class="tag" style="font-size:0.7rem">${se}</span>`).join(' ');

  const modalImgSrc = (typeof getCropImageSrc === 'function') ? getCropImageSrc(s.crop_name) : null;
  const modalBanner = modalImgSrc
    ? `<img class="modal-crop-img" src="${modalImgSrc}" alt="${s.crop_name}" onerror="this.style.display='none'; document.getElementById('modalSeedEmoji').style.display='inline-flex';" />`
    : '';

  document.getElementById('seedModalBody').innerHTML = `
    ${modalBanner}
    <div class="modal-header-actions">
      <span class="modal-emoji" id="modalSeedEmoji" style="${modalImgSrc ? 'display:none' : ''}">${s.image}</span>
      ${seedReadAloudButtons(s.crop_id)}
    </div>
    <div class="modal-title">${getTranslatedName(s.crop_name)}</div>
    <div class="modal-category">${(s.category || '').replace('_', ' ')} · ${(s.season || []).join(', ')}</div>
    <div class="modal-section">
      <h4>🌱 Seed Information</h4>
      <div class="seed-info-grid">
        <div class="seed-info-item">
          <div class="seed-info-label">Seed Type</div>
          <div class="seed-info-val">${s.type}</div>
        </div>
        <div class="seed-info-item">
          <div class="seed-info-label">Sowing Depth</div>
          <div class="seed-info-val">${s.sowing_depth_cm} cm</div>
        </div>
        <div class="seed-info-item">
          <div class="seed-info-label">Seed Rate / Acre</div>
          <div class="seed-info-val">${s.seed_rate_kg_per_acre}</div>
        </div>
        <div class="seed-info-item">
          <div class="seed-info-label">Germination</div>
          <div class="seed-info-val">${s.germination_days} days</div>
        </div>
        <div class="seed-info-item">
          <div class="seed-info-label">Spacing (cm)</div>
          <div class="seed-info-val">${s.spacing_cm}</div>
        </div>
        <div class="seed-info-item">
          <div class="seed-info-label">Season</div>
          <div class="seed-info-val">${seasonTags}</div>
        </div>
      </div>
    </div>
    ${(s.care_tips && s.care_tips.length) ? `
    <div class="modal-section">
      <h4>🌿 Care Tips</h4>
      <ul class="care-tips-list">${s.care_tips.map(t => `<li>${t}</li>`).join('')}</ul>
    </div>` : ''}`;

  document.getElementById('seedModalOverlay').classList.add('open');
}

function closeSeedModal() {
  const ov = document.getElementById('seedModalOverlay');
  if (ov) ov.classList.remove('open');
  stopCropSpeech();
}

loadSeeds();

