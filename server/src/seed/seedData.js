const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '..', '.env') });
const mongoose = require('mongoose');

const User = require('../models/User');
const Subject = require('../models/Subject');
const Deck = require('../models/Deck');
const Flashcard = require('../models/Flashcard');
const Question = require('../models/Question');
const QuizAttempt = require('../models/QuizAttempt');
const ActivityLog = require('../models/ActivityLog');
const Bookmark = require('../models/Bookmark');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/smart-exam-revision';

const subjectsData = [
  {
    name: 'Web Technologies',
    description: 'HTML5, CSS3, JavaScript ES6+, React, DOM, HTTP, and REST APIs',
    icon: '🌐',
    deckName: 'Web Technologies Core Concepts',
    deckDescription: 'Master modern full-stack web standards, layout systems, and JavaScript fundamentals.',
    flashcards: [
      { front: 'What is Semantic HTML5?', back: 'HTML elements that carry meaning about their content (e.g., <header>, <article>, <section>, <nav>) rather than just presentation (like <div> or <span>). It improves accessibility, SEO, and code maintainability.', topic: 'HTML5' },
      { front: 'Explain the CSS Box Model.', back: 'Every element is rendered as a box composed of: Content (inner text/media), Padding (space around content), Border (surrounding line), and Margin (outer spacing between elements).', topic: 'CSS' },
      { front: 'What is the difference between CSS Flexbox and CSS Grid?', back: 'Flexbox is a one-dimensional layout system (row OR column), ideal for component-level alignment. CSS Grid is a two-dimensional layout system (rows AND columns simultaneously), ideal for overall page layout.', topic: 'CSS' },
      { front: 'What is a JavaScript Closure?', back: 'A function bundled together with references to its surrounding state (lexical environment). A closure gives an inner function access to an outer function’s scope even after the outer function has closed.', topic: 'JavaScript' },
      { front: 'What are JavaScript Promises?', back: 'Objects representing the eventual completion (or failure) of an asynchronous operation and its resulting value. They have 3 states: Pending, Fulfilled (resolved), and Rejected.', topic: 'JavaScript' },
      { front: 'How does async/await work in JavaScript?', back: 'Syntactic sugar built on top of Promises. "async" makes a function return a Promise, and "await" pauses execution until the Promise resolves or rejects, making asynchronous code look synchronous and easier to read.', topic: 'JavaScript' },
      { front: 'What is REST and what are its key constraints?', back: 'Representational State Transfer is an architectural style for networked applications. Constraints include: Client-Server architecture, Statelessness, Cacheability, Layered System, and Uniform Interface.', topic: 'Web Architecture' },
      { front: 'What are idempotent HTTP methods?', back: 'HTTP methods where multiple identical requests produce the same server-side state as a single request. GET, PUT, DELETE, and HEAD are idempotent; POST and PATCH are not necessarily idempotent.', topic: 'HTTP' },
      { front: 'What is Event Bubbling in the DOM?', back: 'The propagation mechanism where an event triggers on the deepest target element first and then bubbles up through its ancestors in the DOM tree unless event.stopPropagation() is called.', topic: 'DOM' },
      { front: 'Compare localStorage, sessionStorage, and Cookies.', back: 'localStorage: persistent across browser sessions (~5-10MB). sessionStorage: cleared when tab is closed (~5MB). Cookies: small (~4KB), sent with every HTTP request, supports expiration date and HttpOnly flag for security.', topic: 'Web Storage' },
      { front: 'What is the Viewport Meta Tag in responsive design?', back: '<meta name="viewport" content="width=device-width, initial-scale=1.0"> informs the mobile browser to set the viewport width equal to the device screen width and set the initial zoom level to 100%.', topic: 'Responsive Design' },
      { front: 'How does CSS 3D Transform work for card flips?', back: 'Parent has "perspective: 1000px". The card container has "transform-style: preserve-3d" and transitions "transform: rotateY(180deg)". Front and back sides have "backface-visibility: hidden".', topic: 'CSS Animations' },
      { front: 'What is the Fetch API in modern browsers?', back: 'A native JavaScript interface for making asynchronous network requests, returning Promises. Unlike older XMLHttpRequest, it provides a cleaner syntax and native support for Request, Response, and Headers objects.', topic: 'APIs' },
      { front: 'What is Cross-Origin Resource Sharing (CORS)?', back: 'An HTTP-header based security mechanism that allows a server to indicate which origins (domain, scheme, or port) other than its own are permitted to load resources.', topic: 'Web Security' },
      { front: 'What is the React Virtual DOM?', back: 'A lightweight in-memory representation of the real DOM. When component state changes, React creates a new virtual DOM tree, diffs it with the previous one (reconciliation), and updates only the changed nodes in the real DOM.', topic: 'React' }
    ],
    questions: [
      {
        questionText: 'Which HTML5 element represents self-contained content that could be distributed independently, such as a blog post or news story?',
        options: ['<section>', '<article>', '<aside>', '<main>'],
        correctIndex: 1,
        explanation: '<article> is meant for self-contained, syndicate-ready content, whereas <section> represents a thematic grouping.',
        topic: 'HTML5',
        difficulty: 'easy'
      },
      {
        questionText: 'In CSS box-sizing: border-box, what constitutes the total specified width of an element?',
        options: ['Content only', 'Content + Padding', 'Content + Padding + Border', 'Content + Padding + Border + Margin'],
        correctIndex: 2,
        explanation: 'Under border-box, width and height include content, padding, and border. Margin remains outside.',
        topic: 'CSS',
        difficulty: 'easy'
      },
      {
        questionText: 'Which CSS Flexbox property aligns flex items along the cross axis?',
        options: ['justify-content', 'align-items', 'flex-direction', 'align-content'],
        correctIndex: 1,
        explanation: 'justify-content aligns items along the main axis, while align-items aligns items along the cross axis.',
        topic: 'CSS',
        difficulty: 'medium'
      },
      {
        questionText: 'What is the output of: console.log(typeof NaN)?',
        options: ['"undefined"', '"number"', '"NaN"', '"object"'],
        correctIndex: 1,
        explanation: 'In JavaScript, NaN stands for "Not-a-Number", but its primitive type according to IEEE 754 floating-point standard is "number".',
        topic: 'JavaScript',
        difficulty: 'easy'
      },
      {
        questionText: 'Which JavaScript array method creates a new array populated with the results of calling a provided function on every element?',
        options: ['forEach()', 'filter()', 'map()', 'reduce()'],
        correctIndex: 2,
        explanation: 'map() returns a newly transformed array, whereas forEach() executes a side effect and returns undefined.',
        topic: 'JavaScript',
        difficulty: 'easy'
      },
      {
        questionText: 'What HTTP status code is most appropriate when a resource is successfully created via a POST request?',
        options: ['200 OK', '201 Created', '204 No Content', '202 Accepted'],
        correctIndex: 1,
        explanation: '201 Created indicates the request succeeded and led to the creation of a new resource.',
        topic: 'HTTP',
        difficulty: 'easy'
      },
      {
        questionText: 'Which HTTP method should be used to completely replace an existing resource?',
        options: ['POST', 'PATCH', 'PUT', 'UPDATE'],
        correctIndex: 2,
        explanation: 'PUT replaces an entire existing entity, whereas PATCH applies partial modifications.',
        topic: 'HTTP',
        difficulty: 'medium'
      },
      {
        questionText: 'In the DOM event flow, what happens during the capturing phase?',
        options: [
          'The event travels from the window down to the target element',
          'The event triggers directly on the target element',
          'The event bubbles up from the target to the window',
          'The event is automatically cancelled'
        ],
        correctIndex: 0,
        explanation: 'Capturing phase moves downwards from Window -> Document -> Body -> Target, followed by target phase and bubbling phase.',
        topic: 'DOM',
        difficulty: 'medium'
      },
      {
        questionText: 'Which storage mechanism does NOT automatically send stored data to the server with every HTTP request?',
        options: ['HTTP Cookie', 'Session Cookie', 'localStorage', 'Authorization Header'],
        correctIndex: 2,
        explanation: 'localStorage and sessionStorage remain entirely client-side unless explicitly attached by code.',
        topic: 'Web Storage',
        difficulty: 'easy'
      },
      {
        questionText: 'In React, what hook is used to run side-effects such as data fetching, subscriptions, or DOM mutations?',
        options: ['useState', 'useReducer', 'useEffect', 'useMemo'],
        correctIndex: 2,
        explanation: 'useEffect is specifically designed to perform asynchronous or imperative side-effects in functional components.',
        topic: 'React',
        difficulty: 'easy'
      },
      {
        questionText: 'What is the primary purpose of the useMemo hook in React?',
        options: [
          'To memoize callback functions across renders',
          'To cache the result of expensive calculations between renders',
          'To create global application state',
          'To execute code after every DOM mutation'
        ],
        correctIndex: 1,
        explanation: 'useMemo caches the result of an expensive calculation until one of its dependencies changes.',
        topic: 'React',
        difficulty: 'medium'
      },
      {
        questionText: 'Which header prevents a website from being framed inside an <iframe>, mitigating clickjacking attacks?',
        options: ['X-Frame-Options', 'X-XSS-Protection', 'Content-Encoding', 'Strict-Transport-Security'],
        correctIndex: 0,
        explanation: 'X-Frame-Options: DENY or SAMEORIGIN prevents clickjacking attacks by blocking unauthorized framing.',
        topic: 'Web Security',
        difficulty: 'medium'
      },
      {
        questionText: 'What is the result of Promise.all([p1, p2]) if p1 resolves and p2 rejects?',
        options: [
          'Resolves with the value of p1',
          'Immediately rejects with the reason of p2',
          'Waits indefinitely',
          'Returns an array containing null and the error'
        ],
        correctIndex: 1,
        explanation: 'Promise.all has fail-fast behavior: if any promise rejects, the returned promise immediately rejects.',
        topic: 'JavaScript',
        difficulty: 'medium'
      },
      {
        questionText: 'What does the CSS property "backface-visibility: hidden" do?',
        options: [
          'Hides the shadow of an element',
          'Hides the reverse side of an element during 3D rotations',
          'Makes the element completely transparent',
          'Hides elements behind another element in z-index'
        ],
        correctIndex: 1,
        explanation: 'When rotated > 90deg in 3D, backface-visibility: hidden ensures the flipped reverse side is invisible.',
        topic: 'CSS Animations',
        difficulty: 'medium'
      },
      {
        questionText: 'Which HTTP header tells the browser which origins can read the response in a cross-origin request?',
        options: [
          'Access-Control-Allow-Origin',
          'Access-Control-Request-Headers',
          'Cross-Origin-Resource-Policy',
          'Origin-Whitelist'
        ],
        correctIndex: 0,
        explanation: 'Access-Control-Allow-Origin: * (or specific origin) instructs the browser that the response is accessible.',
        topic: 'Web Security',
        difficulty: 'easy'
      }
    ]
  },
  {
    name: 'Mobile Development',
    description: 'Mobile architectures, PWAs, Responsive patterns, React Native, and mobile performance',
    icon: '📱',
    deckName: 'Mobile Application Architecture & PWAs',
    deckDescription: 'Progressive Web Apps, Service Workers, Touch Events, and Hybrid Mobile Frameworks.',
    flashcards: [
      { front: 'What is a Progressive Web App (PWA)?', back: 'A web application that uses modern web APIs along with progressive enhancement strategy to deliver native-like app experiences: installable, offline-capable, responsive, and fast.', topic: 'PWA' },
      { front: 'What is a Service Worker?', back: 'An event-driven client-side background script that runs separately from the web page thread. It acts as a programmable network proxy capable of intercepting requests, caching assets, and handling push notifications.', topic: 'Service Worker' },
      { front: 'What is a Web App Manifest?', back: 'A JSON file (manifest.json) that provides metadata about the web app (name, icons, start_url, theme_color, display mode) allowing browsers to install it to the home screen like a native app.', topic: 'PWA' },
      { front: 'Compare Native vs Hybrid vs Cross-Platform Mobile Apps.', back: 'Native (Kotlin/Swift): direct OS access, highest performance. Hybrid (Cordova/Capacitor): runs inside a WebView. Cross-Platform (React Native/Flutter): single codebase compiled to native UI widgets.', topic: 'Mobile Architecture' },
      { front: 'What are the main Touch Events in mobile browsers?', back: 'touchstart (finger touches screen), touchmove (finger moves across surface), touchend (finger lifted), and touchcancel (interrupted by phone call or system dialog).', topic: 'Touch Events' },
      { front: 'What is the 44-48px minimum touch target guideline?', back: 'Human interface guidelines (Apple & Google) recommend minimum interactive element size of 44x44px to 48x48px to prevent erroneous taps with human thumbs and index fingers.', topic: 'Mobile UI/UX' },
      { front: 'What is the difference between Cache-First and Network-First caching?', back: 'Cache-First checks cache first and falls back to network (ideal for static JS/CSS/images). Network-First tries network first and falls back to cache (ideal for dynamic API data that must stay fresh).', topic: 'Service Worker' },
      { front: 'What is the Android Activity Lifecycle?', back: 'Key lifecycle callbacks: onCreate() -> onStart() -> onResume() [running] -> onPause() -> onStop() -> onDestroy().', topic: 'Mobile OS' },
      { front: 'What is Flutter and how does it differ from React Native?', back: 'Flutter uses Dart and renders UI using its own Skia/Impeller engine directly to a canvas. React Native uses JavaScript bridge/Fabric to map JSX elements to native Android/iOS UI widgets.', topic: 'Cross-Platform' },
      { front: 'What is Responsive Image srcset and sizes?', back: 'HTML attributes on <img> allowing the browser to select the most bandwidth-efficient image resolution based on device pixel ratio (DPR) and viewport width.', topic: 'Performance' },
      { front: 'Explain the 300ms tap delay on mobile and how to remove it.', back: 'Early mobile browsers waited 300ms after a tap to check if the user was double-tapping to zoom. Setting <meta name="viewport" content="width=device-width"> disables double-tap zoom and eliminates the delay.', topic: 'Mobile Performance' },
      { front: 'What is IndexedDB and why is it preferred over localStorage in PWAs?', back: 'A transactional, asynchronous client-side NoSQL object store that supports large volumes of structured data, blobs, and indexes without blocking the browser main thread.', topic: 'Offline Storage' },
      { front: 'What is Background Sync in Service Workers?', back: 'An API that enables PWAs to defer server communications until the user has stable internet connectivity (e.g. queuing quiz answers while offline and sending upon reconnection).', topic: 'PWA' },
      { front: 'What is Deep Linking in mobile applications?', back: 'Using URIs that link directly to a specific piece of web or in-app content rather than just launching the application home screen (e.g., custom URL schemes or Android App Links).', topic: 'Mobile Architecture' },
      { front: 'What are Push Notifications in web and mobile?', back: 'Messages delivered from a backend server to the client device even when the web application or browser is not actively open, mediated through Push Service and Web Push API.', topic: 'Notifications' }
    ],
    questions: [
      {
        questionText: 'Which thread does a Service Worker execute on?',
        options: ['The main UI thread', 'A separate background worker thread', 'The server-side Node thread', 'The DOM parsing thread'],
        correctIndex: 1,
        explanation: 'Service Workers run on a background thread completely decoupled from the main webpage UI thread and have no direct access to the DOM.',
        topic: 'Service Worker',
        difficulty: 'easy'
      },
      {
        questionText: 'Which Service Worker caching strategy returns cached content immediately while simultaneously updating the cache from the network?',
        options: ['Cache Only', 'Network Only', 'Stale-While-Revalidate', 'Network-First'],
        correctIndex: 2,
        explanation: 'Stale-While-Revalidate serves the fast cached version first, then fetches an update in the background to refresh the cache for next time.',
        topic: 'Service Worker',
        difficulty: 'medium'
      },
      {
        questionText: 'Which property in manifest.json ensures the web application launches without any browser URL bar or UI controls?',
        options: ['"display": "standalone"', '"display": "fullscreen-only"', '"view": "app"', '"mode": "native"'],
        correctIndex: 0,
        explanation: '"display": "standalone" hides standard browser chrome (URL bar, navigation buttons) to look and feel like a native application.',
        topic: 'PWA',
        difficulty: 'easy'
      },
      {
        questionText: 'What event is triggered when a user touches the screen, moves their finger across it, and finally releases contact?',
        options: [
          'mousedown, mousemove, mouseup',
          'touchstart, touchmove, touchend',
          'touchbegin, touchdrag, touchstop',
          'pointerdown, drag, drop'
        ],
        correctIndex: 1,
        explanation: 'Mobile touch events fire in the order: touchstart -> touchmove (repeated) -> touchend.',
        topic: 'Touch Events',
        difficulty: 'easy'
      },
      {
        questionText: 'Why should localStorage be avoided for storing large amounts of offline data in progressive web applications?',
        options: [
          'It only supports binary data',
          'It is synchronous and blocks the main browser execution thread',
          'It is wiped whenever the user reloads the page',
          'It is limited to 100 bytes'
        ],
        correctIndex: 1,
        explanation: 'localStorage operations are synchronous. Accessing large datasets in localStorage halts JavaScript execution on the UI thread.',
        topic: 'Offline Storage',
        difficulty: 'medium'
      },
      {
        questionText: 'In Android development, in which lifecycle method should persistent UI state and database connections be initialized?',
        options: ['onStart()', 'onCreate()', 'onResume()', 'onRestart()'],
        correctIndex: 1,
        explanation: 'onCreate() is called when the Activity is first created and is where views and one-time dependencies are initialized.',
        topic: 'Mobile OS',
        difficulty: 'easy'
      },
      {
        questionText: 'Which component in React Native maps JavaScript components directly to native host platform views?',
        options: ['The DOM reconciler', 'The JavaScript-to-Native Bridge / Fabric', 'The WebView engine', 'The V8 interpreter'],
        correctIndex: 1,
        explanation: 'React Native translates Virtual DOM instructions across the Bridge / Fabric architecture to instantiate real native platform widgets.',
        topic: 'Cross-Platform',
        difficulty: 'medium'
      },
      {
        questionText: 'What is the recommended minimum interactive touch target size according to Web Content Accessibility Guidelines (WCAG)?',
        options: ['20x20 px', '32x32 px', '44x44 to 48x48 px', '64x64 px'],
        correctIndex: 2,
        explanation: 'WCAG and mobile OS design guidelines prescribe at least 44x44 CSS pixels (or 48dp on Android) to accommodate human finger sizes.',
        topic: 'Mobile UI/UX',
        difficulty: 'easy'
      },
      {
        questionText: 'Which browser API provides a standardized way to share text, URLs, or files directly to native apps installed on the device?',
        options: ['Web Share API (navigator.share)', 'File Transfer Protocol API', 'System Broadcast API', 'Native Intent API'],
        correctIndex: 0,
        explanation: 'navigator.share() invokes the native sharing dialog of the operating system directly from web applications.',
        topic: 'PWA',
        difficulty: 'medium'
      },
      {
        questionText: 'What does device pixel ratio (window.devicePixelRatio) measure?',
        options: [
          'The refresh rate of the mobile screen in Hertz',
          'The ratio of physical screen pixels to CSS logical pixels',
          'The battery consumption per rendered frame',
          'The aspect ratio of screen height to width'
        ],
        correctIndex: 1,
        explanation: 'DPR indicates how many physical device pixels represent a single logical CSS pixel (e.g., Retina displays usually have DPR = 2 or 3).',
        topic: 'Mobile Performance',
        difficulty: 'medium'
      },
      {
        questionText: 'Which HTTP header is mandatory for serving a Service Worker script?',
        options: [
          'Service-Worker-Allowed: true',
          'Content-Type: application/javascript (and HTTPS protocol in production)',
          'Access-Control-Allow-Worker: *',
          'X-Worker-Cache: enable'
        ],
        correctIndex: 1,
        explanation: 'Service Workers require HTTPS (or localhost for development) and must be served with a JavaScript MIME type.',
        topic: 'Service Worker',
        difficulty: 'easy'
      },
      {
        questionText: 'What happens when a Service Worker script file changes by even a single byte on the server?',
        options: [
          'Nothing until the user clears their browser cache',
          'The browser recognizes it as an update and triggers the install phase for the new worker',
          'The browser throws a checksum mismatch exception',
          'The old service worker is terminated immediately mid-request'
        ],
        correctIndex: 1,
        explanation: 'Browsers check for byte-level changes in the service worker script. If different, the browser downloads and installs the new version.',
        topic: 'Service Worker',
        difficulty: 'medium'
      },
      {
        questionText: 'Which CSS media query feature allows targeting high-density displays (e.g. Retina screens)?',
        options: ['min-resolution / -webkit-min-device-pixel-ratio', 'aspect-ratio', 'orientation: portrait', 'pointer: fine'],
        correctIndex: 0,
        explanation: '@media (min-resolution: 2dppx) selects devices where the physical resolution is at least double standard display density.',
        topic: 'Responsive Design',
        difficulty: 'medium'
      },
      {
        questionText: 'What is the primary benefit of the Background Sync API in offline-first web apps?',
        options: [
          'It synchronizes user contacts with Google Cloud',
          'It guarantees data is uploaded when internet connectivity is re-established, even if the user leaves the tab',
          'It streams live video while the screen is locked',
          'It speeds up JavaScript parsing time'
        ],
        correctIndex: 1,
        explanation: 'SyncManager registers a one-off sync event that fires as soon as network is detected, even after the original page has closed.',
        topic: 'PWA',
        difficulty: 'hard'
      },
      {
        questionText: 'In Flutter development, what is the core architectural difference between StatelessWidget and StatefulWidget?',
        options: [
          'StatelessWidget can access network; StatefulWidget cannot',
          'StatelessWidget cannot be redrawn; StatefulWidget re-renders upon setState() invocation',
          'StatelessWidget runs on C++; StatefulWidget runs on Java',
          'StatelessWidget has no build() method'
        ],
        correctIndex: 1,
        explanation: 'StatefulWidget maintains mutable internal state via a companion State object that triggers UI rebuilds via setState().',
        topic: 'Cross-Platform',
        difficulty: 'easy'
      }
    ]
  },
  {
    name: 'Data Structures',
    description: 'Arrays, Linked Lists, Stacks, Queues, Trees, Graphs, Sorting, Searching, and Asymptotic Complexity',
    icon: '🌳',
    deckName: 'Data Structures & Algorithms Mastery',
    deckDescription: 'Fundamental computer science data structures, traversal algorithms, and computational complexity.',
    flashcards: [
      { front: 'Compare Array vs Singly Linked List in memory and access time.', back: 'Array: contiguous memory, O(1) random access by index, O(n) insertions/deletions. Linked List: non-contiguous nodes with pointers, O(n) linear access, O(1) insertion/deletion at head or with pointer.', topic: 'Linear Structures' },
      { front: 'What is a Stack and what is its primary access principle?', back: 'A linear data structure operating on Last-In, First-Out (LIFO). Primary operations are push() and pop(), both executing in O(1) time complexity.', topic: 'Linear Structures' },
      { front: 'What is a Queue and how does a Circular Queue prevent memory waste?', back: 'A First-In, First-Out (FIFO) structure. Circular Queue connects the last position back to the first position using modulo arithmetic ((rear + 1) % capacity), reusing vacant slots left by depletions.', topic: 'Linear Structures' },
      { front: 'What is a Binary Search Tree (BST) property?', back: 'For every node: all keys in its left subtree are strictly less than the node’s key, and all keys in its right subtree are strictly greater than the node’s key. Average search time is O(log n).', topic: 'Trees' },
      { front: 'What are the three common depth-first tree traversals?', back: 'Inorder: Left -> Root -> Right (produces sorted order in BST). Preorder: Root -> Left -> Right (used for copying trees). Postorder: Left -> Right -> Root (used for deleting trees and postfix evaluation).', topic: 'Trees' },
      { front: 'Explain Hash Table collision resolution: Chaining vs Open Addressing.', back: 'Separate Chaining: each bucket holds a linked list of entries that hash to that index. Open Addressing (Linear/Quadratic Probing): searches for the next available slot within the array itself.', topic: 'Hashing' },
      { front: 'Compare Breadth-First Search (BFS) and Depth-First Search (DFS).', back: 'BFS: traverses level by level using a Queue, O(V + E) time, ideal for shortest paths in unweighted graphs. DFS: explores as deep as possible along each branch using recursion or a Stack, O(V + E) time.', topic: 'Graphs' },
      { front: 'Explain Merge Sort mechanism and time complexity.', back: 'A divide-and-conquer algorithm that recursively splits the array into halves until single elements remain, then merges sorted halves. Time complexity is O(n log n) in all cases (worst, average, best); space complexity is O(n).', topic: 'Sorting' },
      { front: 'Explain Quick Sort and its worst-case behavior.', back: 'Picks a pivot, partitions elements into less-than and greater-than pivot subarrays, and recursively sorts. Average time is O(n log n). Worst-case is O(n²) when pivot selection is poor (e.g. already sorted array with first element as pivot).', topic: 'Sorting' },
      { front: 'What is Big-O notation and what is the difference from Big-Omega and Big-Theta?', back: 'Big-O (O) represents the asymptotic upper bound (worst case). Big-Omega (Ω) represents the asymptotic lower bound (best case). Big-Theta (Θ) represents a tight bound (both upper and lower).', topic: 'Complexity Analysis' },
      { front: 'What is a Min-Heap and what is its primary property?', back: 'A complete binary tree where the key at the root is the minimum among all keys in the tree, and this property holds recursively for all subtrees. Insertion and deletion (extract-min) take O(log n).', topic: 'Heaps' },
      { front: 'What is a Trie (Prefix Tree)?', back: 'A tree-like search data structure used to store a dynamic set or associative array where keys are usually strings. Nodes store characters, enabling O(m) search time where m is the key string length.', topic: 'Advanced Structures' },
      { front: 'What are the two key properties of Dynamic Programming problems?', back: '1. Overlapping Subproblems: smaller subproblems are computed repeatedly. 2. Optimal Substructure: an optimal solution to the problem contains optimal solutions to its subproblems.', topic: 'Algorithms' },
      { front: 'What is an AVL Tree and how does it maintain balance?', back: 'A self-balancing Binary Search Tree where the heights of the two child subtrees of any node differ by at most one (Balance Factor ∈ {-1, 0, 1}). It rebalances using Left and Right Rotations in O(1) time.', topic: 'Trees' },
      { front: 'What is a Disjoint Set Union (DSU / Union-Find) data structure?', back: 'A data structure that tracks a partition of a set into disjoint subsets. Supports two operations: Find (determines which set an element is in) and Union (joins two sets), running in near O(1) amortized time with Path Compression.', topic: 'Advanced Structures' }
    ],
    questions: [
      {
        questionText: 'What is the worst-case time complexity of searching for an element in an unsorted array of size n?',
        options: ['O(1)', 'O(log n)', 'O(n)', 'O(n²)'],
        correctIndex: 2,
        explanation: 'In the worst case, the target element may be at the very end or absent, requiring inspection of all n elements (linear search).',
        topic: 'Complexity Analysis',
        difficulty: 'easy'
      },
      {
        questionText: 'Which data structure follows the Last-In, First-Out (LIFO) property and is naturally used in function call stacks?',
        options: ['Queue', 'Stack', 'Linked List', 'Heap'],
        correctIndex: 1,
        explanation: 'A Stack is a LIFO data structure. The last item pushed is the first one popped.',
        topic: 'Linear Structures',
        difficulty: 'easy'
      },
      {
        questionText: 'What is the time complexity of pushing an element onto an array-based stack with amortized doubling?',
        options: ['O(1)', 'O(n)', 'O(log n)', 'O(n log n)'],
        correctIndex: 0,
        explanation: 'While resizing takes O(n), it occurs infrequently enough that the average amortized cost per push is O(1).',
        topic: 'Linear Structures',
        difficulty: 'medium'
      },
      {
        questionText: 'Which tree traversal algorithm produces elements of a Binary Search Tree in strictly ascending sorted order?',
        options: ['Preorder Traversal', 'Inorder Traversal', 'Postorder Traversal', 'Level-order Traversal'],
        correctIndex: 1,
        explanation: 'Inorder traversal visits Left Subtree -> Root -> Right Subtree, which yields keys in ascending order for any valid BST.',
        topic: 'Trees',
        difficulty: 'easy'
      },
      {
        questionText: 'What is the worst-case time complexity of Quick Sort?',
        options: ['O(n)', 'O(n log n)', 'O(n²)', 'O(2ⁿ)'],
        correctIndex: 2,
        explanation: 'When the chosen pivot splits the list unbalanced (e.g., 0 and n-1 elements each time), Quick Sort degrades to O(n²).',
        topic: 'Sorting',
        difficulty: 'medium'
      },
      {
        questionText: 'Which sorting algorithm is guaranteed to have O(n log n) time complexity in the worst, average, and best cases?',
        options: ['Quick Sort', 'Bubble Sort', 'Insertion Sort', 'Merge Sort'],
        correctIndex: 3,
        explanation: 'Merge Sort always divides the list evenly into two halves and merges in linear time, guaranteeing O(n log n) complexity.',
        topic: 'Sorting',
        difficulty: 'easy'
      },
      {
        questionText: 'Which data structure is typically used to implement Breadth-First Search (BFS) graph traversal?',
        options: ['Stack', 'Queue', 'Priority Queue', 'Disjoint Set'],
        correctIndex: 1,
        explanation: 'BFS explores vertices level by level, utilizing a FIFO Queue to process discovered nodes in arrival order.',
        topic: 'Graphs',
        difficulty: 'easy'
      },
      {
        questionText: 'In a Hash Table with separate chaining, what is the worst-case lookup time if all keys hash to the exact same bucket?',
        options: ['O(1)', 'O(log n)', 'O(n)', 'O(n²)'],
        correctIndex: 2,
        explanation: 'If all items collide into a single bucket, search degrades to traversing a linked list of length n, taking O(n) time.',
        topic: 'Hashing',
        difficulty: 'medium'
      },
      {
        questionText: 'What is the maximum number of nodes in a binary tree of height h (where a tree with just a root node has height 1)?',
        options: ['2ʰ', '2ʰ - 1', '2ʰ⁺¹', '2ʰ⁻¹'],
        correctIndex: 1,
        explanation: 'A full binary tree has 1 + 2 + 4 + ... + 2ʰ⁻¹ = 2ʰ - 1 total nodes.',
        topic: 'Trees',
        difficulty: 'medium'
      },
      {
        questionText: 'In a Min-Heap represented as a 0-indexed array, where is the left child of the node at index i located?',
        options: ['2 * i', '2 * i + 1', '2 * i + 2', 'i / 2'],
        correctIndex: 1,
        explanation: 'In a 0-indexed complete binary tree array: left child = 2i + 1, right child = 2i + 2, and parent = floor((i - 1) / 2).',
        topic: 'Heaps',
        difficulty: 'medium'
      },
      {
        questionText: 'What is the balance factor of a node in an AVL tree defined as?',
        options: [
          'Height(Left Subtree) - Height(Right Subtree)',
          'Number of nodes in Left - Number of nodes in Right',
          'Depth of Left Subtree * Depth of Right Subtree',
          'Parent Key - Child Key'
        ],
        correctIndex: 0,
        explanation: 'Balance factor is Height(left) - Height(right), which must remain within {-1, 0, 1} for every node in an AVL tree.',
        topic: 'Trees',
        difficulty: 'medium'
      },
      {
        questionText: 'What is the time complexity of Dijkstra’s Algorithm for single-source shortest path using a Min-Heap priority queue?',
        options: ['O(V²)', 'O(E log V)', 'O(V + E)', 'O(V³)'],
        correctIndex: 1,
        explanation: 'With an adjacency list and binary min-heap, Dijkstra runs in O((V + E) log V) = O(E log V) for connected graphs.',
        topic: 'Graphs',
        difficulty: 'hard'
      },
      {
        questionText: 'Which approach stores already computed solutions to subproblems in a table from the bottom up?',
        options: ['Memoization', 'Tabulation', 'Greedy Selection', 'Backtracking'],
        correctIndex: 1,
        explanation: 'Tabulation is the iterative, bottom-up DP technique that fills a table starting from base cases up to the desired target.',
        topic: 'Algorithms',
        difficulty: 'medium'
      },
      {
        questionText: 'What is the primary advantage of a Doubly Linked List over a Singly Linked List?',
        options: [
          'Requires less memory per node',
          'Allows O(1) bidirectional traversal and deletion given a node pointer',
          'Provides O(1) random index access',
          'Guarantees cache locality in CPU caches'
        ],
        correctIndex: 1,
        explanation: 'Doubly linked list nodes store both next and prev pointers, enabling node removal in O(1) without traversing from the head.',
        topic: 'Linear Structures',
        difficulty: 'easy'
      },
      {
        questionText: 'Which algorithmic paradigm solves a problem by making the locally optimal choice at each stage with the hope of finding a global optimum?',
        options: ['Dynamic Programming', 'Greedy Algorithm', 'Divide and Conquer', 'Branch and Bound'],
        correctIndex: 1,
        explanation: 'Greedy algorithms choose the best immediate option at each step without reconsidering prior decisions.',
        topic: 'Algorithms',
        difficulty: 'easy'
      }
    ]
  },
  {
    name: 'DBMS',
    description: 'Relational Model, SQL, Normalization, ACID Transactions, Indexing, and MongoDB NoSQL',
    icon: '🗄️',
    deckName: 'Database Systems: SQL & NoSQL',
    deckDescription: 'Relational schema design, ACID properties, indexing structures, and MongoDB document paradigms.',
    flashcards: [
      { front: 'Explain the ACID properties of database transactions.', back: 'Atomicity: all operations succeed or all rollback. Consistency: database transitions from one valid state to another. Isolation: concurrent transactions execute without interfering. Durability: committed changes survive system crashes.', topic: 'Transactions' },
      { front: 'What is Database Normalization (1NF, 2NF, 3NF)?', back: 'Process of organizing data to reduce redundancy: 1NF: atomic values, unique records. 2NF: in 1NF + no partial dependency on composite primary key. 3NF: in 2NF + no transitive dependencies (non-key attributes depend only on primary key).', topic: 'Schema Design' },
      { front: 'Compare SQL (Relational) vs NoSQL (Document) databases.', back: 'SQL: structured tabular schemas, ACID compliant, vertical scaling, relational JOINs. NoSQL: flexible JSON-like documents, horizontal scaling (sharding), eventual consistency or tunable ACID, denormalized embedded data.', topic: 'Architecture' },
      { front: 'Explain different types of SQL JOINs.', back: 'INNER JOIN: returns matching rows from both tables. LEFT JOIN: all rows from left table + matched rows from right. RIGHT JOIN: all rows from right + matched from left. FULL OUTER JOIN: all rows when a match exists in either table.', topic: 'SQL' },
      { front: 'How does a B-Tree / B+ Tree Index speed up database queries?', back: 'A self-balancing multi-way search tree. Keeps data sorted and allows search, sequential access, insertions, and deletions in logarithmic O(log n) disk block reads instead of full table scans (O(n)).', topic: 'Indexing' },
      { front: 'What is the MongoDB Document Model?', back: 'Data is stored in BSON (Binary JSON) documents organized into Collections. Documents can embed nested sub-documents and arrays, supporting rich data hierarchies without foreign key joins.', topic: 'MongoDB' },
      { front: 'What is the MongoDB Aggregation Pipeline?', back: 'A framework for multi-stage data processing: documents enter a pipeline of operators like $match (filter), $group (aggregate), $project (reshape), $sort, and $lookup (join).', topic: 'MongoDB' },
      { front: 'What is an Entity-Relationship (ER) Diagram?', back: 'A visual data modeling tool showing Entities (rectangles), Attributes (ovals), and Relationships (diamonds) such as one-to-one (1:1), one-to-many (1:N), and many-to-many (M:N).', topic: 'Data Modeling' },
      { front: 'What is a Primary Key vs Foreign Key?', back: 'Primary Key: unique identifier for a row in a table; cannot be NULL. Foreign Key: a field in one table that references the Primary Key of another table, enforcing referential integrity.', topic: 'Relational Model' },
      { front: 'What is a Database View and why is it used?', back: 'A virtual table based on the result-set of an SQL query. It does not store physical data itself, but provides simplified data access, enhances security by restricting column visibility, and hides complex joins.', topic: 'SQL' },
      { front: 'What is a Database Trigger?', back: 'A procedural block of code that automatically executes (fires) in response to specific events (INSERT, UPDATE, DELETE) on a particular table or view.', topic: 'SQL' },
      { front: 'What is the CAP Theorem for distributed databases?', back: 'A distributed data store can simultaneously provide at most two of three guarantees: Consistency (every read gets latest write), Availability (every request receives non-error response), and Partition Tolerance (system operates despite network breaks).', topic: 'Distributed DB' },
      { front: 'What is SQL Injection and how is it prevented?', back: 'An attack where malicious SQL statements are inserted into entry fields. Prevented by using Parameterized Queries (Prepared Statements), ORMs/ODMs, input validation, and principle of least privilege.', topic: 'Security' },
      { front: 'What is Two-Phase Locking (2PL)?', back: 'A concurrency control protocol ensuring serializability. Phase 1 (Growing): transaction acquires locks without releasing any. Phase 2 (Shrinking): transaction releases locks without acquiring new ones.', topic: 'Transactions' },
      { front: 'What is Database Sharding?', back: 'A horizontal partitioning technique that splits large databases into smaller, faster, more manageable pieces called shards across multiple server nodes based on a Shard Key.', topic: 'Scalability' }
    ],
    questions: [
      {
        questionText: 'Which ACID property guarantees that all database updates within a transaction either finish successfully or are completely rolled back upon error?',
        options: ['Atomicity', 'Consistency', 'Isolation', 'Durability'],
        correctIndex: 0,
        explanation: 'Atomicity enforces the "all-or-nothing" rule for transactions.',
        topic: 'Transactions',
        difficulty: 'easy'
      },
      {
        questionText: 'A database relation is in Second Normal Form (2NF) if and only if it is in 1NF and what additional condition is met?',
        options: [
          'No transitive dependencies exist among non-prime attributes',
          'Every non-prime attribute is fully functionally dependent on the entire primary key (no partial dependency)',
          'All columns permit NULL values',
          'Every attribute is indexed with a B-tree'
        ],
        correctIndex: 1,
        explanation: '2NF removes partial functional dependencies on composite keys.',
        topic: 'Schema Design',
        difficulty: 'medium'
      },
      {
        questionText: 'Which SQL clause is used to filter records resulting from an aggregate function like SUM() or COUNT()?',
        options: ['WHERE', 'GROUP BY', 'HAVING', 'ORDER BY'],
        correctIndex: 2,
        explanation: 'WHERE filters rows before grouping; HAVING filters aggregated groups created by GROUP BY.',
        topic: 'SQL',
        difficulty: 'easy'
      },
      {
        questionText: 'In MongoDB, which aggregation stage operator filters documents to pass only those matching specified criteria to the next stage?',
        options: ['$group', '$project', '$match', '$filter'],
        correctIndex: 2,
        explanation: '$match behaves similarly to an SQL WHERE query within the aggregation pipeline.',
        topic: 'MongoDB',
        difficulty: 'easy'
      },
      {
        questionText: 'Which of the following guarantees does the Durability property in ACID provide?',
        options: [
          'Transactions run concurrently without race conditions',
          'Once a transaction is committed, its changes will persist even during power failure or crash',
          'Data constraints like unique keys are always maintained',
          'Every query completes in under 100 milliseconds'
        ],
        correctIndex: 1,
        explanation: 'Durability ensures committed updates are written to non-volatile storage (like WAL or disk) and survive crashes.',
        topic: 'Transactions',
        difficulty: 'easy'
      },
      {
        questionText: 'What is the default unique index field automatically created for every MongoDB document?',
        options: ['_uid', 'id', '_id', 'uuid'],
        correctIndex: 2,
        explanation: 'MongoDB documents always contain an _id field (usually an ObjectId) with a unique B-tree index.',
        topic: 'MongoDB',
        difficulty: 'easy'
      },
      {
        questionText: 'Which SQL JOIN returns all rows from the left table, and matching rows from the right table (with NULLs where no match exists)?',
        options: ['INNER JOIN', 'LEFT OUTER JOIN', 'CROSS JOIN', 'RIGHT OUTER JOIN'],
        correctIndex: 1,
        explanation: 'LEFT OUTER JOIN preserves every row from the left table regardless of whether a matching right table row is present.',
        topic: 'SQL',
        difficulty: 'easy'
      },
      {
        questionText: 'What type of dependency is eliminated when progressing a schema from 2NF to 3NF?',
        options: ['Partial dependency', 'Transitive dependency', 'Multi-valued dependency', 'Join dependency'],
        correctIndex: 1,
        explanation: '3NF requires that non-key attributes must not depend on other non-key attributes (eliminating transitive dependencies).',
        topic: 'Schema Design',
        difficulty: 'medium'
      },
      {
        questionText: 'What is the most effective defense against SQL Injection vulnerabilities in web applications?',
        options: [
          'Filtering semicolons in JavaScript frontend',
          'Using Prepared Statements / Parameterized Queries',
          'Enabling SSL/TLS certificates',
          'Increasing database user permissions'
        ],
        correctIndex: 1,
        explanation: 'Parameterized queries separate SQL code structure from user data, preventing arbitrary command injection.',
        topic: 'Security',
        difficulty: 'easy'
      },
      {
        questionText: 'What data structure is most commonly employed by modern relational database engines for table indexing?',
        options: ['Red-Black Tree', 'B+ Tree', 'Binary Heap', 'Linked List'],
        correctIndex: 1,
        explanation: 'B+ Trees have high fan-out, minimizing disk I/O operations and allowing efficient range queries through linked leaf nodes.',
        topic: 'Indexing',
        difficulty: 'medium'
      },
      {
        questionText: 'In transaction concurrency control, what phenomenon occurs when transaction T1 reads data modified by T2 that is later rolled back?',
        options: ['Non-repeatable read', 'Dirty read', 'Phantom read', 'Lost update'],
        correctIndex: 1,
        explanation: 'A dirty read happens when a transaction reads uncommitted modifications that subsequently get aborted.',
        topic: 'Transactions',
        difficulty: 'medium'
      },
      {
        questionText: 'Which isolation level completely prevents Dirty Reads, Non-repeatable Reads, and Phantom Reads?',
        options: ['Read Uncommitted', 'Read Committed', 'Repeatable Read', 'Serializable'],
        correctIndex: 3,
        explanation: 'Serializable is the highest ANSI SQL isolation level, executing transactions as if they were scheduled serially.',
        topic: 'Transactions',
        difficulty: 'medium'
      },
      {
        questionText: 'In MongoDB, which operator is used to perform left-outer-join-like operations across collections in an aggregation pipeline?',
        options: ['$join', '$merge', '$lookup', '$combine'],
        correctIndex: 2,
        explanation: '$lookup performs an equality match between documents of the current collection and a foreign collection.',
        topic: 'MongoDB',
        difficulty: 'medium'
      },
      {
        questionText: 'According to Brewer’s CAP Theorem, if a network partition occurs in a distributed system, what trade-off must be made?',
        options: [
          'Trade off between Storage and Speed',
          'Trade off between Consistency and Availability',
          'Trade off between Scalability and Durability',
          'Trade off between Security and Portability'
        ],
        correctIndex: 1,
        explanation: 'Under network partition (P), a distributed system must choose between returning errors/stale data (C vs A).',
        topic: 'Distributed DB',
        difficulty: 'medium'
      },
      {
        questionText: 'What is the primary function of a Database Foreign Key constraint?',
        options: [
          'To encrypt column data on disk',
          'To enforce referential integrity between two related tables',
          'To automatically compress rows',
          'To enable full-text indexing'
        ],
        correctIndex: 1,
        explanation: 'A Foreign Key prevents orphaned records by ensuring child values match an existing parent table primary key.',
        topic: 'Relational Model',
        difficulty: 'easy'
      }
    ]
  }
];

