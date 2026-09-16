// ========================================================
//  AgriSystem — Farmer's Personal Dashboard & Weather Suite
//  1. "My Farm" Personal Dashboard (Bookmarks, Watchlist, Calendar, Notes)
//  2. Local Weather & Agro-Advisory Widget (Open-Meteo API)
// ========================================================

(function () {
  'use strict';

  // --------------------------------------------------------
  // 1. BOOKMARKING SYSTEM (Crop Favorites)
  // --------------------------------------------------------
  function getBookmarks() {
    try {
      const raw = localStorage.getItem('agri_bookmarks');
      return raw ? JSON.parse(raw) : [1, 2, 4]; // Default: Wheat, Rice, Cotton
    } catch (e) {
      return [1, 2, 4];
    }
  }

  function saveBookmarks(bks) {
    localStorage.setItem('agri_bookmarks', JSON.stringify(bks));
    window.dispatchEvent(new CustomEvent('agri_bookmarks_updated', { detail: bks }));
    updateAllBookmarkButtons();
  }

  window.isCropBookmarked = function (cropId) {
    const bks = getBookmarks();
    return bks.includes(Number(cropId));
  };

  window.toggleBookmark = function (cropId, evt) {
    if (evt) {
      evt.preventDefault();
      evt.stopPropagation();
    }
    const id = Number(cropId);
    let bks = getBookmarks();
    if (bks.includes(id)) {
      bks = bks.filter(x => x !== id);
    } else {
      bks.push(id);
    }
    saveBookmarks(bks);
    if (document.getElementById('myFarmModal')?.classList.contains('open')) {
      renderMyFarmContent();
    }
  };

  function updateAllBookmarkButtons() {
    const bks = getBookmarks();
    document.querySelectorAll('.btn-crop-bookmark').forEach(btn => {
      const cid = Number(btn.getAttribute('data-crop-id'));
      const isSaved = bks.includes(cid);
      btn.classList.toggle('bookmarked', isSaved);
      btn.innerHTML = isSaved ? '⭐' : '☆';
      btn.title = isSaved ? 'Remove from My Farm' : 'Save to My Farm';
    });
  }

  // --------------------------------------------------------
  // 2. "MY FARM" PERSONAL DASHBOARD MODAL
  // --------------------------------------------------------
  let currentFarmTab = 'saved';

  window.openMyFarm = function (tab = 'saved') {
    currentFarmTab = tab;
    let modal = document.getElementById('myFarmModal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'myFarmModal';
      modal.className = 'modal-overlay';
      modal.innerHTML = `
        <div class="modal myfarm-modal" role="dialog" aria-modal="true">
          <button class="modal-close" onclick="closeMyFarm()" aria-label="Close">✕</button>
          <div class="modal-body">
            <div class="myfarm-header">
              <div class="myfarm-title-wrap">
                <span class="myfarm-badge">⭐ Farmer's Desk</span>
                <h2 class="myfarm-title" id="myFarmTitle">My Farm Dashboard</h2>
                <p class="myfarm-sub" id="myFarmSub">Manage your favorite crops, monitor live market prices, track sowing schedules, and record field notes.</p>
              </div>
            </div>

            <div class="myfarm-nav">
              <button class="myfarm-tab-btn" id="tabBtnSaved" onclick="switchFarmTab('saved')">⭐ Favorite Crops</button>
              <button class="myfarm-tab-btn" id="tabBtnWatchlist" onclick="switchFarmTab('watchlist')">📊 Price Watchlist</button>
              <button class="myfarm-tab-btn" id="tabBtnCalendar" onclick="switchFarmTab('calendar')">🗓️ Sowing Calendar</button>
              <button class="myfarm-tab-btn" id="tabBtnNotes" onclick="switchFarmTab('notes')">📝 Field Notes</button>
            </div>

            <div class="myfarm-content" id="myFarmContent"></div>
          </div>
        </div>
      `;
      document.body.appendChild(modal);
    }
    updateMyFarmLabels();
    modal.classList.add('open');
    switchFarmTab(currentFarmTab);
  };

  window.closeMyFarm = function () {
    const modal = document.getElementById('myFarmModal');
    if (modal) modal.classList.remove('open');
  };

  window.switchFarmTab = function (tab) {
    currentFarmTab = tab;
    document.querySelectorAll('.myfarm-tab-btn').forEach(b => b.classList.remove('active'));
    const btn = document.getElementById('tabBtn' + tab.charAt(0).toUpperCase() + tab.slice(1));
    if (btn) btn.classList.add('active');
    renderMyFarmContent();
  };

  function renderMyFarmContent() {
    const container = document.getElementById('myFarmContent');
    if (!container) return;
    const curLang = localStorage.getItem('agribot_lang') || 'en';
    const crops = (typeof _crops !== 'undefined' && Array.isArray(_crops)) ? _crops : [];

    if (currentFarmTab === 'saved') {
      const bks = getBookmarks();
      const savedCrops = crops.filter(c => bks.includes(c.id));

      if (savedCrops.length === 0) {
        container.innerHTML = `
          <div class="myfarm-empty">
            <span class="myfarm-empty-icon">🌾</span>
            <h3>${curLang === 'gu' ? 'હજુ સુધી કોઈ પાક પસંદ કરેલ નથી' : curLang === 'hi' ? 'अभी तक कोई फसल बुकमार्क नहीं की गई' : 'No crops saved yet'}</h3>
            <p>${curLang === 'gu' ? 'તમારા મનપસંદ પાકને સાચવવા માટે પાકના કાર્ડ પર રહેલા ⭐ આઇકોન પર ક્લિક કરો.' : curLang === 'hi' ? 'अपनी पसंदीदा फसलों को सेव करने के लिए फसल कार्ड पर ⭐ आइकॉन पर क्लिक करें।' : 'Click the ⭐ star icon on any crop card to save it here for quick access.'}</p>
            <a href="crops.html" class="btn btn-primary" onclick="closeMyFarm()">${curLang === 'gu' ? 'પાક જુઓ' : curLang === 'hi' ? 'फसलें देखें' : 'Explore Crops'}</a>
          </div>
        `;
        return;
      }

      container.innerHTML = `
        <div class="myfarm-crops-grid">
          ${savedCrops.map(c => `
            <div class="myfarm-crop-card">
              <div class="myfarm-card-head">
                ${(typeof renderCropVisual === 'function') ? renderCropVisual(c.name, c.image || '🌱', 'crop-img-thumb', 'myfarm-crop-emoji') : `<span class="myfarm-crop-emoji">${c.image || '🌱'}</span>`}
                <div>
                  <h4 class="myfarm-crop-name">${c.name}</h4>
                  <span class="myfarm-crop-cat">${c.category} · ${(c.season || []).join(', ')}</span>
                </div>
                <button class="myfarm-remove-btn" onclick="toggleBookmark(${c.id}, event)" title="Remove">✕</button>
              </div>
              <div class="myfarm-card-body">
                <div class="myfarm-card-row">
                  <span>⏱️ Duration:</span>
                  <strong>${c.duration_days || '90-120'} days</strong>
                </div>
                <div class="myfarm-card-row">
                  <span>🌾 Seed Rate:</span>
                  <strong>${c.seeds?.seed_rate_kg_per_acre || 'Standard'}</strong>
                </div>
                <div class="myfarm-card-row">
                  <span>💧 Water:</span>
                  <strong>${c.water_requirement || 'Medium'}</strong>
                </div>
              </div>
              <div class="myfarm-card-footer">
                <button class="btn btn-secondary btn-sm" onclick="openFertilizerCalculator(); closeMyFarm();">🌾 Fertilizer</button>
                <button class="btn btn-primary btn-sm" onclick="openProfitEstimator(); closeMyFarm();">📈 Profit</button>
              </div>
            </div>
          `).join('')}
        </div>
      `;
    } else if (currentFarmTab === 'watchlist') {
      const bks = getBookmarks();
      const savedCrops = crops.filter(c => bks.includes(c.id));
      const mandiRates = (typeof _mandiPrices !== 'undefined' && Array.isArray(_mandiPrices)) ? _mandiPrices : [
        { crop: 'Wheat', modal_price: 2450, min_price: 2300, max_price: 2550, market: 'Rajkot APMC', state: 'Gujarat' },
        { crop: 'Rice', modal_price: 3100, min_price: 2850, max_price: 3400, market: 'Karnal Mandi', state: 'Haryana' },
        { crop: 'Cotton', modal_price: 7200, min_price: 6800, max_price: 7600, market: 'Surat APMC', state: 'Gujarat' },
        { crop: 'Maize', modal_price: 2150, min_price: 2000, max_price: 2280, market: 'Indore Mandi', state: 'Madhya Pradesh' },
        { crop: 'Potato', modal_price: 1200, min_price: 1050, max_price: 1350, market: 'Agra Mandi', state: 'Uttar Pradesh' },
        { crop: 'Mustard', modal_price: 5650, min_price: 5400, max_price: 5900, market: 'Jaipur Mandi', state: 'Rajasthan' }
      ];

      const matchedRates = mandiRates.filter(m => savedCrops.some(sc => sc.name.toLowerCase().includes(m.crop.toLowerCase()) || m.crop.toLowerCase().includes(sc.name.toLowerCase())));
      const displayRates = matchedRates.length > 0 ? matchedRates : mandiRates.slice(0, 6);

      container.innerHTML = `
        <div class="myfarm-watchlist-wrap">
          <div class="myfarm-watchlist-head">
            <p>${curLang === 'gu' ? 'તમારા મનપસંદ પાકના તાજા એપીએમસી બજાર ભાવ:' : curLang === 'hi' ? 'आपकी पसंदीदा फसलों के नवीनतम मंडी भाव:' : 'Live APMC Mandi rates for your bookmarked crops:'}</p>
            <a href="prices.html" class="btn btn-secondary btn-sm" onclick="closeMyFarm()">${curLang === 'gu' ? 'બધા ભાવો જુઓ →' : curLang === 'hi' ? 'सभी भाव देखें →' : 'All Mandi Rates →'}</a>
          </div>
          <div class="myfarm-rates-grid">
            ${displayRates.map(r => `
              <div class="myfarm-rate-card">
                <div class="myfarm-rate-top">
                  <span class="myfarm-rate-crop">${(typeof renderCropVisual === 'function') ? renderCropVisual(r.crop, '🌾', 'pill-crop-thumb') : ''} ${r.crop}</span>
                  <span class="myfarm-rate-badge">${r.market}, ${r.state}</span>
                </div>
                <div class="myfarm-rate-price">
                  ₹${r.modal_price.toLocaleString('en-IN')} <small>/ Quintal</small>
                </div>
                <div class="myfarm-rate-range">
                  <span>Min: ₹${r.min_price}</span> · <span>Max: ₹${r.max_price}</span>
                </div>
                <button class="btn btn-whatsapp-sm" onclick="shareRateWhatsApp('${r.crop}', '${r.modal_price}', '${r.market}')">
                  📲 Share
                </button>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    } else if (currentFarmTab === 'calendar') {
      const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
      const curMonthIdx = new Date().getMonth();
      const curMonthName = monthNames[curMonthIdx];

      const monthlyCrops = crops.filter(c => (c.sowing_months || []).some(m => m.toLowerCase().includes(curMonthName.toLowerCase())));

      container.innerHTML = `
        <div class="myfarm-calendar-wrap">
          <div class="myfarm-month-alert">
            <span class="myfarm-cal-icon">🗓️</span>
            <div>
              <h4>${curLang === 'gu' ? `ચાલુ મહિનો: ${curMonthName} માં વાવણી માટે ઉત્તમ પાક` : curLang === 'hi' ? `वर्तमान माह: ${curMonthName} में बुवाई योग्य फसलें` : `Current Month: Sowing Recommendations for ${curMonthName}`}</h4>
              <p>${curLang === 'gu' ? 'હાલની ઋતુ અને જમીનના તાપમાન મુજબ નીચે આપેલા પાકની વાવણી શ્રેષ્ઠ ઉપજ આપશે.' : curLang === 'hi' ? 'वर्तमान मौसम व तापमान के अनुसार नीचे दी गई फसलें सर्वाधिक उत्पादन देंगी।' : 'Optimal climate conditions right now are ideal for the following crops.'}</p>
            </div>
          </div>

          <div class="myfarm-crops-grid">
            ${monthlyCrops.slice(0, 8).map(c => `
              <div class="myfarm-crop-card">
                <div class="myfarm-card-head">
                  <span class="myfarm-crop-emoji">${c.image || '🌱'}</span>
                  <div>
                    <h4 class="myfarm-crop-name">${c.name}</h4>
                    <span class="myfarm-crop-cat">${c.category} · ${(c.season || []).join(', ')}</span>
                  </div>
                </div>
                <div class="myfarm-card-body">
                  <p class="myfarm-sow-badge">🌱 Sowing: ${(c.sowing_months || []).join(', ')}</p>
                  <p class="myfarm-harv-badge">🌾 Harvest: ${(c.harvest_months || []).join(', ')}</p>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    } else if (currentFarmTab === 'notes') {
      let notes = [];
      try {
        const raw = localStorage.getItem('agri_farm_notes');
        notes = raw ? JSON.parse(raw) : [];
      } catch (e) { notes = []; }

      container.innerHTML = `
        <div class="myfarm-notes-wrap">
          <form class="myfarm-note-form" onsubmit="addFarmNote(event)">
            <div class="form-group">
              <label>${curLang === 'gu' ? 'પ્રવૃત્તિ / પાક નોંધ ઉમેરો:' : curLang === 'hi' ? 'गतिविधि / फसल नोट जोड़ें:' : 'Add Farm Activity / Log Note:'}</label>
              <div class="myfarm-note-inputs">
                <input type="date" id="noteDate" class="form-input" value="${new Date().toISOString().split('T')[0]}" required>
                <input type="text" id="noteCrop" class="form-input" placeholder="${curLang === 'gu' ? 'પાકનું નામ / પ્લોટ' : curLang === 'hi' ? 'फसल का नाम / खेत' : 'Crop / Plot Name'}" required>
                <input type="text" id="noteText" class="form-input" placeholder="${curLang === 'gu' ? 'વિગત (દા.ત. યુરિયા ખાતર આપ્યું, 2જી પિયત)' : curLang === 'hi' ? 'विवरण (उदा. यूरिया खाद दी, 2nd सिंचाई)' : 'Details (e.g. Applied 2nd irrigation + Urea)'}" required>
                <button type="submit" class="btn btn-primary">${curLang === 'gu' ? 'નોંધ સાચવો' : curLang === 'hi' ? 'सेव करें' : '+ Save Note'}</button>
              </div>
            </div>
          </form>

          <div class="myfarm-notes-list">
            ${notes.length === 0 ? `
              <p class="myfarm-no-notes">${curLang === 'gu' ? 'હજુ કોઈ નોંધ નથી. તમારા ખેતરની પ્રવૃત્તિઓ અહીં નોંધી રાખો.' : curLang === 'hi' ? 'कोई नोट नहीं है। अपने खेत की खाद, बुवाई व पानी की डायरी यहां बनाएं।' : 'No field notes yet. Track your sowing dates, pesticide sprays, and irrigations here.'}</p>
            ` : notes.map((n, i) => `
              <div class="myfarm-note-item">
                <div class="myfarm-note-meta">
                  <span class="myfarm-note-date">📅 ${n.date}</span>
                  <span class="myfarm-note-crop">🌱 ${n.crop}</span>
                </div>
                <p class="myfarm-note-text">${n.text}</p>
                <button class="myfarm-note-del" onclick="deleteFarmNote(${i})" title="Delete">🗑️</button>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }
  }

  window.addFarmNote = function (e) {
    e.preventDefault();
    const date = document.getElementById('noteDate')?.value;
    const crop = document.getElementById('noteCrop')?.value;
    const text = document.getElementById('noteText')?.value;
    if (!crop || !text) return;

    let notes = [];
    try {
      const raw = localStorage.getItem('agri_farm_notes');
      notes = raw ? JSON.parse(raw) : [];
    } catch (err) { notes = []; }

    notes.unshift({ date: date || new Date().toISOString().split('T')[0], crop, text });
    localStorage.setItem('agri_farm_notes', JSON.stringify(notes));
    renderMyFarmContent();
  };

  window.deleteFarmNote = function (idx) {
    let notes = [];
    try {
      const raw = localStorage.getItem('agri_farm_notes');
      notes = raw ? JSON.parse(raw) : [];
    } catch (err) { notes = []; }

    notes.splice(idx, 1);
    localStorage.setItem('agri_farm_notes', JSON.stringify(notes));
    renderMyFarmContent();
  };

  window.shareRateWhatsApp = function (crop, price, market) {
    const text = encodeURIComponent(`🌾 *AgriSystem Mandi Alert*\n\n📈 *${crop}* Rate: *₹${price}/Quintal*\n📍 Market: ${market}\n\n🔍 Check live farming updates & AI diagnostics:\nhttps://agri-info-red.vercel.app/prices.html`);
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  function updateMyFarmLabels() {
    const lang = localStorage.getItem('agribot_lang') || 'en';
    const texts = {
      en: { title: 'My Farm Dashboard', sub: 'Manage your favorite crops, monitor live market prices, track sowing schedules, and record field notes.', tabSaved: '⭐ Favorite Crops', tabWatchlist: '📊 Price Watchlist', tabCalendar: '🗓️ Sowing Calendar', tabNotes: '📝 Field Notes' },
      hi: { title: 'मेरा खेत डैशबोर्ड (My Farm)', sub: 'अपनी पसंदीदा फसलें संभालें, लाइव मंडी भाव ट्रैक करें, बुवाई कैलेंडर देखें और खेत डायरी दर्ज करें।', tabSaved: '⭐ पसंदीदा फसलें', tabWatchlist: '📊 भाव वॉचलिस्ट', tabCalendar: '🗓️ बुवाई कैलेंडर', tabNotes: '📝 खेत डायरी' },
      gu: { title: 'મારું ખેતર ડેશબોર્ડ (My Farm)', sub: 'તમારા મનપસંદ પાકનું સંચાલન કરો, લાઈવ બજાર ભાવો જુઓ, વાવણી કેલેન્ડર અને ખેતર નોંધ સાચવો.', tabSaved: '⭐ મનપસંદ પાક', tabWatchlist: '📊 ભાવ વૉચલિસ્ટ', tabCalendar: '🗓️ વાવણી કેલેન્ડર', tabNotes: '📝 ખેતર નોંધણી' }
    };
    const t = texts[lang] || texts.en;
    const tEl = document.getElementById('myFarmTitle');
    if (tEl) tEl.textContent = t.title;
    const sEl = document.getElementById('myFarmSub');
    if (sEl) sEl.textContent = t.sub;
    const b1 = document.getElementById('tabBtnSaved');
    if (b1) b1.textContent = t.tabSaved;
    const b2 = document.getElementById('tabBtnWatchlist');
    if (b2) b2.textContent = t.tabWatchlist;
    const b3 = document.getElementById('tabBtnCalendar');
    if (b3) b3.textContent = t.tabCalendar;
    const b4 = document.getElementById('tabBtnNotes');
    if (b4) b4.textContent = t.tabNotes;
  }

  // --------------------------------------------------------
  // 3. LOCAL WEATHER & AGRO-ADVISORY WIDGET (Open-Meteo)
  // --------------------------------------------------------
  window.fetchAgroWeather = async function (targetLat = null, targetLon = null) {
    const widget = document.getElementById('agroWeatherWidget');
    if (!widget) return;

    widget.innerHTML = `
      <div class="weather-loading-box">
        <div class="doctor-spinner"></div>
        <span>Fetching local weather & agro-advisory…</span>
      </div>
    `;

    // Coordinates fallback to Gujarat agricultural belt (Ahmedabad / Anand)
    let lat = targetLat || 23.0225;
    let lon = targetLon || 72.5714;
    let locationName = 'Gujarat Regional Hub';

    if (!targetLat && navigator.geolocation) {
      try {
        const pos = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 });
        });
        lat = pos.coords.latitude;
        lon = pos.coords.longitude;
        locationName = 'Your Farm Location';
      } catch (e) {
        // Fallback silently
      }
    }

    try {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=auto`;
      const resp = await fetch(url);
      if (!resp.ok) throw new Error('Weather API error');
      const data = await resp.json();
      renderAgroWeather(data, locationName);
    } catch (err) {
      console.warn('[AgroWeather] Error:', err);
      // Offline fallback mock data
      renderAgroWeather({
        current: { temperature_2m: 29.5, relative_humidity_2m: 62, weather_code: 1, wind_speed_10m: 12 },
        daily: { temperature_2m_max: [33], temperature_2m_min: [24], precipitation_probability_max: [15] }
      }, locationName + ' (Cached)');
    }
  };

  function renderAgroWeather(data, locName) {
    const widget = document.getElementById('agroWeatherWidget');
    if (!widget) return;

    const cur = data.current || {};
    const daily = data.daily || {};
    const temp = Math.round(cur.temperature_2m || 30);
    const humidity = cur.relative_humidity_2m || 60;
    const wind = cur.wind_speed_10m || 10;
    const rainProb = (daily.precipitation_probability_max && daily.precipitation_probability_max[0]) || 10;
    const maxT = (daily.temperature_2m_max && Math.round(daily.temperature_2m_max[0])) || (temp + 3);
    const minT = (daily.temperature_2m_min && Math.round(daily.temperature_2m_min[0])) || (temp - 4);
    const code = cur.weather_code || 0;

    // Weather code description
    let condition = 'Sunny / Clear';
    let icon = '☀️';
    if (code >= 1 && code <= 3) { condition = 'Partly Cloudy'; icon = '⛅'; }
    else if (code >= 45 && code <= 48) { condition = 'Foggy'; icon = '🌫️'; }
    else if (code >= 51 && code <= 67) { condition = 'Rain / Showers'; icon = '🌧️'; }
    else if (code >= 80 && code <= 82) { condition = 'Heavy Showers'; icon = '🌧️'; }
    else if (code >= 95) { condition = 'Thunderstorm'; icon = '⛈️'; }

    // Advisory calculation
    const curLang = localStorage.getItem('agribot_lang') || 'en';
    let advisory = '';
    let badgeType = 'advisory-good';

    if (rainProb >= 50 || code >= 51) {
      badgeType = 'advisory-warn';
      advisory = curLang === 'gu'
        ? '🌧️ ભારે વરસાદની સંભાવના: જંતુનાશક અને ખાતરનો છંટકાવ મોકૂફ રાખો. ખેતરમાં પાણીના નિકાલની વ્યવસ્થા કરો.'
        : curLang === 'hi'
        ? '🌧️ बारिश की संभावना: कीटनाशक व पर्णीय खाद का छिड़काव रोकें। खेतों में जल निकासी की व्यवस्था सुनिश्चित करें।'
        : '🌧️ High Rain Risk: Delay foliar pesticide/fertilizer spray. Ensure field drainage to avoid root rot.';
    } else if (temp >= 36) {
      badgeType = 'advisory-heat';
      advisory = curLang === 'gu'
        ? '☀️ ગરમીનું મોજું: પાકને ગરમીથી બચાવવા વહેલી સવારે અથવા સાંજે હળવું પિયત આપો.'
        : curLang === 'hi'
        ? '☀️ तेज धूप व गर्मी: फसल को गर्मी से बचाने हेतु सुबह या शाम के समय हल्की सिंचाई करें।'
        : '☀️ High Heat Advisory: Irrigate during early morning or late evening to protect crops from heat stress.';
    } else if (wind >= 22) {
      badgeType = 'advisory-wind';
      advisory = curLang === 'gu'
        ? '💨 તેજ પવન: દવાનો છંટકાવ ટાળો જેથી દવાનો વ્યય ન થાય. જરૂર મુજબ ઊંચા પાકને ટેકો આપો.'
        : curLang === 'hi'
        ? '💨 तेज हवाएं: कीटनाशक छिड़काव स्थगित करें ताकि दवा हवा में न उड़े। आवश्यकतानुसार पौधों को सहारा दें।'
        : '💨 Windy Conditions: Postpone spray operations to prevent chemical drift.';
    } else {
      advisory = curLang === 'gu'
        ? '🌱 ઉત્તમ હવામાન: નીંદામણ, વાવણી અને ખેતીના તમામ આયોજન માટે ખૂબ જ અનુકૂળ સમય છે.'
        : curLang === 'hi'
        ? '🌱 अनुकूल मौसम: निराई-गुड़ाई, बुवाई व खेत के अन्य कार्यों के लिए उत्तम मौसम है।'
        : '🌱 Favorable Conditions: Excellent weather for intercultural operations, weeding, and sowing.';
    }

    widget.innerHTML = `
      <div class="weather-card">
        <div class="weather-top-row">
          <div class="weather-city-badge">
            <span class="weather-pin">📍</span>
            <span class="weather-loc-name">${locName}</span>
            <button class="weather-refresh-btn" onclick="fetchAgroWeather()" title="Refresh Weather">🔄</button>
          </div>
          <span class="weather-condition-tag">${icon} ${condition}</span>
        </div>

        <div class="weather-core-grid">
          <div class="weather-temp-wrap">
            <span class="weather-curr-temp">${temp}°<small>C</small></span>
            <span class="weather-temp-range">H: ${maxT}° · L: ${minT}°</span>
          </div>

          <div class="weather-stats-list">
            <div class="weather-stat-item">
              <span class="w-stat-icon">💧</span>
              <span>Humidity: <strong>${humidity}%</strong></span>
            </div>
            <div class="weather-stat-item">
              <span class="w-stat-icon">🌧️</span>
              <span>Rain Chance: <strong>${rainProb}%</strong></span>
            </div>
            <div class="weather-stat-item">
              <span class="w-stat-icon">💨</span>
              <span>Wind: <strong>${wind} km/h</strong></span>
            </div>
          </div>
        </div>

        <div class="agro-advisory-banner ${badgeType}">
          <div class="advisory-title">🌾 Smart Agro-Advisory:</div>
          <p class="advisory-body">${advisory}</p>
        </div>
      </div>
    `;
  }

  // Setup DOM events
  document.addEventListener('DOMContentLoaded', () => {
    updateAllBookmarkButtons();
    if (document.getElementById('agroWeatherWidget')) {
      fetchAgroWeather();
    }
  });

  window.addEventListener('agribot_lang_changed', () => {
    if (document.getElementById('myFarmModal')?.classList.contains('open')) {
      updateMyFarmLabels();
      renderMyFarmContent();
    }
    if (document.getElementById('agroWeatherWidget')) {
      fetchAgroWeather();
    }
  });

})();
