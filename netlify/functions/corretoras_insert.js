import { sql } from './db_client.js';

const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
};

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
    const result = await sql`
      INSERT INTO corretoras (nome, cnpj, telefone, email, responsavel)
      VALUES (${nome}, ${cnpj}, ${telefone}, ${email}, ${responsavel})
      ON CONFLICT (cnpj) DO UPDATE
      SET
        nome = EXCLUDED.nome,
        telefone = EXCLUDED.telefone,
        email = EXCLUDED.email,
        responsavel = EXCLUDED.responsavel,
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
