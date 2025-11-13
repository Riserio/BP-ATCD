const { query, ensureSchema } = require('./_lib/db');
const { requireAuth } = require('./_lib/http');

exports.handler = async (event) => {
  try{
    await ensureSchema();
    await requireAuth(event, { adminOnly: true });
    const { id } = JSON.parse(event.body||'{}');
    if(!id) return resp(400, { error: 'id required' });
    await query('DELETE FROM usuarios WHERE id=$1',[id]);
    return resp(200, { ok: true });
  }catch(e){
    const status = e.statusCode || 500;
    return resp(status, { error: e.message });
  }
};

function resp(status, data){ return { statusCode: status, headers:{'Content-Type':'application/json'}, body: JSON.stringify(data) }; }
