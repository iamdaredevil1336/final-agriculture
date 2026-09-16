// main.js — Homepage logic
// toggleMenu() and closeModal() live in api.js (shared across all pages)
// toggleCropSpeech(), stopCropSpeech(), generateHindiSpeechText() are in api.js

// ── Bilingual Read Aloud button HTML helper (mirrors crops.js) ────────────────
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
  const crop = allCrops ? allCrops.find(c => c.id === cropId) : null;
  if (crop) toggleCropSpeech(crop, lang, event ? event.currentTarget : null, event);
}

function handleStopClick(event) {
  if (event) event.stopPropagation();
  stopCropSpeech();
}

function getLocalizedCrop(crop) {
  if (!crop) return crop;
  const lang = localStorage.getItem('agribot_lang') || localStorage.getItem('agri_lang') || 'en';
  if (lang === 'gu' && typeof gujaratiCropData !== 'undefined' && gujaratiCropData[crop.name]) {
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
  if (lang === 'hi' && typeof hindiCropData !== 'undefined' && hindiCropData[crop.name]) {
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

function buildCropCard(crop, idx) {
  const loc = getLocalizedCrop(crop);
  const isBked = (typeof isCropBookmarked === 'function') && isCropBookmarked(crop.id);
  const visual = (typeof renderCropVisual === 'function')
    ? renderCropVisual(crop.name, crop.image, 'crop-img-thumb', 'crop-emoji')
    : `<span class="crop-emoji">${crop.image}</span>`;
  return `
    <div class="crop-card" onclick="openCropModal(${crop.id})" style="animation-delay:${idx * 0.06}s">
      <div class="crop-card-header">
        <div style="display:flex;align-items:center;gap:8px;">
          ${visual}
          <button class="btn-crop-bookmark ${isBked ? 'bookmarked' : ''}" data-crop-id="${crop.id}" onclick="toggleBookmark(${crop.id}, event)" title="${isBked ? 'Remove from My Farm' : 'Save to My Farm'}">${isBked ? '⭐' : '☆'}</button>
        </div>
        ${readAloudButtons(crop.id)}
      </div>
      <div class="crop-name">${loc.name}</div>
      <div class="crop-desc">${loc.description}</div>
      <div class="crop-meta">
        <span class="tag">${loc.season[0]}</span>
        <span class="tag tag-category">${loc.category.replace('_',' ')}</span>
        <span class="tag tag-water">💧 ${crop.water_requirement}</span>
      </div>
    </div>`;
}

let allCrops = [];

async function loadHomeGrid(season = 'all') {
  const grid = document.getElementById('homeCropGrid');
  if (!grid) return;
  grid.innerHTML = '<div class="loading-spinner">Loading…</div>';
  const filters = season !== 'all' ? { season } : {};
  allCrops = await apiGetCrops(filters);
  grid.innerHTML = allCrops.length
    ? allCrops.map((c, i) => buildCropCard(c, i)).join('')
    : '<div class="empty-state"><span class="empty-state-icon">🌿</span><p>No crops found.</p></div>';
}

function filterBySeason(season, btn) {
  document.querySelectorAll('.pill').forEach(p => p.classList.remove('pill-active'));
  btn.classList.add('pill-active');
  loadHomeGrid(season);
}

// MODAL (shared detail view)
async function openCropModal(id) {
  if (typeof activeSpeechCropId !== 'undefined' && activeSpeechCropId !== id) {
    stopCropSpeech();
  }
  const crop = (allCrops && allCrops.length) ? allCrops.find(c => c.id === id) || await apiGetCropById(id) : await apiGetCropById(id);
  if (!crop) return;
  const loc = getLocalizedCrop(crop);
  const overlay = document.getElementById('modalOverlay');
  if (!overlay) return;
  const modalImgSrc = (typeof getCropImageSrc === 'function') ? getCropImageSrc(crop.name) : null;
  const modalBanner = modalImgSrc
    ? `<img class="modal-crop-img" src="${modalImgSrc}" alt="${crop.name}" onerror="this.style.display='none'; document.getElementById('modalCropEmoji').style.display='inline-flex';" />`
    : '';

  document.getElementById('modalBody').innerHTML = `
    ${modalBanner}
    <div class="modal-header-actions">
      <span class="modal-emoji" id="modalCropEmoji" style="${modalImgSrc ? 'display:none' : ''}">${crop.image}</span>
      ${readAloudButtons(crop.id)}
    </div>
    <div class="modal-title">${loc.name}</div>
    <div class="modal-category">${loc.category.replace('_',' ')} · ${loc.season.join(', ')}</div>
    <p class="modal-desc">${loc.description}</p>
    <div class="modal-tags">
      ${loc.soil_types.map(s=>`<span class="tag tag-soil tag-soil--${s.toLowerCase().replace(/[^a-z0-9]/g, '-')}">${s}</span>`).join('')}
      <span class="tag tag-water">💧 ${crop.water_requirement} water</span>
      <span class="tag tag-category">⏱ ${crop.duration_days} days</span>
      ${crop.climate ? `<span class="tag tag-climate">🌡️ ${crop.climate.join(', ')}</span>` : ''}
    </div>
    <div class="modal-section">
      <h4>🌱 Seed Information</h4>
      <div class="seed-info-grid">
        <div class="seed-info-item"><div class="seed-info-label">Type</div><div class="seed-info-val">${crop.seeds.type}</div></div>
        <div class="seed-info-item"><div class="seed-info-label">Sowing Depth</div><div class="seed-info-val">${crop.seeds.sowing_depth_cm} cm</div></div>
        <div class="seed-info-item"><div class="seed-info-label">Seed Rate/Acre</div><div class="seed-info-val">${crop.seeds.seed_rate_kg_per_acre}</div></div>
        <div class="seed-info-item"><div class="seed-info-label">Germination</div><div class="seed-info-val">${crop.seeds.germination_days} days</div></div>
        <div class="seed-info-item"><div class="seed-info-label">Spacing</div><div class="seed-info-val">${crop.seeds.spacing_cm}</div></div>
        <div class="seed-info-item"><div class="seed-info-label">Sowing Months</div><div class="seed-info-val">${crop.sowing_months.join(', ')}</div></div>
      </div>
    </div>
    <div class="modal-section">
      <h4>🌿 Care Tips</h4>
      <ul class="care-tips-list">
        ${crop.care_tips.map(t=>`<li>${t}</li>`).join('')}
      </ul>
    </div>`;
  overlay.classList.add('open');
}


// Animated stat counter
function animateCounters() {
  document.querySelectorAll('.stat-n').forEach(el => {
    const target = parseInt(el.textContent);
    if (isNaN(target) || el.dataset.animated) return;
    el.dataset.animated = '1';
    let current = 0;
    const step = Math.max(1, Math.floor(target / 30));
    const interval = setInterval(() => {
      current += step;
      if (current >= target) { current = target; clearInterval(interval); }
      el.textContent = current;
    }, 35);
  });
}

// Subtle parallax on hero orbs
function heroParallax() {
  const hero = document.querySelector('.hero');
  if (!hero) return;
  hero.addEventListener('mousemove', e => {
    const rect = hero.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    const orb1 = document.querySelector('.orb1');
    const orb2 = document.querySelector('.orb2');
    if (orb1) orb1.style.transform = `translate(${x * 30}px, ${y * 20}px)`;
    if (orb2) orb2.style.transform = `translate(${x * -20}px, ${y * -15}px)`;
  });
}

// Init
document.addEventListener('DOMContentLoaded', () => {
  animateCounters();
  heroParallax();
});
loadHomeGrid();
