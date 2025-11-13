
const { query, ensureSchema } = require('./_lib/db');

exports.handler = async (event) => {
  try{
    await ensureSchema();
    const p = JSON.parse(event.body||'{}');
    if(!p.id) return resp(400, { error: 'id required' });
    const fields = [];
    const values = [];
    let idx = 1;

    const setters = {
      corretora: val=>val ?? null,
      contato: val=>val ?? null,
      canal: val=>val ?? null,
      assunto: val=>val ?? null,
      responsavel: val=>val ?? null,
      descricao: val=>val ?? null,
      prioridade: val=>val ?? null,
      proximo: val=>val ?? null,
      status: val=>val ?? null,
      anexo: val=>val ?? null,
      team_id: val=>val ?? null,
      owner_id: val=>val ?? null,
    };
    Object.entries(setters).forEach(([key, transform])=>{
      if(p[key] !== undefined){
        fields.push(`${key}=$${idx++}`);
        values.push(transform(p[key]));
      }
    });
    if(p.follow_on !== undefined || p.follow !== undefined){
      fields.push(`follow_on=$${idx++}`);
      values.push(p.follow_on || p.follow || null);
    }
    if(p.tags !== undefined){
      fields.push(`tags=$${idx++}`);
      values.push(Array.isArray(p.tags) ? p.tags : []);
    }
    if(p.sla !== undefined){
      fields.push(`sla=$${idx++}`);
      values.push(toNumberOrNull(p.sla));
    }
    if(!fields.length) return resp(400, { error: 'no fields to update' });
    fields.push(`updated_at=NOW()`);
    values.push(p.id);
    const sql = `UPDATE atendimentos SET ${fields.join(', ')} WHERE id=$${idx} RETURNING *`;
    const { rows } = await query(sql, values);
    return resp(200, rows[0]||{});
  }catch(e){ return resp(500, { error: e.message }); }
};

function toNumberOrNull(v){ const n = Number(v); return Number.isFinite(n) ? n : null; }
function resp(status, data){ return { statusCode: status, headers:{'Content-Type':'application/json'}, body: JSON.stringify(data) }; }
