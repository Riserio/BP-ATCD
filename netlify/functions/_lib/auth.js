const { getPool } = require("./db");
const { v4: uuidv4 } = require("uuid");

async function issueSession(userId, hours=72){
  const pool = getPool();
  const token = uuidv4();
  await pool.query(
    "INSERT INTO sessoes (token, user_id, expires_at) VALUES ($1,$2, NOW() + INTERVAL '72 hours')",
    [token, userId]
  );
  return token;
}
async function getUserByToken(token){
  if(!token) return null;
  const pool = getPool();
  const { rows } = await pool.query(
    `SELECT u.id, u.nome, u.email, u.perfil
       FROM sessoes s JOIN usuarios u ON u.id=s.user_id
      WHERE s.token=$1 AND s.expires_at>NOW()`, [token]);
  return rows[0] || null;
}
async function destroySession(token){
  const pool = getPool();
  await pool.query("DELETE FROM sessoes WHERE token=$1", [token]);
}
module.exports = { issueSession, getUserByToken, destroySession };
