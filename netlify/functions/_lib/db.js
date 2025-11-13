// netlify/functions/_lib/db.js
// Adaptado para usar @netlify/neon (Netlify DB + Neon)
// e manter a mesma interface (query, one, many, ensureSchema).

const { neon, neonConfig } = require('@netlify/neon');

// Garante compatibilidade com node-postgres (rows, rowCount, etc.)
neonConfig.fullResults = true;
// Reaproveita conexões em ambiente serverless
neonConfig.fetchConnectionCache = true;

let sqlInstance;

/**
 * Retorna (e mantém) uma instância de sql() já configurada.
 * O @netlify/neon usa automaticamente a env NETLIFY_DATABASE_URL
 * (criada pelo Netlify DB) – não é necessário passar connectionString.
 */
function getSql() {
  if (!sqlInstance) {
    sqlInstance = neon();
  }
  return sqlInstance;
}

/**
 * query(text, params)
 * text: string com SQL
 * params: array de parâmetros opcionais
 *
 * Retorna um objeto no formato semelhante ao node-postgres,
 * contendo .rows, .rowCount, etc.
 */
async function query(text, params) {
  const sql = getSql();
  if (params && params.length) {
    return await sql(text, params);
  }
  return await sql(text);
}

/**
 * Retorna apenas uma linha (ou null).
 */
async function one(text, params) {
  const { rows } = await query(text, params);
  return rows[0] || null;
}

/**
 * Retorna apenas o array de linhas.
 */
async function many(text, params) {
  const { rows } = await query(text, params);
  return rows;
}

/**
 * Hook para migrações/DDL, se quiser.
 * Neste projeto está como no-op, apenas retorna true.
 */
async function ensureSchema() {
  // Exemplo (idempotente):
  // await query(`
  //   CREATE TABLE IF NOT EXISTS users(
  //     id SERIAL PRIMARY KEY,
  //     name TEXT NOT NULL,
  //     email TEXT UNIQUE NOT NULL,
  //     password_hash TEXT NOT NULL,
  //     role TEXT DEFAULT 'User',
  //     created_at TIMESTAMP DEFAULT NOW()
  //   );
  // `);
  return true;
}

module.exports = { query, one, many, ensureSchema };
