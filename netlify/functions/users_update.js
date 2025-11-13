const { query, ensureSchema } = require('./_lib/db');
const { requireAuth } = require('./_lib/http');
const crypto = require('crypto');

exports.handler = async (event) => {
  try{
    await ensureSchema();
    await requireAuth(event, { adminOnly: true });
    const body = JSON.parse(event.body||'{}');
    const { id } = body;
    if(!id) return resp(400, { error: 'id required' });

    const updates = [];
    const params = [];
    let idx = 1;

    if(body.nome || body.name){
      updates.push(`nome=$${idx++}`);
      params.push((body.nome || body.name).trim());
    }
    if(body.email){
      updates.push(`email=$${idx++}`);
      params.push(body.email.trim().toLowerCase());
    }
    if(body.perfil || body.role){
      const perfil = normalizePerfil(body.perfil || body.role || '');
      if(!['admin','comercial','lider'].includes(perfil)) return resp(400, { error: 'perfil inválido' });
      updates.push(`perfil=$${idx++}`);
      params.push(perfil);
    }
    if(body.password || body.senha){
      updates.push(`senha_hash=$${idx++}`);
      params.push(sha(body.password || body.senha));
    }

    if(!updates.length) return resp(400, { error: 'no fields to update' });
    updates.push(`updated_at=NOW()`);
    params.push(id);
    const sql = `UPDATE usuarios SET ${updates.join(', ')} WHERE id=$${idx} RETURNING id,nome,email,perfil,created_at,updated_at`;
    const { rows } = await query(sql, params);
    return resp(200, rows[0]||{});
  }catch(e){
    const status = e.statusCode || 500;
    return resp(status, { error: e.message });
  }
};

function normalizePerfil(value){
  if(value === undefined || value === null) return '';
  return String(value)
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

function sha(s){ return crypto.createHash('sha256').update(s).digest('hex'); }
function resp(status, data){ return { statusCode: status, headers:{'Content-Type':'application/json'}, body: JSON.stringify(data) }; }
