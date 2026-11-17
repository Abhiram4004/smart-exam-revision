# 📚 University Course Syllabus Mapping

> **Course: Web Technologies and Mobile Application Programming**  
> **Course Project: Smart Exam Revision Website (Project #47)**

---

## 🗺️ Syllabus Topic to Codebase Implementation Matrix

| Syllabus Unit | Curriculum Topic | Where Used in Project | Implementation Details & Source File |
|:---:|---|---|---|
| **Unit I** | **HTML5 Semantic Elements** | Entire application layout | Uses semantic tags (`<header>`, `<nav>`, `<main>`, `<section>`, `<article>`, `<footer>`) across `Navbar.jsx`, `BottomNav.jsx`, and `App.jsx`. |
| **Unit I** | **Forms & Form Validation** | Auth and management views | Controlled React forms with HTML5 constraints, email types, minlength attributes in `LoginPage.jsx`, `RegisterPage.jsx`, and `SettingsPage.jsx`. |
| **Unit II**| **CSS3 Selectors & Box Model** | Component styling | Tailwind utility classes applying `border-box`, padding, margin, borders, and dark mode class selectors in `index.css` and all component JSX. |
| **Unit II**| **CSS Flexbox & CSS Grid** | Page & component layout | Flexbox used for navigation bars, card rows, and button alignments; Grid used for Subject cards, Deck grids, and 4-option MCQ layouts. |
| **Unit II**| **Responsive Design & Media Queries** | Responsive layouts | Mobile-first breakpoints (`sm:`, `md:`, `lg:`) in Tailwind; desktop top-navbar switches to mobile bottom-tab navigation below `md` breakpoint. |
| **Unit II**| **CSS 3D Transforms & Animations** | Flashcard 3D flip | `perspective: 1000px`, `transform-style: preserve-3d`, `rotateY(180deg)`, and `backface-visibility: hidden` in `client/src/index.css` & `FlashCard.jsx`. |
| **Unit III**| **JavaScript ES6+ Syntax** | Entire codebase | Arrow functions, `let`/`const`, template literals, destructuring, spread/rest operators throughout client and server JavaScript files. |
| **Unit III**| **Promises & Async/Await** | Data fetching & database queries | Asynchronous non-blocking architecture using `async/await` in all Mongoose controller operations and client Axios API calls. |
| **Unit III**| **Modern Array Methods** | Data transformation | Extensive usage of `.map()`, `.filter()`, `.reduce()`, `.slice()`, and `.some()` for calculating quiz scores, formatting charts, and filtering decks. |
| **Unit III**| **DOM & Event Handling** | User interaction | React event dispatchers (`onClick`, `onChange`, `onSubmit`), custom keyboard event listeners (arrow keys in `DeckStudyPage.jsx`), and touch events. |
| **Unit III**| **React Framework & Hooks** | Frontend architecture | Single-page application using React 18 functional components, `useState`, `useEffect`, `useCallback`, `useMemo`, `useRef`, and custom hooks (`useSwipe`). |
| **Unit III**| **Client-Side Routing** | Page navigation | Declarative routing using `react-router-dom` v6 with `<BrowserRouter>`, `<Routes>`, `<Route>`, `<Link>`, and `<Navigate>` route guards. |
| **Unit IV** | **Node.js & Express Architecture** | Backend REST API | Express server (`server.js`) implementing modular routing, controllers, centralized error handling, and separation of concerns. |
| **Unit IV** | **MongoDB Document Database** | Persistent data storage | Document-based data modeling using Mongoose schemas with validation, foreign key references (`ref`), and compound indexes in `server/src/models/`. |
| **Unit IV** | **RESTful API Design** | Client-server communication | Full CRUD endpoints implementing proper HTTP verbs (`GET`, `POST`, `PUT`, `DELETE`) and status codes (200, 201, 400, 401, 403, 404, 409, 500). |
| **Unit IV** | **Mobile UX Principles** | Touch & gesture design | Minimum 44–48px touch targets, mobile bottom navigation bar, horizontal swipe detection via `useSwipe.js`, and accessible color contrast. |
| **Unit V**  | **Authentication & Authorization** | Security layer | JWT token generation (`generateToken.js`), bcrypt password hashing in `User.js` pre-save hooks, `auth.js` middleware, and `roleCheck.js` RBAC guards. |
| **Unit V**  | **Web Application Security** | Security hardening | `helmet` HTTP headers, `cors` cross-origin control, `express-rate-limit` brute-force mitigation, and input sanitization via `express-validator`. |
| **Unit V**  | **Performance Optimization** | Load time & efficiency | Route-level code splitting via `React.lazy()` + `<Suspense>`, memoization, paginated question retrieval, and Chart.js canvas rendering. |
| **Unit V**  | **PWA & Offline Execution** | Mobile & offline capabilities | W3C `manifest.json` for installation, Service Worker (`sw.js`) implementing Cache-First (App Shell) and Network-First (API) caching strategies. |

