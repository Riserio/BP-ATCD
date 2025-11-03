# Integração completa: Corretoras no Neon (Netlify Functions)

## 1) Tabela no Neon
Execute no Query Tool:
```sql
CREATE TABLE IF NOT EXISTS corretoras (
  id BIGSERIAL PRIMARY KEY,
  nome TEXT NOT NULL,
  cnpj TEXT,
  telefone TEXT,
  email TEXT,
  responsavel TEXT,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ
);
```

## 2) Variável de ambiente no Netlify
NEON_DB_URL = postgresql://...neon.tech/neondb?sslmode=require&channel_binding=require

## 3) Endpoints
- GET  /.netlify/functions/corretoras_list
- POST /.netlify/functions/corretoras_insert
- POST /.netlify/functions/corretoras_update
- POST /.netlify/functions/corretoras_delete

## 4) Frontend
O arquivo index.html foi patchado com um script que:
- carrega corretoras do banco no DOMContentLoaded;
- intercepta um form com id `form-corretora` (ajuste os names: nome, cnpj, telefone, email, responsavel);
- renderiza numa tabela com id `tabela-corretoras > tbody`;
- trata exclusão via botão com `[data-excluir-corretora][data-id]`. 

Adapte os seletores para o seu layout, se necessário.
