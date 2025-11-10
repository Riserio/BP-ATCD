const { Pool } = require("pg");
let pool;

exports.handler = async () => {
  try {
    if (!pool) {
      pool = new Pool({
        connectionString: process.env.NEON_DB_URL,
        ssl: { rejectUnauthorized: false }
      });
    }
    const { rows } = await pool.query("SELECT id, nome, email, criado_em FROM leads ORDER BY id DESC LIMIT 100");
    return {
      statusCode: 200,
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ ok: true, rows })
    };
  } catch (e) {
    return {
      statusCode: 500,
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ ok: false, error: e.message })
    };
  }
};
