# 🌾 AgriSystem — Smart Agriculture Information & Advisory Platform

An intelligent, full-stack agricultural management and farmer advisory system. Built with vanilla modern web technologies, Node.js Express backend, and Google Gemini AI multimodal integration.

---

## 🌟 Key Features

- 🌾 **Crop Explorer**: Comprehensive catalog of 60+ Indian crops with detailed agronomic data, authentic Wikimedia photography, soil compatibility, duration, and care guides.
- 🌱 **Seed Management & Calculator**: Accurate seed rate (kg/acre), sowing depth, germination days, and row spacing guidelines.
- 🗓️ **Sowing & Harvesting Calendars**: Kharif, Rabi, and Zaid seasonal planning with dynamic crop recommendations.
- 🧪 **Soil Health Analyzer**: Interactive N-P-K nutrient diagnostic, pH balancing recommendations, and soil card generation.
- 📈 **Mandi Prices & Trends**: Live and simulated APMC market rates, price change badges, category filters, and CSV export.
- 🩺 **AI Crop Doctor**: Instant leaf disease identification and treatment advisory powered by Google Gemini Vision multimodal AI.
- 🤖 **AgriBot Assistant**: Trilingual AI conversational farming assistant supporting English, Hindi (हिंदी), and Gujarati (ગુજરાતી).
- 🔊 **Neural Speech (TTS)**: Built-in voice playback for crop care instructions in English, Hindi, and Gujarati.
- ⚖️ **Crop Comparison Matrix**: Side-by-side metric comparison for profit margins, water needs, and duration.
- 🚜 **Machinery & Tractor Hub**: Community equipment rental platform with direct WhatsApp contact.
- 🌿 **Botanical Natural Dark Mode**: Soothing, organic dark theme designed for reduced eye strain during night-time field use.
- 📱 **Progressive Web App (PWA)**: Offline-first service worker caching and installable on Android/iOS/Desktop.

---

## 🛠️ Tech Stack

- **Frontend**: Vanilla JavaScript (ES6+), HTML5, Custom CSS Design System (Glassmorphism & Nature Palette)
- **Backend**: Node.js, Express.js
- **AI & ML**: Google Gemini 1.5/2.0 Flash (Multimodal Vision & Chatbot API)
- **Speech**: Microsoft Edge Neural TTS
- **Deployment**: Vercel Serverless Functions + Global Edge CDN

---

## 🚀 Quick Start (Local Development)

1. **Clone the repository**:
   ```bash
   git clone https://github.com/iamdaredevil1336/final-agriculture.git
   cd final-agriculture
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Copy `.env.example` to `.env` and insert your API keys:
   ```bash
   cp .env.example .env
   ```

4. **Start the local server**:
   ```bash
   npm start
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## ☁️ Deploying to Vercel

This repository is pre-configured with `vercel.json` and `api/index.js` for zero-configuration Vercel deployment:

1. Push this repository to your GitHub account (`iamdaredevil1336/final-agriculture`).
2. Go to [vercel.com](https://vercel.com) and click **"Add New Project"**.
3. Import `final-agriculture`.
4. In **Project Settings > Environment Variables**, add:
   - `GEMINI_API_KEY`: Your Google AI Studio API key
   - `EMAIL_USER`: Your Gmail address (for password reset OTP)
   - `EMAIL_PASS`: Your 16-character Google App Password
   - `DATAGOV_API_KEY`: *(Optional)* Your data.gov.in Mandi prices API key
5. Click **Deploy**.

---

## 📄 License
MIT License. Created for smart farming and agricultural empowerment.
