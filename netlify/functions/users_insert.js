const { query, ensureSchema } = require('./_lib/db');
const { requireAuth } = require('./_lib/http');
const crypto = require('crypto');

exports.handler = async (event) => {
  try{
    await ensureSchema();
    await requireAuth(event, { adminOnly: true });
    const body = JSON.parse(event.body||'{}');
    const nome = (body.nome || body.name || '').trim();
    const email = (body.email || '').trim().toLowerCase();
    const password = body.password || body.senha;
    const perfil = normalizePerfil(body.perfil || body.role || 'comercial');

    if(!nome || !email || !password)
      return resp(400, { error: 'nome/email/password required' });

    if(!['admin','comercial','lider'].includes(perfil))
      return resp(400, { error: 'perfil inválido' });

    const ph = sha(password);
    const { rows } = await query(
      'INSERT INTO usuarios(nome,email,senha_hash,perfil) VALUES($1,$2,$3,$4) RETURNING id,nome,email,perfil,created_at',
      [nome,email,ph,perfil]
    );
    return resp(200, rows[0]);
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
function resp(status, data){
  return {
    statusCode: status,
    headers: { 'Content-Type':'application/json' },
    body: JSON.stringify(data)
  };
}
