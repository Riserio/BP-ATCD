const { Pool } = require("pg");
let pool;
function getPool(){
  if(!pool){
    if(!process.env.NEON_DB_URL) throw new Error("NEON_DB_URL não definida");
    pool = new Pool({ connectionString: process.env.NEON_DB_URL, ssl: { rejectUnauthorized:false } });
  }
  return pool;
}
module.exports = { getPool };
