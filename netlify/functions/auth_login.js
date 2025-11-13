const { query, ensureSchema } = require('./_lib/db');
const { issueSession } = require('./_lib/auth');
const crypto = require('crypto');

exports.handler = async (event) => {
  try{
    await ensureSchema();
    const body = JSON.parse(event.body||'{}');
    const email = (body.email || '').trim().toLowerCase();
    const password = body.password || body.senha;
    if(!email || !password) return resp(400, { ok:false, error: 'email/password required' });

    const ph = sha(password);
    const { rows } = await query('SELECT id, nome, email, perfil FROM usuarios WHERE email=$1 AND senha_hash=$2', [email, ph]);
    if(!rows.length) return resp(401, { ok:false, error: 'invalid credentials' });

    const token = await issueSession(rows[0].id);
    return resp(200, { ok:true, token, user: rows[0] });
  }catch(e){
    const status = e.statusCode || 500;
    return resp(status, { ok:false, error: e.message });
  }
};

function sha(s){ return crypto.createHash('sha256').update(s).digest('hex'); }
function resp(status, data){
  return { statusCode: status, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) };
}
