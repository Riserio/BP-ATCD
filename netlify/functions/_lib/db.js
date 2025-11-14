// netlify/functions/_lib/db.js
// Camada de acesso ao banco usando @netlify/neon + Netlify DB (Postgres Neon)

const crypto = require('crypto');
const { neon } = require('@netlify/neon');

let sqlInstance = null;
let schemaEnsured = false;

const DEFAULT_ADMIN_EMAIL = (
  process.env.DEFAULT_ADMIN_EMAIL ||
  process.env.ADMIN_EMAIL ||
  'admin@bp.com'
).trim().toLowerCase();

const DEFAULT_ADMIN_PASSWORD =
  process.env.DEFAULT_ADMIN_PASSWORD ||
  process.env.ADMIN_PASSWORD ||
  'admin';

const DEFAULT_ADMIN_NAME =
  process.env.DEFAULT_ADMIN_NAME ||
  'Administrador ATCD';

// Retorna instância compartilhada do cliente SQL
function getSql() {
  if (!sqlInstance) {
    // Usa automaticamente a variável NETLIFY_DATABASE_URL
    sqlInstance = neon();
  }
  return sqlInstance;
}

// Declarações de criação / migração de schema
const schemaStatements = [
  // --- USUÁRIOS E AUTENTICAÇÃO ---
  `CREATE TABLE IF NOT EXISTS usuarios (
    id BIGSERIAL PRIMARY KEY,
    nome TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    senha_hash TEXT NOT NULL,
    perfil TEXT NOT NULL DEFAULT 'comercial',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ
  )`,

  // Garante que a coluna perfil exista (para bases antigas)
  `ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS perfil TEXT`,

  // Normaliza perfis nulos para 'comercial'
  `UPDATE usuarios SET perfil = 'comercial' WHERE perfil IS NULL`,

  // Garante que o CHECK constraint tenha os perfis corretos
  `ALTER TABLE usuarios DROP CONSTRAINT IF EXISTS usuarios_perfil_check`,
  `ALTER TABLE usuarios
     ADD CONSTRAINT usuarios_perfil_check
     CHECK (perfil IN ('admin','comercial','lider'))`,

  `CREATE TABLE IF NOT EXISTS sessoes (
    token TEXT PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL
  )`,

  `CREATE TABLE IF NOT EXISTS app_settings (
    chave TEXT PRIMARY KEY,
    valor JSONB
  )`,

  // --- CORRETORAS ---
  `CREATE TABLE IF NOT EXISTS corretoras (
    id BIGSERIAL PRIMARY KEY,
    nome TEXT NOT NULL,
    cnpj TEXT,
    telefone TEXT,
    email TEXT,
    responsavel TEXT,
    criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    atualizado_em TIMESTAMPTZ
  )`,

  // Garante colunas extras para bases antigas
  `ALTER TABLE corretoras ADD COLUMN IF NOT EXISTS telefone TEXT`,
  `ALTER TABLE corretoras ADD COLUMN IF NOT EXISTS email TEXT`,
  `ALTER TABLE corretoras ADD COLUMN IF NOT EXISTS responsavel TEXT`,
  `ALTER TABLE corretoras ADD COLUMN IF NOT EXISTS criado_em TIMESTAMPTZ`,
  `ALTER TABLE corretoras ADD COLUMN IF NOT EXISTS atualizado_em TIMESTAMPTZ`,

  // Garante UNIQUE em CNPJ para suportar ON CONFLICT (cnpj)
  `DO $$
   BEGIN
     IF NOT EXISTS (
       SELECT 1
       FROM pg_constraint
       WHERE conname = 'corretoras_cnpj_key'
     ) THEN
       ALTER TABLE corretoras
         ADD CONSTRAINT corretoras_cnpj_key UNIQUE (cnpj);
     END IF;
   END
   $$`,

  // --- LEADS ---
  `CREATE TABLE IF NOT EXISTS leads (
    id BIGSERIAL PRIMARY KEY,
    nome TEXT NOT NULL,
    email TEXT,
    criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`,

  // --- ATENDIMENTOS ---
  `CREATE TABLE IF NOT EXISTS atendimentos (
    id BIGSERIAL PRIMARY KEY,
    owner_id BIGINT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ,
    status TEXT NOT NULL DEFAULT 'novo',
    prioridade TEXT NOT NULL DEFAULT 'Média',
    corretora TEXT,
    contato TEXT,
    canal TEXT,
    assunto TEXT,
    responsavel TEXT,
    descricao TEXT,
    proximo TEXT,
    follow_on DATE,
    sla INTEGER,
    tags TEXT[],
    anexo TEXT,
    team_id TEXT
  )`,

  // Garante todas as colunas usadas nas Functions
  `ALTER TABLE atendimentos ADD COLUMN IF NOT EXISTS owner_id BIGINT`,
  `ALTER TABLE atendimentos ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ`,
  `ALTER TABLE atendimentos ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ`,
  `ALTER TABLE atendimentos ADD COLUMN IF NOT EXISTS status TEXT`,
  `ALTER TABLE atendimentos ADD COLUMN IF NOT EXISTS prioridade TEXT`,
  `ALTER TABLE atendimentos ADD COLUMN IF NOT EXISTS corretora TEXT`,
  `ALTER TABLE atendimentos ADD COLUMN IF NOT EXISTS contato TEXT`,
  `ALTER TABLE atendimentos ADD COLUMN IF NOT EXISTS canal TEXT`,
  `ALTER TABLE atendimentos ADD COLUMN IF NOT EXISTS assunto TEXT`,
  `ALTER TABLE atendimentos ADD COLUMN IF NOT EXISTS responsavel TEXT`,
  `ALTER TABLE atendimentos ADD COLUMN IF NOT EXISTS descricao TEXT`,
  `ALTER TABLE atendimentos ADD COLUMN IF NOT EXISTS proximo TEXT`,
  `ALTER TABLE atendimentos ADD COLUMN IF NOT EXISTS follow_on DATE`,
  `ALTER TABLE atendimentos ADD COLUMN IF NOT EXISTS sla INTEGER`,
  `ALTER TABLE atendimentos ADD COLUMN IF NOT EXISTS tags TEXT[]`,
  `ALTER TABLE atendimentos ADD COLUMN IF NOT EXISTS anexo TEXT`,
  `ALTER TABLE atendimentos ADD COLUMN IF NOT EXISTS team_id TEXT`,

  // --- CONTATOS ---
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
  )`
];

// Garante que o schema foi aplicado apenas uma vez por cold start
async function ensureSchema() {
  if (schemaEnsured) return;

  const sql = getSql();

  for (const stmt of schemaStatements) {
    const trimmed = (stmt || '').trim();
    if (!trimmed) continue;
    await sql(trimmed);
  }

  await ensureDefaultAdmin();
  schemaEnsured = true;
}

// Cria usuário admin padrão se ainda não existir
async function ensureDefaultAdmin() {
  const existing = await many(
    'SELECT id FROM usuarios WHERE email = $1 LIMIT 1',
    [DEFAULT_ADMIN_EMAIL]
  );
  if (existing.length) return;

  const hash = sha(DEFAULT_ADMIN_PASSWORD);
  await query(
    `INSERT INTO usuarios (nome, email, senha_hash, perfil)
     VALUES ($1, $2, $3, 'admin')`,
    [DEFAULT_ADMIN_NAME, DEFAULT_ADMIN_EMAIL, hash]
  );
  console.log(
    '[DB] Usuário admin criado:',
    DEFAULT_ADMIN_EMAIL,
    '(senha padrão configurada nas variáveis ou "admin")'
  );
}

// Wrapper de query (estilo pg)
async function query(text, params = []) {
  const sql = getSql();
  const rows = await sql(text, params);
  return { rows };
}

async function many(text, params = []) {
  const { rows } = await query(text, params);
  return rows;
}

async function one(text, params = []) {
  const { rows } = await query(text, params);
  return rows[0] || null;
}

function sha(value) {
  return crypto.createHash('sha256')
    .update(String(value))
    .digest('hex');
}

module.exports = {
  query,
  one,
  many,
  ensureSchema
};
