# 📡 Smart Exam Revision REST API Specification

**Base URL**: `http://localhost:5000/api`  
**Protocol**: HTTP/1.1 REST  
**Data Format**: JSON (`Content-Type: application/json`)  
**Authentication**: JSON Web Token (JWT) transmitted via standard HTTP header:  
`Authorization: Bearer <your_jwt_token>`

---

## 📑 Summary of Endpoints

| Method | Endpoint | Auth | Role | Description |
|---|---|---|---|---|
| `POST` | `/api/auth/register` | Public | None | Register a new student account |
| `POST` | `/api/auth/login` | Public | None | Login with email and password |
| `GET` | `/api/auth/profile` | Required | Any | Retrieve current authenticated user profile |
| `PUT` | `/api/auth/password` | Required | Any | Change account password |
| `DELETE`| `/api/auth/account` | Required | Any | Permanently delete user profile and study data |
| `GET` | `/api/subjects` | Public | None | List all course subjects with counts |
| `GET` | `/api/subjects/:id` | Public | None | Retrieve single subject by ID |
| `POST` | `/api/subjects` | Required | Admin | Create a new course subject |
| `PUT` | `/api/subjects/:id` | Required | Admin | Update subject metadata or icon |
| `DELETE`| `/api/subjects/:id` | Required | Admin | Delete subject and its related items |
| `GET` | `/api/decks` | Required | Any | List public decks or decks owned by user |
| `GET` | `/api/decks/:id` | Required | Any | Retrieve deck details and flashcards |
| `POST` | `/api/decks` | Required | Any | Create a new flashcard deck |
| `PUT` | `/api/decks/:id` | Required | Owner | Update deck name or description |
| `DELETE`| `/api/decks/:id` | Required | Owner | Delete deck and its flashcards |
| `GET` | `/api/cards/deck/:deckId` | Required | Any | Retrieve flashcards in a deck |
| `GET` | `/api/cards/due` | Required | Any | Get flashcards scheduled for review today |
| `POST` | `/api/cards` | Required | Any | Add a flashcard to a deck |
| `PUT` | `/api/cards/:id` | Required | Owner | Update flashcard front/back/topic |
| `DELETE`| `/api/cards/:id` | Required | Owner | Delete a flashcard |
| `POST` | `/api/cards/:id/review` | Required | Any | Record SM-2 recall rating (0–5) |
| `GET` | `/api/quiz` | Required | Any | Fetch randomized questions for a subject |
| `POST` | `/api/quiz/submit` | Required | Any | Submit answers and compute exam score |
| `GET` | `/api/quiz/attempts` | Required | Any | Fetch user's paginated quiz history |
| `GET` | `/api/quiz/attempts/:id`| Required | Any | Retrieve attempt details with full review |
| `GET` | `/api/bookmarks` | Required | Any | Get all user bookmarks (cards or questions) |
| `POST` | `/api/bookmarks/toggle` | Required | Any | Toggle bookmark status for an item |
| `DELETE`| `/api/bookmarks/:id` | Required | Any | Delete bookmark by ID |
| `GET` | `/api/progress/dashboard`| Required | Any | Overall statistics, charts, weak topics, streak |
| `GET` | `/api/progress/weak-topics`| Required| Any | Retrieve topics with quiz accuracy < 60% |
| `POST` | `/api/progress/reset` | Required | Any | Reset all SM-2 intervals and quiz logs |
| `GET` | `/api/settings` | Required | Any | Get user preferences & exam date |
| `PUT` | `/api/settings` | Required | Any | Update theme, daily goal, timer, exam date |
| `GET` | `/api/admin/stats` | Required | Admin | System statistics & 7-day quiz metrics |
| `GET` | `/api/admin/questions` | Required | Admin | Paginated question bank with filters |
| `POST` | `/api/admin/questions` | Required | Admin | Add a new MCQ to the question bank |
| `PUT` | `/api/admin/questions/:id`| Required| Admin | Update an MCQ question |
| `DELETE`| `/api/admin/questions/:id`| Required| Admin | Delete an MCQ question |
| `GET` | `/api/import-export/export/deck/:id` | Required | Any | Export a deck and its cards as JSON |
| `POST` | `/api/import-export/import/deck` | Required | Any | Import a deck and cards from JSON |

