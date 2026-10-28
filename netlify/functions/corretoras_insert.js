import { sql } from './db_client.js';

const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
};

// Normaliza o potencial da corretora para 'alto' | 'medio' | 'baixo' (ou null)
function normPotencial(v) {
  if (v === undefined) return undefined;
  const s = String(v ?? '').trim().toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  if (!s) return null;
  if (['alto', 'alta', 'a'].includes(s)) return 'alto';
  if (['medio', 'media', 'm'].includes(s)) return 'medio';
  if (['baixo', 'baixa', 'b'].includes(s)) return 'baixo';
  return null;
}

// Garante a coluna 'potencial' (uma vez por cold start)
let potencialColumnReady = false;
async function ensurePotencialColumn() {
  if (potencialColumnReady) return;
  await sql`ALTER TABLE corretoras ADD COLUMN IF NOT EXISTS potencial TEXT`;
  potencialColumnReady = true;
}

export const handler = async (event, context) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const body = JSON.parse(event.body || '{}');
    const { nome, cnpj, telefone, email, responsavel } = body;
    const potencial = normPotencial(body.potencial) ?? null;

    if (!nome || !cnpj) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Campos nome e cnpj são obrigatórios.' })
      };
    }

    // Se você já tiver UNIQUE(cnpj) criado na tabela,
    // pode usar ON CONFLICT para evitar erro de duplicidade.
    // Caso ainda não tenha, remova o bloco ON CONFLICT.
    await ensurePotencialColumn();

    const result = await sql`
      INSERT INTO corretoras (nome, cnpj, telefone, email, responsavel, potencial)
      VALUES (${nome}, ${cnpj}, ${telefone ?? null}, ${email ?? null}, ${responsavel ?? null}, ${potencial})
      ON CONFLICT (cnpj) DO UPDATE
      SET
        nome = EXCLUDED.nome,
        telefone = EXCLUDED.telefone,
        email = EXCLUDED.email,
        responsavel = EXCLUDED.responsavel,
        potencial = COALESCE(EXCLUDED.potencial, corretoras.potencial),
        atualizado_em = NOW()
      RETURNING *
    `;

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(result[0])
    };
  } catch (err) {
    console.error('Erro em corretoras_insert:', err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: err.message })
    };
  }
};
