const { getUserByToken } = require('./auth');

function getAuthHeader(event){
  const headers = event.headers || {};
  return headers.authorization || headers.Authorization || '';
}

function extractToken(event){
  const header = getAuthHeader(event);
  if (!header) return null;
  const match = header.match(/^Bearer\s+(.+)$/i);
  if (match) return match[1];
  return header.trim() || null;
}

async function requireAuth(event, { adminOnly = false } = {}){
  const token = extractToken(event);
  if (!token){
    const err = new Error('missing token');
    err.statusCode = 401;
    throw err;
  }
  const user = await getUserByToken(token);
  if (!user){
    const err = new Error('invalid token');
    err.statusCode = 401;
    throw err;
  }
  if (adminOnly && user.perfil !== 'admin'){
    const err = new Error('forbidden');
    err.statusCode = 403;
    throw err;
  }
  return user;
}

module.exports = { extractToken, requireAuth };
