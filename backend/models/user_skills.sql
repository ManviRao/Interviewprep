CREATE TABLE user_skills (
       id INT NOT NULL AUTO_INCREMENT,
      user_id INT NOT NULL,
      skill VARCHAR(50) NOT NULL,
      final_ability FLOAT DEFAULT 0,
      test_count INT DEFAULT 0,
      last_tested TIMESTAMP NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      KEY (user_id)
    );
    ALTER TABLE user_skills
    ADD UNIQUE KEY unique_user_skill (user_id, skill);