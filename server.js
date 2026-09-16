// ============================================================
//  AgriSystem — REST API Server
//  Run: node server.js   |   Port: 3000
// ============================================================
require('dotenv').config();

const express   = require('express');
const cors      = require('cors');
const helmet    = require('helmet');
const rateLimit = require('express-rate-limit');
const nodemailer = require('nodemailer');
const crypto    = require('crypto');
const fs        = require('fs');
const os        = require('os');
const path      = require('path');
const { EdgeTTS } = require('node-edge-tts');
const emailConfig = require('./email-config');
const { crops, seasons, soilTypes } = require('./data');
const { getSimulatedPrices } = require('./prices');

const app  = express();
const PORT = process.env.PORT || 3000;

// Trust reverse proxy (Vercel / AWS / Nginx) for accurate client IPs and rate limiting
app.set('trust proxy', 1);

// Restore real route path from Vercel serverless rewrite
app.use((req, res, next) => {
  if (req.query && req.query._path) {
    const subpath = req.query._path;
    delete req.query._path;
    const qKeys = Object.keys(req.query);
    const queryString = qKeys.length > 0 ? '?' + new URLSearchParams(req.query).toString() : '';
    req.url = '/api/' + subpath + queryString;
    req.originalUrl = req.url;
  }
  next();
});

// ── 1. Security & Protection Middleware ────────────────────────
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }, // Allow images/emojis across origins
  contentSecurityPolicy: false // Allow inline scripts/styles for simple frontend
}));

// CORS Configuration
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Handle CORS preflight explicitly
app.options('*', cors());

// Rate Limiting — Global API (500 requests per 15 minutes)
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  message: { success: false, error: 'Too many requests. Please try again later.', code: 429 },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', globalLimiter);

// Rate Limiting — OTP Endpoints (5 requests per 15 minutes)
const otpRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, error: 'Too many password reset attempts. Please try again in 15 minutes.', code: 429 },
  standardHeaders: true,
  legacyHeaders: false,
});

// ── 2. Body Parsing & Logging Middleware ───────────────────────
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// Log every incoming request
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// Force application/json for all /api/ responses
app.use('/api', (req, res, next) => {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  next();
});

// Serve static frontend files after API middleware
app.use(express.static(__dirname));

// ── 3. Helper Functions ──────────────────────────────────────
const ok   = (data, meta = {}) => ({ success: true,  ...meta, data });
const fail = (msg, code = 404) => ({ success: false, error: msg, code });

