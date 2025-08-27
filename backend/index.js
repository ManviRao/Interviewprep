require('dotenv').config();
const express = require('express');
const app = express();
const questionsRoutes = require('./routes/questions');

app.use(express.json());
app.get('/', (_, res) => res.send('Adaptive Interview API running'));
app.use('/api/questions', questionsRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server on :${PORT}`));
