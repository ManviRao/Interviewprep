const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api/questions'; // <-- matches your router mount
const userId = 1; // change as needed
const NUM_QUESTIONS = 10;

// Randomly answer true/false
function randomAnswer() {
  return Math.random() > 0.5;
}

async function runSimulation() {
  try {
    // 1️⃣ Start the test
    let res = await axios.post(`${BASE_URL}/start`, { userId });
    let question = res.data.question;

    if (!question) {
      console.log('No questions available to start the test.');
      return;
    }

    console.log(`Starting test for user ${userId}...`);
    console.log(`Q1: ${question.question_text} (id: ${question.id})`);

    for (let i = 0; i < NUM_QUESTIONS; i++) {
      const isCorrect = randomAnswer();
      const timeTaken = Math.floor(Math.random() * 30) + 5; // 5-35 seconds

      // 2️⃣ Submit answer
      res = await axios.post(`${BASE_URL}/answer`, {
        userId,
        questionId: question.id,
        isCorrect,
        timeTakenSeconds: timeTaken,
      });

      const { ability, nextQuestion } = res.data;
      console.log(`Answered Q${i + 1} (${isCorrect ? '✔' : '✘'}), θ = ${ability.toFixed(2)}`);

      if (!nextQuestion) {
        console.log('No more questions available. Test ended.');
        break;
      }

      question = nextQuestion;
      console.log(`Next Q: ${question.question_text} (id: ${question.id})`);
    }

    console.log('Simulation complete!');
  } catch (err) {
    console.error('Simulation error:', err.response?.data || err.message);
  }
}

runSimulation();