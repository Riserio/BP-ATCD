/**
 * /.netlify/functions/auth_logout
 * Apenas responde ok (se usar cookie/sessÃ£o, apague aqui).
 */
function headers(){
  return {
    "access-control-allow-origin": process.env.CORS_ORIGIN || "*",
    "access-control-allow-headers": "content-type",
    "access-control-allow-methods": "POST,OPTIONS",
    "content-type": "application/json"
  };
}

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") return { statusCode:200, headers:headers(), body:"" };
  if (event.httpMethod !== "POST") return { statusCode:405, headers:headers(), body: JSON.stringify({ ok:false, error:"Use POST" }) };
  // Se estivesse usando cookie: definir Set-Cookie expirado aqui.
  return { statusCode:200, headers:headers(), body: JSON.stringify({ ok:true }) };
};
