# 🎓 AI Study Assistant

A full-stack AI-powered student productivity platform. Upload lecture notes or paste any topic → Groq AI generates summaries, flashcards, and quiz questions → take quizzes → track your progress over time.

![Java](https://img.shields.io/badge/Java-17-orange)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.2-green)
![React](https://img.shields.io/badge/React-18-blue)
![MySQL](https://img.shields.io/badge/MySQL-8.x-blue)
![Groq AI](https://img.shields.io/badge/Groq-Llama--3-orange)

## ✨ Features

- **📝 Note Management** — Paste text or upload PDF files
- **🤖 AI-Powered Generation** — Groq AI creates summaries, 10 flashcards, and 5 MCQ questions
- **🃏 Interactive Flashcards** — Beautiful 3D CSS flip cards with navigation
- **📋 Timed Quizzes** — 5-minute countdown, auto-submit on expiry
- **📊 Progress Tracking** — Chart.js line graphs showing score trends over time
- **🔒 Secure Auth** — JWT-based authentication with BCrypt password hashing
- **📖 API Documentation** — Swagger UI with OpenAPI 3.0

## 🛠️ Prerequisites

| Tool | Version |
|------|---------|
| Java | 17+ |
| Node.js | 18+ |
| MySQL | 8.x |
| Groq API Key | [Get free key](https://console.groq.com/keys) |

## 🚀 Setup & Run

### 1. Create MySQL Database

```bash
mysql -u root -p
```
```sql
CREATE DATABASE study_assistant_db;
```

### 2. Configure Backend

Edit `backend/src/main/resources/application.properties`:

```properties
spring.datasource.password=your_mysql_password
app.groq.api.key=YOUR_GROQ_API_KEY
```

### 3. Start Backend

```bash
cd backend
chmod +x mvnw
./mvnw spring-boot:run
```

Or if you have Maven installed:
```bash
cd backend
mvn spring-boot:run
```

### 4. Start Frontend

```bash
cd frontend
npm install
npm run dev
```

### 5. Access the App

| Service | URL |
|---------|-----|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:8080 |
| Swagger UI | http://localhost:8080/swagger-ui.html |

## 📡 API Reference

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new student |
| POST | `/api/auth/login` | Login with credentials |

### Notes
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/notes/text` | Create note from text |
| POST | `/api/notes/upload` | Create note from PDF |
| GET | `/api/notes` | Get all student's notes |
| GET | `/api/notes/{id}` | Get specific note |

### Study (AI Generation)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/study/generate` | Generate summary, flashcards & quiz |

### Quiz
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/quiz/attempt` | Submit quiz answers |
| GET | `/api/quiz/history` | Get quiz attempt history |

### Progress
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/progress` | Get all progress data |
| GET | `/api/dashboard/stats` | Get dashboard statistics |

## 🗄️ Database Schema (ERD)

```
students ──┬── notes ──┬── flashcards
           │           └── quizzes ── quiz_questions
           └── quiz_attempts ──────── quizzes
```

- **students**: id, name, email, password (BCrypt), role, created_at
- **notes**: id, student_id (FK), title, content (LONGTEXT), created_at
- **flashcards**: id, note_id (FK), question, answer
- **quizzes**: id, note_id (FK), title, created_at
- **quiz_questions**: id, quiz_id (FK), question_text, optionA/B/C/D, correct_option
- **quiz_attempts**: id, student_id (FK), quiz_id (FK), score, total_questions, percentage, attempted_at

## 🧪 Running Tests

```bash
cd backend
./mvnw test
```

## 🔑 Getting a Groq API Key

1. Go to [Groq Console](https://console.groq.com/keys)
2. Sign in or create an account
3. Click "Create API Key"
4. Copy the key and add it to `application.properties`

## 🏗️ Tech Stack

**Backend**: Java 17, Spring Boot 3.2, Spring Security, Spring Data JPA, MySQL 8, JWT (jjwt), PDFBox, SpringDoc OpenAPI

**Frontend**: React 18, Vite 5, React Router 6, Axios, Chart.js, Tailwind CSS 3

## 📄 License

MIT License
