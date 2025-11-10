
const { query, ensureSchema } = require('./_lib/db');
const crypto = require('crypto');

exports.handler = async (event) => {
  try{
    await ensureSchema();
    const body = JSON.parse(event.body||'{}');
    const { email, password } = body;
    if(!email || !password) return resp(400, { error: 'email/password required' });

    const ph = sha(password);
    const { rows } = await query('SELECT id,name,email FROM users WHERE email=$1 AND password_hash=$2', [email, ph]);
    if(!rows.length) return resp(401, { error: 'invalid credentials' });

    // simples token (não-JWT) para demo
    const token = crypto.randomBytes(16).toString('hex');
    return resp(200, { token, user: rows[0] });
  }catch(e){
    return resp(500, { error: e.message });
  }
};

function sha(s){ return crypto.createHash('sha256').update(s).digest('hex'); }
function resp(status, data){
  return { statusCode: status, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) };
}
