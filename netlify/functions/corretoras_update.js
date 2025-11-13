
const { query, ensureSchema } = require('./_lib/db');

exports.handler = async (event) => {
  try{
    await ensureSchema();
    const p = JSON.parse(event.body||'{}');
    if(!p.id && !p.nome) return resp(400,{error:'id or nome required'});
    const fields = [];
    const values = [];
    let idx = 1;
    const updatables = ['nome','cnpj','telefone','email','responsavel'];
    updatables.forEach((key)=>{
      if(p[key] !== undefined){
        fields.push(`${key}=$${idx++}`);
        values.push(p[key]);
      }
    });
    if(!fields.length) return resp(400,{error:'no fields to update'});
    fields.push(`atualizado_em=NOW()`);
    if(p.id){
      values.push(p.id);
      const sql = `UPDATE corretoras SET ${fields.join(', ')} WHERE id=$${idx} RETURNING *`;
      const { rows } = await query(sql, values);
      return resp(200, rows[0]||{});
    }else{
      values.push(p.nome);
      const sql = `UPDATE corretoras SET ${fields.join(', ')} WHERE nome=$${idx} RETURNING *`;
      const { rows } = await query(sql, values);
      return resp(200, rows[0]||{});
    }
  }catch(e){ return resp(500, { error: e.message }); }
};

function resp(status, data){ return { statusCode: status, headers:{'Content-Type':'application/json'}, body: JSON.stringify(data) }; }
