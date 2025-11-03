
const { query, ensureSchema } = require('./db');

exports.handler = async (event) => {
  try{
    await ensureSchema();
    const p = JSON.parse(event.body||'{}');
    const { rows } = await query(
      'INSERT INTO atendimentos(titulo,descricao,status,prioridade,corretora) VALUES($1,$2,$3,$4,$5) RETURNING *',
      [p.titulo||'', p.descricao||'', p.status||'backlog', p.prioridade||'Baixa', p.corretora||null]
    );
    return resp(200, rows[0]);
  }catch(e){ return resp(500, { error: e.message }); }
};

function resp(status, data){ return { statusCode: status, headers:{'Content-Type':'application/json'}, body: JSON.stringify(data) }; }
