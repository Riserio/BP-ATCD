
const { Pool } = require('pg');

let _pool;
function getPool(){
  if(_pool) return _pool;
  const connectionString = process.env.NEON_DB_URL || process.env.DATABASE_URL;
  if(!connectionString) throw new Error('NEON_DB_URL not set');
  _pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });
  return _pool;
}
async function query(sql, params=[]){
  const pool = getPool();
  const client = await pool.connect();
  try{
    return await client.query(sql, params);
  } finally {
    client.release();
  }
}

async function ensureSchema(){
  // create tables if not exist (id serial for simplicity)
  await query(`CREATE TABLE IF NOT EXISTS users(
    id SERIAL PRIMARY KEY,
    name TEXT,
    email TEXT UNIQUE,
    password_hash TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
  );`);
  await query(`CREATE TABLE IF NOT EXISTS corretoras(
    id SERIAL PRIMARY KEY,
    nome TEXT UNIQUE,
    cnpj TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
  );`);
  await query(`CREATE TABLE IF NOT EXISTS atendimentos(
    id SERIAL PRIMARY KEY,
    titulo TEXT,
    descricao TEXT,
    status TEXT,
    prioridade TEXT,
    corretora TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
  );`);
  await query(`CREATE TABLE IF NOT EXISTS settings(
    key TEXT PRIMARY KEY,
    value JSONB,
    updated_at TIMESTAMPTZ DEFAULT now()
  );`);
}

module.exports = { query, ensureSchema };
