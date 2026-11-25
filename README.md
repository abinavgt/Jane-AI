<p align="center">
  <img src="https://img.shields.io/badge/Jane%20AI-Intelligent%20Voice%20Agent-EBF981?style=for-the-badge&labelColor=0a0a0a" alt="Jane AI" />
</p>

<h1 align="center">Jane AI — Intelligent Multilingual Voice Agent & Course Counselor</h1>

<p align="center">
  <em>India's premier AI & Machine Learning Academy. Real-time voice counseling in English, Hindi & Tamil with placement support & automated demo bookings.</em>
</p>

<p align="center">
  <a href="https://github.com/abinavgt/Jane-AI"><img src="https://img.shields.io/badge/GitHub-abinavgt%2FJane--AI-181717?style=flat-square&logo=github" alt="GitHub" /></a>
  <img src="https://img.shields.io/badge/python-3.11+-3776AB?logo=python&logoColor=white" alt="Python" />
  <img src="https://img.shields.io/badge/react-18-61DAFB?logo=react&logoColor=black" alt="React" />
  <img src="https://img.shields.io/badge/fastapi-0.111-009688?logo=fastapi&logoColor=white" alt="FastAPI" />
  <img src="https://img.shields.io/badge/tailwindcss-3-06B6D4?logo=tailwindcss&logoColor=white" alt="Tailwind" />
  <img src="https://img.shields.io/badge/license-MIT-green" alt="License" />
</p>

---

## 🚀 About Jane AI

**Jane AI** fixes a broken process: most leads don't say no — they just never get a call in time.
Hot leads go straight to your relationship manager. Warm ones get a WhatsApp follow-up. Cold ones get re-engaged later. Nobody sorts them by hand.

### ✨ Key Features
- 🎙️ **Live Browser Mic Counseling**: Speak directly through your browser microphone; Jane AI transcribes your voice, reasons over the curriculum & career roadmap, and speaks the answer in real time.
- 🗣️ **Multilingual Support**: Real-time voice and text counseling in **English (`en-IN`)**, **Hindi (`hi-IN`)**, and **Tamil (`ta-IN`)**.
- 💡 **Instant Question Stack**: Pre-configured instant queries covering course fees, 0% interest EMI, placement guarantees, Cloud GPU access, scholarship tests, and 1-on-1 demo sessions.
- 📞 **Caller Cockpit with Direct Candidate Contacts**: Access interested student contact numbers, copy phone numbers in 1 click, direct dialer, and side-by-side transcripts.
- 📊 **Real-Time Sentiment & Lead Qualification**: Continuous sentiment tracking and automated 0-100 lead score calculation.
- 📅 **Automated 1-on-1 Demo Booking**: Instantly locks counseling demo appointments into the CRM when requested.

---

## 🛠️ Tech Stack
- **Frontend**: React 18, Vite, Tailwind CSS, Lucide Icons, Web Audio API (PCM 16-bit WAV)
- **Backend**: FastAPI, Python 3.11+, LangChain, SpeechRecognition, ChromaDB, Uvicorn
- **LLM Engine**: Dual failover (Groq `llama-3.3-70b-versatile` + Gemini Flash) with intelligent offline domain counseling fallback

---

## 📦 Local Development

### 1. Clone the Repository
```bash
git clone https://github.com/abinavgt/Jane-AI.git
cd Jane-AI
```

### 2. Backend Setup
```bash
cd backend
python -m venv .venv

# Windows
.\.venv\Scripts\activate
# Linux/macOS
source .venv/bin/activate

pip install -r requirements.txt
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

### 3. Frontend Setup
```bash
cd ../frontend
npm install
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🌐 Deployment Guide

### Option 1: 1-Click Full-Stack Deployment on Render (Recommended)
This repository includes a `render.yaml` blueprint that deploys both the FastAPI backend and React frontend:
1. Push your repository to GitHub: `https://github.com/abinavgt/Jane-AI`.
2. Log in to [Render Dashboard](https://dashboard.render.com/).
3. Click **New +** → **Blueprint**.
4. Connect `abinavgt/Jane-AI`.
5. Render will automatically detect `render.yaml` and deploy:
   - `jane-ai-backend` (FastAPI Web Service)
   - `jane-ai-frontend` (Vite Static Site with auto-configured `VITE_API_URL`)

---

### Option 2: Deploy Frontend on Vercel + Backend on Render/Railway

#### Step A: Deploy Backend (Render / Railway)
1. In Render, select **New Web Service** → Connect `abinavgt/Jane-AI`.
2. Root Directory: `backend`
3. Build Command: `pip install -r requirements.txt`
4. Start Command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
5. Environment Variables:
   - `DEMO_MODE=true`
   - `PORT=8000`
   - `GROQ_API_KEY` *(optional)*
   - `GEMINI_API_KEY` *(optional)*
6. Copy your deployed backend URL (e.g., `https://jane-ai-backend.onrender.com`).

#### Step B: Deploy Frontend (Vercel)
1. Go to [Vercel](https://vercel.com/) and click **Add New** → **Project**.
2. Import `abinavgt/Jane-AI`.
3. Root Directory: `frontend`
4. Framework Preset: **Vite**
5. Environment Variables:
   - `VITE_API_URL` = `https://jane-ai-backend.onrender.com` (your backend URL from Step A)
6. Click **Deploy**.

---

### Option 3: Docker Deployment
```bash
cd backend
docker build -t jane-ai-backend .
docker run -p 8000:8000 jane-ai-backend
```

---

## 📄 License
MIT © [Jane AI Team](https://github.com/abinavgt/Jane-AI)
