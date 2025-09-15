const express = require('express');
const dotenv = require('dotenv');
const kbRoutes = require('./routes/kb');       // <-- CommonJS import
const questionsRoutes = require('./routes/questions');

dotenv.config();

const app = express();
app.use(express.json());

app.get('/', (_, res) => res.send('Adaptive Interview API running'));

app.use('/kb', kbRoutes);                      // KB routes
app.use('/api/questions', questionsRoutes);    // Questions routes

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
