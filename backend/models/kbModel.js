const db = require('../config/db');

const addReferenceAnswer = async (questionId, referenceText, keyPoints, embedding) => {
    const query = `
        INSERT INTO reference_answers (question_id, reference_text, key_points, embedding)
        VALUES (?, ?, ?, ?)
    `;
    const [result] = await db.mysql.createConnection(db.DB_CONFIG)
        .then(conn => conn.execute(query, [
            questionId,
            referenceText,
            JSON.stringify(keyPoints),
            JSON.stringify(embedding),
        ]));
    return result;
};

const getReferenceAnswer = async (questionId) => {
    const query = 'SELECT * FROM reference_answers WHERE question_id = ?';
    const [rows] = await db.mysql.createConnection(db.DB_CONFIG)
        .then(conn => conn.execute(query, [questionId]));
    return rows[0];
};

const addCandidateAnswer = async (userId, questionId, answerText, answerEmbedding, score) => {
    const query = `
        INSERT INTO candidate_answers (user_id, question_id, answer_text, answer_embedding, score)
        VALUES (?, ?, ?, ?, ?)
    `;
    const [result] = await db.mysql.createConnection(db.DB_CONFIG)
        .then(conn => conn.execute(query, [
            userId,
            questionId,
            answerText,
            JSON.stringify(answerEmbedding),
            score,
        ]));
    return result;
};

module.exports = { addReferenceAnswer, getReferenceAnswer, addCandidateAnswer };
