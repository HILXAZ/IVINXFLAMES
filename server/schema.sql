-- Database: dairy_app
CREATE DATABASE IF NOT EXISTS dairy_app;
USE dairy_app;

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(100) DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Diary entries table
CREATE TABLE IF NOT EXISTS diary_entries (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  mood VARCHAR(50) DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_diary_user_created ON diary_entries(user_id, created_at);

-- Dino game scores table
CREATE TABLE IF NOT EXISTS dino_scores (
  id INT AUTO_INCREMENT PRIMARY KEY,
  score INT NOT NULL,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_dino_score ON dino_scores(score DESC);
CREATE INDEX idx_dino_timestamp ON dino_scores(timestamp DESC);
