
-- ===============================================
-- BP ATCD – MIGRAÇÃO DE ESQUEMA (Neon / Postgres)
-- Ajusta tabelas usadas pelas Netlify Functions
-- ===============================================

BEGIN;

-- 1) CORRETORAS ---------------------------------
-- Garante coluna CNPJ e UNIQUE para suportar UPSERT (ON CONFLICT (cnpj))
ALTER TABLE IF EXISTS corretoras
  ADD COLUMN IF NOT EXISTS cnpj TEXT;

-- Adiciona UNIQUE (aceita múltiplos NULL; falha se houver duplicatas reais)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'corretoras_cnpj_key'
      AND conrelid = 'corretoras'::regclass
  ) THEN
    ALTER TABLE corretoras
      ADD CONSTRAINT corretoras_cnpj_key UNIQUE (cnpj);
  END IF;
END $$;

-- 2) ATENDIMENTOS -------------------------------
-- Cria a tabela caso não exista (id apenas)
CREATE TABLE IF NOT EXISTS atendimentos(
  id SERIAL PRIMARY KEY
);

-- Adiciona/ajusta colunas esperadas pelas Functions
ALTER TABLE atendimentos
  ADD COLUMN IF NOT EXISTS titulo     TEXT,
  ADD COLUMN IF NOT EXISTS descricao  TEXT,
  ADD COLUMN IF NOT EXISTS status     TEXT DEFAULT 'backlog',
  ADD COLUMN IF NOT EXISTS prioridade TEXT DEFAULT 'Baixa',
  ADD COLUMN IF NOT EXISTS corretora  INTEGER,
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW();

-- (Opcional) FK para corretoras (idempotente)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.table_constraints
    WHERE constraint_name = 'atendimentos_corretora_fkey'
      AND table_name = 'atendimentos'
  ) THEN
    ALTER TABLE atendimentos
      ADD CONSTRAINT atendimentos_corretora_fkey
      FOREIGN KEY (corretora) REFERENCES corretoras(id) ON DELETE SET NULL;
  END IF;
END $$;

COMMIT;

-- ============ TESTES RÁPIDOS ===================
-- SELECT * FROM corretoras LIMIT 5;
-- SELECT * FROM atendimentos ORDER BY id DESC LIMIT 5;
