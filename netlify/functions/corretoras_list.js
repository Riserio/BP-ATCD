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

  try {
    const corretoras = await sql`
      SELECT id, nome, cnpj, telefone, email, responsavel, criado_em, atualizado_em
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
