const mysql = require('mysql2/promise');

const DB_CONFIG = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASS || '2003@chin28KC',
  database: process.env.DB_NAME || 'interviewprep',
  multipleStatements: false
};

module.exports = { mysql, DB_CONFIG };
