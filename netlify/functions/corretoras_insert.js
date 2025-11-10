
const { query, ensureSchema } = require('./_lib/db');

exports.handler = async (event) => {
  try{
    await ensureSchema();
    const p = JSON.parse(event.body||'{}');
    if(!p.nome) return resp(400,{error:'nome required'});
    const { rows } = await query('INSERT INTO corretoras(nome,cnpj) VALUES($1,$2) ON CONFLICT (nome) DO UPDATE SET cnpj=EXCLUDED.cnpj RETURNING *',[p.nome,p.cnpj||null]);
    return resp(200, rows[0]);
  }catch(e){ return resp(500, { error: e.message }); }
};

function resp(status, data){ return { statusCode: status, headers:{'Content-Type':'application/json'}, body: JSON.stringify(data) }; }
