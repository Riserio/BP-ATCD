
const { query, ensureSchema } = require('./_lib/db');

exports.handler = async () => {
  try{
    await ensureSchema();
    const { rows } = await query('SELECT * FROM atendimentos ORDER BY id DESC');
    return resp(200, rows);
  }catch(e){ return resp(500, { error: e.message }); }
};

function resp(status, data){ return { statusCode: status, headers:{'Content-Type':'application/json'}, body: JSON.stringify(data) }; }
