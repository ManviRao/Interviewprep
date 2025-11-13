-- Create the user_emotions table
CREATE TABLE user_emotions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  question_id INT,
  session_id VARCHAR(255),
  emotion VARCHAR(20),
  confidence FLOAT,
  confidence_level VARCHAR(20),
  face_detected BOOLEAN,
  timestamp DATETIME,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (question_id) REFERENCES questions(id)
);
