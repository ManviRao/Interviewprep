const { mysql, DB_CONFIG } = require('./db');
const connection = mysql.createPool(DB_CONFIG);
const bcrypt = require('bcrypt');
const crypto = require('crypto');

// Existing methods (keep these)
const findUserByEmail = async (email) => {
  const query = 'SELECT id, name, email, password_hash, role, ability, is_verified, verification_token, verification_token_expires FROM users WHERE email = ?';
  const [users] = await connection.execute(query, [email]);
  return users[0] || null;
};

const findUserById = async (id) => {
  const query = 'SELECT id, name, email, ability, is_verified FROM users WHERE id = ?';
  const [users] = await connection.execute(query, [id]);
  return users[0] || null;
};

const verifyPassword = async (password, passwordHash) => {
  return await bcrypt.compare(password, passwordHash);
};

// UPDATED createUser method (replace old one)
const createUser = async (name, email, password) => {
  const verificationToken = generateVerificationToken();
  const query = 'INSERT INTO users (name, email, password_hash, verification_token, verification_token_expires) VALUES (?, ?, ?, ?, ?)';
  const passwordHash = await bcrypt.hash(password, 12);
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);
  
  const [result] = await connection.execute(query, [name, email, passwordHash, verificationToken, expires]);
  
  return {
    id: result.insertId,
    name,
    email,
    verificationToken
  };
};

// NEW METHODS for email verification
const generateVerificationToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

const updateUserVerificationToken = async (userId, token) => {
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);
  const query = 'UPDATE users SET verification_token = ?, verification_token_expires = ? WHERE id = ?';
  const values = [token, expires, userId];
  
  const [result] = await connection.execute(query, values);
  return result;
};

const verifyUserWithToken = async (token) => {
  const query = 'SELECT * FROM users WHERE verification_token = ? AND verification_token_expires > NOW()';
  const [users] = await connection.execute(query, [token]);
  
  if (users.length === 0) {
    return null;
  }
  
  const user = users[0];
  
  const updateQuery = 'UPDATE users SET is_verified = TRUE, verification_token = NULL, verification_token_expires = NULL WHERE id = ?';
  await connection.execute(updateQuery, [user.id]);
  
  return user;
};

const findUserByVerificationToken = async (token) => {
  const query = 'SELECT * FROM users WHERE verification_token = ? AND verification_token_expires > NOW()';
  const [users] = await connection.execute(query, [token]);
  return users[0] || null;
};

module.exports = {
  findUserByEmail,
  findUserById,
  createUser,
  verifyPassword,
  generateVerificationToken,
  updateUserVerificationToken,
  verifyUserWithToken,
  findUserByVerificationToken
};