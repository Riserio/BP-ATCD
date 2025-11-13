const { query, ensureSchema } = require('./_lib/db');
const { requireAuth } = require('./_lib/http');

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers, body: '' };
  }
  try {
    await ensureSchema();
    await requireAuth(event, { adminOnly: true });
    const { rows } = await query(
      'SELECT id, nome, email, perfil, created_at, updated_at FROM usuarios ORDER BY id ASC'
    );
    return { statusCode: 200, headers, body: JSON.stringify(rows) };
  } catch (err) {
    const status = err.statusCode || 500;
    return { statusCode: status, headers, body: JSON.stringify({ error: err.message }) };
  }
};

const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type,Authorization',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
};
