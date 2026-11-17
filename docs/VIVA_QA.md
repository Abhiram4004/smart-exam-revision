# 🎓 35+ University Technical Viva Questions & Answers

> **Course: Web Technologies and Mobile Application Programming**  
> **Project: Smart Exam Revision Website (Project #47)**

---

## ⚛️ React & Frontend Architecture

### Q1: What is React and why did you choose it over vanilla JavaScript?
**Ans**: React is a component-based JavaScript library for building declarative user interfaces. We chose React because its declarative nature, component reusability, and efficient state-driven rendering (Virtual DOM) allow us to build complex, responsive revision views (3D flip cards, timer countdowns, interactive quizzes) with clean separation of concerns.

### Q2: What is the Virtual DOM and how does it optimize performance?
**Ans**: The Virtual DOM is a lightweight JavaScript object representation of the real browser DOM kept in memory. When state updates occur, React generates a new Virtual DOM tree, performs a diffing algorithm (reconciliation) comparing it with the previous snapshot, and computes the minimal set of real DOM operations required, minimizing expensive browser reflows and repaints.

### Q3: What are React Hooks? Which built-in hooks did you use in this project?
**Ans**: Hooks are functions introduced in React 16.8 that allow functional components to use state and lifecycle features without writing classes. In this project we used:
1. `useState`: For local component state (e.g. card flip status, form inputs, quiz answers).
2. `useEffect`: For lifecycle side-effects (e.g. API fetching, keyboard listeners, interval timers).
3. `useRef`: For referencing DOM nodes (e.g. dropdown detection, file upload trigger, timer timestamps).
4. `useCallback`: For memoizing event handlers (e.g. keyboard navigation, quiz submit functions).
5. `useMemo`: For caching expensive filtered arrays and chart datasets.

### Q4: Differentiate between `useState` and `useEffect`.
**Ans**: `useState` declares a state variable and its updater function to preserve values across component re-renders. `useEffect` declares an asynchronous side-effect callback that executes after the DOM has rendered, synchronized with an array of dependencies.

### Q5: Why did you use React Context API instead of an external state library like Redux?
**Ans**: The application state requirements centered around global user authentication (`AuthContext`) and theme preferences (`ThemeContext`). React Context API is built directly into React, adding zero external bundle dependencies, eliminating boilerplate, and avoiding overhead while handling cross-component auth state cleanly.

### Q6: How does client-side routing work with `react-router-dom`?
**Ans**: `react-router-dom` intercepts browser URL changes using the HTML5 History API (`pushState`, `replaceState`) without triggering a full-page document reload. It conditionally renders matched component hierarchies within `<Routes>` and `<Route>`, while preserving single-page application state.

### Q7: What is code splitting / lazy loading and how did you implement it?
**Ans**: Code splitting divides the compiled JavaScript bundle into smaller chunks loaded on demand. We implemented it using `React.lazy()` paired with `<Suspense fallback={<LoadingSpinner />}>` across all 16 page routes in `App.jsx`, ensuring users only download the script bundle for the page they actively visit.

### Q8: What is a Custom Hook? Explain an example from your codebase.
**Ans**: A custom hook is an exported JavaScript function starting with `use` that encapsulates reusable stateful logic using other React hooks. In our project, `useSwipe` manages touch event listeners (`touchstart`, `touchend`), calculates horizontal pixel displacement (> 50px threshold), and triggers `onSwipeLeft` or `onSwipeRight` callbacks for mobile flashcard navigation.

---

## 🟢 Node.js, Express & REST APIs

### Q9: What is Node.js and how does its Event Loop work?
**Ans**: Node.js is a cross-platform, open-source JavaScript runtime environment built on Chrome's V8 engine. It uses a single-threaded, non-blocking, event-driven architecture. The Event Loop continuously checks the call stack and event queues (microtasks, timers, I/O polling, check phase), offloading asynchronous operations (file system, network, database queries) to the underlying libuv thread pool.

### Q10: What is Express middleware and what is its execution order?
**Ans**: Middleware functions have access to the request object (`req`), response object (`res`), and the `next` function in the application’s request-response cycle. They execute sequentially in the order registered via `app.use()` or route definitions. In our app, requests pass through: Helmet → CORS → Morgan → Express.json → Rate Limiter → Auth JWT Guard → Role Check → Controller → Centralized Error Handler.

### Q11: What makes an API RESTful?
**Ans**: A REST (Representational State Transfer) API complies with architectural constraints: client-server separation, statelessness, cacheability, uniform interface (using standardized HTTP methods like GET, POST, PUT, DELETE), and resource-based URI endpoints representing nouns (e.g. `/api/decks`, `/api/cards`).

### Q12: How did you implement centralized error handling in Express?
**Ans**: We implemented an Express error-handling middleware (`(err, req, res, next)`) at the end of the middleware stack in `server.js`. Controllers wrap asynchronous operations in `try/catch` and forward caught exceptions via `next(error)`. The error handler inspects the error type (e.g., Mongoose `ValidationError`, `CastError`, duplicate key code `11000`, JWT expiry) and formats uniform JSON error responses with appropriate HTTP status codes (400, 401, 403, 404, 409, 500).

### Q13: What is CORS and why must it be configured on the server?
**Ans**: Cross-Origin Resource Sharing (CORS) is a browser security mechanism that restricts web applications from making HTTP requests to a domain, protocol, or port different from the one that served the web page. In development, the Vite client runs on port 3000 while Express runs on port 5000; the `cors` middleware sends appropriate `Access-Control-Allow-Origin` response headers to allow authorized client requests.

---

## 🍃 MongoDB & Mongoose ODM

### Q14: What is MongoDB and how does the document model differ from relational tables?
**Ans**: MongoDB is a NoSQL document-oriented database that stores records as flexible, semi-structured BSON (Binary JSON) documents organized into collections. Unlike relational databases with rigid schemas and tables joined by foreign keys, documents support embedded subdocuments and arrays, providing high read throughput and natural object representation for flashcards and quiz questions.

### Q15: What is Mongoose and what benefits does it provide over native MongoDB driver?
**Ans**: Mongoose is an Object Data Modeling (ODM) library for MongoDB. It provides strict schema definitions, data type validation, middleware lifecycle hooks (`pre('save')`), virtual properties, model query helpers, and automatic population (`populate()`) to reference related documents.

### Q16: What database indexes did you define and why?
**Ans**: We created indexes on frequently queried fields:
1. `User.email`: Unique index for fast lookup during login and preventing duplicate account registration.
2. `Flashcard: { owner: 1, nextReview: 1 }`: Compound index enabling high-speed querying of due cards for daily revision.
3. `QuizAttempt: { user: 1, createdAt: -1 }`: Compound index for paginated retrieval of student quiz histories.
4. `Bookmark: { user: 1, type: 1, refId: 1 }`: Compound unique index preventing duplicate bookmark entries.

### Q17: What is the MongoDB Aggregation Pipeline and where did you use it?
**Ans**: The Aggregation Pipeline is a multi-stage framework for data processing and analysis. We used it in `quizController.js` with `$match` and `$sample` to select randomized questions without loading the entire collection into memory, and in `adminController.js` with `$group` and `$dateToString` to compute 7-day platform quiz submission counts.

---

## 🔒 Security & Authentication (Unit V)

### Q18: Explain the JWT authentication flow implemented in this project.
**Ans**: 
1. Client sends email and password via `POST /api/auth/login`.
2. Server verifies email and compares password hash using `bcrypt.compare()`.
3. Server generates a signed JWT payload containing `{ id: user._id, role: user.role }` signed with `JWT_SECRET` and an expiration time of 7 days.
4. Client stores the token in `localStorage` and includes it in the `Authorization: Bearer <token>` header for subsequent requests via Axios request interceptors.
5. Server `auth` middleware decodes and verifies the token using `jwt.verify()`, attaching `req.user` to the request.

### Q19: Why use `bcrypt` for password storage instead of SHA-256 or MD5?
**Ans**: Cryptographic hash functions like MD5 and SHA-256 are designed to be fast, making them vulnerable to brute-force and rainbow table attacks using GPUs. `bcrypt` incorporates a salt (preventing rainbow table attacks) and is intentionally computationally expensive with an adjustable cost factor (work factor), protecting user passwords even if the database is leaked.

### Q20: What security precautions protect against NoSQL Injection and XSS?
**Ans**:
- **NoSQL Injection**: Server input validation with `express-validator` and Mongoose schema type casting ensures queries do not accept unescaped operator objects (such as `{"$gt": ""}`).
- **Cross-Site Scripting (XSS)**: React inherently encodes data bound in JSX before rendering to the DOM, preventing script injection. Furthermore, `helmet` configures HTTP headers (Content Security Policy, X-XSS-Protection).

### Q21: What is Rate Limiting and why is it applied to `/api/auth`?
**Ans**: Rate limiting restricts the number of HTTP requests a client IP can make within a specified time window. Using `express-rate-limit`, we limit requests to 50 requests per 15-minute window on auth routes to prevent credential stuffing and brute-force password cracking attacks.

---

## 📱 Progressive Web Apps (PWA) & Offline Mode

### Q22: What constitutes a Progressive Web App (PWA)?
**Ans**: A PWA is a web application that employs progressive enhancement to provide native app-like capabilities: it is installable to the device home screen, responsive across form factors, secure (served over HTTPS/localhost), and functional offline using background service workers.

### Q23: What is a Service Worker and what lifecycle does it follow?
**Ans**: A Service Worker is an event-driven background script registered by the browser that runs on a separate thread from the web page. Its lifecycle consists of:
1. **Registration**: Browser loads `sw.js`.
2. **Installation**: Caches static assets (App Shell) in the Cache API.
3. **Activation**: Cleans up previous outdated cache versions and claims active clients.
4. **Fetch**: Intercepts outgoing network requests to apply caching strategies.

### Q24: What caching strategies did you use?
**Ans**:
1. **Cache-First**: Applied to static application shell files (`index.html`, bundle scripts, CSS, icons). It serves cached files instantly and falls back to network only if missing.
2. **Network-First**: Applied to dynamic revision API routes (`/api/`). It attempts to fetch fresh data from the server; if the request fails due to no internet connectivity, it falls back to the previously cached JSON response.

### Q25: What is the purpose of `manifest.json`?
**Ans**: It is a W3C-standard JSON configuration file specifying metadata for mobile installation: application name, short name, start URL (`/`), display mode (`standalone` to hide the browser URL bar), theme color (`#2563eb`), and icons (192x192, 512x512).

---

## 🎨 CSS, Tailwind & UI/UX Principles

### Q26: What is utility-first CSS and why is Tailwind advantageous?
**Ans**: Utility-first CSS provides low-level utility classes (e.g., `flex`, `pt-4`, `text-center`, `rounded-2xl`) that can be composed directly in markup. Tailwind eliminates the need to author custom CSS class names, keeps stylesheet bundles small through PurgeCSS tree-shaking, and ensures consistent spacing and color tokens.

### Q27: How is the 3D card flip animation implemented?
**Ans**: The card container has `perspective: 1000px` to establish depth. The inner element has `transform-style: preserve-3d` and a transition on `transform`. When clicked, it adds a `.flipped` class triggering `transform: rotateY(180deg)`. The front and back faces have `backface-visibility: hidden`, and the back is pre-rotated by 180 degrees.

### Q28: How do you achieve mobile-first responsive design?
**Ans**: Mobile-first design authors base CSS styles targeted at small mobile viewports first, then applies progressive enhancements for larger viewports using Tailwind breakpoint prefixes (`sm:`, `md:`, `lg:`). Interactive elements adhere to a minimum touch target size of 44–48px.

---

## 🌟 Uniqueness & Algorithms

### Q29: What is the SuperMemo-2 (SM-2) Spaced Repetition Algorithm?
**Ans**: Developed by Dr. Piotr Woźniak, SM-2 models human memory decay (the Ebbinghaus Forgetting Curve). When a student reviews a card and rates difficulty ($q \in [0, 5]$):
- Quality $\ge 3$: intervals advance from 1 day to 6 days, then multiply exponentially by an easiness factor ($EF$).
- Quality $< 3$: the card resets to repetition 0 and an interval of 1 day, ensuring difficult cards are resurfaced promptly.

### Q30: How does your weak-topic detection algorithm operate?
**Ans**: When a user completes a quiz, the system saves each question's topic and correctness in `QuizAttempt`. In `progressController.js`, the server inspects the student's last 10 quiz attempts, groups answers by topic, calculates accuracy ($\text{correct}/\text{total} \times 100$), and flags topics with accuracy below 60% as weak areas.

### Q31: How does Smart Daily Revision build a custom session?
**Ans**: It queries cards where `nextReview <= new Date()` to retrieve cards mathematically due for review under SM-2, and pairs them with quiz questions matching the student's detected weak topics.

### Q32: How did you implement deck import and export?
**Ans**: We serialize deck metadata and related cards into a standardized JSON schema. The client uses the HTML5 Blob and Anchor download API to export `.json` files, and the `FileReader` API to parse and upload JSON decks via `POST /api/import-export/import/deck`.

