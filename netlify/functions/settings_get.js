const { query, ensureSchema } = require('./_lib/db');

exports.handler = async () => {
  try{
    await ensureSchema();
    const { rows } = await query("SELECT chave, valor FROM app_settings");
    const obj = {};
    for(const r of rows){ obj[r.chave] = r.valor; }
    return resp(200, {
      logoUrl: obj.logoUrl || null,
      themeVars: obj.themeVars || null
    });
  }catch(e){ return resp(500, { error: e.message }); }
};

function resp(status, data){ return { statusCode: status, headers:{'Content-Type':'application/json'}, body: JSON.stringify(data) }; }
