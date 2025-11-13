// netlify/functions/leads_list.js
// Lista os leads usando o helper de banco baseado em @netlify/neon.

const { query } = require('./_lib/db');

exports.handler = async () => {
  try {
    const { rows } = await query(
      'SELECT id, nome, email, criado_em FROM leads ORDER BY id DESC LIMIT 100'
    );
    return {
      statusCode: 200,
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ ok: true, leads: rows })
    };
  } catch (e) {
    return {
      statusCode: 500,
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ ok: false, error: e.message })
    };
  }
};
