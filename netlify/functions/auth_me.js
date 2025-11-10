const { getUserByToken } = require("./_lib/auth");
exports.handler = async (event)=>{
  const token = (event.headers.authorization||"").replace(/^Bearer\s+/i,"");
  const user = await getUserByToken(token);
  if(!user) return { statusCode:401, body: JSON.stringify({ ok:false }) };
  return { statusCode:200, headers:{ "content-type":"application/json" }, body: JSON.stringify({ ok:true, user }) };
};
