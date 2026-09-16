// js/crops.js — Crop explorer page
// toggleMenu() and closeModal() are defined in api.js (shared)
// toggleCropSpeech(), stopCropSpeech(), generateHindiSpeechText() are in api.js

let allCrops = [];
let cropPrices = {}; // Map: cropName.toLowerCase() -> price object
let currentCropLang = localStorage.getItem('agribot_lang') || 'en';

function changeCropLanguage(lang) {
  currentCropLang = lang;
  localStorage.setItem('agribot_lang', lang);
  const sel = document.getElementById('langSelect');
  if (sel) sel.value = lang;
  renderCrops(allCrops);
}

function getLocalizedCrop(crop) {
  if (!crop) return crop;
  if (currentCropLang === 'gu' && typeof gujaratiCropData !== 'undefined' && gujaratiCropData[crop.name]) {
    const g = gujaratiCropData[crop.name];
    return {
      ...crop,
      name: g.name || crop.name,
      description: g.description || crop.description,
      category: g.category || crop.category,
      season: g.season || crop.season,
      soil_types: g.soil_types || crop.soil_types,
      care_tips: g.care_tips || crop.care_tips
    };
  }
  if (currentCropLang === 'hi' && typeof hindiCropData !== 'undefined' && hindiCropData[crop.name]) {
    const h = hindiCropData[crop.name];
    return {
      ...crop,
      name: h.name || crop.name,
      description: h.description || crop.description,
      category: h.category || crop.category,
      season: h.season || crop.season,
      soil_types: h.soil_types || crop.soil_types,
      care_tips: h.care_tips || crop.care_tips
    };
  }
  return crop;
}

// ── Load prices into lookup map ────────────────────────────────────────────────
async function loadCropPrices() {
  try {
    const endpoint = (typeof USE_LIVE_API !== 'undefined' && USE_LIVE_API)
      ? (API_BASE_URL || '') + '/api/prices'
      : '/api/prices';
    const res  = await fetch(endpoint);
    const json = await res.json();
    const list = json?.data || [];
    for (const p of list) {
      if (p.crop_name) cropPrices[p.crop_name.toLowerCase()] = p;
    }
  } catch { /* prices are optional — fail silently */ }
}

function getPriceForCrop(cropName) {
  return cropPrices[cropName.toLowerCase()] || null;
}

// ── Trilingual Read Aloud button HTML helper (EN / HI / GU) ──────────────────
function readAloudButtons(cropId) {
  return `
    <div class="read-aloud-group" onclick="event.stopPropagation()">
      <button class="btn-read-aloud-en" data-crop-id="${cropId}"
        onclick="handleReadAloudClick(event,${cropId},'en')" title="Read in English">
        🔊 EN
      </button>
      <button class="btn-read-aloud-hi" data-crop-id="${cropId}"
        onclick="handleReadAloudClick(event,${cropId},'hi')" title="हिंदी में सुनें">
        🔊 हि
      </button>
      <button class="btn-read-aloud-gu" data-crop-id="${cropId}"
        onclick="handleReadAloudClick(event,${cropId},'gu')" title="ગુજરાતીમાં સાંભળો">
        🔊 ગુ
      </button>
      <button class="btn-stop-reading" data-crop-id="${cropId}" style="display:none"
        onclick="handleStopClick(event)" title="Stop reading">
        ⏹ Stop
      </button>
    </div>`;
}

function handleReadAloudClick(event, cropId, lang) {
  if (event) event.stopPropagation();
  const crop = allCrops.find(c => c.id === cropId);
  if (crop) toggleCropSpeech(crop, lang, event ? event.currentTarget : null, event);
}

function handleStopClick(event) {
  if (event) event.stopPropagation();
  stopCropSpeech();
}

// ── Card builder ───────────────────────────────────────────────────────────────
function buildCropCard(crop) {
  const loc = getLocalizedCrop(crop);
  const price = getPriceForCrop(crop.name);
  const isBked = (typeof isCropBookmarked === 'function') && isCropBookmarked(crop.id);
  const priceBadge = price
    ? `<span class="price-badge" title="Modal mandi price">📈 ₹${Number(price.modal_price).toLocaleString('en-IN')}/qtl</span>`
    : '';
  return `
    <div class="crop-card" onclick="openCropModal(${crop.id})" style="animation-delay:${Math.random() * 0.3}s">
      <div class="crop-card-header">
        <div style="display:flex;align-items:center;gap:8px;">
          ${(typeof renderCropVisual === 'function') ? renderCropVisual(crop.name, crop.image, 'crop-img-thumb', 'crop-emoji') : `<span class="crop-emoji">${crop.image}</span>`}
          <button class="btn-crop-bookmark ${isBked ? 'bookmarked' : ''}" data-crop-id="${crop.id}" onclick="toggleBookmark(${crop.id}, event)" title="${isBked ? 'Remove from My Farm' : 'Save to My Farm'}">${isBked ? '⭐' : '☆'}</button>
        </div>
        ${readAloudButtons(crop.id)}
      </div>
      <div class="crop-name">${loc.name}</div>
      <div class="crop-desc">${loc.description}</div>
      <div class="crop-meta">
        ${loc.season.map(s => `<span class="tag">${s}</span>`).join('')}
        <span class="tag tag-category">${loc.category.replace('_', ' ')}</span>
        <span class="tag tag-water">💧 ${crop.water_requirement}</span>
      </div>
      <div class="crop-card-footer">🌱 Sow: ${crop.sowing_months.slice(0, 2).join(', ')} &nbsp;|&nbsp; ⏱ ${crop.duration_days} days
        ${priceBadge ? `<br>${priceBadge}` : ''}
      </div>
    </div>`;
}

