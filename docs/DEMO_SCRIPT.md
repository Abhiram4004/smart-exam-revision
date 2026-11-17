# ⏱️ 5-Minute Live Viva Demo Script

> **Examiner Presentation Guide for Project #47: Smart Exam Revision Website**

---

## 🎯 Quick Elevator Pitch (0:00 – 0:30)
> *"Good morning, Professors. For our Web Technologies and Mobile Programming course project, we built **SmartRevise**—an installable Progressive Web Application that solves how university students revise for technical exams. Unlike platforms like Quizlet or Brainscape, SmartRevise implements true **SM-2 Spaced Repetition**, detects **weak syllabus areas from quiz failures**, and operates **100% offline** on laptops and phones using a local MongoDB database and custom Service Worker."*

---

## 📱 Phase 1: Authentication & Responsive Shell (0:30 – 1:00)
1. **Open Browser at `http://localhost:3000`**.
2. **Show Mobile View**: Press `F12` and switch Chrome DevTools to **iPhone 14 / Pixel 7** view.
   - Point out the **bottom navigation bar** (Home, Cards, Quiz, Progress, More) designed for one-handed mobile use.
   - Point out that touch targets are at least **44–48px**.
3. **Login as Student**:
   - Enter `student@smartrevision.local` and `Student@123`.
   - Point out the **JWT token** stored in localStorage with automatic authorization headers in all Axios requests.

---

## 📊 Phase 2: Dashboard & Gamified Widgets (1:00 – 1:30)
1. Point out the **Dashboard components**:
   - 🔥 **Study Streak Badge**: Currently 3 Days, encouraging daily retention.
   - ⭕ **SVG Daily Goal Progress Ring**: Visual progress of cards reviewed against the daily target.
   - ⏳ **Exam Countdown Widget**: Days remaining until the target examination date.
   - ⚠️ **Weak Topics Alert Box**: Highlights topics where the student scored below 60%.
   - 📚 **Course Subjects Grid**: Shows the 4 seeded courses with card and question counts.

---

## 🎴 Phase 3: Flashcards & 3D Flip Animation (1:30 – 2:30)
1. Click **"Review Flashcards"** or select **"Web Technologies"**.
2. Open the **"Web Technologies Core Concepts"** deck.
3. Demonstrate **CSS 3D Flip Transform**:
   - Tap/click the card. Show the smooth 3D Y-axis flip animation (`transform: rotateY(180deg)` with `backface-visibility: hidden`).
4. Demonstrate **Interactions**:
   - Press the **Right Arrow (`→`)** and **Left Arrow (`←`)** keys to navigate.
   - On touch/mobile: swipe left or right to trigger `useSwipe`.
5. Demonstrate **Spaced Repetition (SM-2)**:
   - Click **"Need Review"**: Explain that interval resets to 1 day and repetitions to 0.
   - Click **"Known"**: Explain that repetition count increments and interval increases (1 day → 6 days → exponential).
6. Click the **Bookmark ribbon**: Show immediate persistence.

---

## 📝 Phase 4: Timed Quiz Mode & Explanations (2:30 – 3:30)
1. Click **"Quiz"** in the navigation bar.
2. Select **Data Structures**, choose **5 Questions**, and toggle **Exam Simulation Timer** on.
3. Click **"Start Practice Quiz Now"**.
4. Point out the **countdown clock**, question progress bar, and randomized options.
5. Answer questions: purposely pick one wrong answer to showcase error review.
6. Click **"Submit Quiz"**:
   - Show the **Result Summary** card with percentage and time taken.
   - Scroll down to the **Question Review**: point out the green/red badges and academic explanation for why the solution is correct.
   - Click **"Share Score"** to show clipboard integration.

---

## 📈 Phase 5: Progress Analytics & Weak-Topic Detection (3:30 – 4:00)
1. Click **"Progress"** in the navigation bar.
2. Point out:
   - **Last 7 Days Study Activity Bar Chart** (rendered with Chart.js).
   - **Subject Accuracy Benchmark Chart**.
   - **Spaced Repetition Mastery Counter** (cards with interval ≥ 21 days).
   - **Weak Topics Section**: Point out how low quiz scores automatically register topics here with a **"Practice"** shortcut.

---

## 🛡️ Phase 6: Faculty Admin Portal (4:00 – 4:30)
1. Log out and sign in as **`admin@smartrevision.local` / `Admin@123`**.
2. Click the user profile dropdown → **"Admin"**.
3. Point out:
   - Platform-wide statistics (total users, questions, 7-day quiz volume).
   - Open **"Question Bank"**: Show how faculty can author new MCQs with 4 options, designate the correct answer index, and provide explanations.

---

## 🔌 Phase 7: PWA & Offline Demonstration (4:30 – 5:00)
1. Switch to Chrome DevTools → **Network** tab → Check **"Offline"** (or turn off Wi-Fi on laptop).
2. Refresh the browser at `http://localhost:3000`.
3. Notice:
   - The **application continues to load instantly** via the Service Worker cache.
   - Cached flashcard decks and quiz materials remain completely navigable and responsive.
4. Conclude:
   > *"As demonstrated, SmartRevise fulfills all Unit IV and Unit V syllabus objectives: responsive design, semantic HTML5, modern ES6+, React architecture, secure Express REST API, MongoDB data models, and resilient offline PWA execution."*

---

## 🚨 Emergency 1-Minute Backup Plan
*If network simulator glitches or time is cut short:*
1. **0:00 – 0:15**: Show Dashboard with Streak, Goal Ring, and Exam Countdown.
2. **0:15 – 0:30**: Open Web Technologies deck, flip a card with 3D animation, and click "Known" (explain SM-2 formula).
3. **0:30 – 0:45**: Take a 5-question quiz, submit, and highlight instant solution explanations.
4. **0:45 – 1:00**: Show the Progress analytics chart and explain the offline Service Worker cache architecture.

