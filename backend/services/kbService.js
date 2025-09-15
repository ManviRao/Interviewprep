const { getReferenceAnswer } = require('../models/kbModel');
const { cosineSimilarity } = require('../utils/similarity');

const evaluateCandidateAnswer = async (questionId, candidateEmbedding) => {
    const reference = await getReferenceAnswer(questionId);
    if (!reference) throw new Error('Reference answer not found');

    const score = cosineSimilarity(candidateEmbedding, JSON.parse(reference.embedding));
    return { score, referenceText: reference.reference_text };
};

module.exports = { evaluateCandidateAnswer };
