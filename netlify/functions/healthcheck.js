// netlify/functions/healthcheck.js
const { query, ensureSchema } = require('./_lib/db');

exports.handler = async () => {
  const started = Date.now();
  let dbOk = false, dbError = null, now = null;
  try{
    await ensureSchema();
    const { rows } = await query('SELECT NOW() AS now');
    now = rows[0].now;
    dbOk = true;
  }catch(e){
    dbError = e.message;
  }
  const payload = {
    ok: dbOk,
    uptime_ms: Date.now() - started,
    hasEnv: !!(process.env.NEON_DB_URL || process.env.DATABASE_URL),
    now,
    dbError
  };
  return {
    statusCode: dbOk ? 200 : 500,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    },
    body: JSON.stringify(payload)
  };
};
