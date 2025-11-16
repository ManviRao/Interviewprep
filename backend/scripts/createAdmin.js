const bcrypt = require("bcrypt");
const { mysql, DB_CONFIG } = require("../config/db"); // use your DB connection

async function createAdmin() {
  const connection = await mysql.createConnection(DB_CONFIG);
  const name = "Super Admin";
  const email = "admin@example.com";
  const password = "admin123"; // choose a strong password
  const role = "admin";

  const hashedPassword = await bcrypt.hash(password, 12);

  // Insert admin directly
  const query = `
    INSERT INTO users (name, email, password_hash, role, is_verified)
    VALUES (?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE name = VALUES(name), password_hash = VALUES(password_hash), role = VALUES(role), is_verified = VALUES(is_verified)
  `;

  await connection.execute(query, [name, email, hashedPassword, role, true]);
  console.log("✅ Admin account created or updated:", { name, email, role, is_verified: true });

  await connection.end();
  process.exit(0);
}

createAdmin().catch(err => {
  console.error("Error creating admin:", err);
  process.exit(1);
});
