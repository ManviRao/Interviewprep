const { mysql, DB_CONFIG } = require('./db');
const bcrypt = require('bcryptjs');

const userQueries = {
  // Create new user
  createUser: async (name, email, password) => {
    const connection = await mysql.createConnection(DB_CONFIG);
    try {
      const password_hash = await bcrypt.hash(password, 10);
      
      const [result] = await connection.execute(
        'INSERT INTO users (name, email, password_hash, ability) VALUES (?, ?, ?, ?)',
        [name, email, password_hash, 0]
      );
      
      return {
        id: result.insertId,
        name,
        email,
        ability: 0
      };
    } finally {
      await connection.end();
    }
  },

  // Find user by email
  findUserByEmail: async (email) => {
    const connection = await mysql.createConnection(DB_CONFIG);
    try {
      const [users] = await connection.execute(
        'SELECT id, name, email, password_hash, ability FROM users WHERE email = ?',
        [email]
      );
      return users[0] || null;
    } finally {
      await connection.end();
    }
  },

  // Find user by ID
  findUserById: async (id) => {
    const connection = await mysql.createConnection(DB_CONFIG);
    try {
      const [users] = await connection.execute(
        'SELECT id, name, email, ability FROM users WHERE id = ?',
        [id]
      );
      return users[0] || null;
    } finally {
      await connection.end();
    }
  },

  // Verify password
  verifyPassword: async (plainPassword, hashedPassword) => {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }
};

module.exports = userQueries;