---

## 📦 Request & Response Payload Examples

### 1. Authentication
#### Register (`POST /api/auth/register`)
**Request:**
```json
{
  "name": "Jane Student",
  "email": "jane@university.edu",
  "password": "Password@123"
}
```
**Response (201 Created):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "6739bbd0e045ab78019b1101",
    "name": "Jane Student",
    "email": "jane@university.edu",
    "role": "student",
    "settings": {
      "theme": "light",
      "dailyGoal": 20,
      "timerEnabled": true
    },
    "streak": {
      "current": 0
    }
  }
}
```

#### Login (`POST /api/auth/login`)
**Request:**
```json
{
  "email": "student@smartrevision.local",
  "password": "Student@123"
}
```
**Response (200 OK):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "6739bbd0e045ab78019b1102",
    "name": "Alex Student",
    "email": "student@smartrevision.local",
    "role": "student"
  }
}
```

---

### 2. Spaced Repetition Flashcards
#### Record Card Review (`POST /api/cards/:id/review`)
Submits quality score: `1` for Need Review, `4` for Known.
**Request:**
```json
{
  "quality": 4
}
```
**Response (200 OK):**
```json
{
  "card": {
    "_id": "6739bbd0e045ab78019b1205",
    "front": "What is a JavaScript Closure?",
    "back": "A function bundled with references to its surrounding lexical environment...",
    "interval": 6,
    "easiness": 2.5,
    "repetitions": 2,
    "nextReview": "2026-11-23T03:30:00.000Z"
  }
}
```

---

### 3. Interactive Quiz Mode
#### Fetch Quiz (`GET /api/quiz?subject=6739bbd...&count=5`)
**Response (200 OK):** *(Notice: `correctIndex` is stripped from questions to prevent cheating)*
```json
{
  "count": 5,
  "questions": [
    {
      "_id": "6739bbd0e045ab78019b1301",
      "questionText": "Which HTTP method should be used to completely replace an existing resource?",
      "options": ["POST", "PATCH", "PUT", "UPDATE"],
      "topic": "HTTP",
      "difficulty": "medium"
    }
  ]
}
```

#### Submit Quiz (`POST /api/quiz/submit`)
**Request:**
```json
{
  "subject": "6739bbd0e045ab78019b1110",
  "durationSec": 45,
  "answers": [
    { "questionId": "6739bbd0e045ab78019b1301", "selectedIndex": 2 }
  ]
}
```
**Response (201 Created):**
```json
{
  "attempt": {
    "_id": "6739bbd0e045ab78019b1401",
    "score": 1,
    "total": 1,
    "percentage": 100
  },
  "results": [
    {
      "questionId": "6739bbd0e045ab78019b1301",
      "questionText": "Which HTTP method should be used to completely replace an existing resource?",
      "selectedIndex": 2,
      "correctIndex": 2,
      "isCorrect": true,
      "explanation": "PUT replaces an entire existing entity, whereas PATCH applies partial modifications."
    }
  ]
}
```

---

### 4. Import / Export Deck
#### Export Deck (`GET /api/import-export/export/deck/:id`)
**Response (200 OK):**
```json
{
  "exportVersion": "1.0",
  "exportedAt": "2026-11-17T08:50:00.000Z",
  "deck": {
    "name": "Web Technologies Core Concepts",
    "description": "Master modern full-stack web standards.",
    "subjectName": "Web Technologies"
  },
  "cards": [
    {
      "front": "What is Semantic HTML5?",
      "back": "HTML elements that carry meaning about their content...",
      "topic": "HTML5"
    }
  ]
}
```

