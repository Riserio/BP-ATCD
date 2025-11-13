const { query, ensureSchema } = require('./_lib/db');

exports.handler = async (event) => {
  try{
    await ensureSchema();
    const body = JSON.parse(event.body||'{}');
    const nome = (body.nome||'').trim();
    if(!nome) return resp(400, { error:'nome obrigatório' });
    const payload = [
      nome,
      body.email || null,
      body.telefone || null,
      body.corretora || null,
      body.endereco || null,
      body.instagram || null,
      body.facebook || null,
      body.linkedin || null,
      body.site || null,
      body.obs || body.observacoes || null
    ];
    if(body.id){
      const { rows } = await query(
        `UPDATE contatos SET
          nome=$1, email=$2, telefone=$3, corretora=$4, endereco=$5,
          instagram=$6, facebook=$7, linkedin=$8, site=$9, obs=$10,
          updated_at=NOW()
        WHERE id=$11 RETURNING *`,
        [...payload, body.id]
      );
      return resp(200, rows[0]||{});
    }
    const { rows } = await query(
      `INSERT INTO contatos (
        nome,email,telefone,corretora,endereco,
        instagram,facebook,linkedin,site,obs
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,
      payload
    );
    return resp(200, rows[0]||{});
  }catch(e){ return resp(500, { error: e.message }); }
};

function resp(status, data){
  return { statusCode: status, headers:{'Content-Type':'application/json'}, body: JSON.stringify(data) };
}