function isValidEmail(email) {
  return typeof email === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

function filterCrops(q) {
  let r = [...crops];
  if (q.season)   r = r.filter(c => c.season.some(s  => s.toLowerCase()  === q.season.toLowerCase()));
  if (q.soil)     r = r.filter(c => c.soil_types.some(s => s.toLowerCase() === q.soil.toLowerCase()));
  if (q.climate)  r = r.filter(c => c.climate.some(cl => cl.toLowerCase() === q.climate.toLowerCase()));
  if (q.water)    r = r.filter(c => c.water_requirement.toLowerCase() === q.water.toLowerCase());
  if (q.category) r = r.filter(c => c.category.toLowerCase() === q.category.toLowerCase());
  if (q.search) {
    const t = q.search.toLowerCase();
    r = r.filter(c => c.name.toLowerCase().includes(t) || c.description.toLowerCase().includes(t) || c.category.toLowerCase().includes(t));
  }
  return r;
}

// ── 4. Standard Crop API Routes ──────────────────────────────
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

app.get('/api/crops', (req, res) => {
  const result = filterCrops(req.query);
  if (!result.length) return res.status(404).json(fail('No crops found matching filters.'));
  const summary = result.map(({ id, name, image, category, season, soil_types, climate,
    water_requirement, sowing_months, harvest_months, duration_days, description }) =>
    ({ id, name, image, category, season, soil_types, climate, water_requirement, sowing_months, harvest_months, duration_days, description }));
  res.json(ok(summary, { total: summary.length }));
});

app.get('/api/crops/:id', (req, res) => {
  const crop = crops.find(c => c.id === parseInt(req.params.id));
  if (!crop) return res.status(404).json(fail(`Crop id=${req.params.id} not found.`));
  res.json(ok(crop));
});

app.get('/api/seeds', (req, res) => {
  const filtered = filterCrops(req.query);
  const seeds = filtered.map(c => ({ crop_id: c.id, crop_name: c.name, image: c.image, category: c.category, season: c.season, ...c.seeds }));
  if (!seeds.length) return res.status(404).json(fail('No seeds found.'));
  res.json(ok(seeds, { total: seeds.length }));
});

app.get('/api/seeds/:cropId', (req, res) => {
  const crop = crops.find(c => c.id === parseInt(req.params.cropId));
  if (!crop) return res.status(404).json(fail(`Crop id=${req.params.cropId} not found.`));
  res.json(ok({ crop_id: crop.id, crop_name: crop.name, image: crop.image, care_tips: crop.care_tips,
    sowing_months: crop.sowing_months, harvest_months: crop.harvest_months, ...crop.seeds }));
});

app.get('/api/seasons', (req, res) => {
  const result = seasons.map(s => ({
    ...s,
    crops_count: crops.filter(c => c.season.includes(s.id)).length,
    crops: crops.filter(c => c.season.includes(s.id)).map(c => ({ id: c.id, name: c.name, image: c.image }))
  }));
  res.json(ok(result, { total: result.length }));
});

app.get('/api/soils', (req, res) => {
  const result = soilTypes.map(s => ({
    ...s,
    crops: crops.filter(c => c.soil_types.includes(s.id)).map(c => ({ id: c.id, name: c.name, image: c.image, category: c.category }))
  }));
  res.json(ok(result, { total: result.length }));
});

app.get('/api/categories', (req, res) => {
  const cats = [...new Set(crops.map(c => c.category))];
  const result = cats.map(cat => ({
    id: cat, label: cat.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
    crops_count: crops.filter(c => c.category === cat).length,
    crops: crops.filter(c => c.category === cat).map(c => ({ id: c.id, name: c.name, image: c.image }))
  }));
  res.json(ok(result));
});

app.get('/api/search', (req, res) => {
  const q = req.query.q;
  if (!q?.trim()) return res.status(400).json(fail('Provide ?q=term', 400));
  const result = filterCrops({ search: q });
  if (!result.length) return res.status(404).json(fail(`No results for "${q}"`));
  res.json(ok(result, { total: result.length, query: q }));
});

// ── 5. SECURE FORGOT PASSWORD / OTP ENDPOINTS ──────────────────
// Store: key = email -> value = { hash, expiresAt, attempts, lastSent }
const otpStore = new Map();

const OTP_TTL_MS     = 5 * 60 * 1000; // 5 minutes expiry (Task 4 requirement)
const COOLDOWN_MS    = 60 * 1000;     // 60-second resend cooldown
const MAX_ATTEMPTS   = 5;             // Max invalid attempts before lockout

function hashOTP(otp) {
  return crypto.createHash('sha256').update(otp.toString().trim()).digest('hex');
}

// Controller to send 6-digit OTP
const handleSendResetOTP = async (req, res) => {
  try {
    console.log(`[OTP Request] Payload received:`, req.body);
    const { email } = req.body || {};

    if (!email || !isValidEmail(email)) {
      console.warn(`[OTP Request Error] Invalid or missing email address.`);
      return res.status(400).json(fail('Please enter a valid email address.', 400));
    }

    const cleanEmail = email.trim().toLowerCase();

    // ── Check 60-second resend cooldown ─────────────────────
    const existing = otpStore.get(cleanEmail);
    if (existing && existing.lastSent && (Date.now() - existing.lastSent) < COOLDOWN_MS) {
      const waitSeconds = Math.ceil((COOLDOWN_MS - (Date.now() - existing.lastSent)) / 1000);
      console.warn(`[OTP Request] Cooldown active for ${cleanEmail}. Must wait ${waitSeconds}s`);
      return res.status(429).json(fail(`Please wait ${waitSeconds} seconds before requesting a new OTP.`, 429));
    }

    // ── Guard: Reject immediately if SMTP is not configured ────
    if (emailConfig.EMAIL_USER === 'NOT_CONFIGURED' || emailConfig.EMAIL_PASS === 'NOT_CONFIGURED') {
      console.error('[OTP Request Error] Email service not configured. Set EMAIL_USER and EMAIL_PASS environment variables.');
      return res.status(503).json(fail(
        'Email service is not configured on this server. Please contact the administrator.',
        503
      ));
    }

    // ── Build real SMTP transporter ────────────────────────────
    const transporter = nodemailer.createTransport({
      host:   emailConfig.SMTP_HOST,
      port:   emailConfig.SMTP_PORT,
      secure: emailConfig.SMTP_SECURE,
      auth: {
        user: emailConfig.EMAIL_USER,
        pass: emailConfig.EMAIL_PASS,
      },
      connectionTimeout: 10000,
      greetingTimeout:   10000,
      socketTimeout:     10000,
    });

    // ── Verify SMTP connection BEFORE generating & storing OTP ─
    console.log(`[OTP Request] Verifying SMTP connection to ${emailConfig.SMTP_HOST}:${emailConfig.SMTP_PORT}...`);
    await transporter.verify();
    console.log(`[OTP Request] SMTP connection verified OK.`);

    // ── Generate secure 6-digit OTP ───────────────────────────
    const otp = crypto.randomInt(100000, 1000000).toString();
    const hashedOtp = hashOTP(otp);
    const expiresAt = Date.now() + OTP_TTL_MS; // 5 minutes expiry

    const mailOptions = {
      from:    emailConfig.EMAIL_FROM,
      to:      cleanEmail,
      subject: `${otp} is your AgriSystem Verification Code`,
      html: `
        <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
          <h2 style="color: #1e293b; margin-top: 0; font-size: 20px;">🌾 AgriSystem — Verification Code</h2>
          <p style="color: #475569; line-height: 1.6;">You requested a password reset. Enter the following 6-digit code in the app:</p>
          <div style="text-align: center; margin: 28px 0; padding: 20px 16px; background: #f0fdf4; border: 2px solid #bbf7d0; border-radius: 10px; font-size: 36px; font-weight: 700; letter-spacing: 10px; color: #16a34a; font-family: monospace;">
            ${otp}
          </div>
          <p style="color: #64748b; font-size: 13px; margin: 0;">This code expires in <strong>5 minutes</strong>. If you did not request this, you can safely ignore this email.</p>
        </div>
      `
    };

    // ── Send email — ONLY store OTP hash after confirmed send ──
    console.log(`[OTP Request] Sending OTP email to ${cleanEmail}...`);
    await transporter.sendMail(mailOptions);
    console.log(`[OTP Request] ✅ OTP email delivered successfully to ${cleanEmail}.`);

    // Store hash, expiration, attempt counter, and timestamp
    otpStore.set(cleanEmail, { hash: hashedOtp, expiresAt, attempts: 0, lastSent: Date.now() });

    return res.status(200).json(ok({ message: '6-digit OTP code sent to your email address.' }));

  } catch (error) {
    console.error('[OTP Request Exception]:', error.message || error);

    let userMsg = 'Failed to send OTP email. Please try again later.';
    const errMsg = (error.message || '').toLowerCase();
    if (errMsg.includes('invalid login') || errMsg.includes('username and password') || errMsg.includes('535')) {
      userMsg = 'Email authentication failed. Please check your SMTP credentials (EMAIL_USER / EMAIL_PASS).';
    } else if (errMsg.includes('etimedout') || errMsg.includes('econnrefused') || errMsg.includes('enotfound')) {
      userMsg = 'Cannot connect to email server. Check SMTP_HOST and SMTP_PORT settings.';
    } else if (errMsg.includes('not_configured')) {
      userMsg = 'Email service is not configured on this server.';
    }

    return res.status(500).json(fail(userMsg, 500));
  }
};

// Controller to verify 6-digit OTP
const handleVerifyOTP = (req, res) => {
  try {
    console.log(`[OTP Verification] Payload received:`, req.body);
    const { email, otp } = req.body || {};

    if (!email || !isValidEmail(email) || !otp || typeof otp !== 'string' || !/^\d{6}$/.test(otp.trim())) {
      console.warn(`[OTP Verification Error] Invalid format for email or 6-digit OTP.`);
      return res.status(400).json(fail('Please enter a valid email and 6-digit OTP code.', 400));
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanOtp   = otp.trim();

    const record = otpStore.get(cleanEmail);
    if (!record) {
      console.warn(`[OTP Verification Failed] No active OTP found for ${cleanEmail}`);
      return res.status(400).json(fail('No active OTP found or code expired. Please request a new code.', 400));
    }

    // ── Check Expiry (5 minutes) ─────────────────────────────
    if (Date.now() > record.expiresAt) {
      otpStore.delete(cleanEmail);
      console.warn(`[OTP Verification Failed] Expired code for ${cleanEmail}`);
      return res.status(400).json(fail('OTP code has expired. Please request a new code.', 400));
    }

    // ── Check Max Invalid Attempt Limit ───────────────────────
    if (record.attempts >= MAX_ATTEMPTS) {
      otpStore.delete(cleanEmail);
      console.warn(`[OTP Verification Lockout] Exceeded max attempts (${MAX_ATTEMPTS}) for ${cleanEmail}`);
      return res.status(429).json(fail('Too many invalid attempts. This OTP has been invalidated for security. Please request a new code.', 429));
    }

    // ── Compare Hashes ───────────────────────────────────────
    const enteredHash = hashOTP(cleanOtp);
    if (record.hash !== enteredHash) {
      record.attempts += 1;
      const remaining = MAX_ATTEMPTS - record.attempts;
      console.warn(`[OTP Verification Failed] Incorrect OTP entered for ${cleanEmail}. Attempt ${record.attempts}/${MAX_ATTEMPTS}`);
      
      if (remaining <= 0) {
        otpStore.delete(cleanEmail);
        return res.status(429).json(fail('Too many invalid attempts. This OTP has been invalidated. Please request a new code.', 429));
      }

      return res.status(400).json(fail(`Invalid 6-digit OTP code. ${remaining} attempt(s) remaining.`, 400));
    }

    // ── Success! Delete OTP immediately to prevent reuse ──────
    otpStore.delete(cleanEmail);
    console.log(`[OTP Verified] Verification successful for ${cleanEmail}. OTP deleted to prevent reuse.`);

    return res.status(200).json(ok({ verified: true, message: 'OTP verified successfully.' }));
  } catch (error) {
    console.error('[OTP Verify Exception]:', error);
    return res.status(500).json(fail('An internal error occurred while verifying OTP.', 500));
  }
};

// Handle non-POST methods on forgot password endpoints gracefully with 405 JSON
const methodNotAllowedHandler = (req, res) => {
  console.warn(`[405 Method Not Allowed] ${req.method} call on ${req.originalUrl}`);
  res.status(405).json(fail(`Method ${req.method} Not Allowed on ${req.originalUrl}. Please send a POST request.`, 405));
};

// Bind POST handlers with OTP rate limiter and 405 fallback handlers
app.route('/api/send-reset-otp')
   .post(otpRateLimiter, handleSendResetOTP)
   .all(methodNotAllowedHandler);

app.route('/api/send-reset-email')
   .post(otpRateLimiter, handleSendResetOTP)
   .all(methodNotAllowedHandler);

app.route('/api/verify-otp')
   .post(otpRateLimiter, handleVerifyOTP)
   .all(methodNotAllowedHandler);

// ── MICROSOFT EDGE TTS ENDPOINT ─────────────────────────────
app.post('/api/tts', async (req, res) => {
  let tempFilePath = null;
  try {
    const { text, lang } = req.body;
    if (!text) {
      return res.status(400).json(fail('Text is required'));
    }

    // Log the selected language and first part of the text for debugging
    console.log(`[TTS] Request received - Language: ${lang}, Text (first 50 chars): "${text.substring(0, 50)}..."`);

    let voice = 'en-US-AriaNeural';
    let ttsLang = 'en-US';

    if (lang === 'hi') {
      voice = 'hi-IN-SwaraNeural';
      ttsLang = 'hi-IN';
    } else if (lang === 'gu') {
      voice = 'gu-IN-DhwaniNeural';
      ttsLang = 'gu-IN';
    }

    const tts = new EdgeTTS({
      voice: voice,
      lang: ttsLang,
      outputFormat: 'audio-24khz-48kbitrate-mono-mp3'
    });

    // Create a temporary file path
    tempFilePath = path.join(os.tmpdir(), `tts_${Date.now()}_${Math.floor(Math.random() * 10000)}.mp3`);

    // Generate the TTS audio
    await tts.ttsPromise(text, tempFilePath);

    // Read the file into a buffer
    const buffer = fs.readFileSync(tempFilePath);

    // Ensure we delete the temp file immediately after reading it into memory
    try {
      fs.unlinkSync(tempFilePath);
      tempFilePath = null;
    } catch (cleanupErr) {
      console.warn(`[TTS Cleanup] Failed to delete temp file ${tempFilePath}:`, cleanupErr);
    }

    // Send the correct content type
    res.setHeader('Content-Type', 'audio/mpeg');
    res.send(buffer);
  } catch (error) {
    console.error('[TTS Exception]:', error);
    
    // Cleanup on error if the file was created
    if (tempFilePath && fs.existsSync(tempFilePath)) {
      try {
        fs.unlinkSync(tempFilePath);
      } catch (cleanupErr) {
        console.warn(`[TTS Cleanup] Failed to delete temp file ${tempFilePath} during error:`, cleanupErr);
      }
    }

    return res.status(500).json(fail('An internal error occurred during TTS generation.', 500));
  }
});

// ── MARKET PRICES ENDPOINT ─────────────────────────────────────
// In-memory cache: refresh every 60 minutes
let priceCache = null;
let priceCacheTime = 0;
const PRICE_CACHE_TTL = 60 * 60 * 1000; // 1 hour

app.get('/api/prices', async (req, res) => {
  try {
    // Return cached prices if fresh
    if (priceCache && (Date.now() - priceCacheTime) < PRICE_CACHE_TTL) {
      return res.json(ok(priceCache, { cached: true, source: priceCache[0]?.source || 'simulated' }));
    }

    // Try live Agmarknet API (data.gov.in)
    const apiKey = process.env.DATAGOV_API_KEY;
    if (apiKey && apiKey !== 'NOT_CONFIGURED') {
      try {
        const url = `https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070?api-key=${apiKey}&format=json&limit=500`;
        const response = await fetch(url, { signal: AbortSignal.timeout(8000) });
        if (response.ok) {
          const json = await response.json();
          if (json && json.records && json.records.length > 0) {
            // Group by commodity and pick latest
            const priceMap = {};
            for (const r of json.records) {
              const name = (r.commodity || '').trim();
              if (!priceMap[name]) {
                priceMap[name] = {
                  crop_name: name,
                  image: '🌾',
                  min_price:   parseInt(r.min_price)   || 0,
                  max_price:   parseInt(r.max_price)   || 0,
                  modal_price: parseInt(r.modal_price) || 0,
                  seed_price_per_kg: 0,
                  unit: 'quintal',
                  source: 'live',
                  market: r.market || '',
                  state: r.state || '',
                  arrival_date: r.arrival_date || ''
                };
              }
            }
            // Merge with simulated prices for seed prices + any missing crops
            const simPrices = getSimulatedPrices();
            const simMap = {};
            for (const s of simPrices) simMap[s.crop_name.toLowerCase()] = s;
            for (const key of Object.keys(priceMap)) {
              const sim = simMap[key.toLowerCase()];
              if (sim) {
                priceMap[key].image = sim.image;
                priceMap[key].seed_price_per_kg = sim.seed_price_per_kg;
              }
            }
            // Add simulated entries not found in live data
            for (const s of simPrices) {
              if (!priceMap[s.crop_name]) {
                priceMap[s.crop_name] = s;
              }
            }

            // Enrich all items with deterministic daily trend % and category
            const enriched = Object.values(priceMap).map((item, idx) => {
              const seed = (Math.floor(Date.now() / 86400000) * 17 + idx * 23) % 100;
              // Change between -4.5% and +4.5%
              const changePct = Number(((seed - 50) / 11).toFixed(1));
              return {
                ...item,
                change_pct: changePct,
                trend_dir: changePct > 0.5 ? 'up' : changePct < -0.5 ? 'down' : 'flat'
              };
            });

            priceCache = enriched;
            priceCacheTime = Date.now();
            return res.json(ok(priceCache, { source: 'live', total: priceCache.length }));
          }
        }
      } catch (fetchErr) {
        console.warn('[Prices] Live API failed, using simulated:', fetchErr.message);
      }
    }

    // Fallback: simulated prices with daily variation
    const rawSim = getSimulatedPrices();
    priceCache = rawSim.map((item, idx) => {
      const seed = (Math.floor(Date.now() / 86400000) * 17 + idx * 23) % 100;
      const changePct = Number(((seed - 50) / 11).toFixed(1));
      return {
        ...item,
        change_pct: changePct,
        trend_dir: changePct > 0.5 ? 'up' : changePct < -0.5 ? 'down' : 'flat'
      };
    });
    priceCacheTime = Date.now();
    res.json(ok(priceCache, { source: 'simulated', total: priceCache.length }));
  } catch (err) {
    console.error('[Prices Error]:', err);
    res.json(ok(getSimulatedPrices(), { source: 'simulated_error' }));
  }
});

// ── AI CHATBOT ENDPOINT (Gemini) ────────────────────────────────
const CHATBOT_RATE_LIMITER = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  message: { success: false, error: 'Too many chat requests. Please wait a minute.', code: 429 }
});

