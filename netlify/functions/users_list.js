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
    // Ajuste os campos conforme seu schema real de "usuarios"
    const users = await sql`
      SELECT id, nome, email, perfil, criado_em, atualizado_em
      FROM usuarios
      ORDER BY id ASC
    `;

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(users)
    };
  } catch (err) {
    console.error('Erro em users_list:', err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: err.message })
    };
  }
};
