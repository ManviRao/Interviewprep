CREATE TABLE IF NOT EXISTS questions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  question_text MEDIUMTEXT NOT NULL,
  topic VARCHAR(64),
  tags JSON NULL,
  difficulty INT DEFAULT 0,            -- -2 easy .. +2 hard
  discrimination FLOAT DEFAULT 1.0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_question_text (question_text(255))
);
