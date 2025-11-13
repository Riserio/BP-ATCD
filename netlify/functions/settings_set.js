const { query, ensureSchema } = require('./_lib/db');
const { requireAuth } = require('./_lib/http');

exports.handler = async (event) => {
  try{
    await ensureSchema();
    await requireAuth(event, { adminOnly: true });
    const p = JSON.parse(event.body||'{}');
    await upsertSetting('logoUrl', p.logoUrl || null);
    await upsertSetting('themeVars', p.themeVars || null);
    return resp(200, { ok: true });
  }catch(e){
    const status = e.statusCode || 500;
    return resp(status, { ok:false, error: e.message });
  }
};

async function upsertSetting(key, value){
  await query(
    "INSERT INTO app_settings(chave, valor) VALUES($1,$2) ON CONFLICT (chave) DO UPDATE SET valor=EXCLUDED.valor",
    [key, JSON.stringify(value)]
  );
}

function resp(status, data){ return { statusCode: status, headers:{'Content-Type':'application/json'}, body: JSON.stringify(data) }; }
