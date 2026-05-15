-- AI Study Assistant Database Schema

CREATE DATABASE IF NOT EXISTS study_assistant_db;
USE study_assistant_db;

CREATE TABLE IF NOT EXISTS students (
  id           BIGINT AUTO_INCREMENT PRIMARY KEY,
  name         VARCHAR(100) NOT NULL,
  email        VARCHAR(150) UNIQUE NOT NULL,
  password     VARCHAR(255) NOT NULL,
  role         VARCHAR(20) DEFAULT 'STUDENT',
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS notes (
  id           BIGINT AUTO_INCREMENT PRIMARY KEY,
  student_id   BIGINT NOT NULL,
  title        VARCHAR(200) NOT NULL,
  content      LONGTEXT NOT NULL,
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(id)
);

CREATE TABLE IF NOT EXISTS flashcards (
  id           BIGINT AUTO_INCREMENT PRIMARY KEY,
  note_id      BIGINT NOT NULL,
  question     TEXT NOT NULL,
  answer       TEXT NOT NULL,
  FOREIGN KEY (note_id) REFERENCES notes(id)
);

CREATE TABLE IF NOT EXISTS quizzes (
  id           BIGINT AUTO_INCREMENT PRIMARY KEY,
  note_id      BIGINT NOT NULL,
  title        VARCHAR(200),
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (note_id) REFERENCES notes(id)
);

CREATE TABLE IF NOT EXISTS quiz_questions (
  id             BIGINT AUTO_INCREMENT PRIMARY KEY,
  quiz_id        BIGINT NOT NULL,
  question_text  TEXT NOT NULL,
  option_a       VARCHAR(300) NOT NULL,
  option_b       VARCHAR(300) NOT NULL,
  option_c       VARCHAR(300) NOT NULL,
  option_d       VARCHAR(300) NOT NULL,
  correct_option CHAR(1) NOT NULL,
  FOREIGN KEY (quiz_id) REFERENCES quizzes(id)
);

CREATE TABLE IF NOT EXISTS quiz_attempts (
  id               BIGINT AUTO_INCREMENT PRIMARY KEY,
  student_id       BIGINT NOT NULL,
  quiz_id          BIGINT NOT NULL,
  score            INT NOT NULL,
  total_questions  INT NOT NULL,
  percentage       DECIMAL(5,2),
  attempted_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(id),
  FOREIGN KEY (quiz_id)    REFERENCES quizzes(id)
);
