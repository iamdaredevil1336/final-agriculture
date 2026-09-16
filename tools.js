// ========================================================
//  AgriSystem — Smart Agricultural Tools Suite (EN / HI / GU)
//  1. AI Crop Disease & Pest Scanner (Gemini Vision)
//  2. Fertilizer & Seed Rate Calculator
//  3. Crop Profit & Revenue Estimator
// ========================================================

(function () {
  'use strict';

  // --------------------------------------------------------
  // 1. CROP DOCTOR (AI DISEASE & PEST SCANNER)
  // --------------------------------------------------------
  let currentScanImageBase64 = null;

  window.openCropDoctor = function () {
    let modal = document.getElementById('doctorModal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'doctorModal';
      modal.className = 'modal-overlay';
      modal.innerHTML = `
        <div class="modal doctor-modal" role="dialog" aria-modal="true">
          <button class="modal-close" onclick="closeCropDoctor()" aria-label="Close">✕</button>
          <div class="modal-body">
            <div class="doctor-header">
              <span class="doctor-badge">🌿 AI AgriDoctor</span>
              <h2 class="doctor-title" id="docTitle">Crop Disease & Pest Scanner</h2>
              <p class="doctor-sub" id="docSub">Upload or snap a photo of an infected leaf or plant to diagnose diseases and get instant organic & chemical treatments.</p>
            </div>

            <div class="doctor-upload-zone" id="doctorDropZone" onclick="document.getElementById('doctorFileInput').click()">
              <input type="file" id="doctorFileInput" accept="image/*" capture="environment" style="display:none" onchange="handleDoctorImageSelect(event)">
              <div id="doctorUploadPrompt">
                <span class="doctor-upload-icon">📷</span>
                <p class="doctor-upload-text" id="docUploadText"><strong>Click to upload</strong> or capture with camera</p>
                <span class="doctor-upload-hint" id="docUploadHint">Supports JPG, PNG, WEBP (Leaf / Stem / Fruit)</span>
              </div>
              <div id="doctorPreviewWrap" style="display:none">
                <img id="doctorPreviewImg" class="doctor-preview-img" alt="Crop Leaf Preview">
                <button type="button" class="doctor-change-btn" onclick="event.stopPropagation(); document.getElementById('doctorFileInput').click()">🔄 Change Photo</button>
              </div>
            </div>

            <div class="doctor-notes-wrap">
              <label for="doctorNotes" class="doctor-notes-label" id="docNotesLabel">Additional Notes (Optional):</label>
              <input type="text" id="doctorNotes" class="doctor-notes-input" placeholder="e.g. Wheat leaves turning yellow, seen after heavy rain...">
            </div>

            <button class="btn btn-primary doctor-scan-btn" id="doctorScanBtn" onclick="runCropDiagnosis()">
              <span id="docScanBtnText">🔍 Diagnose with Gemini AI</span>
            </button>

            <div class="doctor-loading" id="doctorLoading" style="display:none">
              <div class="doctor-spinner"></div>
              <p id="docLoadingText">Scanning leaf pathology with Gemini Vision…</p>
            </div>

            <div class="doctor-result-card" id="doctorResult" style="display:none"></div>
          </div>
        </div>
      `;
      document.body.appendChild(modal);
    }
    updateDoctorLabels();
    modal.classList.add('open');
  };

  window.closeCropDoctor = function () {
    const modal = document.getElementById('doctorModal');
    if (modal) modal.classList.remove('open');
  };

  window.handleDoctorImageSelect = function (e) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (evt) {
      currentScanImageBase64 = evt.target.result;
      document.getElementById('doctorUploadPrompt').style.display = 'none';
      const prevWrap = document.getElementById('doctorPreviewWrap');
      const prevImg = document.getElementById('doctorPreviewImg');
      prevImg.src = currentScanImageBase64;
      prevWrap.style.display = 'block';
      document.getElementById('doctorResult').style.display = 'none';
    };
    reader.readAsDataURL(file);
  };

  window.runCropDiagnosis = async function () {
    if (!currentScanImageBase64) {
      const curLang = localStorage.getItem('agribot_lang') || 'en';
      alert(curLang === 'gu' ? 'કૃપા કરીને પહેલા પાક અથવા પાંદડાનો ફોટો અપલોડ કરો.' : curLang === 'hi' ? 'कृपया पहले फसल या पत्ती की फोटो अपलोड करें।' : 'Please upload or capture a photo of the crop leaf first.');
      return;
    }

    const curLang = localStorage.getItem('agribot_lang') || 'en';
    const btn = document.getElementById('doctorScanBtn');
    const loading = document.getElementById('doctorLoading');
    const resultWrap = document.getElementById('doctorResult');
    const notes = (document.getElementById('doctorNotes') && document.getElementById('doctorNotes').value) || '';

    btn.disabled = true;
    loading.style.display = 'block';
    resultWrap.style.display = 'none';

    try {
      const response = await fetch('/api/diagnose-crop', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: currentScanImageBase64,
          notes: notes,
          lang: curLang
        })
      });

      const resData = await response.json();
      if (!resData.success) throw new Error(resData.error || 'Diagnosis failed');

      renderDoctorResult(resData.data, curLang);
    } catch (err) {
      console.error('[Doctor Error]', err);
      resultWrap.style.display = 'block';
      resultWrap.innerHTML = `
        <div class="doctor-error-banner">
          ⚠️ ` + (curLang === 'gu' ? 'નિદાન કરવામાં ભૂલ આવી. કૃપા કરીને સ્પષ્ટ ફોટો સાથે ફરી પ્રયાસ કરો.' : curLang === 'hi' ? 'निदान में त्रुटि हुई। कृपया स्पष्ट फोटो के साथ पुनः प्रयास करें।' : 'Diagnosis error. Please try again with a clear photo.') + `
        </div>
      `;
    } finally {
      btn.disabled = false;
      loading.style.display = 'none';
    }
  };

  function renderDoctorResult(diag, lang) {
    const wrap = document.getElementById('doctorResult');
    if (!wrap) return;

    const lbl = {
      en: { crop: 'Crop Identified', severity: 'Severity', symptoms: 'Key Symptoms', organic: '🌱 Organic & Biological Remedies', chemical: '🧪 Recommended Treatment & Fungicide', prevention: '🛡️ Preventive Measures' },
      hi: { crop: 'पहचानी गई फसल', severity: 'गंभीरता', symptoms: 'मुख्य लक्षण', organic: '🌱 जैविक व प्राकृतिक उपचार', chemical: '🧪 रासायनिक उपचार व छिड़काव', prevention: '🛡️ रोकथाम के उपाय' },
      gu: { crop: 'ઓળખાયેલ પાક', severity: 'તીવ્રતા', symptoms: 'મુખ્ય લક્ષણો', organic: '🌱 જૈવિક અને કુદરતી ઉપાયો', chemical: '🧪 રાસાયણિક ઉપચાર અને છંટકાવ', prevention: '🛡️ નિવારક પગલાં' }
    }[lang] || { crop: 'Crop Identified', severity: 'Severity', symptoms: 'Key Symptoms', organic: '🌱 Organic & Biological Remedies', chemical: '🧪 Recommended Treatment & Fungicide', prevention: '🛡️ Preventive Measures' };

    const severityClass = (diag.severity || '').toLowerCase().includes('severe') ? 'sev-high' : (diag.severity || '').toLowerCase().includes('moderate') ? 'sev-med' : 'sev-low';

    wrap.innerHTML = `
      <div class="doctor-res-head">
        <div class="doctor-res-title-wrap">
          <span class="doctor-res-crop">${diag.crop_identified || 'Crop Plant'}</span>
          <h3 class="doctor-res-disease">${diag.disease_name || 'Disease Detected'}</h3>
        </div>
        <span class="doctor-severity-badge ${severityClass}">${diag.severity || 'Moderate'}</span>
      </div>

      <div class="doctor-res-meta">
        <span><strong>Type:</strong> ${diag.pathogen_type || 'Plant Pathology'}</span>
      </div>

      <div class="doctor-res-sec">
        <h4>⚠️ ${lbl.symptoms}</h4>
        <ul>${(diag.symptoms || []).map(s => `<li>${s}</li>`).join('')}</ul>
      </div>

      <div class="doctor-res-sec bio-sec">
        <h4>${lbl.organic}</h4>
        <ul>${(diag.organic_treatment || []).map(t => `<li>${t}</li>`).join('')}</ul>
      </div>

      <div class="doctor-res-sec chem-sec">
        <h4>${lbl.chemical}</h4>
        <ul>${(diag.chemical_treatment || []).map(t => `<li>${t}</li>`).join('')}</ul>
      </div>

      <div class="doctor-res-sec prev-sec">
        <h4>${lbl.prevention}</h4>
        <ul>${(diag.prevention_tips || []).map(t => `<li>${t}</li>`).join('')}</ul>
      </div>
    `;
    wrap.style.display = 'block';
  }

  function updateDoctorLabels() {
    const lang = localStorage.getItem('agribot_lang') || 'en';
    const texts = {
      en: {
        title: 'Crop Disease & Pest Scanner',
        sub: 'Upload or snap a photo of an infected leaf or plant to diagnose diseases and get instant organic & chemical treatments.',
        upload: '<strong>Click to upload</strong> or capture with camera',
        hint: 'Supports JPG, PNG, WEBP (Leaf / Stem / Fruit)',
        notes: 'Additional Notes (Optional):',
        placeholder: 'e.g. Wheat leaves turning yellow, seen after heavy rain...',
        btn: '🔍 Diagnose with Gemini AI',
        loading: 'Scanning leaf pathology with Gemini Vision…'
      },
      hi: {
        title: 'फसल रोग व कीट स्कैनर (AI डॉक्टर)',
        sub: 'संक्रमित पत्ती या पौधे की तस्वीर अपलोड करें और तुरंत सटीक बीमारी पहचान व जैविक/रासायनिक उपचार पाएं।',
        upload: '<strong>अपलोड करने के लिए क्लिक करें</strong> या कैमरा से फोटो लें',
        hint: 'समर्थित फॉर्मेट: JPG, PNG, WEBP (पत्ती / तना / फल)',
        notes: 'अतिरिक्त जानकारी (वैकल्पिक):',
        placeholder: 'उदा. गेहूं की पत्तियां पीली पड़ रही हैं, बारिश के बाद देखा...',
        btn: '🔍 AI से फसल की जांच करें',
        loading: 'Gemini Vision से पत्ती की जांच हो रही है…'
      },
      gu: {
        title: 'પાક રોગ અને જીવાત સ્કેનર (AI ડોક્ટર)',
        sub: 'રોગગ્રસ્ત પાંદડા અથવા છોડનો ફોટો અપલોડ કરો અને ત્વરિત સચોટ રોગ નિદાન તથા જૈવિક/રાસાયણિક ઉપાયો મેળવો.',
        upload: '<strong>અપલોડ કરવા ક્લિક કરો</strong> અથવા કેમેરાથી ફોટો પાડો',
        hint: 'સપોર્ટેડ: JPG, PNG, WEBP (પાંદડું / થડ / ફળ)',
        notes: 'વધારાની વિગત (વૈકલ્પિક):',
        placeholder: 'દા.ત. ઘઉંના પાંદડા પીળા પડી રહ્યા છે, વરસાદ પછી જોવા મળ્યું...',
        btn: '🔍 AI દ્વારા પાકનું નિદાન કરો',
        loading: 'Gemini Vision દ્વારા પાંદડાનું વિશ્લેષણ ચાલુ છે…'
      }
    };
    const t = texts[lang] || texts.en;
    const titleEl = document.getElementById('docTitle');
    if (titleEl) titleEl.textContent = t.title;
    const subEl = document.getElementById('docSub');
    if (subEl) subEl.textContent = t.sub;
    const upText = document.getElementById('docUploadText');
    if (upText) upText.innerHTML = t.upload;
    const hintText = document.getElementById('docUploadHint');
    if (hintText) hintText.textContent = t.hint;
    const notesLabel = document.getElementById('docNotesLabel');
    if (notesLabel) notesLabel.textContent = t.notes;
    const notesInput = document.getElementById('doctorNotes');
    if (notesInput) notesInput.placeholder = t.placeholder;
    const scanBtn = document.getElementById('docScanBtnText');
    if (scanBtn) scanBtn.textContent = t.btn;
    const loadText = document.getElementById('docLoadingText');
    if (loadText) loadText.textContent = t.loading;
  }

  // --------------------------------------------------------
  // 2. FERTILIZER & SEED RATE CALCULATOR
  // --------------------------------------------------------
  const FERTILIZER_DB = {
    wheat: { name: 'Wheat (गेहूं / ઘઉં)', seedPerAcre: 45, seedUnit: 'kg', ureaKg: 110, dapKg: 55, mopKg: 25, zincKg: 10, waterCycles: '4-6 irrigations (Crown root, tillering, flowering, dough)', basal: 'Full DAP + Full MOP + 1/3rd Urea at sowing', topdress: 'Remaining Urea in 2 split doses after 1st and 2nd irrigation' },
    rice: { name: 'Rice / Paddy (धान / ડાંગર)', seedPerAcre: 10, seedUnit: 'kg', ureaKg: 130, dapKg: 60, mopKg: 35, zincKg: 12, waterCycles: 'Continuous 5 cm standing water till grain hardening', basal: 'Full DAP + 50% MOP + 1/3rd Urea + Zinc at transplanting', topdress: '1/3rd Urea at tillering, 1/3rd Urea + 50% MOP at panicle initiation' },
    cotton: { name: 'Cotton (कपास / કપાસ)', seedPerAcre: 1.5, seedUnit: 'kg (Bt seeds)', ureaKg: 90, dapKg: 50, mopKg: 40, zincKg: 10, waterCycles: '5-8 irrigations (critical at flowering & boll formation)', basal: 'Full DAP + 1/2 MOP + 1/4th Urea at sowing', topdress: 'Remaining Urea in 3 splits at squaring, flowering, and boll development' },
    maize: { name: 'Maize (मक्का / મકાઈ)', seedPerAcre: 8, seedUnit: 'kg', ureaKg: 105, dapKg: 50, mopKg: 30, zincKg: 10, waterCycles: '4-6 irrigations (Knee-high, tasseling, and silking stages)', basal: 'Full DAP + Full MOP + 1/3rd Urea at sowing', topdress: '1/3rd Urea at knee-high, 1/3rd at tasseling stage' },
    potato: { name: 'Potato (आलू / બટાકા)', seedPerAcre: 550, seedUnit: 'kg (seed tubers)', ureaKg: 120, dapKg: 80, mopKg: 60, zincKg: 10, waterCycles: '7-10 light irrigations every 8-10 days', basal: 'Full DAP + Full MOP + 1/2 Urea at planting/furrowing', topdress: 'Remaining 1/2 Urea at first earthing up (30 days)' },
    tomato: { name: 'Tomato (टमाटर / ટામેટા)', seedPerAcre: 0.15, seedUnit: 'kg', ureaKg: 80, dapKg: 60, mopKg: 50, zincKg: 8, waterCycles: '8-12 irrigations (drip irrigation strongly recommended)', basal: 'Full DAP + 1/2 MOP + 1/3rd Urea before transplanting', topdress: 'Remaining Urea & MOP in weekly fertigation or 3 split soil doses' },
    groundnut: { name: 'Groundnut (मूंगफली / મગફળી)', seedPerAcre: 55, seedUnit: 'kg kernels', ureaKg: 25, dapKg: 50, mopKg: 30, zincKg: 10, gypsumKg: 200, waterCycles: '4-5 irrigations (flowering and pegging are critical)', basal: 'Full Urea + Full DAP + Full MOP at sowing', topdress: 'Apply 200 kg Gypsum/acre at 40-45 days (pegging stage)' },
    mustard: { name: 'Mustard (सरसों / રાઈ)', seedPerAcre: 2, seedUnit: 'kg', ureaKg: 70, dapKg: 40, mopKg: 15, sulfurKg: 15, waterCycles: '2-3 irrigations (branching and pod filling)', basal: 'Full DAP + Full MOP + Full Sulfur + 1/2 Urea at sowing', topdress: 'Remaining 1/2 Urea at 1st irrigation (30-35 days)' },
    soybean: { name: 'Soybean (सोयाबीन / સોયાબીન)', seedPerAcre: 30, seedUnit: 'kg', ureaKg: 25, dapKg: 50, mopKg: 25, zincKg: 10, waterCycles: '2-3 protective irrigations during dry spells', basal: 'Full NPK at sowing with Rhizobium seed inoculation', topdress: 'Foliar spray of 2% DAP or Urea at flowering if needed' },
    onion: { name: 'Onion (प्याज़ / ડુંગળી)', seedPerAcre: 4, seedUnit: 'kg', ureaKg: 85, dapKg: 50, mopKg: 40, zincKg: 10, waterCycles: '10-14 light irrigations (stop 10 days before harvest)', basal: 'Full DAP + Full MOP + 1/3rd Urea at transplanting', topdress: 'Remaining Urea in 2 splits at 30 and 45 days after transplanting' },
    chickpea: { name: 'Chickpea / Gram (चना / ચણા)', seedPerAcre: 32, seedUnit: 'kg', ureaKg: 20, dapKg: 45, mopKg: 15, zincKg: 8, waterCycles: '1-2 light irrigations (branching and pod development)', basal: 'Full DAP + Full MOP + Starter Urea at sowing with Rhizobium', topdress: 'Avoid excess nitrogen; foliar micronutrient spray at pod formation' },
    sugarcane: { name: 'Sugarcane (गन्ना / શેરડી)', seedPerAcre: 2800, seedUnit: 'three-bud setts', ureaKg: 250, dapKg: 100, mopKg: 80, zincKg: 15, waterCycles: '15-20 irrigations (every 10-12 days)', basal: 'Full DAP + 1/3rd MOP + 1/4th Urea at furrow planting', topdress: 'Remaining Urea & MOP in 3 split doses at 45, 90, and 120 days' }
  };

  window.openFertilizerCalculator = function () {
    let modal = document.getElementById('fertilizerModal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'fertilizerModal';
      modal.className = 'modal-overlay';
      modal.innerHTML = `
        <div class="modal fert-modal" role="dialog" aria-modal="true">
          <button class="modal-close" onclick="closeFertilizerCalculator()" aria-label="Close">✕</button>
          <div class="modal-body">
            <div class="fert-header">
              <span class="fert-badge">🌾 AgriCalculator</span>
              <h2 class="fert-title" id="fertTitle">Fertilizer & Seed Rate Calculator</h2>
              <p class="fert-sub" id="fertSub">Calculate exact required seeds, Urea bags, DAP, Potash, and irrigation schedule customized for your land area.</p>
            </div>

            <div class="fert-form-grid">
              <div class="form-group">
                <label for="fertCropSelect" id="fertCropLabel">Select Crop:</label>
                <select id="fertCropSelect" class="form-select" onchange="calculateFertilizer()">
                  <option value="wheat">🌾 Wheat (गेहूं / ઘઉં)</option>
                  <option value="rice">🍚 Rice / Paddy (धान / ડાંગર)</option>
                  <option value="cotton">🪴 Cotton (कपास / કપાસ)</option>
                  <option value="maize">🌽 Maize (मक्का / મકાઈ)</option>
                  <option value="potato">🥔 Potato (आलू / બટાકા)</option>
                  <option value="tomato">🍅 Tomato (टमाटर / ટામેટા)</option>
                  <option value="groundnut">🥜 Groundnut (मूंगफली / મગફળી)</option>
                  <option value="mustard">🌼 Mustard (सरसों / રાઈ)</option>
                  <option value="soybean">🟫 Soybean (सोयाबीन / સોયાબીન)</option>
                  <option value="onion">🧅 Onion (प्याज़ / ડુંગળી)</option>
                  <option value="chickpea">🫘 Chickpea (चना / ચણા)</option>
                  <option value="sugarcane">🎋 Sugarcane (गन्ना / શેરડી)</option>
                </select>
              </div>

              <div class="form-group">
                <label for="fertAreaInput" id="fertAreaLabel">Land Area:</label>
                <div class="fert-input-group">
                  <input type="number" id="fertAreaInput" class="form-input" value="1" min="0.1" step="0.1" oninput="calculateFertilizer()">
                  <select id="fertUnitSelect" class="form-select" onchange="calculateFertilizer()">
                    <option value="acre">Acres (एकड़ / એકર)</option>
                    <option value="bigha">Bigha (बीघा / વીઘા - 0.62 ac)</option>
                    <option value="hectare">Hectares (हेक्टेयर / હેક્ટર)</option>
                    <option value="guntha">Guntha / Cent (गुंठा / ગૂંઠા)</option>
                  </select>
                </div>
              </div>
            </div>

            <div class="fert-results-wrap" id="fertResults"></div>
          </div>
        </div>
      `;
      document.body.appendChild(modal);
    }
    updateFertLabels();
    modal.classList.add('open');
    calculateFertilizer();
  };

  window.closeFertilizerCalculator = function () {
    const modal = document.getElementById('fertilizerModal');
    if (modal) modal.classList.remove('open');
  };

  window.calculateFertilizer = function () {
    const cropKey = document.getElementById('fertCropSelect')?.value || 'wheat';
    const areaVal = parseFloat(document.getElementById('fertAreaInput')?.value) || 1;
    const unitVal = document.getElementById('fertUnitSelect')?.value || 'acre';
    const resWrap = document.getElementById('fertResults');
    if (!resWrap) return;

    let acres = areaVal;
    if (unitVal === 'hectare') acres = areaVal * 2.471;
    else if (unitVal === 'bigha') acres = areaVal * 0.625;
    else if (unitVal === 'guntha') acres = areaVal * 0.025;

    const data = FERTILIZER_DB[cropKey] || FERTILIZER_DB.wheat;
    const totalSeed = (data.seedPerAcre * acres).toFixed(1);
    const totalUreaKg = Math.round(data.ureaKg * acres);
    const ureaBags = (totalUreaKg / 45).toFixed(1);
    const totalDapKg = Math.round(data.dapKg * acres);
    const dapBags = (totalDapKg / 50).toFixed(1);
    const totalMopKg = Math.round(data.mopKg * acres);
    const totalZincKg = data.zincKg ? Math.round(data.zincKg * acres) : null;

    const curLang = localStorage.getItem('agribot_lang') || 'en';
    const lbl = {
      en: { seed: 'Seeds Required', urea: 'Urea (45 kg bags)', dap: 'DAP (50 kg bags)', mop: 'MOP / Potash', zinc: 'Zinc Micronutrient', water: 'Water & Irrigation Schedule', basal: 'Basal Dose (At Sowing / Furrow)', topdress: 'Top Dressing & Foliar Schedule' },
      hi: { seed: 'आवश्यक बीज मात्रा', urea: 'यूरिया (45 किलो बोरी)', dap: 'डीएपी (50 किलो बोरी)', mop: 'एमओपी / पोटाश', zinc: 'जिंक सूक्ष्मपोषक', water: 'सिंचाई व पानी चक्र', basal: 'बेसल खुराक (बुवाई के समय)', topdress: 'टॉप ड्रेसिंग (खड़ी फसल में)' },
      gu: { seed: 'જરૂરી બીજ પ્રમાણ', urea: 'યુરિયા (45 કિગ્રા ગુણી)', dap: 'ડીએપી (50 કિગ્રા ગુણી)', mop: 'એમઓપી / પોટાશ', zinc: 'ઝિંક સૂક્ષ્મ પોષકતત્વ', water: 'પિયત અને પાણીનું સમયપત્રક', basal: 'પાયાનું ખાતર (વાવણી વખતે)', topdress: 'પૂર્તિ ખાતર (ઉભા પાકમાં)' }
    }[curLang] || { seed: 'Seeds Required', urea: 'Urea (45 kg bags)', dap: 'DAP (50 kg bags)', mop: 'MOP / Potash', zinc: 'Zinc Micronutrient', water: 'Water & Irrigation Schedule', basal: 'Basal Dose (At Sowing / Furrow)', topdress: 'Top Dressing & Foliar Schedule' };

    resWrap.innerHTML = `
      <div class="fert-cards-grid">
        <div class="fert-stat-card seed-card">
          <div class="fert-stat-icon">🌱</div>
          <div class="fert-stat-val">${totalSeed} <small>${data.seedUnit}</small></div>
          <div class="fert-stat-lbl">${lbl.seed}</div>
        </div>

        <div class="fert-stat-card urea-card">
          <div class="fert-stat-icon">⚪</div>
          <div class="fert-stat-val">${ureaBags} <small>Bags (${totalUreaKg} kg)</small></div>
          <div class="fert-stat-lbl">${lbl.urea}</div>
        </div>

        <div class="fert-stat-card dap-card">
          <div class="fert-stat-icon">🟤</div>
          <div class="fert-stat-val">${dapBags} <small>Bags (${totalDapKg} kg)</small></div>
          <div class="fert-stat-lbl">${lbl.dap}</div>
        </div>

        <div class="fert-stat-card mop-card">
          <div class="fert-stat-icon">🔴</div>
          <div class="fert-stat-val">${totalMopKg} <small>kg</small></div>
          <div class="fert-stat-lbl">${lbl.mop}</div>
        </div>
      </div>

      <div class="fert-schedule-box">
        <h4>🗓️ ${lbl.water}</h4>
        <p><strong>💧 ${data.waterCycles}</strong></p>

        <div class="fert-timeline">
          <div class="fert-timeline-item">
            <span class="fert-step-badge">1</span>
            <div>
              <strong>${lbl.basal}:</strong>
              <p>${data.basal}${totalZincKg ? ` + ${totalZincKg} kg Zinc Sulfate` : ''}</p>
            </div>
          </div>
          <div class="fert-timeline-item">
            <span class="fert-step-badge">2</span>
            <div>
              <strong>${lbl.topdress}:</strong>
              <p>${data.topdress}</p>
            </div>
          </div>
        </div>
      </div>
    `;
  };

  function updateFertLabels() {
    const lang = localStorage.getItem('agribot_lang') || 'en';
    const texts = {
      en: { title: 'Fertilizer & Seed Rate Calculator', sub: 'Calculate exact required seeds, Urea bags, DAP, Potash, and irrigation schedule customized for your land area.', crop: 'Select Crop:', area: 'Land Area:' },
      hi: { title: 'उर्वरक एवं बीज दर कैलकुलेटर', sub: 'अपनी ज़मीन के अनुसार आवश्यक बीज, यूरिया की बोरियां, डीएपी, पोटाश और सिंचाई का सटीक हिसाब लगाएं।', crop: 'फसल चुनें:', area: 'ज़मीन का क्षेत्रफल:' },
      gu: { title: 'ખાતર અને બિયારણ ગણતરી કેલ્ક્યુલેટર', sub: 'તમારી જમીન પ્રમાણે જરૂરી બિયારણ, યુરિયાની થેલીઓ, ડીએપી, પોટાશ અને પિયતનું સચોટ આયોજન મેળવો.', crop: 'પાક પસંદ કરો:', area: 'જમીનનો વિસ્તાર:' }
    };
    const t = texts[lang] || texts.en;
    const titleEl = document.getElementById('fertTitle');
    if (titleEl) titleEl.textContent = t.title;
    const subEl = document.getElementById('fertSub');
    if (subEl) subEl.textContent = t.sub;
    const cropEl = document.getElementById('fertCropLabel');
    if (cropEl) cropEl.textContent = t.crop;
    const areaEl = document.getElementById('fertAreaLabel');
    if (areaEl) areaEl.textContent = t.area;
  }

  // --------------------------------------------------------
  // 3. CROP PROFIT & REVENUE ESTIMATOR
  // --------------------------------------------------------
  const CROP_ECONOMICS = {
    wheat: { name: 'Wheat', yieldPerAcre: 18, mandiPrice: 2450, costPerAcre: 16500 },
    rice: { name: 'Rice (Basmati/Paddy)', yieldPerAcre: 24, mandiPrice: 3100, costPerAcre: 22000 },
    cotton: { name: 'Cotton', yieldPerAcre: 12, mandiPrice: 7200, costPerAcre: 28000 },
    maize: { name: 'Maize', yieldPerAcre: 26, mandiPrice: 2150, costPerAcre: 17000 },
    potato: { name: 'Potato', yieldPerAcre: 100, mandiPrice: 1200, costPerAcre: 45000 },
    tomato: { name: 'Tomato', yieldPerAcre: 150, mandiPrice: 1400, costPerAcre: 55000 },
    groundnut: { name: 'Groundnut', yieldPerAcre: 14, mandiPrice: 6500, costPerAcre: 26000 },
    mustard: { name: 'Mustard', yieldPerAcre: 9, mandiPrice: 5650, costPerAcre: 13500 },
    soybean: { name: 'Soybean', yieldPerAcre: 10, mandiPrice: 4800, costPerAcre: 15000 },
    onion: { name: 'Onion', yieldPerAcre: 110, mandiPrice: 1600, costPerAcre: 48000 },
    chickpea: { name: 'Chickpea / Gram', yieldPerAcre: 8, mandiPrice: 5800, costPerAcre: 14000 },
    sugarcane: { name: 'Sugarcane', yieldPerAcre: 350, mandiPrice: 340, costPerAcre: 42000 }
  };

  window.openProfitEstimator = function () {
    let modal = document.getElementById('profitModal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'profitModal';
      modal.className = 'modal-overlay';
      modal.innerHTML = `
        <div class="modal profit-modal" role="dialog" aria-modal="true">
          <button class="modal-close" onclick="closeProfitEstimator()" aria-label="Close">✕</button>
          <div class="modal-body">
            <div class="profit-header">
              <span class="profit-badge">📈 AgriEconomics</span>
              <h2 class="profit-title" id="profTitle">Crop Profit & Revenue Estimator</h2>
              <p class="profit-sub" id="profSub">Estimate your farm's total crop yield, gross revenue, cultivation costs, and net return on investment (ROI).</p>
            </div>

            <div class="profit-form-grid">
              <div class="form-group">
                <label for="profitCropSelect" id="profCropLabel">Select Crop:</label>
                <select id="profitCropSelect" class="form-select" onchange="onProfitCropChange()">
                  <option value="wheat">🌾 Wheat</option>
                  <option value="rice">🍚 Rice / Paddy</option>
                  <option value="cotton">🪴 Cotton</option>
                  <option value="maize">🌽 Maize</option>
                  <option value="potato">🥔 Potato</option>
                  <option value="tomato">🍅 Tomato</option>
                  <option value="groundnut">🥜 Groundnut</option>
                  <option value="mustard">🌼 Mustard</option>
                  <option value="soybean">🟫 Soybean</option>
                  <option value="onion">🧅 Onion</option>
                  <option value="chickpea">🫘 Chickpea</option>
                  <option value="sugarcane">🎋 Sugarcane</option>
                </select>
              </div>

              <div class="form-group">
                <label for="profitAreaInput" id="profAreaLabel">Land Area (Acres):</label>
                <input type="number" id="profitAreaInput" class="form-input" value="2" min="0.5" step="0.5" oninput="calculateProfit()">
              </div>

              <div class="form-group">
                <label for="profitYieldInput" id="profYieldLabel">Expected Yield / Acre (Quintals):</label>
                <input type="number" id="profitYieldInput" class="form-input" value="18" min="1" step="0.5" oninput="calculateProfit()">
              </div>

              <div class="form-group">
                <label for="profitPriceInput" id="profPriceLabel">Selling Price (₹ per Quintal):</label>
                <input type="number" id="profitPriceInput" class="form-input" value="2450" min="100" step="50" oninput="calculateProfit()">
              </div>

              <div class="form-group form-group-full">
                <label for="profitCostInput" id="profCostLabel">Estimated Cultivation Cost / Acre (₹):</label>
                <input type="number" id="profitCostInput" class="form-input" value="16500" min="1000" step="500" oninput="calculateProfit()">
                <span class="form-hint">Includes seeds, tractor ploughing, fertilizers, labor, pesticides, and harvesting.</span>
              </div>
            </div>

            <div class="profit-results-wrap" id="profitResults"></div>
          </div>
        </div>
      `;
      document.body.appendChild(modal);
    }
    updateProfitLabels();
    modal.classList.add('open');
    onProfitCropChange();
  };

  window.closeProfitEstimator = function () {
    const modal = document.getElementById('profitModal');
    if (modal) modal.classList.remove('open');
  };

  window.onProfitCropChange = function () {
    const cropKey = document.getElementById('profitCropSelect')?.value || 'wheat';
    const eco = CROP_ECONOMICS[cropKey] || CROP_ECONOMICS.wheat;
    const yieldInput = document.getElementById('profitYieldInput');
    const priceInput = document.getElementById('profitPriceInput');
    const costInput = document.getElementById('profitCostInput');

    if (yieldInput) yieldInput.value = eco.yieldPerAcre;
    if (priceInput) priceInput.value = eco.mandiPrice;
    if (costInput) costInput.value = eco.costPerAcre;

    calculateProfit();
  };

  window.calculateProfit = function () {
    const area = parseFloat(document.getElementById('profitAreaInput')?.value) || 1;
    const yieldPerAcre = parseFloat(document.getElementById('profitYieldInput')?.value) || 0;
    const pricePerQtl = parseFloat(document.getElementById('profitPriceInput')?.value) || 0;
    const costPerAcre = parseFloat(document.getElementById('profitCostInput')?.value) || 0;
    const resWrap = document.getElementById('profitResults');
    if (!resWrap) return;

    const totalYield = (area * yieldPerAcre).toFixed(1);
    const grossRevenue = Math.round(totalYield * pricePerQtl);
    const totalCost = Math.round(area * costPerAcre);
    const netProfit = grossRevenue - totalCost;
    const profitPerAcre = Math.round(netProfit / area);
    const roi = totalCost > 0 ? ((netProfit / totalCost) * 100).toFixed(1) : '0';

    const isProfitable = netProfit >= 0;
    const curLang = localStorage.getItem('agribot_lang') || 'en';

    const lbl = {
      en: { prod: 'Total Production', rev: 'Gross Revenue', cost: 'Total Cost', profit: 'Net Farm Profit', roi: 'Return on Investment (ROI)', perAcre: 'per acre' },
      hi: { prod: 'कुल उत्पादन', rev: 'कुल आय (राजस्व)', cost: 'कुल लागत', profit: 'शुद्ध मुनाफा', roi: 'निवेश पर लाभ (ROI)', perAcre: 'प्रति एकड़' },
      gu: { prod: 'કુલ ઉત્પાદન', rev: 'કુલ આવક', cost: 'કુલ ખર્ચ', profit: 'ચોખ્ખો નફો', roi: 'રોકાણ પર વળતર (ROI)', perAcre: 'એકર દીઠ' }
    }[curLang] || { prod: 'Total Production', rev: 'Gross Revenue', cost: 'Total Cost', profit: 'Net Farm Profit', roi: 'Return on Investment (ROI)', perAcre: 'per acre' };

    resWrap.innerHTML = `
      <div class="profit-banner ${isProfitable ? 'profit-positive' : 'profit-negative'}">
        <div class="profit-banner-main">
          <span class="profit-banner-title">${lbl.profit}</span>
          <span class="profit-banner-val">₹${netProfit.toLocaleString('en-IN')}</span>
          <span class="profit-banner-sub">₹${profitPerAcre.toLocaleString('en-IN')} ${lbl.perAcre}</span>
        </div>
        <div class="profit-roi-pill ${isProfitable ? 'roi-good' : 'roi-bad'}">
          <span>ROI: <strong>${roi}%</strong></span>
        </div>
      </div>

      <div class="profit-cards-grid">
        <div class="profit-stat-card">
          <span class="profit-stat-icon">📦</span>
          <span class="profit-stat-val">${totalYield} <small>Qtl</small></span>
          <span class="profit-stat-lbl">${lbl.prod}</span>
        </div>

        <div class="profit-stat-card">
          <span class="profit-stat-icon">💰</span>
          <span class="profit-stat-val">₹${grossRevenue.toLocaleString('en-IN')}</span>
          <span class="profit-stat-lbl">${lbl.rev}</span>
        </div>

        <div class="profit-stat-card">
          <span class="profit-stat-icon">🧾</span>
          <span class="profit-stat-val">₹${totalCost.toLocaleString('en-IN')}</span>
          <span class="profit-stat-lbl">${lbl.cost}</span>
        </div>
      </div>
    `;
  };

  function updateProfitLabels() {
    const lang = localStorage.getItem('agribot_lang') || 'en';
    const texts = {
      en: { title: 'Crop Profit & Revenue Estimator', sub: 'Estimate your farm\'s total crop yield, gross revenue, cultivation costs, and net return on investment (ROI).', crop: 'Select Crop:', area: 'Land Area (Acres):', yld: 'Expected Yield / Acre (Quintals):', price: 'Selling Price (₹ per Quintal):', cost: 'Estimated Cultivation Cost / Acre (₹):' },
      hi: { title: 'फसल मुनाफा व आमदनी कैलकुलेटर', sub: 'अपनी कुल फसल उपज, सकल आय, खेती की लागत और शुद्ध मुनाफे (ROI) का सही आकलन करें।', crop: 'फसल चुनें:', area: 'ज़मीन (एकड़):', yld: 'अनुमानित उपज/एकड़ (क्विंटल):', price: 'बिक्री भाव (₹ प्रति क्विंटल):', cost: 'प्रति एकड़ कुल लागत (₹):' },
      gu: { title: 'પાક નફો અને આવક કેલ્ક્યુલેટર', sub: 'તમારી કુલ ઉપજ, કુલ આવક, ખેતી ખર્ચ અને ચોખ્ખા નફા (ROI) નો ચોક્કસ અંદાજ લગાવો.', crop: 'પાક પસંદ કરો:', area: 'જમીન (એકર):', yld: 'અંદાજિત ઉપજ/એકર (ક્વિન્ટલ):', price: 'વેચાણ ભાવ (₹ પ્રતિ ક્વિન્ટલ):', cost: 'એકર દીઠ કુલ ખર્ચ (₹):' }
    };
    const t = texts[lang] || texts.en;
    const titleEl = document.getElementById('profTitle');
    if (titleEl) titleEl.textContent = t.title;
    const subEl = document.getElementById('profSub');
    if (subEl) subEl.textContent = t.sub;
    const cropEl = document.getElementById('profCropLabel');
    if (cropEl) cropEl.textContent = t.crop;
    const areaEl = document.getElementById('profAreaLabel');
    if (areaEl) areaEl.textContent = t.area;
    const yldEl = document.getElementById('profYieldLabel');
    if (yldEl) yldEl.textContent = t.yld;
    const priceEl = document.getElementById('profPriceLabel');
    if (priceEl) priceEl.textContent = t.price;
    const costEl = document.getElementById('profCostLabel');
    if (costEl) costEl.textContent = t.cost;
  }

  // Listen for language changes across the app
  window.addEventListener('agribot_lang_changed', () => {
    if (document.getElementById('doctorModal')?.classList.contains('open')) updateDoctorLabels();
    if (document.getElementById('fertilizerModal')?.classList.contains('open')) { updateFertLabels(); calculateFertilizer(); }
    if (document.getElementById('profitModal')?.classList.contains('open')) { updateProfitLabels(); calculateProfit(); }
  });

})();
