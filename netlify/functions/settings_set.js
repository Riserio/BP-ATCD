
const { query, ensureSchema } = require('./db');

exports.handler = async (event) => {
  try{
    await ensureSchema();
    const p = JSON.parse(event.body||'{}');
    // salvamos chaves simples em JSONB
    await query("INSERT INTO settings(key,value) VALUES('logoUrl',$1) ON CONFLICT (key) DO UPDATE SET value=EXCLUDED.value", [JSON.stringify(p.logoUrl||null)]);
    await query("INSERT INTO settings(key,value) VALUES('themeVars',$1) ON CONFLICT (key) DO UPDATE SET value=EXCLUDED.value", [JSON.stringify(p.themeVars||null)]);
    return resp(200, { ok: true });
  }catch(e){ return resp(500, { error: e.message }); }
};

function resp(status, data){ return { statusCode: status, headers:{'Content-Type':'application/json'}, body: JSON.stringify(data) }; }
