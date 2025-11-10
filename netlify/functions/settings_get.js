
const { query, ensureSchema } = require('./db');

exports.handler = async () => {
  try{
    await ensureSchema();
    const { rows } = await query("SELECT key, value FROM settings");
    const obj = {};
    for(const r of rows){ obj[r.key] = r.value; }
    // normalizar convenções usadas no adapter
    return resp(200, {
      logoUrl: (obj.brand && obj.brand.logoUrl) || obj.logoUrl || null,
      themeVars: (obj.brand && obj.brand.themeVars) || obj.themeVars || null
    });
  }catch(e){ return resp(500, { error: e.message }); }
};

function resp(status, data){ return { statusCode: status, headers:{'Content-Type':'application/json'}, body: JSON.stringify(data) }; }
