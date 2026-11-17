# 🧪 Comprehensive Test Cases Specification

> **Project #47: Smart Exam Revision Website**  
> **Test Plan: Manual & Functional Validation Suite**

---

## 📋 Test Cases Table

| Test ID | Category | Test Scenario | Execution Steps | Expected Result | Actual Result | Status |
|:---:|:---:|---|---|---|:---:|:---:|
| **TC-01** | Auth | User Registration | 1. Navigate to `/register`<br>2. Fill Name, Email, Password (≥ 6 chars)<br>3. Confirm Password and click Register | Account created, JWT stored in localStorage, redirected to Dashboard with toast | As expected | PASS |
| **TC-02** | Auth | Duplicate Email Validation | 1. Go to `/register`<br>2. Enter already registered email<br>3. Submit form | Server rejects with HTTP 409 Conflict; toast displays error message | As expected | PASS |
| **TC-03** | Auth | User Login | 1. Navigate to `/login`<br>2. Enter valid credentials<br>3. Click "Sign In" | HTTP 200 OK, JWT stored, redirected to Dashboard | As expected | PASS |
| **TC-04** | Auth | Protected Route Guard | 1. Clear localStorage token<br>2. Attempt direct navigation to `/progress` | `PrivateRoute` intercepts and redirects unauthenticated user to `/login` | As expected | PASS |
| **TC-05** | UI/UX | 3D Flashcard Flip | 1. Open any deck at `/flashcards/:id`<br>2. Click or tap the card face | Card executes 3D Y-axis rotation (0.6s animation); back content appears | As expected | PASS |
| **TC-06** | UI/UX | Keyboard Arrow Navigation | 1. Open deck view<br>2. Press Right Arrow (`→`) key<br>3. Press Left Arrow (`←`) key | Right arrow advances to next card; Left arrow returns to previous card | As expected | PASS |
| **TC-07** | UI/UX | Mobile Touch Swipe | 1. Open deck in mobile simulation<br>2. Swipe finger horizontally > 50px | Card flips back to front and transitions to adjacent card via `useSwipe` | As expected | PASS |
| **TC-08** | Algorithm| SM-2 "Known" Progression | 1. View card with 0 repetitions<br>2. Click "Known" (Quality = 4) | Server updates repetition to 1, sets interval to 1 day, schedules nextReview | As expected | PASS |
| **TC-09** | Algorithm| SM-2 "Need Review" Reset | 1. View card with existing interval ≥ 6<br>2. Click "Need Review" (Quality = 1) | Server resets repetitions to 0, resets interval to 1 day, schedules review | As expected | PASS |
| **TC-10** | Feature | Smart Daily Revision | 1. Navigate to `/study`<br>2. View scheduled due cards | Fetches cards where `nextReview <= now`; shows empty state if caught up | As expected | PASS |
| **TC-11** | Quiz | MCQ Generation & Anti-Cheat | 1. Select subject at `/quiz`<br>2. Start 5-question quiz | Server returns 5 randomized questions; `correctIndex` is stripped from payload | As expected | PASS |
| **TC-12** | Quiz | Exam Simulation Timer | 1. Start quiz with timer enabled<br>2. Observe countdown clock | Clock decrements each second; automatically submits quiz if timer hits 0:00 | As expected | PASS |
| **TC-13** | Quiz | Quiz Submission & Review | 1. Select answers for all questions<br>2. Click "Submit Quiz" | HTTP 201 Created; redirected to result page showing score and explanations | As expected | PASS |
| **TC-14** | Feature | Weak-Topic Detection | 1. Intentionally answer "Security" questions incorrectly in a quiz<br>2. Submit and view Dashboard | Dashboard flags "Security" in the Weak Topics Alert with a "Practice" button | As expected | PASS |
| **TC-15** | Feature | Bookmarking Toggle | 1. Click bookmark ribbon on card or question<br>2. Open `/bookmarks` | Item appears in Bookmarks list; clicking ribbon again removes it | As expected | PASS |
| **TC-16** | Feature | Deck JSON Export | 1. Open `/flashcards`<br>2. Click download icon on a deck | Browser triggers file download of formatted `.json` file containing all cards | As expected | PASS |
| **TC-17** | Feature | Deck JSON Import | 1. Click "Import Deck" at `/flashcards`<br>2. Select valid `.json` file | New deck created with all imported flashcards; toast confirms card count | As expected | PASS |
| **TC-18** | UI/UX | Dark Mode Persistence | 1. Click Sun/Moon toggle in navbar<br>2. Reload page | `dark` class added to `<html>`; background switches to dark and persists | As expected | PASS |
| **TC-19** | Admin | Admin Role Protection | 1. Login as Student<br>2. Attempt navigation to `/admin` | `AdminRoute` denies access and redirects user to `/` | As expected | PASS |
| **TC-20** | Admin | Authoring MCQ Question | 1. Login as Admin<br>2. Add question via `/admin/questions`<br>3. Save | Question is persisted in MongoDB and immediately available in quiz pools | As expected | PASS |
| **TC-21** | Offline | PWA Offline Execution | 1. Turn off Wi-Fi or toggle DevTools Offline<br>2. Refresh page at `/` | Service worker serves App Shell and cached revision data with zero network | As expected | PASS |
| **TC-22** | Settings| Password Change | 1. Navigate to `/settings`<br>2. Enter current and new passwords<br>3. Submit | Password re-hashed with bcrypt; old password successfully rejected on login | As expected | PASS |

