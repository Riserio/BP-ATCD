// netlify/functions/_lib/db.js
// Compatível com @netlify/neon + Netlify Functions

const { neon } = require("@netlify/neon");

// Cliente único reutilizado
let sqlInstance = null;

function getSql() {
  if (!sqlInstance) {
    sqlInstance = neon(); // usa NETLIFY_DATABASE_URL automaticamente
  }
  return sqlInstance;
}

async function query(text, params) {
  const sql = getSql();
  if (params && params.length) {
    const result = await sql(text, params);
    return { rows: result };
  }
  const result = await sql(text);
  return { rows: result };
}

async function one(text, params) {
  const { rows } = await query(text, params);
  return rows[0] || null;
}

async function many(text, params) {
  const { rows } = await query(text, params);
  return rows;
}

async function ensureSchema() {
  // Mantido por compatibilidade
  return true;
}

module.exports = {
  query,
  one,
  many,
  ensureSchema
};
