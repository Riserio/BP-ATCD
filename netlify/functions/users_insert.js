
const { query, ensureSchema } = require('./_lib/db');
const crypto = require('crypto');

exports.handler = async (event) => {
  try{
    await ensureSchema();
    const { name, email, password } = JSON.parse(event.body||'{}');
    if(!name || !email || !password) return resp(400, { error: 'name/email/password required' });
    const ph = sha(password);
    const { rows } = await query('INSERT INTO users(name,email,password_hash) VALUES($1,$2,$3) RETURNING id,name,email,created_at',[name,email,ph]);
    return resp(200, rows[0]);
  }catch(e){ return resp(500, { error: e.message }); }
};

function sha(s){ return crypto.createHash('sha256').update(s).digest('hex'); }
function resp(status, data){ return { statusCode: status, headers:{'Content-Type':'application/json'}, body: JSON.stringify(data) }; }
