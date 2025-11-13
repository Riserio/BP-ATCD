// netlify/functions/leads_insert.js
// Insere um lead usando o helper de banco baseado em @netlify/neon.

const { query } = require('./_lib/db');

exports.handler = async (event) => {
  try {
    if (event.httpMethod !== 'POST') {
      return {
        statusCode: 405,
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ error: 'Use POST' })
      };
    }

    const { nome, email } = JSON.parse(event.body || '{}');
    if (!nome) {
      return {
        statusCode: 400,
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ error: "Campo 'nome' é obrigatório" })
      };
    }

    const { rows } = await query(
      'INSERT INTO leads (nome, email) VALUES ($1, $2) RETURNING id, nome, email, criado_em',
      [nome, email || null]
    );

    return {
      statusCode: 200,
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ ok: true, lead: rows[0] })
    };
  } catch (e) {
    return {
      statusCode: 500,
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ ok: false, error: e.message })
    };
  }
};
