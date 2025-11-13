const { query, ensureSchema } = require('./_lib/db');

exports.handler = async () => {
  try{
    await ensureSchema();
    const { rows } = await query(`
      SELECT id,nome,email,telefone,corretora,endereco,instagram,facebook,linkedin,site,obs,created_at,updated_at
      FROM contatos
      ORDER BY nome ASC, id ASC
    `);
    return resp(200, rows);
  }catch(e){ return resp(500, { error: e.message }); }
};

function resp(status, data){
  return { statusCode: status, headers:{'Content-Type':'application/json'}, body: JSON.stringify(data) };
}