async function seedDatabase() {
  try {
    console.log('Connecting to MongoDB at:', MONGODB_URI);
    await mongoose.connect(MONGODB_URI);
    console.log('MongoDB connected successfully.');

    // Clear existing data
    console.log('Clearing existing collections...');
    await Promise.all([
      User.deleteMany({}),
      Subject.deleteMany({}),
      Deck.deleteMany({}),
      Flashcard.deleteMany({}),
      Question.deleteMany({}),
      QuizAttempt.deleteMany({}),
      ActivityLog.deleteMany({}),
      Bookmark.deleteMany({})
    ]);
    console.log('Existing collections cleared.');

    // Create users
    console.log('Creating default users...');
    const adminUser = new User({
      name: 'Professor Admin',
      email: 'admin@smartrevision.local',
      passwordHash: 'Admin@123',
      role: 'admin',
      settings: {
        theme: 'light',
        dailyGoal: 25,
        timerEnabled: true
      },
      streak: {
        current: 5,
        lastStudyDate: new Date()
      },
      examDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) // 14 days from now
    });
    await adminUser.save();

    const studentUser = new User({
      name: 'Alex Student',
      email: 'student@smartrevision.local',
      passwordHash: 'Student@123',
      role: 'student',
      settings: {
        theme: 'light',
        dailyGoal: 15,
        timerEnabled: true
      },
      streak: {
        current: 3,
        lastStudyDate: new Date()
      },
      examDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
    });
    await studentUser.save();

    console.log('Users created:');
    console.log('  Admin:   admin@smartrevision.local / Admin@123');
    console.log('  Student: student@smartrevision.local / Student@123');

    // Create subjects, decks, cards, questions
    let totalCards = 0;
    let totalQuestions = 0;

    for (const data of subjectsData) {
      console.log(`\nSeeding subject: ${data.name} (${data.icon})`);

      const subject = new Subject({
        name: data.name,
        description: data.description,
        icon: data.icon,
        createdBy: adminUser._id,
        cardCount: data.flashcards.length,
        questionCount: data.questions.length
      });
      await subject.save();

      // Create deck owned by student
      const deck = new Deck({
        name: data.deckName,
        description: data.deckDescription,
        subject: subject._id,
        owner: studentUser._id,
        isPublic: true,
        cardCount: data.flashcards.length
      });
      await deck.save();

      // Create flashcards
      const cardsToInsert = data.flashcards.map((fc, index) => {
        // Vary interval for demo so some are due and some are mastered
        const isMastered = index % 4 === 0;
        const isDue = index % 3 === 0;

        let interval = 1;
        let repetitions = 1;
        let nextReview = new Date();

        if (isMastered) {
          interval = 25;
          repetitions = 4;
          nextReview.setDate(nextReview.getDate() + 25);
        } else if (isDue) {
          interval = 0;
          repetitions = 0;
          nextReview.setDate(nextReview.getDate() - 1); // Due yesterday
        } else {
          interval = 3;
          repetitions = 2;
          nextReview.setDate(nextReview.getDate() + 3);
        }

        return {
          front: fc.front,
          back: fc.back,
          subject: subject._id,
          topic: fc.topic,
          deck: deck._id,
          owner: studentUser._id,
          interval,
          easiness: 2.5,
          repetitions,
          nextReview
        };
      });

      await Flashcard.insertMany(cardsToInsert);
      totalCards += cardsToInsert.length;

      // Create questions
      const questionsToInsert = data.questions.map((q) => ({
        subject: subject._id,
        topic: q.topic,
        questionText: q.questionText,
        options: q.options,
        correctIndex: q.correctIndex,
        explanation: q.explanation,
        difficulty: q.difficulty || 'medium',
        createdBy: adminUser._id
      }));

      await Question.insertMany(questionsToInsert);
      totalQuestions += questionsToInsert.length;

      console.log(`  Inserted ${cardsToInsert.length} flashcards and ${questionsToInsert.length} questions`);
    }

    // Seed realistic activity log and sample quiz attempts for student
    console.log('\nCreating sample activity logs and quiz attempts for student...');
    const allSubjects = await Subject.find();
    const allQuestions = await Question.find();

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Activity log for past 7 days
    for (let i = 6; i >= 0; i--) {
      const logDate = new Date(today);
      logDate.setDate(logDate.getDate() - i);
      const cardsReviewed = Math.floor(Math.random() * 15) + 5;
      const quizzesTaken = i % 2 === 0 ? 1 : 0;
      await ActivityLog.create({
        user: studentUser._id,
        date: logDate,
        cardsReviewed,
        quizzesTaken,
        studyTimeMin: cardsReviewed * 2 + quizzesTaken * 10
      });
    }

    // Create 3 realistic sample quiz attempts
    for (let i = 0; i < 3; i++) {
      const subj = allSubjects[i % allSubjects.length];
      const subjQuestions = allQuestions.filter(
        (q) => q.subject.toString() === subj._id.toString()
      ).slice(0, 5);

      if (subjQuestions.length >= 5) {
        let score = 0;
        const answers = subjQuestions.map((q, idx) => {
          // Alex got mostly correct, but topic "Security" or "CSS" wrong to demonstrate weak-topic detection
          const isCorrect = idx < 3;
          if (isCorrect) score++;
          return {
            question: q._id,
            selectedIndex: isCorrect ? q.correctIndex : (q.correctIndex + 1) % 4,
            isCorrect
          };
        });

        await QuizAttempt.create({
          user: studentUser._id,
          subject: subj._id,
          score,
          total: 5,
          durationSec: 120,
          answers,
          createdAt: new Date(Date.now() - i * 24 * 60 * 60 * 1000)
        });
      }
    }

    // Create a sample bookmark
    const firstCard = await Flashcard.findOne({ owner: studentUser._id });
    if (firstCard) {
      await Bookmark.create({
        user: studentUser._id,
        type: 'flashcard',
        refId: firstCard._id
      });
    }

    console.log('\n========================================');
    console.log('✅ DATABASE SEEDING COMPLETED SUCCESSFULLY');
    console.log(`   Subjects:    ${subjectsData.length}`);
    console.log(`   Total Cards: ${totalCards}`);
    console.log(`   Questions:   ${totalQuestions}`);
    console.log('========================================\n');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed with error:', error);
    process.exit(1);
  }
}

seedDatabase();

