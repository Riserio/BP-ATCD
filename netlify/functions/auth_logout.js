const { destroySession } = require('./_lib/auth');
const { extractToken } = require('./_lib/http');

function headers(){
  return {
    "access-control-allow-origin": process.env.CORS_ORIGIN || "*",
    "access-control-allow-headers": "content-type,authorization",
    "access-control-allow-methods": "POST,OPTIONS",
    "content-type": "application/json"
  };
}

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") return { statusCode:200, headers:headers(), body:"" };
  if (event.httpMethod !== "POST") return { statusCode:405, headers:headers(), body: JSON.stringify({ ok:false, error:"Use POST" }) };
  const token = extractToken(event);
  if (token){
    await destroySession(token);
  }
  return { statusCode:200, headers:headers(), body: JSON.stringify({ ok:true }) };
};
