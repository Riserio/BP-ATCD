
const { query, ensureSchema } = require('./_lib/db');

exports.handler = async (event) => {
  try{
    await ensureSchema();
    const p = JSON.parse(event.body||'{}');
    if(!p.id && !p.nome) return resp(400,{error:'id or nome required'});
    if(p.id){
      await query('UPDATE corretoras SET nome=COALESCE($1,nome), cnpj=COALESCE($2,cnpj) WHERE id=$3',[p.nome,p.cnpj,p.id]);
      const { rows } = await query('SELECT * FROM corretoras WHERE id=$1',[p.id]);
      return resp(200, rows[0]||{});
    }else{
      await query('UPDATE corretoras SET cnpj=COALESCE($1,cnpj) WHERE nome=$2',[p.cnpj,p.nome]);
      const { rows } = await query('SELECT * FROM corretoras WHERE nome=$1',[p.nome]);
      return resp(200, rows[0]||{});
    }
  }catch(e){ return resp(500, { error: e.message }); }
};

function resp(status, data){ return { statusCode: status, headers:{'Content-Type':'application/json'}, body: JSON.stringify(data) }; }
