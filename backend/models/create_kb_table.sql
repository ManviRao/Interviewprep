-- Run this in your MySQL to create the Knowledge Base table

CREATE TABLE knowledge_base (
    id INT AUTO_INCREMENT PRIMARY KEY,
    topic VARCHAR(255),
    content TEXT,
    source_url VARCHAR(500)
);
