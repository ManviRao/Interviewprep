// models/saveKB.js
const mysql = require('mysql2/promise');

async function saveKB(chunks) {
  const conn = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '2003@chin28KC', // replace with your actual MySQL password
    database: 'interviewprep'   // replace with your actual DB name
  });

  for (const c of chunks) {
    await conn.query(
      'INSERT INTO knowledge_base (topic, content, source) VALUES (?, ?, ?)',
      [c.topic, c.content, c.source]
    );
  }

  await conn.end();
  console.log(`Saved ${chunks.length} KB chunks`);
}

module.exports = saveKB;   // ✅ direct export
