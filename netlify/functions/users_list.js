const { query } = require('./_lib/db');

const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
};

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers, body: '' };
  }

  try {
    // Pega todos os campos existentes na tabela usuarios
    const { rows } = await query('SELECT * FROM usuarios ORDER BY id ASC');

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(rows)
    };
  } catch (err) {
    console.error('Erro em users_list:', err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: err.message })
    };
  }
}