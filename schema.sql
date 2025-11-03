CREATE TABLE IF NOT EXISTS usuarios (
  id BIGSERIAL PRIMARY KEY,
  nome TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  senha_hash TEXT NOT NULL,
  perfil TEXT NOT NULL CHECK (perfil IN ('admin','comercial')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ
);
CREATE TABLE IF NOT EXISTS sessoes (
  token TEXT PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL
);
CREATE TABLE IF NOT EXISTS app_settings (chave TEXT PRIMARY KEY, valor TEXT);
CREATE TABLE IF NOT EXISTS corretoras (
  id BIGSERIAL PRIMARY KEY, nome TEXT NOT NULL, cnpj TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ
);
CREATE TABLE IF NOT EXISTS atendimentos (
  id BIGSERIAL PRIMARY KEY, owner_id BIGINT, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ, status TEXT NOT NULL CHECK (status IN ('novo','andamento','aguardando','concluido')),
  prioridade TEXT NOT NULL CHECK (prioridade IN ('Alta','Média','Baixa')),
  corretora TEXT NOT NULL, contato TEXT, canal TEXT, assunto TEXT NOT NULL,
  responsavel TEXT, descricao TEXT NOT NULL, proximo TEXT, follow_on DATE, sla INTEGER,
  tags TEXT[], anexo TEXT
);
