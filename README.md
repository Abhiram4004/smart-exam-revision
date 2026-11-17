# 🎓 Smart Exam Revision Website (PWA)

> **Mobile-Friendly, Offline-Capable Revision Platform with Spaced Repetition (SM-2), Adaptive Quizzes, and Progress Tracking.**
> Course Project for Web Technologies & Mobile Programming (Project #47)

---

## 🌟 Key Features

1. **📱 Installable Progressive Web App (PWA)**
   - Custom Service Worker caching the App Shell and revision APIs.
   - Works seamlessly with **zero internet connection** on laptops, tablets, and mobile devices.
   - Meets 44–48px touch target requirements with responsive Flexbox/Grid layouts.

2. **🧠 Spaced Repetition Algorithm (SM-2)**
   - Mathematically schedules flashcard reviews based on active recall difficulty ratings (Again, Hard, Good, Easy).
   - Automatically adapts easiness factors and repetition intervals (1 day → 6 days → exponential spacing).

3. **🎯 Smart Daily Revision & Weak-Topic Detection**
   - Automatically generates daily revision sessions by combining cards due today with topics where quiz accuracy dipped below 60%.
   - "Practice Weak Areas" dynamic action button.

4. **⚡ Interactive Quiz Mode**
   - Subject-specific randomized MCQs with customizable question counts (5, 10, 15, 20).
   - Optional 60-second exam simulation timer with auto-submit.
   - Immediate feedback, question review with academic explanations, and "Retry Wrong Answers".

5. **📊 Progress Tracking & Gamification**
   - Study streak tracking (fire badge) and circular daily goal progress ring.
   - Last 7 days activity breakdown chart (cards reviewed vs. quizzes taken).
   - Subject accuracy benchmarks and cards mastered counter (intervals ≥ 21 days).
   - Exam countdown timer widget on the dashboard.

6. **🔖 Bookmarking & JSON Syllabus Import/Export**
   - Bookmark critical flashcards and questions for quick reference.
   - Export custom decks as portable JSON files to share with classmates; import syllabi instantly.

7. **🛡️ Role-Based Authentication & Faculty Admin Portal**
   - JWT stateless authentication with passwords hashed using `bcryptjs`.
   - Role checks (`student` and `admin`).
   - Admin management panel to create, update, and prune curriculum subjects and question bank items.

---

## 🛠️ Tech Stack & Minimal Dependencies

| Layer | Technology | Version | Reason for Choice |
|---|---|---|---|
| **Frontend Framework** | React | ^18.2.0 | Component-driven architecture, virtual DOM reconciliation, hooks |
| **Build Tool** | Vite | ^5.0.8 | Blazing fast ESM dev server, optimized rollup production bundles |
| **Styling** | Tailwind CSS | ^3.4.0 | Mobile-first responsive utilities, built-in dark mode classes |
| **Routing** | React Router DOM | ^6.21.0 | Declarative client-side routing, protected route guards |
| **Icons** | React Icons | ^4.12.0 | Bundled lightweight SVG icons (no external web font CDNs) |
| **Charts** | Chart.js + react-chartjs-2 | ^4.4.1 | Canvas-rendered offline analytics charts |
| **Notifications** | React Hot Toast | ^2.4.1 | Minimalist accessible toast feedback |
| **Backend Runtime** | Node.js + Express | ^4.19.2 | Syllabus core requirement, asynchronous non-blocking REST API |
| **Database** | MongoDB + Mongoose | ^8.5.1 | Document-oriented data store matching hierarchical flashcards/quizzes |
| **Security** | Helmet + CORS + RateLimit | — | HTTP security headers, CORS origin protection, auth brute-force mitigation |
| **Password Hashing**| bcryptjs | ^2.4.3 | Pure JavaScript one-way cryptographic password hashing |
| **Token Auth** | jsonwebtoken | ^9.0.2 | Stateless signed tokens carrying role-based claims |

---

## 📋 Prerequisites

- **Node.js**: v18.0.0 or later (`node -v`)
- **MongoDB**: Community Server v6.0+ running locally on port 27017 (`mongodb://127.0.0.1:27017`)
- **Package Manager**: `npm` or `pnpm`

---

## 🚀 Quick Start (Local & Offline Evaluation)

### 1. Clone & Install Dependencies
```bash
# Clone the repository
cd smart-exam-revision

# Install root, server, and client packages
npm run install:all
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env` in the root folder:
```bash
cp .env.example .env
```
Default configuration:
```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/smart-exam-revision
JWT_SECRET=smart-revision-dev-secret-key-2024
JWT_EXPIRES_IN=7d
ADMIN_EMAIL=admin@smartrevision.local
ADMIN_PASSWORD=Admin@123
```

### 3. Seed Database (4 Subjects, 60+ Flashcards, 60+ MCQs)
Ensure your local MongoDB daemon is running, then populate the curriculum:
```bash
npm run seed
```
This loads:
- **Web Technologies** (15 flashcards, 15 MCQs)
- **Mobile Development** (15 flashcards, 15 MCQs)
- **Data Structures** (15 flashcards, 15 MCQs)
- **DBMS** (15 flashcards, 15 MCQs)
- Sample student history, activity logs, and streak counters.

### 4. Run Both Client & Server Concurrently
```bash
npm run dev
```
- **Client Application**: [http://localhost:3000](http://localhost:3000)
- **Backend REST API**: [http://localhost:5000/api](http://localhost:5000/api)

---

## 🔑 Default Credentials

| Role | Email | Password | Access Level |
|---|---|---|---|
| **Student** | `student@smartrevision.local` | `Student@123` | Dashboard, Decks, Spaced Repetition, Quizzes, Progress |
| **Faculty / Admin** | `admin@smartrevision.local` | `Admin@123` | Full access + Admin Dashboard, Subject Manager, Question Bank |

*(You can also register any new student account directly from the UI).*

---

## 📁 Project Structure

```text
smart-exam-revision/
├── client/                      # React 18 + Vite frontend
│   ├── public/
│   │   ├── manifest.json        # PWA Web App Manifest
│   │   ├── sw.js                # Offline Service Worker (Cache API)
│   │   └── icons/               # 192x192 & 512x512 app icons
│   ├── src/
│   │   ├── components/          # Reusable UI (FlashCard, QuestionCard, ProgressRing, etc.)
│   │   ├── context/             # AuthContext, ThemeContext
│   │   ├── hooks/               # useApi, useSwipe
│   │   ├── pages/               # 16 lazy-loaded route views
│   │   ├── services/            # Axios API client with bearer token interceptors
│   │   ├── utils/               # Date formatters, streak calculators
│   │   ├── App.jsx              # Application router and layout
│   │   ├── main.jsx             # React entry point & SW registration
│   │   └── index.css            # Tailwind directives & 3D card flip styles
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
├── server/                      # Node.js + Express REST API
│   ├── src/
│   │   ├── config/              # MongoDB connection (db.js)
│   │   ├── models/              # Mongoose schemas (User, Flashcard, Question, etc.)
│   │   ├── controllers/         # REST endpoint business logic
│   │   ├── routes/              # Express API routers
│   │   ├── middleware/          # JWT auth, roleCheck, validate, errorHandler
│   │   ├── utils/               # sm2Algorithm.js, token generator
│   │   └── seed/                # Academic curriculum seed script (seedData.js)
│   ├── server.js                # Server entry point with security middleware
│   └── package.json
├── docs/                        # Complete project documentation & reports
│   ├── REPORT_CONTENT.md        # Comprehensive report with Mermaid diagrams
│   ├── API.md                   # Full REST API endpoint reference
│   ├── DEMO_SCRIPT.md           # 5-minute live viva demonstration script
│   ├── VIVA_QA.md               # 35+ technical viva interview Q&As
│   ├── UNIQUENESS.md            # Novel learning science features
│   ├── SYLLABUS_MAPPING.md      # Mapping to university curriculum units
│   └── TEST_CASES.md            # Manual and automated test cases
├── .env.example
├── package.json                 # Root orchestration scripts
└── README.md
```

---

## 🧪 Testing

Execute automated unit and endpoint test suites:
```bash
npm test
```
- Tests SM-2 algorithm progression and edge cases.
- Tests JWT authentication endpoints and quiz scoring validation.

---

## ❓ Troubleshooting

1. **MongoDB Connection Failed (`ECONNREFUSED 127.0.0.1:27017`)**
   - Check if your local MongoDB service is started:
     ```powershell
     net start MongoDB
     # OR run mongod directly:
     mongod --dbpath <path-to-data-directory>
     ```
2. **Port 5000 or 3000 Already in Use**
   - Change `PORT=5001` in `.env` and update the proxy target in `client/vite.config.js`.
3. **PWA Offline Mode Not Triggering**
   - Ensure you access the app via `localhost` (browsers only allow Service Workers on HTTPS or `localhost`).
   - Open Chrome DevTools → **Application** tab → **Service Workers** to verify `sw.js` status is **Activated and running**.

---

## 📄 License
MIT License. Developed for University Web Technologies & Mobile Programming Course Evaluation.

