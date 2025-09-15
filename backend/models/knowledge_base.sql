CREATE TABLE reference_answers (
    answer_id INT AUTO_INCREMENT PRIMARY KEY,
    question_id INT,
    reference_text TEXT,
    key_points JSON,
    embedding JSON,
    FOREIGN KEY (question_id) REFERENCES questions(question_id)
);

CREATE TABLE candidate_answers (
    attempt_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    question_id INT,
    answer_text TEXT,
    answer_embedding JSON,
    score FLOAT,
    FOREIGN KEY (question_id) REFERENCES questions(question_id)
);
