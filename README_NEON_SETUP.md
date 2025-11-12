# Guia rápido: subir app no Neon (PostgreSQL) + Netlify

## 1) Criar banco no Neon
1. Acesse https://console.neon.tech (ou app) → **Create project**.
2. Anote a **Connection string** (formato `postgresql://...sslmode=require`).

> **Dica:** gere uma senha nova para o usuário padrão e guarde-a com segurança.

## 2) Popular o schema no Neon
Requisitos: `psql` instalado (no macOS: `brew install libpq && brew link --force libpq`).

Edite seu arquivo `.env` na raiz do projeto e coloque:
```
NEON_DB_URL=postgresql://USER:PASSWORD@HOST/neondb?sslmode=require
```

Depois rode:
```
cd "ATCDoficial-main-fixed3 2"
bash scripts/neon_import.sh
```

Esse comando aplica `scripts/init_neon.sql` (que inclui seu `schema.sql` e cria um índice único em `corretoras.cnpj` para dar suporte ao `ON CONFLICT`).

## 3) Configurar Netlify
- Em **Site settings → Environment variables**, adicione:  
  `NEON_DB_URL` com a mesma connection string.
- Confirme seu `netlify.toml`:
```toml
[build]
command = "npm i"
publish = "."
functions = "netlify/functions"

[functions]
external_node_modules = ["pg", "bcryptjs", "uuid"]
node_bundler = "esbuild"
included_files = ["netlify/functions/**"]

[build.environment]
NODE_VERSION = "20"
```

## 4) Testes rápidos (em produção após deploy)
```
curl -s https://SEU_SITE.netlify.app/.netlify/functions/healthcheck
curl -s https://SEU_SITE.netlify.app/.netlify/functions/db_test
curl -s https://SEU_SITE.netlify.app/.netlify/functions/users_list
```

## 5) Segurança
- **Nunca** commitar `.env` com credenciais reais.
- Se você já divulgou a string antiga, **rotate** a senha no Neon.
- Use `sslmode=require` e não desative validação TLS no cliente.

## 6) Erro comum: `ON CONFLICT` sem índice
Se aparecer `there is no unique or exclusion constraint matching the ON CONFLICT specification` ao inserir corretoras, é porque faltava `UNIQUE (cnpj)`. O `scripts/init_neon.sql` deste pacote já cria a constraint `corretoras_cnpj_key`.

---

Pronto! Com isso, seu app sobe no Neon e os endpoints das Functions passam a persistir os dados no PostgreSQL em nuvem.
