# CropMate Offline 🌱
### 100% Offline AI Crop Helper with Voice Assistant & Vision Disease Analysis

**CropMate Offline** is a privacy-first, on-device agricultural assistant designed specifically for farmers. It provides actionable farming advice, visual crop disease analysis, voice interaction, and verified agronomic guides—**completely functioning when there is zero internet connectivity** in remote fields.

---

## 🌟 Key Capabilities

1. **Local AI Farm Chat (Windows & Android)**
   - Powered by genuine local AI models via **Ollama** on Windows laptops and **Capacitor on-device runtime** on Android phones.
   - Zero cloud API dependencies; no OpenAI, Anthropic, or external server calls.
   - Farmer-friendly plain English and Telugu language support.
   - Real-time response streaming, response copy, and abortable generation controls.

2. **Crop Doctor (Vision-Language Disease Analysis)**
   - Upload or snap camera photos of leaves, stems, or fruits directly in the field.
   - Automatically processed and scaled on-device to protect memory.
   - Analyzed using vision-capable local models (`gemma4:12b`, `llava`, `moondream`).
   - Produces structured 4-part assessments:
     1. Observable Visual Signs
     2. Possible Causes & Alternatives (nutrient deficiency vs pest vs fungal/bacterial)
     3. Practical, Low-Risk Next Steps (cultural practices, spacing, organic neem)
     4. Agricultural Safety & Extension Consultation Advisory.
   - **Strict Safety**: Never prescribes unverified hazardous chemical dosages or unsafe tank mixes.

3. **Hands-Free Voice Assistant**
   - In-chat voice input and dedicated full-screen Hands-Free Voice Mode for muddy field conditions.
   - Speech-to-Text with transcript preview and editing before submission.
   - Offline-capable Text-to-Speech (TTS) using local operating system voice packs (Windows SAPI / Android local voices).
   - Replay voice, mute, and playback rate adjustments.

4. **Curated Offline Crop Knowledge Library**
   - 100% available without any AI model running.
   - Curated references covering:
     - Staple crop care (Paddy, Wheat, Tomato, Cotton, Maize, Chilli, Potato).
     - Soil health, organic carbon, composting, and pH correction.
     - Critical irrigation timing and drip maintenance.
     - Visual diagnostic leaf symptom matrix.
     - Integrated Pest Management (IPM), pheromones, and home-made NSKE 5% neem extract.
     - Macro & micronutrient deficiencies (N, P, K, Zinc, Iron, Boron).
     - Safe fertilizer handling and 4R stewardship.
     - Seasonal checklists (Kharif, Rabi, Zaid).
     - Golden rules for photographing sick crops for AI and agronomy experts.

5. **Local Storage & Absolute Privacy**
   - IndexedDB database (`CropMateOfflineDB`) stores conversations, image diagnoses, and custom notes on-device.
   - Zero telemetry, zero analytics tracking, zero cloud uploads.
   - One-click JSON backup export and import with structure validation.

---

## 🏗️ Technology Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                 CropMate Offline App Shell                  │
│       React 19 • TypeScript • Vite • Responsive CSS • PWA   │
├─────────────────────────────────────────────────────────────┤
│  Dashboard  │  AI Chat  │  Crop Doctor  │ Voice │ Library  │
├─────────────────────────────────────────────────────────────┤
│                     Shared AI Provider Layer                │
│             aiService (AIProvider Interface)                │
├───────────────────────────────┬─────────────────────────────┤
│    Windows Local Runtime      │   Android Native Runtime    │
│  Ollama Daemon (127.0.0.1)    │  Capacitor App Storage      │
│  Model: gemma4:12b / llava    │  On-device NPU/GPU Models   │
├───────────────────────────────┴─────────────────────────────┤
│     On-Device Storage: IndexedDB (CropMateOfflineDB)        │
│     Offline Web Speech Synthesis & Speech Recognition       │
│     PWA Service Worker (sw.js) & Web App Manifest           │
└─────────────────────────────────────────────────────────────┘
```

---

## 🚀 Quickstart: Running on Windows

### Prerequisites
1. **Node.js** (v18 or higher).
2. **Ollama** installed on Windows: [Download from ollama.com](https://ollama.com).

### Step 1: Install Dependencies
Open PowerShell or Command Prompt in the project folder:
```powershell
npm.cmd install
```

### Step 2: Ensure Ollama is Running with a Vision Model
Check if Ollama is running:
```powershell
ollama list
```
If you do not have a vision model yet, run the recommended model:
```powershell
ollama run gemma4:12b
```
*(Alternative lightweight vision models: `ollama run llava` or `ollama run moondream`)*

### Step 3: Start the Development Server
```powershell
npm.cmd run dev
```
Open your browser at **`http://localhost:5173`**.

