import { Client } from 'pg';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

async function ensureSchema(client) {
  await client.query(`
    CREATE TABLE IF NOT EXISTS users(
      id serial PRIMARY KEY,
      name text NOT NULL,
      email text UNIQUE NOT NULL,
      password text
    );
  `);
}

export async function handler(event) {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: CORS, body: '' };
  }

  try {
    const client = new Client({
      connectionString: process.env.NEON_DB_URL,
      ssl: { rejectUnauthorized: false }
    });
    await client.connect();
    await ensureSchema(client);
    const { rows } = await client.query('SELECT id,name,email FROM users ORDER BY id DESC');
    await client.end();

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json', ...CORS },
      body: JSON.stringify(rows)
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: CORS,
      body: JSON.stringify({ error: err.message })
    };
  }
}