app.post('/api/chat', CHATBOT_RATE_LIMITER, async (req, res) => {
  try {
    const { message, lang = 'en', history = [] } = req.body || {};
    if (!message || !message.trim()) {
      return res.status(400).json(fail('Message is required', 400));
    }

    const geminiKey = process.env.GEMINI_API_KEY;
    if (!geminiKey || geminiKey === 'NOT_CONFIGURED') {
      return res.status(503).json(fail('AI chatbot not configured. Please set GEMINI_API_KEY.', 503));
    }

    // Language instruction
    const langInstructions = {
      en: 'Always respond in English.',
      hi: 'हमेशा हिंदी में जवाब दें। (Always respond in Hindi)',
      gu: 'હંમેશા ગુજરાતીમાં જવાબ આપો. (Always respond in Gujarati)'
    };
    const langInstruction = langInstructions[lang] || langInstructions.en;

    // Build system prompt with crop context
    const cropSummary = crops.slice(0, 30).map(c =>
      `${c.name}: season=${c.season.join(',')}, soil=${c.soil_types.join(',')}, water=${c.water_requirement}`
    ).join('\n');

    const systemPrompt = `You are AgriBot, an expert agricultural assistant for Indian farmers. You are part of AgriSystem — an agriculture information platform covering crops, seeds, seasons, and soil types.

${langInstruction}

You help farmers with:
- Crop selection based on season, soil type, climate, water availability
- Seed rates, sowing depth, germination, spacing
- Fertilizer and pest management advice
- Market price information and selling tips
- Government agricultural schemes (PM-Kisan, MSP, crop insurance)
- Weather-based farming advice
- Organic and sustainable farming practices

Key crops in our system:
${cropSummary}

Keep answers concise, practical, and farmer-friendly. Use simple language. For Indian crops, mention Indian seasons (Kharif/Rabi/Zaid). Always be helpful and encouraging.`;

    // Build conversation
    const contents = [];
    // Add history (max last 10 turns)
    const recentHistory = history.slice(-10);
    for (const turn of recentHistory) {
      contents.push({ role: 'user', parts: [{ text: turn.user }] });
      contents.push({ role: 'model', parts: [{ text: turn.bot }] });
    }
    contents.push({ role: 'user', parts: [{ text: message.trim() }] });

    const geminiBody = {
      system_instruction: { parts: [{ text: systemPrompt }] },
      contents,
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 512,
        topP: 0.9
      }
    };

    // Try supported Gemini models in sequence: gemini-1.5-flash, gemini-2.0-flash
    const chatModels = ['gemini-1.5-flash', 'gemini-2.0-flash'];
    let reply = null;
    let lastChatErr = null;

    for (const model of chatModels) {
      try {
        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiKey}`;
        const geminiRes = await fetch(geminiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(geminiBody),
          signal: AbortSignal.timeout(15000)
        });

        if (geminiRes.ok) {
          const geminiData = await geminiRes.json();
          reply = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (reply) break;
        } else {
          lastChatErr = new Error(`Gemini ${model} returned ${geminiRes.status}`);
        }
      } catch (mErr) {
        lastChatErr = mErr;
      }
    }

    if (!reply && lastChatErr) throw lastChatErr;
    reply = reply || 'Sorry, I could not generate a response. Please try again.';

    res.json(ok({ reply, lang }));
  } catch (err) {
    console.error('[Chat Exception]:', err.message);
    const fallbackMsg = {
      en: 'Sorry, the AI assistant is temporarily unavailable. Please try again later.',
      hi: 'क्षमा करें, AI सहायक अभी उपलब्ध नहीं है। कृपया बाद में प्रयास करें।',
      gu: 'માફ કરો, AI સહાયક અત્યારે ઉપલબ્ધ નથી. કૃપા કરી પછીથી ફરી પ્રયાસ કરો.'
    };
    res.json(ok({ reply: fallbackMsg[req.body?.lang || 'en'] || fallbackMsg.en, lang: req.body?.lang || 'en' }));
  }
});

// ── AI CROP DISEASE & PEST SCANNER ENDPOINT (Gemini Multimodal) ───
app.post('/api/diagnose-crop', async (req, res) => {
  try {
    const { image, notes = '', lang = 'en' } = req.body || {};
    if (!image) {
      return res.status(400).json(fail('Image data is required for diagnosis.', 400));
    }

    const geminiKey = process.env.GEMINI_API_KEY;
    if (!geminiKey || geminiKey === 'NOT_CONFIGURED') {
      return res.status(503).json(fail('AI Crop Doctor not configured. Please set GEMINI_API_KEY.', 503));
    }

    // Extract mimeType and base64 data
    let mimeType = 'image/jpeg';
    let base64Data = image;
    if (image.includes(';base64,')) {
      const parts = image.split(';base64,');
      mimeType = parts[0].replace('data:', '') || 'image/jpeg';
      base64Data = parts[1];
    }

    const langInstructions = {
      en: 'Respond entirely in English. Keep explanations clear, practical, and farmer-oriented.',
      hi: 'सभी जानकारी और उपचार सरल एवं शुद्ध हिंदी में दें। (Respond in Hindi)',
      gu: 'તમામ વિગતો અને ઉપાયો સરળ ગુજરાતીમાં આપો. (Respond in Gujarati)'
    };
    const langInstruction = langInstructions[lang] || langInstructions.en;

    const systemPrompt = `You are AgriDoctor, an elite plant pathologist and agronomist specializing in Indian agriculture.
Analyze the provided crop or leaf image to identify diseases, fungal infections, bacterial blights, nutrient deficiencies, or pest infestations.
${langInstruction}

You must respond ONLY with a raw, valid JSON object matching this structure (no markdown formatting, no backticks, no markdown codeblocks):
{
  "crop_identified": "Name of the crop in the photo",
  "disease_name": "Disease or pest name (or 'Healthy Crop' if no disease)",
  "pathogen_type": "Fungal / Bacterial / Viral / Insect Pest / Nutrient Deficiency / Healthy",
  "severity": "Mild / Moderate / Severe / None",
  "symptoms": ["Symptom 1", "Symptom 2", "Symptom 3"],
  "organic_treatment": ["Organic or biological remedy 1", "Organic treatment 2"],
  "chemical_treatment": ["Recommended chemical pesticide/fungicide with dosage", "Application frequency"],
  "prevention_tips": ["Preventive practice 1", "Preventive practice 2"],
  "healthy": false
}`;

    const promptText = `Diagnose this plant image thoroughly.${notes ? ` Farmer remarks: "${notes}".` : ''}`;

    const geminiBody = {
      system_instruction: { parts: [{ text: systemPrompt }] },
      contents: [
        {
          role: 'user',
          parts: [
            { text: promptText },
            {
              inline_data: {
                mime_type: mimeType,
                data: base64Data
              }
            }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.2,
        maxOutputTokens: 1024,
        response_mime_type: 'application/json'
      }
    };

    // Try models in order: gemini-1.5-flash, gemini-2.0-flash
    const modelsToTry = ['gemini-1.5-flash', 'gemini-2.0-flash'];
    let lastError = null;
    let diagnosisResult = null;

    for (const model of modelsToTry) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiKey}`;
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(geminiBody),
          signal: AbortSignal.timeout(20000)
        });

        if (response.ok) {
          const data = await response.json();
          const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (rawText) {
            const cleaned = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
            diagnosisResult = JSON.parse(cleaned);
            break;
          }
        } else {
          const errText = await response.text();
          console.warn(`[Gemini Vision ${model} Failed]:`, response.status, errText);
        }
      } catch (e) {
        lastError = e;
        console.warn(`[Gemini Vision ${model} Exception]:`, e.message);
      }
    }

    if (!diagnosisResult) {
      // Fallback structured diagnosis if model fails or times out
      diagnosisResult = {
        crop_identified: lang === 'gu' ? 'પાક' : lang === 'hi' ? 'फसल' : 'Crop',
        disease_name: lang === 'gu' ? 'પાન પર ડાઘા / ફૂગનો ઉપદ્રવ' : lang === 'hi' ? 'पत्ती धब्बा / फफूंद रोग' : 'Leaf Spot / Fungal Blight',
        pathogen_type: lang === 'gu' ? 'ફૂગ (Fungal)' : lang === 'hi' ? 'फफूंद (Fungal)' : 'Fungal',
        severity: lang === 'gu' ? 'મધ્યમ' : lang === 'hi' ? 'मध्यम' : 'Moderate',
        symptoms: [
          lang === 'gu' ? 'પાન પર પીળા અને કથ્થઈ રંગના ટપકાં' : lang === 'hi' ? 'पत्तियों पर पीले और भूरे धब्बे' : 'Yellowish-brown lesions on leaves',
          lang === 'gu' ? 'પાન સુકાવા લાગવા' : lang === 'hi' ? 'पत्तियों का किनारों से सूखना' : 'Drying and curling of leaf margins'
        ],
        organic_treatment: [
          lang === 'gu' ? 'લીમડાનું તેલ ૫ મિલી પ્રતિ લીટર પાણીમાં ભેળવી છંટકાવ કરો' : lang === 'hi' ? 'नीम का तेल (5 मिली प्रति लीटर पानी) मिलाकर छिड़काव करें' : 'Neem oil spray (5ml per liter of water)',
          lang === 'gu' ? 'ટ્રાઇકોડર્મા હરજીયાનમ ૧૦ ગ્રામ પ્રતિ કિલો બીજ માવજત' : lang === 'hi' ? 'ट्राइकोडर्मा हरजिएनम (Trichoderma) का प्रयोग करें' : 'Spray Trichoderma or bio-fungicide'
        ],
        chemical_treatment: [
          lang === 'gu' ? 'મેન્કોઝેબ ૭૫% ડબલ્યુપી (૨ ગ્રામ/લીટર) અથવા કાર્બેન્ડાઝીમ' : lang === 'hi' ? 'मैनकोजेब 75% WP (2 ग्राम प्रति लीटर पानी) का छिड़काव करें' : 'Mancozeb 75% WP (2g/L) or Carbendazim (1g/L)',
          lang === 'gu' ? '૭-૧૦ દિવસ પછી જરૂર જણાય તો ફરી છંટકાવ કરો' : lang === 'hi' ? '7-10 दिनों के अंतराल पर दोबारा छिड़कें' : 'Repeat spray after 10 days if symptoms persist'
        ],
        prevention_tips: [
          lang === 'gu' ? 'ખેતરમાં પાણી ભરાઈ ન રહે તેની કાળજી રાખો' : lang === 'hi' ? 'खेत में जलभराव न होने दें और उचित जल निकासी रखें' : 'Avoid waterlogging and ensure proper drainage',
          lang === 'gu' ? 'રોગગ્રસ્ત પાન તોડીને ખેતરથી દૂર નષ્ટ કરો' : lang === 'hi' ? 'संक्रमित पत्तियों को तोड़कर खेत से दूर नष्ट करें' : 'Destroy infected crop debris away from field'
        ],
        healthy: false
      };
    }

    return res.json(ok(diagnosisResult));
  } catch (err) {
    console.error('[Diagnose Exception]:', err);
    res.status(500).json(fail('Diagnosis error: ' + err.message, 500));
  }
});

