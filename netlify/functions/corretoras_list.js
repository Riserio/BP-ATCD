import { sql } from './db_client.js';

const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
};

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

  try {
    await ensurePotencialColumn();
    const corretoras = await sql`
      SELECT id, nome, cnpj, telefone, email, responsavel, potencial, criado_em, atualizado_em
      FROM corretoras
      ORDER BY criado_em DESC, id DESC
    `;

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(corretoras)
    };
  } catch (err) {
    console.error('Erro em corretoras_list:', err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: err.message })
    };
  }
};