// ── Load & Render ─────────────────────────────────────────────────────────────
async function loadCrops() {
  await loadCropPrices();
  allCrops = await apiGetCrops();
  const sel = document.getElementById('langSelect');
  if (sel) sel.value = currentCropLang;
  renderCrops(allCrops);
}

function renderCrops(list) {
  const grid = document.getElementById('cropGrid');
  const count = document.getElementById('resultsCount');
  count.textContent = `${list.length} crop${list.length !== 1 ? 's' : ''} found`;
  grid.innerHTML = list.length
    ? list.map(buildCropCard).join('')
    : '<div class="empty-state"><span class="empty-state-icon">🌿</span><p>No crops match your filters. Try clearing some.</p></div>';
}

function applyFilters() {
  const search = document.getElementById('searchInput').value.toLowerCase();
  const season = document.getElementById('filterSeason').value;
  const soil = document.getElementById('filterSoil').value;
  const water = document.getElementById('filterWater').value;
  const category = document.getElementById('filterCategory').value;
  let r = allCrops;
  if (search) r = r.filter(c => {
    const loc = getLocalizedCrop(c);
    return c.name.toLowerCase().includes(search) ||
      loc.name.toLowerCase().includes(search) ||
      c.description.toLowerCase().includes(search) ||
      loc.description.toLowerCase().includes(search);
  });
  if (season) r = r.filter(c => c.season.some(s => s === season));
  if (soil) r = r.filter(c => c.soil_types.some(s => s === soil));
  if (water) r = r.filter(c => c.water_requirement === water);
  if (category) r = r.filter(c => c.category === category);
  renderCrops(r);
}

function clearFilters() {
  ['searchInput', 'filterSeason', 'filterSoil', 'filterWater', 'filterCategory'].forEach(id => {
    document.getElementById(id).value = '';
  });
  renderCrops(allCrops);
}

