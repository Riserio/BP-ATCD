// netlify/functions/_lib/db.js
const { Client } = require('pg');

let clientPromise;

/**
 * Retorna (e mantém) um cliente conectado.
 */
async function getClient() {
  const connectionString = process.env.NEON_DB_URL || process.env.DATABASE_URL;
  if (!connectionString) throw new Error('NEON_DB_URL (ou DATABASE_URL) não definida');

  if (!clientPromise) {
    clientPromise = (async () => {
      const client = new Client({
        connectionString,
        ssl: { rejectUnauthorized: false },
      });
      await client.connect();
      return client;
    })();
  }
  return clientPromise;
}

/**
 * Compatível com 'pg': retorna um objeto com .rows, .rowCount, etc.
 * Ex.: const { rows } = await query('SELECT 1');
 */
async function query(text, params) {
  const client = await getClient();
  const res = await client.query(text, params);
  return res; // <- mantém .rows, .rowCount, etc.
}

/**
 * Conveniências (opcionais). Use se quiser.
 */
async function one(text, params) {
  const { rows } = await query(text, params);
  return rows[0] || null;
}

async function many(text, params) {
  const { rows } = await query(text, params);
  return rows;
}

/**
 * Coloque aqui suas migrações/tabelas se as Functions chamam ensureSchema().
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
