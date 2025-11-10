
const { query, ensureSchema } = require('./db');
const crypto = require('crypto');

exports.handler = async (event) => {
  try{
    await ensureSchema();
    const { id, name, email, password } = JSON.parse(event.body||'{}');
    if(!id) return resp(400, { error: 'id required' });
    if(password){
      const ph = sha(password);
      await query('UPDATE users SET name=COALESCE($1,name), email=COALESCE($2,email), password_hash=$3 WHERE id=$4',[name,email,ph,id]);
    }else{
      await query('UPDATE users SET name=COALESCE($1,name), email=COALESCE($2,email) WHERE id=$3',[name,email,id]);
    }
    const { rows } = await query('SELECT id,name,email,created_at FROM users WHERE id=$1',[id]);
    return resp(200, rows[0]||{});
  }catch(e){ return resp(500, { error: e.message }); }
};

function sha(s){ return crypto.createHash('sha256').update(s).digest('hex'); }
function resp(status, data){ return { statusCode: status, headers:{'Content-Type':'application/json'}, body: JSON.stringify(data) }; }
