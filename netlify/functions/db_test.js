// netlify/functions/db_test.js
const { query, ensureSchema } = require('./_lib/db');

exports.handler = async () => {
  try{
    await ensureSchema();
    const { rows } = await query('SELECT NOW() AS now');
    return resp(200, { ok: true, now: rows[0].now });
  }catch(e){
    return resp(500, { ok:false, error: e.message });
  }
};

function resp(status, data){
  return {
    statusCode: status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    },
    body: JSON.stringify(data)
  };
}
