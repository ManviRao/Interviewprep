CREATE TABLE IF NOT EXISTS user_attempts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  question_id INT NOT NULL,
  is_correct TINYINT(1) NOT NULL,
  time_taken_seconds FLOAT NULL,
  ability_at_attempt FLOAT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (question_id) REFERENCES questions(id),
  INDEX idx_attempts_question (question_id),
  INDEX idx_attempts_user (user_id)
);