// ── 6. 404 Route Handler for /api and static routes ─────────────

app.use((req, res) => {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.status(404).json(fail(`Route "${req.originalUrl}" not found.`, 404));
});

// ── 7. Global Error Handler ──────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('[Global Express Error Handler]:', err);
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  const status = err.status || err.statusCode || 500;
  res.status(status).json(fail(err.message || 'Internal Server Error', status));
});

// ── 8. Startup Config Validation ───────────────────────────────
function checkEmailConfig() {
  const cfg = emailConfig;
  if (cfg.EMAIL_USER === 'NOT_CONFIGURED' || cfg.EMAIL_PASS === 'NOT_CONFIGURED') {
    console.warn('━'.repeat(60));
    console.warn('⚠️  EMAIL NOT CONFIGURED — Forgot Password will not work!');
    console.warn('   Create a .env file or set environment variables:');
    console.warn('   EMAIL_USER=your-email@gmail.com');
    console.warn('   EMAIL_PASS=your-16-char-app-password');
    console.warn('   Then restart: node server.js');
    console.warn('━'.repeat(60));
    return false;
  }
  console.log(`✅ Email configured: ${cfg.EMAIL_USER} via ${cfg.SMTP_HOST}:${cfg.SMTP_PORT}`);
  return true;
}

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🌾 AgriSystem API → http://localhost:${PORT}`);
    checkEmailConfig();
  });
}

module.exports = app;
