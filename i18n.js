// AgriSystem i18n — Unified multi-language support (English, Hindi, Gujarati)
const I18N_STORAGE_KEY = "agribot_lang";
const DEFAULT_LANG = "en";
const SUPPORTED_LANGS = ["en", "hi", "gu"];

let currentLang = localStorage.getItem(I18N_STORAGE_KEY) || DEFAULT_LANG;
const langCache = {};

const deepGet = (obj, path) => path.split('.').reduce((acc, key) => acc && acc[key] != null ? acc[key] : null, obj);

async function loadLanguage(lang) {
  if (langCache[lang]) return langCache[lang];
  try {
    const res = await fetch(`translations/${lang}.json`);
    langCache[lang] = await res.json();
    return langCache[lang];
  } catch (err) {
    console.error(`[i18n] Failed to load translations/${lang}.json:`, err);
    return {};
  }
}

function applyTranslations(dict) {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.dataset.i18n;
    const val = deepGet(dict, key);
    if (val != null) el.innerHTML = val;
  });

  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.dataset.i18nPlaceholder;
    const val = deepGet(dict, key);
    if (val != null) el.placeholder = val;
  });

  document.documentElement.lang = currentLang;

  // Sync any dropdowns with currentLang
  document.querySelectorAll('#langSelect, .lang-select').forEach(sel => {
    if (sel.value !== currentLang) sel.value = currentLang;
  });
}

async function setLanguage(lang) {
  currentLang = SUPPORTED_LANGS.includes(lang) ? lang : DEFAULT_LANG;
  localStorage.setItem(I18N_STORAGE_KEY, currentLang);
  localStorage.setItem('agri_lang', currentLang);

  const dict = await loadLanguage(currentLang);
  applyTranslations(dict);

  // Trigger page-specific re-renders if available
  if (typeof changeCropLanguage === 'function' && currentCropLang !== currentLang) {
    changeCropLanguage(currentLang);
  }
  if (typeof changeLanguage === 'function' && typeof filterSeeds === 'function') {
    const sel = document.getElementById('langSelect');
    if (sel) sel.value = currentLang;
    changeLanguage();
  }
  if (typeof setPricesLang === 'function') {
    setPricesLang(currentLang);
  }
  if (typeof pricesChangeLang === 'function' && typeof currentPricesLang !== 'undefined' && currentPricesLang !== currentLang) {
    pricesChangeLang(currentLang);
  }
  if (typeof renderSeasonCards === 'function' && typeof _allSeasonData !== 'undefined' && _allSeasonData.length) {
    renderSeasonCards(_allSeasonData);
  }
  if (typeof loadSoils === 'function' && typeof _allSoilData !== 'undefined' && _allSoilData.length) {
    renderSoilCards(_allSoilData);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('#langSelect, .lang-select').forEach(s => {
    s.addEventListener('change', e => setLanguage(e.target.value));
  });
  setLanguage(currentLang);
});

window.i18n = { setLanguage, currentLang: () => currentLang };
