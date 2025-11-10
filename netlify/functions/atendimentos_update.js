
const { query, ensureSchema } = require('./_lib/db');

exports.handler = async (event) => {
  try{
    await ensureSchema();
    const p = JSON.parse(event.body||'{}');
    if(!p.id) return resp(400, { error: 'id required' });
    await query(
      'UPDATE atendimentos SET titulo=COALESCE($1,titulo), descricao=COALESCE($2,descricao), status=COALESCE($3,status), prioridade=COALESCE($4,prioridade), corretora=COALESCE($5,corretora) WHERE id=$6',
      [p.titulo, p.descricao, p.status, p.prioridade, p.corretora, p.id]
    );
    const { rows } = await query('SELECT * FROM atendimentos WHERE id=$1',[p.id]);
    return resp(200, rows[0]||{});
  }catch(e){ return resp(500, { error: e.message }); }
};

function resp(status, data){ return { statusCode: status, headers:{'Content-Type':'application/json'}, body: JSON.stringify(data) }; }
