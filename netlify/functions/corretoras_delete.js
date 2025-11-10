
const { query, ensureSchema } = require('./_lib/db');

exports.handler = async (event) => {
  try{
    await ensureSchema();
    const { id } = JSON.parse(event.body||'{}');
    if(!id) return resp(400, { error: 'id required' });
    await query('DELETE FROM corretoras WHERE id=$1',[id]);
    return resp(200, { ok: true });
  }catch(e){ return resp(500, { error: e.message }); }
};

function resp(status, data){ return { statusCode: status, headers:{'Content-Type':'application/json'}, body: JSON.stringify(data) }; }