// ── Modal ──────────────────────────────────────────────────────────────────────
async function openCropModal(id) {
  if (typeof activeSpeechCropId !== 'undefined' && activeSpeechCropId !== id) {
    stopCropSpeech();
  }
  const crop = allCrops.find(c => c.id === id) || await apiGetCropById(id);
  if (!crop) return;

  const loc = getLocalizedCrop(crop);
  const price = getPriceForCrop(crop.name);
  const priceSection = price ? `
    <div class="modal-section">
      <h4>📈 ${currentCropLang === 'gu' ? 'બજાર ભાવ (Agmarknet)' : currentCropLang === 'hi' ? 'बाजार भाव (Agmarknet)' : 'Market Price (Agmarknet)'}</h4>
      <div class="seed-info-grid">
        <div class="seed-info-item"><div class="seed-info-label">${currentCropLang === 'gu' ? 'ન્યૂનતમ ભાવ' : currentCropLang === 'hi' ? 'न्यूनतम मूल्य' : 'Min Price'}</div><div class="seed-info-val">₹${Number(price.min_price).toLocaleString('en-IN')}/qtl</div></div>
        <div class="seed-info-item"><div class="seed-info-label">${currentCropLang === 'gu' ? 'બજાર ભાવ' : currentCropLang === 'hi' ? 'बाजार मूल्य' : 'Modal Price'}</div><div class="seed-info-val prices-modal">₹${Number(price.modal_price).toLocaleString('en-IN')}/qtl</div></div>
        <div class="seed-info-item"><div class="seed-info-label">${currentCropLang === 'gu' ? 'મહત્તમ ભાવ' : currentCropLang === 'hi' ? 'अधिकतम मूल्य' : 'Max Price'}</div><div class="seed-info-val">₹${Number(price.max_price).toLocaleString('en-IN')}/qtl</div></div>
        <div class="seed-info-item"><div class="seed-info-label">${currentCropLang === 'gu' ? 'બીજ ભાવ' : currentCropLang === 'hi' ? 'बीज मूल्य' : 'Seed Price'}</div><div class="seed-info-val">₹${Number(price.seed_price_per_kg).toLocaleString('en-IN')}/kg</div></div>
        ${price.market ? `<div class="seed-info-item"><div class="seed-info-label">${currentCropLang === 'gu' ? 'બજાર (મંડી)' : currentCropLang === 'hi' ? 'मंडी' : 'Market'}</div><div class="seed-info-val">${price.market}</div></div>` : ''}
        <div class="seed-info-item"><div class="seed-info-label">${currentCropLang === 'gu' ? 'સ્ત્રોત' : currentCropLang === 'hi' ? 'स्रोत' : 'Source'}</div><div class="seed-info-val">${price.source === 'live' ? '🟢 Live' : '🟡 Simulated'}</div></div>
      </div>
    </div>` : '';

  const modalImgSrc = (typeof getCropImageSrc === 'function') ? getCropImageSrc(crop.name) : null;
  const modalBanner = modalImgSrc
    ? `<img class="modal-crop-img" src="${modalImgSrc}" alt="${crop.name}" onerror="this.style.display='none'; document.getElementById('modalCropEmoji').style.display='inline-flex';" />`
    : '';

  document.getElementById('modalBody').innerHTML = `
    ${modalBanner}
    <div class="modal-header-actions">
      <div style="display:flex;align-items:center;gap:10px;">
        <span class="modal-emoji" id="modalCropEmoji" style="${modalImgSrc ? 'display:none' : ''}">${crop.image}</span>
        <button class="btn btn-secondary btn-sm" onclick="printFarmAdvisory(${crop.id})" title="Print 1-Page Advisory PDF">📄 Print PDF</button>
        <button class="btn btn-secondary btn-sm" onclick="openCropComparison(${crop.id}, 1); closeModal();" title="Compare this crop">⚖️ Compare</button>
      </div>
      ${readAloudButtons(crop.id)}
    </div>
    <div class="modal-title">${loc.name}</div>
    <div class="modal-category">${loc.category.replace('_', ' ')} · ${loc.season.join(', ')}</div>
    <p class="modal-desc">${loc.description}</p>
    <div class="modal-tags">
      ${loc.soil_types.map(s => `<span class="tag tag-soil tag-soil--${s.toLowerCase().replace(/[^a-z0-9]/g, '-')}">${s}</span>`).join('')}
      <span class="tag tag-water">💧 ${crop.water_requirement} water</span>
      <span class="tag tag-category">⏱ ${crop.duration_days} days</span>
      ${crop.climate ? `<span class="tag tag-climate">🌡️ ${crop.climate.join(', ')}</span>` : ''}
    </div>
    ${priceSection}
    <div class="modal-section">
      <h4>🌱 ${currentCropLang === 'gu' ? 'બીજની માહિતી' : currentCropLang === 'hi' ? 'बीज की जानकारी' : 'Seed Information'}</h4>
      <div class="seed-info-grid">
        <div class="seed-info-item"><div class="seed-info-label">${currentCropLang === 'gu' ? 'બીજનો પ્રકાર' : currentCropLang === 'hi' ? 'बीज प्रकार' : 'Seed Type'}</div><div class="seed-info-val">${crop.seeds.type}</div></div>
        <div class="seed-info-item"><div class="seed-info-label">${currentCropLang === 'gu' ? 'વાવણીની ઊંડાઈ' : currentCropLang === 'hi' ? 'बुवाई की गहराई' : 'Sowing Depth'}</div><div class="seed-info-val">${crop.seeds.sowing_depth_cm} cm</div></div>
        <div class="seed-info-item"><div class="seed-info-label">${currentCropLang === 'gu' ? 'બીજ દર / એકર' : currentCropLang === 'hi' ? 'बीज दर / एकड़' : 'Seed Rate/Acre'}</div><div class="seed-info-val">${crop.seeds.seed_rate_kg_per_acre}</div></div>
        <div class="seed-info-item"><div class="seed-info-label">${currentCropLang === 'gu' ? 'અંકુરણ સમય' : currentCropLang === 'hi' ? 'अंकुरण समय' : 'Germination'}</div><div class="seed-info-val">${crop.seeds.germination_days} days</div></div>
        <div class="seed-info-item"><div class="seed-info-label">${currentCropLang === 'gu' ? 'અંતર' : currentCropLang === 'hi' ? 'दूरी' : 'Spacing'}</div><div class="seed-info-val">${crop.seeds.spacing_cm}</div></div>
        <div class="seed-info-item"><div class="seed-info-label">${currentCropLang === 'gu' ? 'કાપણી' : currentCropLang === 'hi' ? 'कटाई' : 'Harvest'}</div><div class="seed-info-val">${crop.harvest_months.join(', ')}</div></div>
      </div>
    </div>
    <div class="modal-section">
      <h4>🌿 ${currentCropLang === 'gu' ? 'સંભાળ માટેની ટિપ્સ' : currentCropLang === 'hi' ? 'फसल देखभाल के सुझाव' : 'Care Tips'}</h4>
      <ul class="care-tips-list">${loc.care_tips.map(t => `<li>${t}</li>`).join('')}</ul>
    </div>`;
  document.getElementById('modalOverlay').classList.add('open');
}

loadCrops();

