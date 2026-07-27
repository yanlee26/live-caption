# 🎓 Academic Live Caption — Real-Time Bilingual Subtitles & Notes

An intelligent, real-time speech translation and bilingual captioning web application built for international students attending university lectures. Converts English lecture voice audio into real-time Chinese subtitles while protecting specialized academic terminology across Science, Engineering, Business, Medicine, Humanities, and Computer Science & AI.

---

## ✨ Features

- 🎙️ **Real-Time Speech-to-Chinese Translation**: Captures live English lecture voice audio via the Web Speech API and translates clauses instantaneously with preserving specialized domain vocabulary.
- 🎓 **Course-First Lecture Session Workflow**: Select from enrolled courses or create new university courses (Course Code, Title, Instructor, Category) before launching live captioning.
- 🛡️ **Continuous Microphone Auto-Reconnect**: Auto-recovers from browser silence pauses or 60-second timeouts, keeping the microphone active throughout full-length lectures.
- ⚡ **Web Speech Result Index Deduplication**: Eliminates duplicate caption entries using index tracking and recent-history deduplication guards.
- 🔐 **Google OAuth 2.0 & Auth0 Authentication**: Sign in with your Google Account (`@gmail.com` or university email) to manage personal lecture transcripts and courses.
- 📚 **Universal Academic Term Dictionary**: Cross-disciplinary dictionary covering Computer Science & AI, Science & Math, Business & Economics, Engineering, Medicine, and Humanities. Allows adding custom professor jargon.
- 💾 **Hybrid Local & Supabase Persistence**: Automatically persists enrolled courses, custom dictionaries, UI preferences, and lecture transcripts locally and syncs to Supabase cloud.
- 📥 **Lecture Notes Exporter**: One-click export of lecture transcripts, Chinese translations, and bookmarked sentences into Markdown or JSON format.

---

## 🗺️ Roadmap & TODO Features

- [ ] 🤖 **AI Implementation & LLM Translation Parser**: Integrate Gemini / OpenAI models for context-aware, high-precision academic translation that adapts to professor accent and lecture style.
- [ ] 💬 **AI Course Q&A Chatbot**: Interactive AI study assistant allowing students to ask clarifying questions directly against live lecture transcripts and course notes.
- [ ] 🧠 **Automated AI Terminology Generator**: Auto-extract domain-specific key terms, formulas, and bilingual definitions from live lecture streams or uploaded slides/PDFs.
- [ ] 📝 **AI Lecture Summaries & Flashcards**: One-click generation of weekly executive summaries, key takeaways, and interactive review flashcards for exam preparation.
- [ ] 📄 **Syllabus PDF Parser**: Automatically parse course syllabus documents to populate weekly course dates, topics, and assignment deadlines.
- [ ] 🎙️ **Multi-Speaker Diarization**: Advanced audio speaker identification to distinguish between professors, guest lecturers, and student Q&A interactions.

---

## 🛠️ Tech Stack

- **Framework**: React 18 + Vite
- **Language**: 100% TypeScript (`.ts` / `.tsx`)
- **Styling**: Modern Vanilla CSS with dark mode glassmorphism UI & micro-animations
- **Authentication**: `@react-oauth/google` (Google OAuth 2.0)
- **Icons**: `lucide-react`
- **Translation Engine**: Hybrid Term Preservation Parser + Google Translation API

---

## 🚀 Quick Start

### 1. Prerequisites
Ensure you have **Node.js** (v18+) and **npm** installed on your system.

### 2. Installation
```bash
# Clone the repository
git clone https://github.com/your-username/live-caption.git

# Navigate into project directory
cd live-caption

# Install dependencies
npm install
```

### 3. Configure Google OAuth 2.0 (Optional)
Copy `.env.example` to `.env` and set your Google OAuth Client ID:
```bash
cp .env.example .env
```
Inside `.env`:
```env
VITE_GOOGLE_CLIENT_ID=your_actual_google_client_id.apps.googleusercontent.com
```

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 📁 Project Structure

```text
live-caption/
├── public/
├── src/
│   ├── components/
│   │   ├── AudioControls.tsx        # Microphone toolbar & equalizer visualizer
│   │   ├── AuthModal.tsx            # Google OAuth & Student Auth modal
│   │   ├── CourseSelectorModal.tsx  # Course picker & custom course creator
│   │   ├── ExportModal.tsx          # Markdown/JSON lecture notes exporter
│   │   ├── GlossaryManager.tsx      # Universal Academic Term Dictionary
│   │   ├── LiveCaptionBar.tsx       # Real-time bilingual subtitle overlay
│   │   ├── Navbar.tsx               # Header navigation & user profile badge
│   │   ├── SettingsModal.tsx        # Subtitle font size & layout preferences
│   │   ├── TermCardModal.tsx        # Academic term definition card
│   │   └── TranscriptView.tsx       # Continuous lecture transcript stream
│   ├── context/
│   │   └── AuthContext.tsx          # Google OAuth & user authentication state
│   ├── data/
│   │   ├── courses.ts               # Pre-loaded university course dataset
│   │   └── csGlossary.ts            # Cross-disciplinary academic terms dataset
│   ├── types/
│   │   └── index.ts                 # TypeScript interfaces (Course, CSTerm, etc.)
│   ├── utils/
│   │   ├── storage.ts               # LocalStorage persistence manager
│   │   └── translationEngine.ts     # Term-preserving translation parser
│   ├── App.tsx                      # Core application orchestrator
│   ├── index.css                    # Design system tokens & glassmorphism styles
│   └── main.tsx                     # Application entry point
├── .env.example                     # Environment template
├── tsconfig.json                    # TypeScript configuration
└── vite.config.ts                   # Vite build configuration
```

---

## 📜 Available Scripts

- `npm run dev` — Launches local development server
- `npm run build` — Compiles production bundle with TypeScript checks
- `npx tsc --noEmit` — Runs standalone TypeScript compiler type check

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