The application automatically connects to local Ollama via Vite's proxy (`/api/ollama`), bypassing any browser CORS restrictions!

---

## 📱 Packaging for Android via Capacitor

CropMate Offline is configured for native Android packaging via **Capacitor** (`capacitor.config.ts`).

### Step 1: Build the Production Bundle
```powershell
npm.cmd run build
```

### Step 2: Add Capacitor Android Platform
```powershell
npm.cmd install @capacitor/core @capacitor/cli @capacitor/android
npx.cmd cap add android
npx.cmd cap sync
```

### Step 3: Open in Android Studio & Generate APK
```powershell
npx.cmd cap open android
```
In Android Studio:
1. Verify permissions in `AndroidManifest.xml`:
   - `android.permission.CAMERA` (for leaf photos)
   - `android.permission.RECORD_AUDIO` (for voice queries)
   - `android.permission.MODIFY_AUDIO_SETTINGS`
2. Select **Build > Build Bundle(s) / APK(s) > Build APK(s)**.
3. Install the generated `.apk` directly on Android devices.

---

## 🧪 Verification & Offline Testing Checklist

| Test Scenario | Action | Expected Result | Status |
| :--- | :--- | :--- | :--- |
| **PWA Installation** | Click browser install icon or "Add to Home Screen" | Installs as standalone desktop or mobile application | ✅ Pass |
| **Offline Startup** | Disconnect Wi-Fi and mobile data; reload app | App shell and UI load instantly from Service Worker cache | ✅ Pass |
| **Offline Library** | Navigate to Crop Library while disconnected | All 9 curated guides, symptom matrices, and search work 100% | ✅ Pass |
| **Local AI Chat** | Ask: "How do I make neem spray?" with Wi-Fi off | Ollama streams response locally on CPU/GPU | ✅ Pass |
| **Vision Analysis** | Upload leaf photo in Crop Doctor; click Run Diagnosis | Model analyzes image locally and produces 4-section safety assessment | ✅ Pass |
| **Voice Output** | Tap "Listen" on any AI response | System offline speech engine reads response aloud | ✅ Pass |
| **Data Persistence** | Refresh browser or restart app | Chat history and saved diagnoses remain preserved in IndexedDB | ✅ Pass |
| **JSON Backup** | Export backup, clear data, and import backup | Data restored with verification count notice | ✅ Pass |

---

## 🛡️ Agricultural Safety & Ethics

1. **No Absolute Diagnostic Claims**: Visual images cannot distinguish certain viral strains or microscopic soil nematodes from abiotic stress. The app explicitly informs farmers that visual examination is an aid, not a laboratory certainty.
2. **No Hazardous Chemical Dosages**: CropMate Offline never suggests dangerous off-label pesticide mixes or chemical application rates. It directs farmers to local Krishi Vigyan Kendra (KVK) and state agricultural extension officers for registered regional formulations.
3. **Organic & Cultural First**: Recommendations prioritize sanitation (removing infected leaves), solarization, spacing, yellow sticky traps, and biological deterrents (neem extract).
