// netlify/functions/_lib/db.js
// Compatível com @netlify/neon + Netlify DB

const crypto = require('crypto');
const { neon } = require("@netlify/neon");

let sqlInstance = null;
let schemaEnsured = false;

const DEFAULT_ADMIN_EMAIL = (process.env.DEFAULT_ADMIN_EMAIL || process.env.ADMIN_EMAIL || 'admin@bp.com').trim().toLowerCase();
const DEFAULT_ADMIN_PASSWORD = process.env.DEFAULT_ADMIN_PASSWORD || process.env.ADMIN_PASSWORD || 'admin';
const DEFAULT_ADMIN_NAME = process.env.DEFAULT_ADMIN_NAME || 'Administrador ATCD';

const schemaStatements = [
  `CREATE TABLE IF NOT EXISTS usuarios (
    id BIGSERIAL PRIMARY KEY,
    nome TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    senha_hash TEXT NOT NULL,
    perfil TEXT NOT NULL CHECK (perfil IN ('admin','comercial','lider')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ
  )`,
  `CREATE TABLE IF NOT EXISTS sessoes (
    token TEXT PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS app_settings (
    chave TEXT PRIMARY KEY,
    valor TEXT
  )`,
  `CREATE TABLE IF NOT EXISTS corretoras (
    id BIGSERIAL PRIMARY KEY,
    nome TEXT NOT NULL,
    cnpj TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ
  )`,
  `CREATE TABLE IF NOT EXISTS atendimentos (
    id BIGSERIAL PRIMARY KEY,
    owner_id BIGINT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ,
    status TEXT NOT NULL CHECK (status IN ('novo','andamento','aguardando','concluido')),
    prioridade TEXT NOT NULL CHECK (prioridade IN ('Alta','Média','Baixa')),
    corretora TEXT NOT NULL,
    contato TEXT,
    canal TEXT,
    assunto TEXT NOT NULL,
    responsavel TEXT,
    descricao TEXT NOT NULL,
    proximo TEXT,
    follow_on DATE,
    sla INTEGER,
    tags TEXT[],
    anexo TEXT,
    team_id TEXT
  )`,
  `CREATE TABLE IF NOT EXISTS contatos (
    id BIGSERIAL PRIMARY KEY,
    nome TEXT NOT NULL,
    email TEXT,
    telefone TEXT,
    corretora TEXT,
    endereco TEXT,
    instagram TEXT,
    facebook TEXT,
    linkedin TEXT,
    site TEXT,
    obs TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ
  )`,
  `DO $$ BEGIN
    IF NOT EXISTS (
      SELECT 1 FROM pg_constraint c
      JOIN pg_class t ON c.conrelid = t.oid
      WHERE t.relname = 'corretoras' AND c.conname = 'corretoras_cnpj_key'
    ) THEN
      ALTER TABLE corretoras ADD CONSTRAINT corretoras_cnpj_key UNIQUE (cnpj);
    END IF;
  END $$;`
];

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
  if (schemaEnsured) return true;
  const sql = getSql();
  for (const statement of schemaStatements) {
    await sql(statement);
  }
  await seedDefaultAdmin(sql);
  schemaEnsured = true;
  return true;
}

async function seedDefaultAdmin(sql){
  if(!DEFAULT_ADMIN_EMAIL || !DEFAULT_ADMIN_PASSWORD) return;
  const hash = sha(DEFAULT_ADMIN_PASSWORD);
  await sql(
    `INSERT INTO usuarios (nome,email,senha_hash,perfil)
     VALUES ($1,$2,$3,'admin')
     ON CONFLICT (email) DO NOTHING`,
    [DEFAULT_ADMIN_NAME, DEFAULT_ADMIN_EMAIL, hash]
  );
}

function sha(value){
  return crypto.createHash('sha256').update(String(value)).digest('hex');
}

module.exports = {
  query,
  one,
  many,
  ensureSchema
};
