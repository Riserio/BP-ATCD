
const { query, ensureSchema } = require('./_lib/db');

exports.handler = async (event) => {
  try{
    await ensureSchema();
    const p = JSON.parse(event.body||'{}');
    const tags = Array.isArray(p.tags) ? p.tags : [];
    const follow = p.follow_on || p.follow || null;
    const sla = toNumberOrNull(p.sla);
    const status = p.status || 'novo';
    const { rows } = await query(
      `INSERT INTO atendimentos (
        corretora, contato, canal, assunto, responsavel,
        descricao, prioridade, proximo, follow_on, tags,
        sla, status, anexo, team_id, owner_id
      ) VALUES (
        $1,$2,$3,$4,$5,
        $6,$7,$8,$9,$10,
        $11,$12,$13,$14,$15
      ) RETURNING *`,
      [
        p.corretora||'',
        p.contato||'',
        p.canal||'',
        p.assunto || p.titulo || '',
        p.responsavel || '',
        p.descricao || '',
        p.prioridade || 'Baixa',
        p.proximo || '',
        follow,
        tags,
        sla,
        status,
        p.anexo || '',
        p.team_id || null,
        p.owner_id || null
      ]
    );
    return resp(200, rows[0]);
  }catch(e){ return resp(500, { error: e.message }); }
};

function toNumberOrNull(v){ const n = Number(v); return Number.isFinite(n) ? n : null; }
function resp(status, data){ return { statusCode: status, headers:{'Content-Type':'application/json'}, body: JSON.stringify(data) }; }
