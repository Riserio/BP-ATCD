// netlify/functions/_lib/db.js
// Camada de acesso ao banco usando @netlify/neon
// Expõe: query, one, many, ensureSchema

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

// Cria (ou reaproveita) instância do cliente SQL
function getSql() {
  if (!sqlInstance) {
    // Usa automaticamente NETLIFY_DATABASE_URL
    sqlInstance = neon();
  }
  return sqlInstance;
}

// Scripts de criação/ajuste de schema
const schemaStatements = [
  // Usuários
  `CREATE TABLE IF NOT EXISTS usuarios (
    id BIGSERIAL PRIMARY KEY,
    nome TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    senha_hash TEXT NOT NULL,
    perfil TEXT NOT NULL CHECK (perfil IN ('admin','comercial','lider')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ
  )`,

  // Sessões (auth)
  `CREATE TABLE IF NOT EXISTS sessoes (
    token TEXT PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL
  )`,

  // Configurações da aplicação
  `CREATE TABLE IF NOT EXISTS app_settings (
    chave TEXT PRIMARY KEY,
    valor JSONB
  )`,

  // Corretoras (ajustado para bater com as Functions)
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

  // Garantir colunas extras se a tabela já existir
  `ALTER TABLE corretoras ADD COLUMN IF NOT EXISTS telefone TEXT`,
  `ALTER TABLE corretoras ADD COLUMN IF NOT EXISTS email TEXT`,
  `ALTER TABLE corretoras ADD COLUMN IF NOT EXISTS responsavel TEXT`,
  `ALTER TABLE corretoras ADD COLUMN IF NOT EXISTS criado_em TIMESTAMPTZ`,
  `ALTER TABLE corretoras ADD COLUMN IF NOT EXISTS atualizado_em TIMESTAMPTZ`,

  // Leads (para leads_insert / leads_list)
  `CREATE TABLE IF NOT EXISTS leads (
    id BIGSERIAL PRIMARY KEY,
    nome TEXT NOT NULL,
    email TEXT,
    criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`,

  // Atendimentos (usado em atendimentos_* Functions)
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

  // Contatos (para contatos_list / contatos_upsert / contatos_delete)
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

// Executa o schema e garante admin
async function ensureSchema() {
  if (schemaEnsured) return;

  const sql = getSql();

  // Executa cada statement em sequência
  for (const stmt of schemaStatements) {
    if (!stmt || !stmt.trim()) continue;
    await sql(stmt);
  }

  // Garante que a coluna perfil exista e tenha o CHECK correto
  await sql(`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'usuarios' AND column_name = 'perfil'
      ) THEN
        ALTER TABLE usuarios
          ADD COLUMN perfil TEXT NOT NULL DEFAULT 'comercial';
      END IF;
    END
    $$;
  `);

  // Garante usuário admin padrão
  await ensureDefaultAdmin();

  schemaEnsured = true;
}

// Cria usuário admin se não existir
async function ensureDefaultAdmin() {
  const { rows } = await query(
    'SELECT id FROM usuarios WHERE email = $1 LIMIT 1',
    [DEFAULT_ADMIN_EMAIL]
  );
  if (rows.length) return;

  const hash = sha(DEFAULT_ADMIN_PASSWORD);
  await query(
    `INSERT INTO usuarios (nome, email, senha_hash, perfil)
     VALUES ($1, $2, $3, 'admin')`,
    [DEFAULT_ADMIN_NAME, DEFAULT_ADMIN_EMAIL, hash]
  );

  console.log(
    '[DB] Usuário admin criado:',
    DEFAULT_ADMIN_EMAIL,
    '(senha padrão configurada em variáveis ou "admin")'
  );
}

// Wrapper de query para ter interface estilo "pg"
async function query(text, params = []) {
  const sql = getSql();
  // @netlify/neon suporta sql(queryText, params[])
  const rows = await sql(text, params);
  return { rows };
}

// Helpers convenientes
async function many(text, params = []) {
  const { rows } = await query(text, params);
  return rows;
}

async function one(text, params = []) {
  const { rows } = await query(text, params);
  return rows[0] || null;
}

function sha(value) {
  return crypto
    .createHash('sha256')
    .update(String(value))
    .digest('hex');
}

module.exports = {
  query,
  one,
  many,
  ensureSchema
};
