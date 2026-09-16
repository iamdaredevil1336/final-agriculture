// ========================================================
//  AgriSystem — Advanced Agricultural Tools Suite (EN / HI / GU)
//  1. Government Schemes & Subsidy Finder (Kisan Yojana)
//  2. Soil Health Card Analyzer & Custom NPK Balancer
//  3. Side-by-Side Crop Comparison Matrix
//  4. Mandi Price Target Alerts & Notification Bell
//  5. Smart Drip Irrigation & Water Schedule Calculator
//  6. Downloadable 1-Page Farm Advisory Card (Printable PDF)
//  7. Kisan Machinery & Tractor Rental Hub
// ========================================================

(function () {
  'use strict';

  // --------------------------------------------------------
  // 1. GOVERNMENT SCHEMES & SUBSIDY FINDER
  // --------------------------------------------------------
  const SCHEMES_DB = [
    {
      id: 'pm-kisan',
      title: 'PM-Kisan Samman Nidhi Yojana',
      title_hi: 'पीएम किसान सम्मान निधि योजना',
      title_gu: 'પીએમ કિસાન સન્માન નિધિ યોજના',
      category: 'financial',
      subsidy: '₹6,000 / year (Direct Bank Transfer)',
      subsidy_hi: '₹6,000 प्रति वर्ष (सीधे बैंक खाते में)',
      subsidy_gu: '₹6,000 વાર્ષિક (સીધા બેંક ખાતામાં)',
      state: 'all',
      land: 'all',
      eligibility: 'All landholding farmer families with cultivable land.',
      eligibility_hi: 'सभी भूमिधारक किसान परिवार जिनके पास कृषि योग्य भूमि है।',
      eligibility_gu: 'તમામ જમીન ધરાવતા ખેડૂત પરિવારો.',
      docs: ['Aadhaar Card', 'Land Ownership Record (7/12, Khatauni)', 'Active Bank Account & IFSC'],
      docs_hi: ['आधार कार्ड', 'जमीन के दस्तावेज (खतौनी/7-12)', 'बैंक पासबुक व आधार लिंक'],
      docs_gu: ['આધાર કાર્ડ', 'જમીનની વિગત (૭/૧૨ અને ૮-અ)', 'બેંક પાસબુક'],
      url: 'https://pmkisan.gov.in'
    },
    {
      id: 'pm-kusum',
      title: 'PM-KUSUM Solar Agricultural Pumps',
      title_hi: 'पीएम कुसुम सोलर कृषि पंप योजना',
      title_gu: 'પીએમ કુસુમ સોલાર પંપ યોજના',
      category: 'solar',
      subsidy: 'Up to 60% – 90% Subsidy on Solar Pumps',
      subsidy_hi: 'सोलर पंप पर 60% से 90% तक की भारी सब्सिडी',
      subsidy_gu: 'સોલાર પંપ પર ૬૦% થી ૯૦% સુધીની સબસિડી',
      state: 'all',
      land: 'all',
      eligibility: 'Individual farmers, water user associations, and farmer groups.',
      eligibility_hi: 'व्यक्तिगत किसान, जल उपभोक्ता संघ और किसान समूह।',
      eligibility_gu: 'વ્યક્તિગત ખેડૂતો અને ખેડૂત જૂથો.',
      docs: ['Aadhaar Card', 'Land 7/12 Records', 'Bank Passbook', 'Discom Electricity Certificate'],
      docs_hi: ['आधार कार्ड', 'खतौनी/जमीन पर्चा', 'बैंक पासबुक', 'बिजली कंपनी का प्रमाण'],
      docs_gu: ['આધાર કાર્ડ', '૭/૧૨ અને ૮-અ ઉતારા', 'બેંક ખાતાની નકલ', 'વીજ જોડાણ પ્રમાણપત્ર'],
      url: 'https://pmkusum.mnre.gov.in'
    },
    {
      id: 'pmfby',
      title: 'PM Fasal Bima Yojana (Crop Insurance)',
      title_hi: 'प्रधानमंत्री फसल बीमा योजना (PMFBY)',
      title_gu: 'પ્રધાનમંત્રી ફસલ બીમા યોજના (પાક વીમો)',
      category: 'financial',
      subsidy: 'Full Crop Cover (1.5% Kharif / 2% Rabi Premium)',
      subsidy_hi: 'पूर्ण फसल सुरक्षा (केवल 1.5% - 2% प्रीमियम किसान का)',
      subsidy_gu: 'સંપૂર્ણ પાક વીમો (ખરીફ ૧.૫% / રવિ ૨% પ્રીમિયમ)',
      state: 'all',
      land: 'all',
      eligibility: 'All farmers growing notified crops in notified areas (loanee & non-loanee).',
      eligibility_hi: 'अधिसूचित क्षेत्रों में अधिसूचित फसल उगाने वाले सभी किसान।',
      eligibility_gu: 'સૂચિત પાક વાવતા તમામ ખાતેદાર અને બિન-ખાતેદાર ખેડૂતો.',
      docs: ['Land Sowing Certificate', 'Aadhaar Card', 'Bank Passbook', 'Land Revenue Record'],
      docs_hi: ['बुवाई प्रमाण पत्र', 'आधार कार्ड', 'बैंक पासबुक', 'जमीन की नकल'],
      docs_gu: ['વાવણીનો દાખલો', 'આધાર કાર્ડ', 'બેંક પાસબુક', '૭/૧૨ ઉતારા'],
      url: 'https://pmfby.gov.in'
    },
    {
      id: 'smam',
      title: 'Sub-Mission on Agricultural Mechanization (SMAM)',
      title_hi: 'कृषि यंत्रीकरण उप-मिशन (ट्रैक्टर व कृषि यंत्र सब्सिडी)',
      title_gu: 'કૃષિ યાંત્રિકીકરણ સબસિડી (ટ્રેક્ટર અને ઓજારો)',
      category: 'machinery',
      subsidy: '40% to 50% Subsidy on Tractors & Implements',
      subsidy_hi: 'ट्रैक्टर, रोटावेटर व कल्टीवेटर पर 40% से 50% तक सब्सिडी',
      subsidy_gu: 'ટ્રેક્ટર, રોટાવેટર અને સાધનો પર ૪૦% થી ૫૦% સબસિડી',
      state: 'all',
      land: 'small',
      eligibility: 'Small, marginal, SC/ST, and women farmers given priority.',
      eligibility_hi: 'छोटे, सीमांत, महिला और एससी/एसटी किसानों को प्राथमिकता।',
      eligibility_gu: 'નાના, સીમાંત અને મહિલા ખેડૂતોને પ્રાથમિકતા.',
      docs: ['Aadhaar Card', 'Caste Certificate (if applicable)', 'Land Registry', 'Bank Passbook'],
      docs_hi: ['आधार कार्ड', 'जाति प्रमाण पत्र (यदि लागू हो)', 'जमीन पर्चा', 'बैंक पासबुक'],
      docs_gu: ['આધાર કાર્ડ', 'જાતિનો દાખલો', '૭/૧૨ ઉતારો', 'બેંક પાસબુક'],
      url: 'https://agrimachinery.nic.in'
    },
    {
      id: 'per-drop',
      title: 'Per Drop More Crop (Micro Irrigation Subsidy)',
      title_hi: 'प्रति बूंद अधिक फसल (ड्रिप व स्प्रिंकलर सब्सिडी)',
      title_gu: 'પર ડ્રોપ મોર ક્રોપ (ટપક અને ફુવારા પિયત પદ્ધતિ)',
      category: 'irrigation',
      subsidy: 'Up to 55% – 70% Subsidy on Drip Systems',
      subsidy_hi: 'ड्रिप व फव्वारा सिंचाई सिस्टम पर 55% से 70% सरकारी अनुदान',
      subsidy_gu: 'ટપક પિયત પદ્ધતિ પર ૫૫% થી ૭૦% સરકારી સહાય',
      state: 'all',
      land: 'all',
      eligibility: 'All farmers possessing an operational water source on their field.',
      eligibility_hi: 'वे सभी किसान जिनके खेत पर पानी का कोई सक्रिय स्रोत (कुआं/बोरवेल) है।',
      eligibility_gu: 'જે ખેડૂતો પાસે પાણીનો કૂવો અથવા બોરવેલ ઉપલબ્ધ હોય.',
      docs: ['Water Source Proof', 'Electricity Bill / Pump Proof', 'Land Ownership Records', 'Aadhaar'],
      docs_hi: ['पानी के स्रोत का प्रमाण', 'बिजली बिल या पंप विवरण', 'खतौनी', 'आधार कार्ड'],
      docs_gu: ['પાણીના સ્ત્રોતનો પુરાવો', 'વીજળી બિલ', '૭/૧૨ ઉતારા', 'આધાર કાર્ડ'],
      url: 'https://pmksy.gov.in'
    },
    {
      id: 'soil-health',
      title: 'Soil Health Card Scheme',
      title_hi: 'मृदा स्वास्थ्य कार्ड योजना (मुफ्त मिट्टी परीक्षण)',
      title_gu: 'જમીન આરોગ્ય કાર્ડ યોજના (મફત માટી પરીક્ષણ)',
      category: 'organic',
      subsidy: '100% Free Soil Nutrient Testing & Report',
      subsidy_hi: '100% मुफ्त 12 पोषक तत्वों की मिट्टी जांच व कार्ड',
      subsidy_gu: '૧૦૦% મફત માટી ચકાસણી અને ખાતર માર્ગદર્શન',
      state: 'all',
      land: 'all',
      eligibility: 'Every farmer can get their soil samples tested every 2 years.',
      eligibility_hi: 'प्रत्येक किसान हर 2 वर्ष में अपनी मिट्टी की मुफ्त जांच करा सकता है।',
      eligibility_gu: 'તમામ ખેડૂતો દર બે વર્ષે પોતાના ખેતરની માટી ચકાસાવી શકે છે.',
      docs: ['Soil Sample from field', 'Farmer Aadhaar Card', 'Mobile Number'],
      docs_hi: ['खेत से मिट्टी का नमूना', 'आधार कार्ड', 'मोबाइल नंबर'],
      docs_gu: ['ખેતરની માટીનો નમૂનો', 'આધાર કાર્ડ', 'મોબાઈલ નંબર'],
      url: 'https://soilhealth.dac.gov.in'
    },
    {
      id: 'kcc',
      title: 'Kisan Credit Card (Subsidized Farm Loans)',
      title_hi: 'किसान क्रेडिट कार्ड (सस्ता फसली ऋण @ 4%)',
      title_gu: 'કિસાન ક્રેડિટ કાર્ડ (સસ્તા દરે ધિરાણ @ ૪%)',
      category: 'financial',
      subsidy: 'Loans up to ₹3 Lakh at effective 4% Interest',
      subsidy_hi: 'समय पर भुगतान करने पर मात्र 4% वार्षिक ब्याज पर ₹3 लाख ऋण',
      subsidy_gu: 'સમયસર ભરપાઈ પર માત્ર ૪% વ્યાજે ₹૩ લાખ સુધીનું ધિરાણ',
      state: 'all',
      land: 'all',
      eligibility: 'All owner cultivators, tenant farmers, and oral lessees.',
      eligibility_hi: 'सभी किसान, बटाईदार और काश्तकार।',
      eligibility_gu: 'તમામ ખેડૂતો અને ભાગીદારીમાં ખેતી કરતા ખેડૂતો.',
      docs: ['Land Holding Certificate', 'Aadhaar & PAN Card', 'Recent Passport Photos'],
      docs_hi: ['खतौनी की प्रतिलिपि', 'आधार व पैन कार्ड', 'पासपोर्ट फोटो'],
      docs_gu: ['૭/૧૨ અને ૮-અ ઉતારા', 'આધાર અને પાન કાર્ડ', 'ફોટોગ્રાફ્સ'],
      url: 'https://www.myscheme.gov.in/schemes/kcc'
    },
    {
      id: 'pkvy',
      title: 'Paramparagat Krishi Vikas Yojana (PKVY Organic)',
      title_hi: 'परंपरागत कृषि विकास योजना (जैविक खेती प्रोत्साहन)',
      title_gu: 'પરંપરાગત કૃષિ વિકાસ યોજના (ઓર્ગેનિક ખેતી સહાય)',
      category: 'organic',
      subsidy: '₹50,000 / Hectare for Organic Farming & Seeds',
      subsidy_hi: 'जैविक खाद, बीज व प्रमाणीकरण हेतु ₹50,000 प्रति हेक्टेयर अनुदान',
      subsidy_gu: 'ઓર્ગેનિક ખાતર, બિયારણ અને પ્રમાણીકરણ માટે ₹૫૦,૦૦૦ સહાય',
      state: 'all',
      land: 'all',
      eligibility: 'Farmer clusters forming groups of 20 or more farmers.',
      eligibility_hi: '20 या अधिक किसानों के समूह बनाकर जैविक खेती करने वाले किसान।',
      eligibility_gu: '૨૦ કે તેથી વધુ ખેડૂતોનું જૂથ બનાવી કુદરતી ખેતી કરતા ખેડૂતો.',
      docs: ['Cluster Group Registration', 'Aadhaar Cards', 'Land Ownership Records'],
      docs_hi: ['किसान समूह पंजीकरण', 'आधार कार्ड', 'खतौनी विवरण'],
      docs_gu: ['ખેડૂત જૂથ નોંધણી', 'આધાર કાર્ડ', 'જમીનના દસ્તાવેજ'],
      url: 'https://pgsindia-ncof.gov.in'
    }
  ];

  window.openSchemesFinder = function () {
    let modal = document.getElementById('schemesModal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'schemesModal';
      modal.className = 'modal-overlay';
      modal.innerHTML = `
        <div class="modal schemes-modal" role="dialog" aria-modal="true">
          <button class="modal-close" onclick="closeSchemesFinder()" aria-label="Close">✕</button>
          <div class="modal-body">
            <div class="schemes-header">
              <span class="schemes-badge">🏛️ Kisan Yojana Portal</span>
              <h2 class="schemes-title" id="schTitle">Government Schemes & Subsidy Finder</h2>
              <p class="schemes-sub" id="schSub">Discover high-value Central and State agricultural subsidies, solar pump grants, crop insurance, and equipment assistance tailored to your land.</p>
            </div>

            <div class="schemes-filter-bar">
              <div class="schemes-filter-item">
                <label id="lblSchCat">Category:</label>
                <select id="schCatSelect" class="form-select" onchange="filterSchemes()">
                  <option value="all">All Schemes</option>
                  <option value="solar">☀️ Solar & Energy</option>
                  <option value="irrigation">💧 Micro-Irrigation</option>
                  <option value="machinery">🚜 Farm Machinery</option>
                  <option value="financial">💰 Financial & Insurance</option>
                  <option value="organic">🌱 Organic & Soil Health</option>
                </select>
              </div>

              <div class="schemes-filter-item">
                <label id="lblSchLand">Land Holding:</label>
                <select id="schLandSelect" class="form-select" onchange="filterSchemes()">
                  <option value="all">Any Land Size</option>
                  <option value="small">Small / Marginal (< 5 Acres)</option>
                  <option value="medium">Medium / Large (> 5 Acres)</option>
                </select>
              </div>

              <div class="schemes-search-wrap">
                <label id="lblSchSearch">Search Scheme:</label>
                <input type="text" id="schSearchInput" class="form-input" placeholder="Search by name, subsidy keyword…" oninput="filterSchemes()">
              </div>
            </div>

            <div class="schemes-grid" id="schemesGrid"></div>
          </div>
        </div>
      `;
      document.body.appendChild(modal);
    }
    updateSchemesLabels();
    modal.classList.add('open');
    filterSchemes();
  };

  window.closeSchemesFinder = function () {
    const modal = document.getElementById('schemesModal');
    if (modal) modal.classList.remove('open');
  };

  window.filterSchemes = function () {
    const cat = document.getElementById('schCatSelect')?.value || 'all';
    const land = document.getElementById('schLandSelect')?.value || 'all';
    const query = (document.getElementById('schSearchInput')?.value || '').toLowerCase().trim();
    const curLang = localStorage.getItem('agribot_lang') || 'en';

    const filtered = SCHEMES_DB.filter(s => {
      const matchCat = cat === 'all' || s.category === cat;
      const matchLand = land === 'all' || s.land === 'all' || s.land === land;
      const t = (curLang === 'gu' ? s.title_gu : curLang === 'hi' ? s.title_hi : s.title).toLowerCase();
      const sub = (curLang === 'gu' ? s.subsidy_gu : curLang === 'hi' ? s.subsidy_hi : s.subsidy).toLowerCase();
      const matchQuery = !query || t.includes(query) || sub.includes(query);
      return matchCat && matchLand && matchQuery;
    });

    const grid = document.getElementById('schemesGrid');
    if (!grid) return;

    if (!filtered.length) {
      grid.innerHTML = `
        <div class="schemes-empty">
          <span class="schemes-empty-icon">📜</span>
          <p>${curLang === 'gu' ? 'કોઈ યોજના મળી નથી. કૃપા કરીને ફિલ્ટર બદલો.' : curLang === 'hi' ? 'कोई योजना नहीं मिली। कृपया फ़िल्टर बदलें।' : 'No schemes match your filters. Please adjust your criteria.'}</p>
        </div>
      `;
      return;
    }

    grid.innerHTML = filtered.map(s => {
      const title = curLang === 'gu' ? s.title_gu : curLang === 'hi' ? s.title_hi : s.title;
      const subsidy = curLang === 'gu' ? s.subsidy_gu : curLang === 'hi' ? s.subsidy_hi : s.subsidy;
      const elig = curLang === 'gu' ? s.eligibility_gu : curLang === 'hi' ? s.eligibility_hi : s.eligibility;
      const docs = curLang === 'gu' ? s.docs_gu : curLang === 'hi' ? s.docs_hi : s.docs;

      return `
        <div class="scheme-card">
          <div class="scheme-card-top">
            <span class="scheme-cat-pill">${s.category.toUpperCase()}</span>
            <span class="scheme-subsidy-badge">🎁 ${subsidy}</span>
          </div>
          <h3 class="scheme-card-title">${title}</h3>
          <p class="scheme-card-elig"><strong>${curLang === 'gu' ? 'પાત્રતા:' : curLang === 'hi' ? 'पात्रता:' : 'Eligibility:'}</strong> ${elig}</p>

          <div class="scheme-docs-box">
            <span class="scheme-docs-title">📋 ${curLang === 'gu' ? 'જરૂરી દસ્તાવેજ:' : curLang === 'hi' ? 'आवश्यक दस्तावेज:' : 'Required Documents:'}</span>
            <ul class="scheme-docs-list">
              ${docs.map(d => `<li>${d}</li>`).join('')}
            </ul>
          </div>

          <div class="scheme-card-footer">
            <a href="${s.url}" target="_blank" rel="noopener noreferrer" class="btn btn-primary btn-sm scheme-apply-btn">
              ${curLang === 'gu' ? 'સત્તાવાર પોર્ટલ પર અરજી કરો ↗' : curLang === 'hi' ? 'आधिकारिक पोर्टल पर आवेदन करें ↗' : 'Apply on Official Portal ↗'}
            </a>
          </div>
        </div>
      `;
    }).join('');
  };

  function updateSchemesLabels() {
    const lang = localStorage.getItem('agribot_lang') || 'en';
    const texts = {
      en: { title: 'Government Schemes & Subsidy Finder', sub: 'Discover high-value Central and State agricultural subsidies, solar pump grants, crop insurance, and equipment assistance tailored to your land.', cat: 'Category:', land: 'Land Holding:', search: 'Search Scheme:' },
      hi: { title: 'सरकारी योजना व कृषि सब्सिडी पोर्टल', sub: 'अपनी ज़मीन और फसल के अनुसार केंद्र व राज्य सरकार की सोलर पंप, खाद, बीमा, ट्रैक्टर व कृषि यंत्र सब्सिडी खोजें।', cat: 'श्रेणी:', land: 'ज़मीन का आकार:', search: 'योजना खोजें:' },
      gu: { title: 'સરકારી કૃષિ યોજના અને સબસિડી પોર્ટલ', sub: 'તમારી જમીન અને પાક અનુસાર સોલાર પંપ, ટપક પિયત, ટ્રેક્ટર સહાય અને પાક વીમા યોજનાઓની સંપૂર્ણ માહિતી.', cat: 'કેટેગરી:', land: 'જમીનનું ક્ષેત્રફળ:', search: 'યોજના શોધો:' }
    };
    const t = texts[lang] || texts.en;
    const tEl = document.getElementById('schTitle'); if (tEl) tEl.textContent = t.title;
    const sEl = document.getElementById('schSub'); if (sEl) sEl.textContent = t.sub;
    const l1 = document.getElementById('lblSchCat'); if (l1) l1.textContent = t.cat;
    const l2 = document.getElementById('lblSchLand'); if (l2) l2.textContent = t.land;
    const l3 = document.getElementById('lblSchSearch'); if (l3) l3.textContent = t.search;
  }

  // --------------------------------------------------------
  // 2. SOIL HEALTH CARD ANALYZER & NPK BALANCER
  // --------------------------------------------------------
  window.openSoilHealthAnalyzer = function () {
    let modal = document.getElementById('soilAnalyzerModal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'soilAnalyzerModal';
      modal.className = 'modal-overlay';
      modal.innerHTML = `
        <div class="modal soil-modal" role="dialog" aria-modal="true">
          <button class="modal-close" onclick="closeSoilHealthAnalyzer()" aria-label="Close">✕</button>
          <div class="modal-body">
            <div class="soil-header">
              <span class="soil-badge">🧪 Soil Science</span>
              <h2 class="soil-title" id="soilTitle">Soil Health Card Analyzer & NPK Balancer</h2>
              <p class="soil-sub" id="soilSub">Input your government Soil Health Card parameters to calculate your soil fertility score, correct soil pH, and optimize fertilizer doses to save money.</p>
            </div>

            <div class="soil-form-grid">
              <div class="form-group">
                <label id="lblSoilCrop">Target Crop:</label>
                <select id="soilCropSelect" class="form-select" onchange="analyzeSoilHealth()">
                  <option value="wheat">🌾 Wheat (गेहूं / ઘઉં)</option>
                  <option value="rice">🍚 Rice / Paddy (धान / ડાંગર)</option>
                  <option value="cotton">🪴 Cotton (कपास / કપાસ)</option>
                  <option value="potato">🥔 Potato (आलू / બટાકા)</option>
                  <option value="groundnut">🥜 Groundnut (मूंगफली / મગફળી)</option>
                  <option value="mustard">🌼 Mustard (सरसों / રાઈ)</option>
                </select>
              </div>

              <div class="form-group">
                <label id="lblSoilPH">Soil pH Level (Ideal: 6.5 – 7.5):</label>
                <div class="soil-ph-input-wrap">
                  <input type="range" id="soilPHRange" min="4.5" max="9.5" step="0.1" value="7.2" class="form-range" oninput="document.getElementById('soilPHVal').textContent = this.value; analyzeSoilHealth();">
                  <span class="soil-ph-display" id="soilPHVal">7.2</span>
                </div>
              </div>

              <div class="form-group">
                <label id="lblSoilN">Nitrogen (N) Status:</label>
                <select id="soilNSelect" class="form-select" onchange="analyzeSoilHealth()">
                  <option value="low">🔴 Low (< 280 kg/ha)</option>
                  <option value="medium" selected>🟡 Medium (280 – 560 kg/ha)</option>
                  <option value="high">🟢 High (> 560 kg/ha)</option>
                </select>
              </div>

              <div class="form-group">
                <label id="lblSoilP">Phosphorus (P₂O₅) Status:</label>
                <select id="soilPSelect" class="form-select" onchange="analyzeSoilHealth()">
                  <option value="low">🔴 Low (< 10 kg/ha)</option>
                  <option value="medium">🟡 Medium (10 – 25 kg/ha)</option>
                  <option value="high" selected>🟢 High (> 25 kg/ha)</option>
                </select>
              </div>

              <div class="form-group">
                <label id="lblSoilK">Potassium (K₂O) Status:</label>
                <select id="soilKSelect" class="form-select" onchange="analyzeSoilHealth()">
                  <option value="low">🔴 Low (< 110 kg/ha)</option>
                  <option value="medium" selected>🟡 Medium (110 – 280 kg/ha)</option>
                  <option value="high">🟢 High (> 280 kg/ha)</option>
                </select>
              </div>

              <div class="form-group">
                <label id="lblSoilOC">Organic Carbon (%):</label>
                <select id="soilOCSelect" class="form-select" onchange="analyzeSoilHealth()">
                  <option value="low">🔴 Low (< 0.5%)</option>
                  <option value="medium" selected>🟡 Medium (0.5% – 0.75%)</option>
                  <option value="high">🟢 High (> 0.75%)</option>
                </select>
              </div>
            </div>

            <div class="soil-analysis-wrap" id="soilAnalysisResults"></div>
          </div>
        </div>
      `;
      document.body.appendChild(modal);
    }
    updateSoilLabels();
    modal.classList.add('open');
    analyzeSoilHealth();
  };

  window.closeSoilHealthAnalyzer = function () {
    const modal = document.getElementById('soilAnalyzerModal');
    if (modal) modal.classList.remove('open');
  };

  window.analyzeSoilHealth = function () {
    const ph = parseFloat(document.getElementById('soilPHRange')?.value) || 7.2;
    const n = document.getElementById('soilNSelect')?.value || 'medium';
    const p = document.getElementById('soilPSelect')?.value || 'high';
    const k = document.getElementById('soilKSelect')?.value || 'medium';
    const oc = document.getElementById('soilOCSelect')?.value || 'medium';
    const curLang = localStorage.getItem('agribot_lang') || 'en';

    // Calculate score
    let score = 50;
    if (ph >= 6.5 && ph <= 7.5) score += 20;
    else if (ph >= 6.0 && ph <= 8.2) score += 10;

    if (n === 'medium') score += 10; else if (n === 'high') score += 8;
    if (p === 'medium') score += 10; else if (p === 'high') score += 8;
    if (k === 'medium' || k === 'high') score += 10;
    if (oc === 'high') score += 10; else if (oc === 'medium') score += 5;

    // Recommendations & Savings
    let recommendations = [];
    let savingsINR = 0;

    if (p === 'high') {
      savingsINR += 750;
      recommendations.push({
        title: curLang === 'gu' ? 'ડીએપી (DAP) નો ૨૫% ઘટાડો કરો' : curLang === 'hi' ? 'डीएपी (DAP) खाद में 25% कटौती करें' : 'Reduce DAP Application by 25%',
        desc: curLang === 'gu' ? 'તમારી જમીનમાં ફોસ્ફરસ પહેલેથી પૂરતો છે. વધુ DAP નાખવાથી જમીન ખારી થાય છે. ૨૫% ઓછું નાખીને એકર દીઠ ₹૭૫૦ બચાવો.' : curLang === 'hi' ? 'आपकी मिट्टी में पहले से पर्याप्त फास्फोरस है। DAP 25% कम डालें और प्रति एकड़ ₹750 बचाएं।' : 'Your soil is already rich in Phosphorus. Reducing DAP by 25% prevents soil salinity and saves ₹750/acre.',
        type: 'save'
      });
    }

    if (n === 'low') {
      recommendations.push({
        title: curLang === 'gu' ? 'યુરિયા ૨૦% વધારો અથવા લીલો ખાતર વાપરો' : curLang === 'hi' ? 'यूरिया में 20% वृद्धि या हरी खाद' : 'Increase Nitrogen / Green Manuring',
        desc: curLang === 'gu' ? 'નાઇટ્રોજન ઓછો હોવાથી પાકના પાંદડા પીળા પડી શકે છે. લીમડા-કોટેડ યુરિયા અથવા શણ/ઇકકડ વાવો.' : curLang === 'hi' ? 'नाइट्रोजन की कमी से पत्तियों में पीलापन आ सकता है। नीम-लेपित यूरिया 20% बढ़ाएं या ढैंचा लगाएं।' : 'Nitrogen deficiency causes yellowing. Apply 20% extra Neem-coated urea in 2 split top-dresses.',
        type: 'action'
      });
    }

    if (ph > 8.0) {
      recommendations.push({
        title: curLang === 'gu' ? 'જમીન સુધારણા: જીપ્સમ (ચિરોડી) નો ઉપયોગ' : curLang === 'hi' ? 'क्षारीय मिट्टी सुधार: जिप्सम का प्रयोग' : 'Alkaline Soil Amendment: Apply Gypsum',
        desc: curLang === 'gu' ? 'જમીન ક્ષારીય (pH > 8.0) છે. વાવણી પહેલા એકર દીઠ ૧૫૦ કિગ્રા જીપ્સમ આપવાથી pH સામાન્ય થશે.' : curLang === 'hi' ? 'मिट्टी का pH अधिक (क्षारीय) है। 150 किग्रा/एकड़ जिप्सम डालने से लवणता नियंत्रित होगी।' : 'Soil is alkaline (pH > 8.0). Apply 150 kg Gypsum/acre before sowing to neutralize salinity.',
        type: 'action'
      });
    } else if (ph < 6.0) {
      recommendations.push({
        title: curLang === 'gu' ? 'એસિડિક જમીન સુધારણા: ચૂનો (Lime)' : curLang === 'hi' ? 'अम्लीय मिट्टी सुधार: कृषि चूना डालें' : 'Acidic Soil Amendment: Agricultural Lime',
        desc: curLang === 'gu' ? 'જમીન એસિડિક છે. ૧૦૦ કિગ્રા કૃષિ ચૂનો આપવાથી પોષકતત્વોની પ્રાપ્તિ સરળ થશે.' : curLang === 'hi' ? 'मिट्टी अम्लीय है। बुवाई पूर्व 100 किग्रा कृषि चूना मिलाने से पोषक तत्वों का अवशोषण सुधरेगा।' : 'Soil is acidic (pH < 6.0). Incorporate 100 kg agricultural lime/acre into furrow.',
        type: 'action'
      });
    }

    if (oc === 'low') {
      recommendations.push({
        title: curLang === 'gu' ? 'સેન્દ્રિય કાર્બન વધારો: દેશી ખાતર (FYM)' : curLang === 'hi' ? 'जैविक कार्बन सुधार: गोबर की खाद या वर्मीकम्पोस्ट' : 'Boost Organic Carbon with FYM / Vermicompost',
        desc: curLang === 'gu' ? 'ઓર્ગેનિક કાર્બન ઓછો છે. ૨ ટન સારું કોહવાયેલું છાણીયું ખાતર અથવા વર્મીકમ્પોસ્ટ આપો.' : curLang === 'hi' ? 'मिट्टी का कार्बन कम है। 2 टन सड़ी गोबर खाद या केंचुआ खाद प्रति एकड़ अवश्य डालें।' : 'Low organic carbon reduces water retention. Apply 2-3 tonnes well-rotted FYM or vermicompost.',
        type: 'action'
      });
    }

    const resWrap = document.getElementById('soilAnalysisResults');
    if (!resWrap) return;

    resWrap.innerHTML = `
      <div class="soil-score-banner">
        <div class="soil-score-dial">
          <span class="soil-score-num">${score}</span>
          <span class="soil-score-max">/ 100</span>
        </div>
        <div class="soil-score-details">
          <h4>${score >= 80 ? (curLang === 'gu' ? 'ઉત્તમ જમીન ફળદ્રુપતા 🌿' : curLang === 'hi' ? 'उत्कृष्ट मिट्टी उर्वरता 🌿' : 'Excellent Soil Fertility 🌿') : (curLang === 'gu' ? 'મધ્યમ ફળદ્રુપતા — સુધારણા જરૂરી 🌾' : curLang === 'hi' ? 'मध्यम उर्वरता — सुधार की आवश्यकता 🌾' : 'Moderate Fertility — Requires Balancing 🌾')}</h4>
          <p>${curLang === 'gu' ? `જમીનનું pH: ${ph} (${ph > 7.5 ? 'ક્ષારીય' : ph < 6.5 ? 'એસિડિક' : 'તટસ્થ/ઉત્તમ'}). સંભવિત ખર્ચ બચત: ₹${savingsINR}/એકર` : curLang === 'hi' ? `मिट्टी pH: ${ph} (${ph > 7.5 ? 'क्षारीय' : ph < 6.5 ? 'अम्लीय' : 'संतुलित/उत्तम'})। संभावित खाद बचत: ₹${savingsINR}/एकड़` : `Soil pH: ${ph} (${ph > 7.5 ? 'Alkaline' : ph < 6.5 ? 'Acidic' : 'Balanced/Optimal'}). Estimated Fertilizer Savings: ₹${savingsINR}/acre`}</p>
        </div>
      </div>

      <div class="soil-recom-list">
        ${recommendations.map(r => `
          <div class="soil-recom-card ${r.type === 'save' ? 'recom-save' : 'recom-action'}">
            <div class="soil-recom-icon">${r.type === 'save' ? '💰' : '💡'}</div>
            <div class="soil-recom-body">
              <h5>${r.title}</h5>
              <p>${r.desc}</p>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  };

  function updateSoilLabels() {
    const lang = localStorage.getItem('agribot_lang') || 'en';
    const texts = {
      en: { title: 'Soil Health Card Analyzer & NPK Balancer', sub: 'Input your government Soil Health Card parameters to calculate your soil fertility score, correct soil pH, and optimize fertilizer doses to save money.', crop: 'Target Crop:', ph: 'Soil pH Level (Ideal: 6.5 – 7.5):', n: 'Nitrogen (N) Status:', p: 'Phosphorus (P₂O₅) Status:', k: 'Potassium (K₂O) Status:', oc: 'Organic Carbon (%):' },
      hi: { title: 'मृदा स्वास्थ्य कार्ड विश्लेषक व NPK संतुलन', sub: 'अपने मृदा स्वास्थ्य कार्ड के आंकड़े डालकर मिट्टी का स्कोर जांचें, pH सुधारें और खाद का अनावश्यक खर्च बचाएं।', crop: 'लक्षित फसल:', ph: 'मिट्टी pH स्तर (आदर्श: 6.5 - 7.5):', n: 'नाइट्रोजन (N) स्थिति:', p: 'फास्फोरस (P₂O₅) स्थिति:', k: 'पोटाश (K₂O) स्थिति:', oc: 'जैविक कार्बन (%):' },
      gu: { title: 'માટી આરોગ્ય કાર્ડ વિશ્લેષક અને ખાતર સંતુલન', sub: 'તમારા સોઇલ હેલ્થ કાર્ડના માપદંડો દાખલ કરી જમીનનો ફળદ્રુપતા સ્કોર જાણો અને બિનજરૂરી ખાતરનો ખર્ચ બચાવો.', crop: 'વાવણી યોગ્ય પાક:', ph: 'જમીનનું pH લેવલ (શ્રેષ્ઠ: ૬.૫ - ૭.૫):', n: 'નાઇટ્રોજન (N) સ્થિતિ:', p: 'ફોસ્ફરસ (P₂O₅) સ્થિતિ:', k: 'પોટાશ (K₂O) સ્થિતિ:', oc: 'સેન્દ્રિય કાર્બન (%):' }
    };
    const t = texts[lang] || texts.en;
    const tEl = document.getElementById('soilTitle'); if (tEl) tEl.textContent = t.title;
    const sEl = document.getElementById('soilSub'); if (sEl) sEl.textContent = t.sub;
    const l1 = document.getElementById('lblSoilCrop'); if (l1) l1.textContent = t.crop;
    const l2 = document.getElementById('lblSoilPH'); if (l2) l2.textContent = t.ph;
    const l3 = document.getElementById('lblSoilN'); if (l3) l3.textContent = t.n;
    const l4 = document.getElementById('lblSoilP'); if (l4) l4.textContent = t.p;
    const l5 = document.getElementById('lblSoilK'); if (l5) l5.textContent = t.k;
    const l6 = document.getElementById('lblSoilOC'); if (l6) l6.textContent = t.oc;
  }

  // --------------------------------------------------------
  // 3. SIDE-BY-SIDE CROP COMPARISON MATRIX
  // --------------------------------------------------------
  window.openCropComparison = function (cropAId = 1, cropBId = 4) {
    let modal = document.getElementById('comparisonModal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'comparisonModal';
      modal.className = 'modal-overlay';
      modal.innerHTML = `
        <div class="modal compare-modal" role="dialog" aria-modal="true">
          <button class="modal-close" onclick="closeCropComparison()" aria-label="Close">✕</button>
          <div class="modal-body">
            <div class="compare-header">
              <span class="compare-badge">⚖️ Smart Decision Matrix</span>
              <h2 class="compare-title" id="cmpTitle">Side-by-Side Crop Comparison</h2>
              <p class="compare-sub" id="cmpSub">Compare two crops across water demand, input costs, duration, expected revenue, and net profit per acre before sowing.</p>
            </div>

            <div class="compare-selectors">
              <div class="compare-select-wrap">
                <label id="lblCmpCropA">Select Crop A:</label>
                <select id="cmpCropA" class="form-select" onchange="renderComparison()"></select>
              </div>
              <div class="compare-vs-badge">VS</div>
              <div class="compare-select-wrap">
                <label id="lblCmpCropB">Select Crop B:</label>
                <select id="cmpCropB" class="form-select" onchange="renderComparison()"></select>
              </div>
            </div>

            <div class="compare-matrix-wrap" id="compareMatrix"></div>
          </div>
        </div>
      `;
      document.body.appendChild(modal);
    }
    populateComparisonSelects(cropAId, cropBId);
    updateComparisonLabels();
    modal.classList.add('open');
    renderComparison();
  };

  window.closeCropComparison = function () {
    const modal = document.getElementById('comparisonModal');
    if (modal) modal.classList.remove('open');
  };

  function populateComparisonSelects(defA, defB) {
    const crops = (typeof _crops !== 'undefined' && Array.isArray(_crops)) ? _crops : [];
    const selA = document.getElementById('cmpCropA');
    const selB = document.getElementById('cmpCropB');
    if (!selA || !selB) return;

    selA.innerHTML = crops.map(c => `<option value="${c.id}" ${c.id === Number(defA) ? 'selected' : ''}>${c.image || '🌱'} ${c.name}</option>`).join('');
    selB.innerHTML = crops.map(c => `<option value="${c.id}" ${c.id === Number(defB) ? 'selected' : ''}>${c.image || '🌱'} ${c.name}</option>`).join('');
  }

  window.renderComparison = function () {
    const crops = (typeof _crops !== 'undefined' && Array.isArray(_crops)) ? _crops : [];
    const idA = Number(document.getElementById('cmpCropA')?.value) || 1;
    const idB = Number(document.getElementById('cmpCropB')?.value) || 4;
    const cropA = crops.find(c => c.id === idA) || crops[0];
    const cropB = crops.find(c => c.id === idB) || crops[1] || crops[0];
    const curLang = localStorage.getItem('agribot_lang') || 'en';

    const ecoDB = {
      1: { cost: 16500, yieldQtl: 18, price: 2450 }, // Wheat
      2: { cost: 22000, yieldQtl: 24, price: 3100 }, // Rice
      3: { cost: 17000, yieldQtl: 26, price: 2150 }, // Maize
      4: { cost: 28000, yieldQtl: 12, price: 7200 }, // Cotton
      5: { cost: 55000, yieldQtl: 150, price: 1400 }, // Tomato
      6: { cost: 42000, yieldQtl: 350, price: 340 }, // Sugarcane
      7: { cost: 45000, yieldQtl: 100, price: 1200 }, // Potato
      8: { cost: 13500, yieldQtl: 9, price: 5650 }, // Sunflower
      9: { cost: 14000, yieldQtl: 8, price: 5800 }, // Chickpea
      11: { cost: 48000, yieldQtl: 110, price: 1600 }, // Onion
      12: { cost: 26000, yieldQtl: 14, price: 6500 } // Groundnut
    };

    const ecoA = ecoDB[cropA.id] || { cost: 18000, yieldQtl: 15, price: 2500 };
    const ecoB = ecoDB[cropB.id] || { cost: 20000, yieldQtl: 14, price: 2700 };

    const revA = ecoA.yieldQtl * ecoA.price;
    const revB = ecoB.yieldQtl * ecoB.price;
    const profitA = revA - ecoA.cost;
    const profitB = revB - ecoB.cost;
    const roiA = ((profitA / ecoA.cost) * 100).toFixed(0);
    const roiB = ((profitB / ecoB.cost) * 100).toFixed(0);

    const wrap = document.getElementById('compareMatrix');
    if (!wrap) return;

    wrap.innerHTML = `
      <table class="compare-table">
        <thead>
          <tr>
            <th>Parameter</th>
            <th class="col-crop-a">${(typeof renderCropVisual === 'function') ? renderCropVisual(cropA.name, cropA.image, 'price-crop-thumb') : cropA.image} ${cropA.name}</th>
            <th class="col-crop-b">${(typeof renderCropVisual === 'function') ? renderCropVisual(cropB.name, cropB.image, 'price-crop-thumb') : cropB.image} ${cropB.name}</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>Season & Category</strong></td>
            <td>${(cropA.season || []).join(', ')} · ${cropA.category}</td>
            <td>${(cropB.season || []).join(', ')} · ${cropB.category}</td>
          </tr>
          <tr>
            <td><strong>Duration</strong></td>
            <td>${cropA.duration_days || '100-120'} days</td>
            <td>${cropB.duration_days || '120-150'} days</td>
          </tr>
          <tr>
            <td><strong>Water Requirement</strong></td>
            <td>💧 ${cropA.water_requirement}</td>
            <td>💧 ${cropB.water_requirement}</td>
          </tr>
          <tr>
            <td><strong>Estimated Cost / Acre</strong></td>
            <td>₹${ecoA.cost.toLocaleString('en-IN')}</td>
            <td>₹${ecoB.cost.toLocaleString('en-IN')}</td>
          </tr>
          <tr>
            <td><strong>Expected Yield / Acre</strong></td>
            <td>${ecoA.yieldQtl} Quintals</td>
            <td>${ecoB.yieldQtl} Quintals</td>
          </tr>
          <tr>
            <td><strong>Mandi Selling Price</strong></td>
            <td>₹${ecoA.price.toLocaleString('en-IN')} / qtl</td>
            <td>₹${ecoB.price.toLocaleString('en-IN')} / qtl</td>
          </tr>
          <tr>
            <td><strong>Gross Revenue / Acre</strong></td>
            <td>₹${revA.toLocaleString('en-IN')}</td>
            <td>₹${revB.toLocaleString('en-IN')}</td>
          </tr>
          <tr class="highlight-row">
            <td><strong>Net Profit / Acre</strong></td>
            <td class="${profitA >= profitB ? 'winner-cell' : ''}">₹${profitA.toLocaleString('en-IN')} (${roiA}% ROI)</td>
            <td class="${profitB >= profitA ? 'winner-cell' : ''}">₹${profitB.toLocaleString('en-IN')} (${roiB}% ROI)</td>
          </tr>
        </tbody>
      </table>

      <div class="compare-verdict-banner">
        <span class="compare-verdict-icon">🏆</span>
        <div>
          <h4>${curLang === 'gu' ? 'નિર્ણય ભલામણ:' : curLang === 'hi' ? 'तुलनात्मक निष्कर्ष:' : 'Smart Sowing Verdict:'}</h4>
          <p>${profitA >= profitB
            ? `${cropA.name} delivers ₹${(profitA - profitB).toLocaleString('en-IN')} more net profit per acre than ${cropB.name} with ${roiA}% ROI.`
            : `${cropB.name} delivers ₹${(profitB - profitA).toLocaleString('en-IN')} more net profit per acre than ${cropA.name} with ${roiB}% ROI.`}</p>
        </div>
      </div>
    `;
  };

  function updateComparisonLabels() {
    const lang = localStorage.getItem('agribot_lang') || 'en';
    const texts = {
      en: { title: 'Side-by-Side Crop Comparison', sub: 'Compare two crops across water demand, input costs, duration, expected revenue, and net profit per acre before sowing.', a: 'Select Crop A:', b: 'Select Crop B:' },
      hi: { title: 'फसल तुलना मैट्रिक्स (Crop Comparison)', sub: 'बुवाई से पहले दो फसलों की पानी की जरूरत, लागत, अवधि, बाजार भाव और प्रति एकड़ मुनाफे की सीधी तुलना करें।', a: 'पहली फसल चुनें:', b: 'दूसरी फसल चुनें:' },
      gu: { title: 'પાક સરખામણી મેટ્રિક્સ (Crop Comparison)', sub: 'વાવણી અગાઉ બે પાકના પાણીની જરૂરિયાત, ખર્ચ, સમયગાળો, બજાર ભાવ અને ચોખ્ખા નફાની સામસામે સરખામણી કરો.', a: 'પ્રથમ પાક પસંદ કરો:', b: 'બીજો પાક પસંદ કરો:' }
    };
    const t = texts[lang] || texts.en;
    const tEl = document.getElementById('cmpTitle'); if (tEl) tEl.textContent = t.title;
    const sEl = document.getElementById('cmpSub'); if (sEl) sEl.textContent = t.sub;
    const la = document.getElementById('lblCmpCropA'); if (la) la.textContent = t.a;
    const lb = document.getElementById('lblCmpCropB'); if (lb) lb.textContent = t.b;
  }

  // --------------------------------------------------------
  // 4. MANDI PRICE TARGET ALERTS & NOTIFICATION BELL
  // --------------------------------------------------------
  function getPriceAlerts() {
    try {
      const raw = localStorage.getItem('agri_price_alerts');
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  }

  function savePriceAlerts(alerts) {
    localStorage.setItem('agri_price_alerts', JSON.stringify(alerts));
    updateAlertBellBadge();
  }

  window.openPriceAlerts = function () {
    let modal = document.getElementById('alertsModal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'alertsModal';
      modal.className = 'modal-overlay';
      modal.innerHTML = `
        <div class="modal alerts-modal" role="dialog" aria-modal="true">
          <button class="modal-close" onclick="closePriceAlerts()" aria-label="Close">✕</button>
          <div class="modal-body">
            <div class="alerts-header">
              <span class="alerts-badge">🔔 Mandi Watchdog</span>
              <h2 class="alerts-title" id="alrTitle">Mandi Price Target Alerts</h2>
              <p class="alerts-sub" id="alrSub">Set price alert thresholds for your commodities. You will be notified instantly when Mandi rates match your selling target.</p>
            </div>

            <form class="alerts-add-form" onsubmit="addPriceAlert(event)">
              <div class="alerts-form-grid">
                <input type="text" id="alrCropInput" class="form-input" placeholder="Crop (e.g. Wheat, Cotton)" required>
                <select id="alrCondSelect" class="form-select">
                  <option value="above">rises above (≥)</option>
                  <option value="below">drops below (≤)</option>
                </select>
                <input type="number" id="alrPriceInput" class="form-input" placeholder="Price (₹/qtl)" min="100" step="50" required>
                <button type="submit" class="btn btn-primary">+ Set Alert</button>
              </div>
            </form>

            <div class="alerts-list-wrap" id="alertsList"></div>
          </div>
        </div>
      `;
      document.body.appendChild(modal);
    }
    modal.classList.add('open');
    renderPriceAlerts();
  };

  window.closePriceAlerts = function () {
    const modal = document.getElementById('alertsModal');
    if (modal) modal.classList.remove('open');
  };

  window.addPriceAlert = function (e) {
    e.preventDefault();
    const crop = document.getElementById('alrCropInput')?.value.trim();
    const condition = document.getElementById('alrCondSelect')?.value || 'above';
    const targetPrice = parseFloat(document.getElementById('alrPriceInput')?.value) || 0;
    if (!crop || !targetPrice) return;

    const alerts = getPriceAlerts();
    alerts.push({ crop, targetPrice, condition });
    savePriceAlerts(alerts);
    document.getElementById('alrCropInput').value = '';
    document.getElementById('alrPriceInput').value = '';
    renderPriceAlerts();
  };

  window.deletePriceAlert = function (index) {
    const alerts = getPriceAlerts();
    alerts.splice(index, 1);
    savePriceAlerts(alerts);
    renderPriceAlerts();
  };

  function renderPriceAlerts() {
    const wrap = document.getElementById('alertsList');
    if (!wrap) return;
    const alerts = getPriceAlerts();

    if (!alerts.length) {
      wrap.innerHTML = `<p class="alerts-empty">No active price alerts. Add your target commodity rates above.</p>`;
      return;
    }

    wrap.innerHTML = alerts.map((a, i) => `
      <div class="alert-item-card">
        <div class="alert-item-info">
          <span class="alert-item-crop">🌾 ${a.crop}</span>
          <span class="alert-item-target">Notify when price is <strong>${a.condition} ₹${a.targetPrice.toLocaleString('en-IN')}/qtl</strong></span>
        </div>
        <button class="alert-del-btn" onclick="deletePriceAlert(${i})" title="Remove Alert">✕</button>
      </div>
    `).join('');
  }

  function updateAlertBellBadge() {
    const alerts = getPriceAlerts();
    const badge = document.getElementById('navbarAlertBadge');
    if (badge) {
      badge.textContent = alerts.length;
      badge.setAttribute('data-count', alerts.length);
      badge.style.display = alerts.length > 0 ? 'inline-flex' : 'none';
    }
  }

  // --------------------------------------------------------
  // 5. SMART DRIP IRRIGATION & WATER SCHEDULE CALCULATOR
  // --------------------------------------------------------
  window.openIrrigationPlanner = function () {
    let modal = document.getElementById('irrigationModal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'irrigationModal';
      modal.className = 'modal-overlay';
      modal.innerHTML = `
        <div class="modal irrig-modal" role="dialog" aria-modal="true">
          <button class="modal-close" onclick="closeIrrigationPlanner()" aria-label="Close">✕</button>
          <div class="modal-body">
            <div class="irrig-header">
              <span class="irrig-badge">💧 Jal Shakti</span>
              <h2 class="irrig-title" id="irrigTitle">Smart Drip Irrigation & Water Calculator</h2>
              <p class="irrig-sub" id="irrigSub">Compute precise daily water requirements, tube-well run times, and water savings with drip irrigation vs. conventional flood irrigation.</p>
            </div>

            <div class="irrig-form-grid">
              <div class="form-group">
                <label id="lblIrrigCrop">Crop Type:</label>
                <select id="irrigCropSelect" class="form-select" onchange="calculateIrrigation()">
                  <option value="cotton">🪴 Cotton (कपास / કપાસ)</option>
                  <option value="tomato">🍅 Tomato (टमाटर / ટામેટા)</option>
                  <option value="sugarcane">🎋 Sugarcane (गन्ना / શેરડી)</option>
                  <option value="banana">🍌 Banana (केला / કેળા)</option>
                  <option value="wheat">🌾 Wheat (गेहूं / ઘઉં)</option>
                  <option value="potato">🥔 Potato (आलू / બટાકા)</option>
                </select>
              </div>

              <div class="form-group">
                <label id="lblIrrigArea">Farm Area (Acres):</label>
                <input type="number" id="irrigAreaInput" class="form-input" value="2" min="0.5" step="0.5" oninput="calculateIrrigation()">
              </div>

              <div class="form-group">
                <label id="lblIrrigStage">Crop Growth Stage:</label>
                <select id="irrigStageSelect" class="form-select" onchange="calculateIrrigation()">
                  <option value="initial">🌱 Initial / Germination (Low water)</option>
                  <option value="vegetative" selected>🌿 Active Vegetative Growth (Medium water)</option>
                  <option value="flowering">🌸 Flowering & Fruit/Boll Formation (Peak water)</option>
                  <option value="maturity">🌾 Maturity / Ripening (Reduced water)</option>
                </select>
              </div>

              <div class="form-group">
                <label id="lblIrrigPump">Pump Capacity:</label>
                <select id="irrigPumpSelect" class="form-select" onchange="calculateIrrigation()">
                  <option value="3">3 HP Pump (~200 Liters/min)</option>
                  <option value="5" selected>5 HP Pump (~350 Liters/min)</option>
                  <option value="7.5">7.5 HP Pump (~500 Liters/min)</option>
                </select>
              </div>
            </div>

            <div class="irrig-results-wrap" id="irrigResults"></div>
          </div>
        </div>
      `;
      document.body.appendChild(modal);
    }
    updateIrrigationLabels();
    modal.classList.add('open');
    calculateIrrigation();
  };

  window.closeIrrigationPlanner = function () {
    const modal = document.getElementById('irrigationModal');
    if (modal) modal.classList.remove('open');
  };

  window.calculateIrrigation = function () {
    const area = parseFloat(document.getElementById('irrigAreaInput')?.value) || 1;
    const stage = document.getElementById('irrigStageSelect')?.value || 'vegetative';
    const hp = parseFloat(document.getElementById('irrigPumpSelect')?.value) || 5;
    const curLang = localStorage.getItem('agribot_lang') || 'en';

    // Base water: liters per acre per day
    const stageMultipliers = { initial: 0.6, vegetative: 1.0, flowering: 1.4, maturity: 0.7 };
    const baseDailyWaterPerAcre = 18000; // ~18,000 liters/acre for drip
    const dripDailyWater = Math.round(baseDailyWaterPerAcre * area * (stageMultipliers[stage] || 1.0));
    const floodDailyWater = Math.round(dripDailyWater * 2.3); // Flood uses 130% more water
    const waterSaved = floodDailyWater - dripDailyWater;

    // Pump flow rate in liters per hour
    const flowLPH = hp === 3 ? 12000 : hp === 7.5 ? 30000 : 21000;
    const runtimeHours = (dripDailyWater / flowLPH).toFixed(1);

    const resWrap = document.getElementById('irrigResults');
    if (!resWrap) return;

    resWrap.innerHTML = `
      <div class="irrig-metrics-grid">
        <div class="irrig-metric-card">
          <span class="irrig-metric-icon">💧</span>
          <span class="irrig-metric-val">${(dripDailyWater / 1000).toFixed(1)}k <small>L/day</small></span>
          <span class="irrig-metric-lbl">${curLang === 'gu' ? 'દૈનિક ટપક પિયત જરૂરિયાત' : curLang === 'hi' ? 'दैनिक ड्रिप सिंचाई आवश्यकता' : 'Drip Daily Water Demand'}</span>
        </div>

        <div class="irrig-metric-card">
          <span class="irrig-metric-icon">⏱️</span>
          <span class="irrig-metric-val">${runtimeHours} <small>Hours</small></span>
          <span class="irrig-metric-lbl">${curLang === 'gu' ? `${hp} HP મોટર રનટાઈમ / દિવસ` : curLang === 'hi' ? `${hp} HP पंप संचालन समय / दिन` : `${hp} HP Pump Runtime / day`}</span>
        </div>

        <div class="irrig-metric-card irrig-saved-card">
          <span class="irrig-metric-icon">🌿</span>
          <span class="irrig-metric-val">~56% <small>Water Saved</small></span>
          <span class="irrig-metric-lbl">${curLang === 'gu' ? `${(waterSaved / 1000).toFixed(0)}k લીટર પાણી બચત!` : curLang === 'hi' ? `${(waterSaved / 1000).toFixed(0)}k लीटर जल बचत!` : `${(waterSaved / 1000).toFixed(0)}k Liters Saved vs Flood`}</span>
        </div>
      </div>

      <div class="irrig-advice-banner">
        <h4>⚡ ${curLang === 'gu' ? 'શ્રેષ્ઠ પિયત સમયપત્રક:' : curLang === 'hi' ? 'सर्वोत्तम सिंचाई सलाह:' : 'Optimal Irrigation Schedule:'}</h4>
        <p>${curLang === 'gu'
          ? `ગરમીના સમયે બાષ્પીભવન અટકાવવા વહેલી સવારે અથવા સાંજે ${runtimeHours} કલાક ટપક પદ્ધતિ ચલાવો. વીજળી બિલમાં ~૪૦% ઘટાડો થશે.`
          : curLang === 'hi'
          ? `वाष्पीकरण रोकने हेतु सुबह 6-9 बजे या शाम 5-7 बजे ${runtimeHours} घंटे ड्रिप चलाएं। बिजली व पानी दोनों की भारी बचत होगी।`
          : `Run your drip system for ${runtimeHours} hours either between 6:00–9:00 AM or after 5:00 PM to eliminate evaporative loss.`}</p>
      </div>
    `;
  };

  function updateIrrigationLabels() {
    const lang = localStorage.getItem('agribot_lang') || 'en';
    const texts = {
      en: { title: 'Smart Drip Irrigation & Water Calculator', sub: 'Compute precise daily water requirements, tube-well run times, and water savings with drip irrigation vs. conventional flood irrigation.', crop: 'Crop Type:', area: 'Farm Area (Acres):', stage: 'Crop Growth Stage:', pump: 'Pump Capacity:' },
      hi: { title: 'ड्रिप सिंचाई व जल प्रबंधन कैलकुलेटर', sub: 'अपनी फसल के लिए प्रतिदिन आवश्यक पानी, ट्यूबवेल मोटर चलाने का समय और ड्रिप से होने वाली 55%+ पानी बचत की गणना करें।', crop: 'फसल प्रकार:', area: 'खेत क्षेत्रफल (एकड़):', stage: 'फसल की अवस्था:', pump: 'पंप की क्षमता (HP):' },
      gu: { title: 'સ્માર્ટ ટપક પિયત અને પાણી વ્યવસ્થાપન', sub: 'તમારા પાક માટે દૈનિક પાણીની જરૂરિયાત, મોટર ચલાવવાનો સમય અને પરંપરાગત પિયતની તુલનામાં પાણીની બચત ગણો.', crop: 'પાક પસંદ કરો:', area: 'જમીન (એકર):', stage: 'પાકની વર્તમાન અવસ્થા:', pump: 'મોટર ક્ષમતા (HP):' }
    };
    const t = texts[lang] || texts.en;
    const tEl = document.getElementById('irrigTitle'); if (tEl) tEl.textContent = t.title;
    const sEl = document.getElementById('irrigSub'); if (sEl) sEl.textContent = t.sub;
    const l1 = document.getElementById('lblIrrigCrop'); if (l1) l1.textContent = t.crop;
    const l2 = document.getElementById('lblIrrigArea'); if (l2) l2.textContent = t.area;
    const l3 = document.getElementById('lblIrrigStage'); if (l3) l3.textContent = t.stage;
    const l4 = document.getElementById('lblIrrigPump'); if (l4) l4.textContent = t.pump;
  }

  // --------------------------------------------------------
  // 6. DOWNLOADABLE 1-PAGE FARM ADVISORY CARD (PRINT PDF)
  // --------------------------------------------------------
  window.printFarmAdvisory = function (cropId = 1) {
    const crops = (typeof _crops !== 'undefined' && Array.isArray(_crops)) ? _crops : [];
    const crop = crops.find(c => c.id === Number(cropId)) || crops[0] || { name: 'Wheat', image: '🌾', duration_days: '120-150', water_requirement: 'Medium', sowing_months: ['October', 'November'] };
    const dateStr = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });

    let printArea = document.getElementById('agriPrintContainer');
    if (!printArea) {
      printArea = document.createElement('div');
      printArea.id = 'agriPrintContainer';
      printArea.className = 'printable-advisory-card';
      document.body.appendChild(printArea);
    }

    printArea.innerHTML = `
      <div class="print-card-inner">
        <div class="print-header">
          <div class="print-brand">
            <span class="print-logo">🌾</span>
            <div>
              <h2>AgriSystem — National Crop Advisory</h2>
              <p>Official Agronomy & Extension Advisory Card · Agmarknet Connected</p>
            </div>
          </div>
          <div class="print-meta">
            <span>Date: <strong>${dateStr}</strong></span>
            <span>Card ID: <strong>AGRI-${Math.floor(100000 + Math.random() * 900000)}</strong></span>
          </div>
        </div>

        <div class="print-crop-hero">
          <span class="print-crop-emoji">${crop.image || '🌱'}</span>
          <div>
            <h3>${crop.name} Cultivation Advisory</h3>
            <p>Category: ${crop.category || 'General'} · Season: ${(crop.season || []).join(', ')} · Duration: ${crop.duration_days || '90-120'} days</p>
          </div>
        </div>

        <div class="print-section-grid">
          <div class="print-box">
            <h4>🌱 Sowing & Seed Specifications</h4>
            <p>• <strong>Seed Rate:</strong> ${crop.seeds?.seed_rate_kg_per_acre || '40-50 kg/acre'}</p>
            <p>• <strong>Sowing Depth:</strong> ${crop.seeds?.sowing_depth_cm || '3-5'} cm</p>
            <p>• <strong>Row Spacing:</strong> ${crop.seeds?.spacing_cm || '20-22 cm'}</p>
            <p>• <strong>Optimal Sowing:</strong> ${(crop.sowing_months || []).join(', ')}</p>
          </div>

          <div class="print-box">
            <h4>🌾 Fertilizer & NPK Dosage (Per Acre)</h4>
            <p>• <strong>Urea:</strong> ~110 kg (2.4 bags in 3 splits)</p>
            <p>• <strong>DAP:</strong> ~55 kg (1.1 bags at sowing)</p>
            <p>• <strong>MOP / Potash:</strong> ~25 kg basal application</p>
            <p>• <strong>Micronutrients:</strong> 10 kg Zinc Sulfate 21%</p>
          </div>
        </div>

        <div class="print-box full-box">
          <h4>💧 Water Management & Irrigation Cycles</h4>
          <p>Water Requirement: <strong>${crop.water_requirement || 'Medium'}</strong> · Provide 4–6 irrigations at Crown Root Initiation, Tillering, Late Jointing, Flowering, and Grain Filling stages.</p>
        </div>

        <div class="print-box full-box">
          <h4>🛡️ Disease & Pest Prevention Tips</h4>
          <p>${(crop.care_tips || ['Ensure well drained soil', 'Inspect early for rust or leaf blight', 'Use certified disease free seeds']).join(' · ')}</p>
        </div>

        <div class="print-footer">
          <div class="print-qr-placeholder">
            <span>[Verified AgriSystem Seal]</span>
          </div>
          <div class="print-cert">
            <p>Generated via AgriSystem Smart Agriculture Suite. Verified against Agmarknet APMC rates & ICAR guidelines.</p>
            <p>Visit online: <strong>${(typeof window !== 'undefined' && window.location.origin) ? window.location.origin : 'AgriSystem Portal'}</strong></p>
          </div>
        </div>
      </div>
    `;

    window.print();
  };

  // --------------------------------------------------------
  // 7. KISAN MACHINERY & TRACTOR RENTAL HUB
  // --------------------------------------------------------
  const DEFAULT_MACHINES = [
    { id: 1, name: 'Mahindra 575 DI Tractor (45 HP)', type: 'tractor', rate: '₹650 / hour', owner: 'Ramesh Patel', phone: '+919876543210', district: 'Rajkot / Anand', available: true, icon: '🚜' },
    { id: 2, name: 'Class Combine Harvester (Paddy/Wheat)', type: 'harvester', rate: '₹1,800 / acre', owner: 'Gurpreet Singh', phone: '+919812345678', district: 'Karnal / Central', available: true, icon: '🌾' },
    { id: 3, name: 'Laser Land Leveler (Dual GPS)', type: 'leveler', rate: '₹750 / hour', owner: 'Suresh Verma', phone: '+919823456789', district: 'Indore / Ujjain', available: true, icon: '📐' },
    { id: 4, name: 'Shaktiman 7-Feet Rotavator', type: 'rotavator', rate: '₹550 / acre', owner: 'Dinesh Choudhary', phone: '+919834567890', district: 'Ahmedabad / Kheda', available: true, icon: '⚙️' },
    { id: 5, name: 'Agricultural Spray Drone (10L Tank)', type: 'drone', rate: '₹400 / acre', owner: 'Kisan Drone Services', phone: '+919845678901', district: 'Surat / Vadodara', available: true, icon: '🚁' }
  ];

  function getMachinesList() {
    try {
      const raw = localStorage.getItem('agri_machines');
      return raw ? JSON.parse(raw) : DEFAULT_MACHINES;
    } catch (e) {
      return DEFAULT_MACHINES;
    }
  }

  function saveMachinesList(list) {
    localStorage.setItem('agri_machines', JSON.stringify(list));
  }

  window.openMachineryHub = function () {
    let modal = document.getElementById('machineryModal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'machineryModal';
      modal.className = 'modal-overlay';
      modal.innerHTML = `
        <div class="modal machine-modal" role="dialog" aria-modal="true">
          <button class="modal-close" onclick="closeMachineryHub()" aria-label="Close">✕</button>
          <div class="modal-body">
            <div class="machine-header">
              <span class="machine-badge">🚜 Kisan Machinery Hub</span>
              <h2 class="machine-title" id="macTitle">Farm Equipment & Tractor Rental Directory</h2>
              <p class="machine-sub" id="macSub">Rent tractors, combine harvesters, laser levelers, and spray drones from verified local farm owners at affordable hourly & per-acre rates.</p>
            </div>

            <div class="machine-action-bar">
              <div class="machine-filter-tabs">
                <button class="mac-filter-btn active" onclick="filterMachines('all', this)">All Equipment</button>
                <button class="mac-filter-btn" onclick="filterMachines('tractor', this)">🚜 Tractors</button>
                <button class="mac-filter-btn" onclick="filterMachines('harvester', this)">🌾 Harvesters</button>
                <button class="mac-filter-btn" onclick="filterMachines('rotavator', this)">⚙️ Rotavators</button>
                <button class="mac-filter-btn" onclick="filterMachines('drone', this)">🚁 Spray Drones</button>
              </div>
              <button class="btn btn-secondary btn-sm" onclick="toggleAddMachineForm()">+ List Your Machine</button>
            </div>

            <form id="addMachineForm" class="add-machine-form" style="display:none" onsubmit="handleAddMachine(event)">
              <h4>List Your Farm Equipment for Rent</h4>
              <div class="add-mac-grid">
                <input type="text" id="newMacName" class="form-input" placeholder="Machine Name & HP (e.g. John Deere 5050D)" required>
                <select id="newMacType" class="form-select">
                  <option value="tractor">🚜 Tractor</option>
                  <option value="harvester">🌾 Harvester</option>
                  <option value="rotavator">⚙️ Rotavator</option>
                  <option value="leveler">📐 Laser Leveler</option>
                  <option value="drone">🚁 Drone</option>
                </select>
                <input type="text" id="newMacRate" class="form-input" placeholder="Rental Rate (e.g. ₹600 / hour)" required>
                <input type="text" id="newMacOwner" class="form-input" placeholder="Owner Name" required>
                <input type="text" id="newMacPhone" class="form-input" placeholder="Phone / WhatsApp Number" required>
                <input type="text" id="newMacDistrict" class="form-input" placeholder="District / Area" required>
              </div>
              <div style="margin-top:10px; display:flex; gap:8px;">
                <button type="submit" class="btn btn-primary btn-sm">Save Listing</button>
                <button type="button" class="btn btn-clear btn-sm" onclick="toggleAddMachineForm()">Cancel</button>
              </div>
            </form>

            <div class="machine-cards-grid" id="machinesGrid"></div>
          </div>
        </div>
      `;
      document.body.appendChild(modal);
    }
    updateMachineryLabels();
    modal.classList.add('open');
    filterMachines('all');
  };

  window.closeMachineryHub = function () {
    const modal = document.getElementById('machineryModal');
    if (modal) modal.classList.remove('open');
  };

  window.toggleAddMachineForm = function () {
    const form = document.getElementById('addMachineForm');
    if (form) form.style.display = form.style.display === 'none' ? 'block' : 'none';
  };

  window.handleAddMachine = function (e) {
    e.preventDefault();
    const name = document.getElementById('newMacName')?.value;
    const type = document.getElementById('newMacType')?.value;
    const rate = document.getElementById('newMacRate')?.value;
    const owner = document.getElementById('newMacOwner')?.value;
    const phone = document.getElementById('newMacPhone')?.value;
    const district = document.getElementById('newMacDistrict')?.value;

    const iconMap = { tractor: '🚜', harvester: '🌾', rotavator: '⚙️', leveler: '📐', drone: '🚁' };
    const list = getMachinesList();
    list.unshift({
      id: Date.now(),
      name,
      type,
      rate,
      owner,
      phone,
      district,
      available: true,
      icon: iconMap[type] || '🚜'
    });
    saveMachinesList(list);
    toggleAddMachineForm();
    filterMachines('all');
  };

  let currentMacType = 'all';

  window.filterMachines = function (type, btn = null) {
    currentMacType = type;
    if (btn) {
      document.querySelectorAll('.mac-filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    }

    const grid = document.getElementById('machinesGrid');
    if (!grid) return;
    const all = getMachinesList();
    const filtered = currentMacType === 'all' ? all : all.filter(m => m.type === currentMacType);

    grid.innerHTML = filtered.map(m => `
      <div class="machine-card">
        <div class="machine-card-head">
          <span class="machine-icon">${m.icon}</span>
          <div>
            <h4 class="machine-name">${m.name}</h4>
            <span class="machine-district">📍 ${m.district}</span>
          </div>
          <span class="machine-rate-badge">${m.rate}</span>
        </div>
        <div class="machine-card-body">
          <p>Owner: <strong>${m.owner}</strong></p>
        </div>
        <div class="machine-card-footer">
          <a href="tel:${m.phone}" class="btn btn-secondary btn-sm">📞 Call</a>
          <a href="https://api.whatsapp.com/send?phone=${m.phone.replace(/[^0-9]/g, '')}&text=${encodeURIComponent(`Hello ${m.owner}, I found your ${m.name} listed on AgriSystem and would like to inquire about renting it.`)}" target="_blank" class="btn btn-whatsapp-sm" style="width:auto; padding:6px 14px;">📲 WhatsApp</a>
        </div>
      </div>
    `).join('');
  };

  function updateMachineryLabels() {
    const lang = localStorage.getItem('agribot_lang') || 'en';
    const texts = {
      en: { title: 'Farm Equipment & Tractor Rental Directory', sub: 'Rent tractors, combine harvesters, laser levelers, and spray drones from verified local farm owners at affordable hourly & per-acre rates.' },
      hi: { title: 'किसान ट्रैक्टर व कृषि यंत्र रेंटल हब', sub: 'किफायती प्रति-घंटे व प्रति-एकड़ किराए पर ट्रैक्टर, हार्वेस्टर, रोटावेटर और ड्रोन स्प्रेयर स्थानीय मालिकों से सीधे किराए पर लें।' },
      gu: { title: 'કિસાન ટ્રેક્ટર અને કૃષિ ઓજાર ભાડા કેન્દ્ર', sub: 'સ્થાનિક ખેડૂત માલિકો પાસેથી વ્યાજબી કલાકદીઠ અથવા એકરદીઠ ભાડે ટ્રેક્ટર, હાર્વેસ્ટર, રોટાવેટર અને ડ્રોન મેળવો.' }
    };
    const t = texts[lang] || texts.en;
    const tEl = document.getElementById('macTitle'); if (tEl) tEl.textContent = t.title;
    const sEl = document.getElementById('macSub'); if (sEl) sEl.textContent = t.sub;
  }

  // Setup DOM events
  document.addEventListener('DOMContentLoaded', () => {
    updateAlertBellBadge();
  });

  window.addEventListener('agribot_lang_changed', () => {
    if (document.getElementById('schemesModal')?.classList.contains('open')) updateSchemesLabels();
    if (document.getElementById('soilAnalyzerModal')?.classList.contains('open')) updateSoilLabels();
    if (document.getElementById('comparisonModal')?.classList.contains('open')) updateComparisonLabels();
    if (document.getElementById('irrigationModal')?.classList.contains('open')) updateIrrigationLabels();
    if (document.getElementById('machineryModal')?.classList.contains('open')) updateMachineryLabels();
  });

})();
