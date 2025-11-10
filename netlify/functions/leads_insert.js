const { Pool } = require("pg");
let pool;

exports.handler = async (event) => {
  try {
    if (event.httpMethod !== "POST") {
      return { statusCode: 405, body: "Use POST" };
    }
    const { nome, email } = JSON.parse(event.body || "{}");
    if (!nome) return { statusCode: 400, body: "Campo 'nome' é obrigatório" };

    if (!pool) {
      pool = new Pool({
        connectionString: process.env.NEON_DB_URL,
        ssl: { rejectUnauthorized: false }
      });
    }

    const q = "INSERT INTO leads (nome,email) VALUES ($1,$2) RETURNING id,nome,email,criado_em";
    const { rows } = await pool.query(q, [nome, email || null]);

    return {
      statusCode: 200,
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ ok: true, lead: rows[0] })
    };
  } catch (e) {
    return {
      statusCode: 500,
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ ok: false, error: e.message })
    };
  }
};
