const { query } = require('./db');
const { v4: uuidv4 } = require('uuid');

async function issueSession(userId, hours = 72){
  const token = uuidv4();
  const expiresAt = new Date(Date.now() + hours * 3600 * 1000).toISOString();
  await query(
    'INSERT INTO sessoes (token, user_id, expires_at) VALUES ($1,$2,$3)',
    [token, userId, expiresAt]
  );
  return token;
}

async function getUserByToken(token){
  if (!token) return null;
  const { rows } = await query(
    `SELECT u.id, u.nome, u.email, u.perfil
       FROM sessoes s
       JOIN usuarios u ON u.id = s.user_id
      WHERE s.token = $1 AND s.expires_at > NOW()`,
    [token]
  );
  return rows[0] || null;
}

async function destroySession(token){
  if (!token) return;
  await query('DELETE FROM sessoes WHERE token=$1', [token]);
}

module.exports = { issueSession, getUserByToken, destroySession };
